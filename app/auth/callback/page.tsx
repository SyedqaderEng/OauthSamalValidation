'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AuthDetails {
  protocol: 'oauth' | 'saml';
  success: boolean;
  timestamp: string;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string;
  scope?: string;
  idToken?: string;
  state?: string;
  code?: string;
  // SAML specific
  nameId?: string;
  sessionIndex?: string;
  attributes?: Record<string, string>;
  issuer?: string;
  // Decoded info
  decodedToken?: Record<string, unknown>;
  aiExplanation?: string;
}

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

function InfoCard({ title, value, description, highlight = false }: {
  title: string;
  value: string;
  description?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{title}</div>
      <div className={`font-mono text-sm break-all ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</div>
      {description && <div className="text-xs text-gray-500 mt-2">{description}</div>}
    </div>
  );
}

function TokenDisplay({ token, title }: { token: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const decoded = decodeJWT(token);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1a1a1f] rounded-xl border border-white/10 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="font-semibold text-purple-400">{title}</span>
        <button
          onClick={copyToClipboard}
          className="px-3 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4">
        <div className="font-mono text-xs text-gray-400 break-all mb-4 max-h-20 overflow-auto">
          {token.substring(0, 50)}...{token.substring(token.length - 20)}
        </div>
        {decoded && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Decoded Payload</div>
            <pre className="bg-black/40 p-3 rounded-lg text-xs text-green-400 overflow-auto max-h-48">
              {JSON.stringify(decoded, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const protocol = searchParams.get('protocol') as 'oauth' | 'saml' || 'oauth';
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const accessToken = searchParams.get('access_token');
    const idToken = searchParams.get('id_token');
    const tokenType = searchParams.get('token_type');
    const expiresIn = searchParams.get('expires_in');
    const scope = searchParams.get('scope');
    const refreshToken = searchParams.get('refresh_token');

    // SAML params
    const samlResponse = searchParams.get('SAMLResponse');
    const relayState = searchParams.get('RelayState');

    const details: AuthDetails = {
      protocol,
      success: true,
      timestamp: new Date().toISOString(),
      code: code || undefined,
      state: state || undefined,
      accessToken: accessToken || undefined,
      tokenType: tokenType || undefined,
      expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
      scope: scope || undefined,
      refreshToken: refreshToken || undefined,
      idToken: idToken || undefined,
    };

    // Decode tokens if present
    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      if (decoded) details.decodedToken = decoded;
    } else if (idToken) {
      const decoded = decodeJWT(idToken);
      if (decoded) details.decodedToken = decoded;
    }

    // Parse SAML response if present
    if (samlResponse) {
      try {
        const decoded = atob(samlResponse);
        const parser = new DOMParser();
        const doc = parser.parseFromString(decoded, 'text/xml');
        const nameId = doc.querySelector('NameID')?.textContent;
        const issuer = doc.querySelector('Issuer')?.textContent;
        if (nameId) details.nameId = nameId;
        if (issuer) details.issuer = issuer;
      } catch {
        // SAML parsing failed
      }
    }

    setAuthDetails(details);
    setLoading(false);

    // Hide confetti after 5 seconds
    setTimeout(() => setConfetti(false), 5000);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Confetti Animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[800px] h-[800px] rounded-full blur-[150px] bg-gradient-to-r from-green-600/30 to-emerald-600/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Authentication Successful!
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            {authDetails?.protocol === 'saml' ? 'SAML 2.0' : 'OAuth 2.0'} authentication completed successfully
          </p>
          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
            {new Date(authDetails?.timestamp || '').toLocaleString()}
          </div>
        </div>

        {/* Auth Details Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <InfoCard
              title="Protocol"
              value={authDetails?.protocol?.toUpperCase() || 'OAuth 2.0'}
              description="Authentication protocol used"
              highlight
            />
            {authDetails?.tokenType && (
              <InfoCard
                title="Token Type"
                value={authDetails.tokenType}
                description="Type of access token received"
              />
            )}
            {authDetails?.expiresIn && (
              <InfoCard
                title="Expires In"
                value={`${authDetails.expiresIn} seconds`}
                description="Token validity duration"
              />
            )}
            {authDetails?.scope && (
              <InfoCard
                title="Scopes Granted"
                value={authDetails.scope}
                description="Permissions granted to the application"
              />
            )}
            {authDetails?.state && (
              <InfoCard
                title="State Parameter"
                value={authDetails.state}
                description="CSRF protection parameter"
              />
            )}
            {authDetails?.code && (
              <InfoCard
                title="Authorization Code"
                value={`${authDetails.code.substring(0, 20)}...`}
                description="One-time code to exchange for tokens"
              />
            )}
            {authDetails?.nameId && (
              <InfoCard
                title="SAML Name ID"
                value={authDetails.nameId}
                description="User identifier from IdP"
                highlight
              />
            )}
            {authDetails?.issuer && (
              <InfoCard
                title="SAML Issuer"
                value={authDetails.issuer}
                description="Identity Provider that issued the assertion"
              />
            )}
          </div>

          {/* Tokens Section */}
          <div className="space-y-6 mb-8">
            {authDetails?.accessToken && (
              <TokenDisplay token={authDetails.accessToken} title="Access Token" />
            )}
            {authDetails?.idToken && (
              <TokenDisplay token={authDetails.idToken} title="ID Token" />
            )}
            {authDetails?.refreshToken && (
              <TokenDisplay token={authDetails.refreshToken} title="Refresh Token" />
            )}
          </div>

          {/* Decoded Token Info */}
          {authDetails?.decodedToken && (
            <div className="bg-[#1a1a1f] rounded-xl border border-white/10 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-4 py-3 border-b border-white/10">
                <span className="font-semibold text-blue-400">Token Claims</span>
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-4">
                {Object.entries(authDetails.decodedToken).map(([key, value]) => (
                  <div key={key} className="bg-black/20 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase">{key}</div>
                    <div className="text-sm text-white font-mono break-all">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's Next Section */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6 mb-8">
            <h3 className="text-xl font-bold text-purple-400 mb-4">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">1</div>
                <div className="font-semibold mb-1">Use the Access Token</div>
                <div className="text-sm text-gray-400">Include in Authorization header for API requests</div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">2</div>
                <div className="font-semibold mb-1">Verify Token Signature</div>
                <div className="text-sm text-gray-400">Validate the token using public keys</div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <div className="text-2xl mb-2">3</div>
                <div className="font-semibold mb-1">Handle Token Refresh</div>
                <div className="text-sm text-gray-400">Use refresh token before expiry</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/dashboard/tools"
              className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition font-semibold"
            >
              Open Tools
            </Link>
            <button
              onClick={() => window.print()}
              className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition font-semibold"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
