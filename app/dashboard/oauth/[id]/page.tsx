import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import DeleteButton from '@/components/DeleteOAuthButton';
import OAuthTester from '@/components/OAuthTester';

async function getOAuthApp(id: string, userId: string) {
  const app = await prisma.oAuthApp.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      tokens: {
        where: {
          expiresAt: {
            gte: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!app) return null;

  // Parse JSON strings
  return {
    ...app,
    grantTypes: JSON.parse(app.grantTypes) as string[],
    redirectUris: JSON.parse(app.redirectUris) as string[],
    scopes: JSON.parse(app.scopes) as string[],
  };
}

export default async function OAuthAppDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const app = await getOAuthApp(params.id, session.user.id);

  if (!app) {
    notFound();
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(app.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/dashboard/oauth"
            className="text-pink-400 hover:text-pink-300 text-sm mb-2 inline-block"
          >
            ← Back to OAuth Apps
          </Link>
          <h1 className="text-4xl font-black mb-2">{app.name}</h1>
          <p className="text-gray-400">{app.description || 'No description provided'}</p>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="text-gray-500">
              Created {new Date(app.createdAt).toLocaleDateString()}
            </span>
            <span className="text-gray-600">•</span>
            {app.isPublic ? (
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                PUBLIC
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
                CONFIDENTIAL
              </span>
            )}
            {daysUntilExpiry <= 7 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                  ⚠️ Expires in {daysUntilExpiry} days
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/oauth/${app.id}/edit`}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
          >
            ✏️ Edit
          </Link>
          <DeleteButton appId={app.id} appName={app.name} />
        </div>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-bold mb-1">Security Notice</h3>
            <p className="text-sm text-gray-300">
              The client secret below is <strong>only displayed once during creation</strong>.
              If you've lost it, you'll need to regenerate a new secret. Store it securely and never expose it in client-side code or public repositories.
            </p>
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🔑 OAuth 2.0 Credentials
        </h2>

        <div className="space-y-4">
          {/* Client ID */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Client ID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                {app.clientId}
              </code>
              <CopyButton text={app.clientId} label="Copy" />
            </div>
          </div>

          {/* Client Secret */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Client Secret</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm">
                {'•'.repeat(40)} (hashed - not retrievable)
              </code>
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm cursor-not-allowed"
                title="Secret is only shown once during creation"
              >
                Hidden
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ℹ️ Client secrets are hashed and cannot be retrieved. You received the plain text version when you created this app.
            </p>
          </div>

          {/* Token Endpoint */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Token Endpoint</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/token
              </code>
              <CopyButton
                text={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/token`}
                label="Copy"
              />
            </div>
          </div>

          {/* Authorization Endpoint */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Authorization Endpoint</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/oauth/authorize
              </code>
              <CopyButton
                text={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/oauth/authorize`}
                label="Copy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Grant Types */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔐 Grant Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {app.grantTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 text-sm font-medium"
              >
                {type}
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>✓ {app.grantTypes.length} grant type(s) enabled</p>
          </div>
        </div>

        {/* Scopes */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎯 Scopes
          </h3>
          <div className="flex flex-wrap gap-2">
            {app.scopes.map((scope) => (
              <span
                key={scope}
                className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm font-medium"
              >
                {scope}
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>✓ {app.scopes.length} scope(s) available</p>
          </div>
        </div>

        {/* Token Lifetimes */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⏱️ Token Lifetimes
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Access Token</label>
              <div className="text-2xl font-bold text-green-400">
                {app.accessTokenLifetime < 3600
                  ? `${Math.floor(app.accessTokenLifetime / 60)}m`
                  : `${Math.floor(app.accessTokenLifetime / 3600)}h`}
              </div>
              <p className="text-xs text-gray-500">{app.accessTokenLifetime} seconds</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Refresh Token</label>
              <div className="text-2xl font-bold text-blue-400">
                {Math.floor(app.refreshTokenLifetime / 86400)}d
              </div>
              <p className="text-xs text-gray-500">{app.refreshTokenLifetime} seconds</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⚙️ Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Auto Approve</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                app.autoApprove
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {app.autoApprove ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Public Client</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                app.isPublic
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {app.isPublic ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">App Expires</span>
              <span className="text-sm font-semibold text-yellow-400">
                {new Date(app.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Redirect URIs */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🔗 Redirect URIs
        </h3>
        <div className="space-y-2">
          {app.redirectUris.map((uri, index) => (
            <div key={index} className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-2 rounded-lg border border-white/10 font-mono text-sm break-all">
                {uri}
              </code>
              <CopyButton text={uri} label="Copy" />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ℹ️ {app.redirectUris.length} redirect URI(s) configured. OAuth authorization codes and tokens will only be sent to these URLs.
        </p>
      </div>

      {/* Active Tokens */}
      {app.tokens.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎫 Active Tokens
          </h3>
          <div className="space-y-3">
            {app.tokens.map((token) => (
              <div key={token.id} className="p-4 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-400">
                    Token: {token.id.substring(0, 12)}...
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    new Date(token.expiresAt) > new Date()
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {new Date(token.expiresAt) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">User:</span>
                    <span className="ml-2 text-gray-300">{token.userEmail || 'Client Credentials'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <span className="ml-2 text-gray-300">
                      {new Date(token.expiresAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Scopes:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {JSON.parse(token.scope).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OAuth Flow Tester */}
      <OAuthTester app={app} />

      {/* Quick Start Guide */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📚 Quick Start Guide
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-2">1. Authorization Code Flow</h4>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
              <div className="text-green-400"># Step 1: Redirect user to authorization endpoint</div>
              <div className="text-gray-300 break-all">
                GET {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/oauth/authorize?
              </div>
              <div className="text-gray-300 pl-4">client_id={app.clientId}&</div>
              <div className="text-gray-300 pl-4">redirect_uri={app.redirectUris[0]}&</div>
              <div className="text-gray-300 pl-4">response_type=code&</div>
              <div className="text-gray-300 pl-4">scope={app.scopes.join(' ')}</div>
              <div className="mt-3 text-green-400"># Step 2: Exchange code for token</div>
              <div className="text-gray-300">
                POST {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/token
              </div>
              <div className="text-gray-300 pl-4">grant_type=authorization_code</div>
              <div className="text-gray-300 pl-4">code=RECEIVED_CODE</div>
              <div className="text-gray-300 pl-4">client_id={app.clientId}</div>
              <div className="text-gray-300 pl-4">client_secret=YOUR_SECRET</div>
            </div>
          </div>

          {app.grantTypes.includes('client_credentials') && (
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">2. Client Credentials Flow</h4>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
                <div className="text-green-400"># Get token directly (no user interaction)</div>
                <div className="text-gray-300">curl -X POST {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/token \</div>
                <div className="text-gray-300 pl-4">-d "grant_type=client_credentials" \</div>
                <div className="text-gray-300 pl-4">-d "client_id={app.clientId}" \</div>
                <div className="text-gray-300 pl-4">-d "client_secret=YOUR_SECRET"</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
