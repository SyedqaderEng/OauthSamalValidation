'use client';

import { useState } from 'react';

interface SAMLEnvironment {
  id: string;
  type: string;
  entityId: string;
  ssoUrl?: string | null;
  acsUrl?: string | null;
  testUsers?: any[] | null;
}

interface SAMLTesterProps {
  env: SAMLEnvironment;
}

export default function SAMLTester({ env }: SAMLTesterProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [samlResponse, setSamlResponse] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';

  const handleInitiateSSO = () => {
    if (env.type === 'idp') {
      const ssoUrl = `${baseUrl}/saml/${env.id}/sso`;
      window.open(ssoUrl, '_blank', 'width=800,height=700');
    } else {
      alert('SP-initiated SSO requires IdP configuration. Use the metadata URL to configure your IdP.');
    }
  };

  const handleValidateSAMLResponse = async () => {
    if (!samlResponse.trim()) {
      setError('Please provide a SAML response to validate');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const res = await fetch(`/api/saml/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          samlResponse: samlResponse.trim(),
          environmentId: env.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setParsedData(data);
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = (userEmail: string) => {
    const params = new URLSearchParams({
      email: userEmail,
      RelayState: baseUrl,
    });
    const testUrl = `${baseUrl}/saml/${env.id}/sso?${params.toString()}`;
    window.open(testUrl, '_blank', 'width=800,height=700');
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        🧪 SAML Flow Tester
      </h3>

      {/* IdP Testing */}
      {env.type === 'idp' && (
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">
              Test IdP-Initiated SSO
            </h4>

            {env.testUsers && env.testUsers.length > 0 ? (
              <div className="space-y-3">
                <label className="text-sm text-gray-400 block">Select Test User</label>
                <div className="grid gap-2">
                  {env.testUsers.map((user: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleTestUserLogin(user.email)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10 hover:bg-white/5 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg">{user.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                      <span className="text-sm text-purple-400">Test SSO →</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                ℹ️ No test users configured. Add test users to simulate IdP authentication.
              </div>
            )}

            <button
              onClick={handleInitiateSSO}
              className="w-full mt-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
            >
              🚀 Start SSO Flow (Generic)
            </button>
          </div>
        </div>
      )}

      {/* SP Testing */}
      {env.type === 'sp' && (
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-3">
              Test SP Configuration
            </h4>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-3">
              <p className="mb-2">
                ℹ️ To test SP-initiated SSO, you need to configure your IdP with this SP's metadata.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Download the metadata XML using the button above</li>
                <li>Upload it to your IdP configuration</li>
                <li>Initiate SSO from your application to test</li>
              </ol>
            </div>
            <a
              href={`/saml/${env.id}/metadata`}
              target="_blank"
              className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold text-center"
            >
              📥 Download SP Metadata
            </a>
          </div>
        </div>
      )}

      {/* SAML Response Validator */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">
            SAML Response Validator
          </h4>
          <label className="text-sm text-gray-400 block mb-2">
            Paste SAML Response (Base64 or XML)
          </label>
          <textarea
            value={samlResponse}
            onChange={(e) => setSamlResponse(e.target.value)}
            placeholder="Paste your SAML response here to validate and parse..."
            rows={6}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono resize-none"
          />
        </div>

        <button
          onClick={handleValidateSAMLResponse}
          disabled={isLoading || !samlResponse.trim()}
          className="w-full px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          {isLoading ? '⏳ Validating...' : '✓ Validate & Parse'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          <div className="flex items-start gap-2">
            <span className="text-xl">❌</span>
            <div className="flex-1">
              <div className="font-semibold mb-1">Validation Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Data Display */}
      {parsedData && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Parsed SAML Data</label>
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
              ✓ Valid
            </span>
          </div>

          {/* Key Attributes */}
          {parsedData.attributes && (
            <div className="mb-4 p-4 rounded-lg bg-black/30 border border-green-500/30">
              <h5 className="text-sm font-semibold text-green-400 mb-3">Attributes</h5>
              <div className="space-y-2">
                {Object.entries(parsedData.attributes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-medium min-w-[120px]">
                      {key}
                    </span>
                    <span className="text-gray-300 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Response */}
          <details className="bg-black/50 rounded-lg border border-white/10 overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer hover:bg-white/5 transition text-sm font-semibold">
              View Full Response Data
            </summary>
            <div className="p-4 border-t border-white/10 overflow-x-auto">
              <pre className="text-xs font-mono text-gray-300">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Reference</h4>
        <div className="grid md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-black/30 border border-white/10">
            <div className="font-semibold text-purple-400 mb-1">Entity ID</div>
            <code className="text-gray-300 break-all">{env.entityId}</code>
          </div>
          {env.ssoUrl && (
            <div className="p-3 rounded-lg bg-black/30 border border-white/10">
              <div className="font-semibold text-blue-400 mb-1">SSO URL</div>
              <code className="text-gray-300 break-all">{env.ssoUrl}</code>
            </div>
          )}
          {env.acsUrl && (
            <div className="p-3 rounded-lg bg-black/30 border border-white/10">
              <div className="font-semibold text-green-400 mb-1">ACS URL</div>
              <code className="text-gray-300 break-all">{env.acsUrl}</code>
            </div>
          )}
          <div className="p-3 rounded-lg bg-black/30 border border-white/10">
            <div className="font-semibold text-cyan-400 mb-1">Metadata URL</div>
            <code className="text-gray-300 break-all">
              {baseUrl}/saml/{env.id}/metadata
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
