import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import DeleteSAMLButton from '@/components/DeleteSAMLButton';
import SAMLTester from '@/components/SAMLTester';

async function getSAMLEnvironment(id: string, userId: string) {
  const env = await prisma.samlEnvironment.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      sessions: {
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

  if (!env) return null;

  // Parse JSON strings
  return {
    ...env,
    idpMetadata: env.idpMetadata ? JSON.parse(env.idpMetadata) : null,
    attributeMappings: env.attributeMappings ? JSON.parse(env.attributeMappings) : null,
    testUsers: env.testUsers ? JSON.parse(env.testUsers) : null,
  };
}

export default async function SAMLEnvironmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const env = await getSAMLEnvironment(id, session.user.id);

  if (!env) {
    notFound();
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(env.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/dashboard/saml"
            className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block"
          >
            ← Back to SAML Environments
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black">{env.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              env.type === 'idp'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
            }`}>
              {env.type === 'idp' ? 'Identity Provider' : 'Service Provider'}
            </span>
          </div>
          <p className="text-gray-400">{env.description || 'No description provided'}</p>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="text-gray-500">
              Created {new Date(env.createdAt).toLocaleDateString()}
            </span>
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
            href={`/dashboard/saml/${env.id}/edit`}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
          >
            ✏️ Edit
          </Link>
          <DeleteSAMLButton envId={env.id} envName={env.name} />
        </div>
      </div>

      {/* SAML Configuration */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🏢 SAML 2.0 Configuration
        </h2>

        <div className="space-y-4">
          {/* Entity ID */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Entity ID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                {env.entityId}
              </code>
              <CopyButton text={env.entityId} label="Copy" />
            </div>
          </div>

          {/* SSO URL */}
          {env.ssoUrl && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Single Sign-On URL (SSO)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                  {env.ssoUrl}
                </code>
                <CopyButton text={env.ssoUrl} label="Copy" />
              </div>
            </div>
          )}

          {/* SLO URL */}
          {env.sloUrl && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Single Logout URL (SLO)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                  {env.sloUrl}
                </code>
                <CopyButton text={env.sloUrl} label="Copy" />
              </div>
            </div>
          )}

          {/* ACS URL */}
          {env.acsUrl && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Assertion Consumer Service URL (ACS)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                  {env.acsUrl}
                </code>
                <CopyButton text={env.acsUrl} label="Copy" />
              </div>
            </div>
          )}

          {/* Metadata URL */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Metadata URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-sm break-all">
                {baseUrl}/saml/{env.id}/metadata
              </code>
              <CopyButton text={`${baseUrl}/saml/${env.id}/metadata`} label="Copy" />
              <Link
                href={`/saml/${env.id}/metadata`}
                target="_blank"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-sm font-medium whitespace-nowrap"
              >
                📥 Download
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SAML Settings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Security Settings */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔐 Security Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sign Assertions</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                env.signAssertions
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {env.signAssertions ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sign Response</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                env.signResponse
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {env.signResponse ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Encrypt Assertions</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                env.encryptAssertions
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {env.encryptAssertions ? '🔒 Enabled' : '✗ Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* NameID & Timing */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⚙️ NameID & Timing
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">NameID Format</label>
              <div className="text-sm font-mono text-purple-400 mt-1 break-all">
                {env.nameIdFormat.split(':').pop()}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Assertion Lifetime</label>
              <div className="text-2xl font-bold text-green-400">
                {Math.floor(env.assertionLifetime / 60)}m
              </div>
              <p className="text-xs text-gray-500">{env.assertionLifetime} seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate & Keys */}
      {(env.certificate || env.privateKey) && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔑 Certificate & Private Key
          </h3>

          {env.certificate && (
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-2">X.509 Certificate</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-xs break-all max-h-32 overflow-y-auto">
                  {env.certificate.substring(0, 200)}...
                </code>
                <CopyButton text={env.certificate} label="Copy" />
              </div>
            </div>
          )}

          {env.privateKey && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">Private Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-white/10 font-mono text-xs">
                  {'•'.repeat(60)} (encrypted - not retrievable)
                </code>
                <button
                  disabled
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm cursor-not-allowed"
                  title="Private key is encrypted and cannot be retrieved"
                >
                  Hidden
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Private keys are encrypted and cannot be retrieved for security.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attribute Mappings */}
      {env.attributeMappings && Object.keys(env.attributeMappings).length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎯 Attribute Mappings
          </h3>
          <div className="space-y-2">
            {Object.entries(env.attributeMappings).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/10">
                <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-sm font-medium min-w-[100px]">
                  {key}
                </span>
                <span className="text-gray-400">→</span>
                <code className="flex-1 text-sm font-mono text-gray-300 break-all">
                  {value as string}
                </code>
                <CopyButton text={value as string} label="Copy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Users (for IdP) */}
      {env.type === 'idp' && env.testUsers && env.testUsers.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            👥 Test Users
          </h3>
          <div className="grid gap-3">
            {env.testUsers.map((user: any, index: number) => (
              <div key={index} className="p-4 bg-black/30 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xl">{user.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                  <CopyButton text={user.email} label="Copy Email" />
                </div>
                {user.customAttributes && Object.keys(user.customAttributes).length > 0 && (
                  <div className="mt-2 pl-13 text-xs text-gray-500">
                    Custom attributes: {Object.keys(user.customAttributes).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {env.sessions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎫 Active SAML Sessions
          </h3>
          <div className="space-y-3">
            {env.sessions.map((session: any) => (
              <div key={session.id} className="p-4 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-400">
                    Session: {session.sessionId.substring(0, 16)}...
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    new Date(session.expiresAt) > new Date()
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {new Date(session.expiresAt) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">NameID:</span>
                    <span className="ml-2 text-gray-300">{session.nameId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Expires:</span>
                    <span className="ml-2 text-gray-300">
                      {new Date(session.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAML Flow Tester */}
      <SAMLTester env={env} />

      {/* Integration Guide */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📚 Integration Guide
        </h3>
        <div className="space-y-4">
          {env.type === 'idp' && (
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                IdP-Initiated SSO
              </h4>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
                <div className="text-green-400"># Initiate SSO from Identity Provider</div>
                <div className="text-gray-300 break-all">
                  GET {baseUrl}/saml/{env.id}/sso?RelayState=TARGET_URL
                </div>
                <div className="mt-3 text-green-400"># User authenticates and assertion is sent to SP</div>
                <div className="text-gray-300">
                  POST {env.acsUrl || 'SP_ACS_URL'}
                </div>
              </div>
            </div>
          )}

          {env.type === 'sp' && (
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">
                SP-Initiated SSO
              </h4>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
                <div className="text-green-400"># Service Provider redirects to IdP</div>
                <div className="text-gray-300 break-all">
                  GET {env.ssoUrl || 'IDP_SSO_URL'}?SAMLRequest=BASE64_ENCODED_REQUEST
                </div>
                <div className="mt-3 text-green-400"># After authentication, receive assertion</div>
                <div className="text-gray-300 break-all">
                  POST {baseUrl}/saml/{env.id}/acs
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-2">
              Metadata Configuration
            </h4>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
              <div className="text-green-400"># Download SAML metadata XML</div>
              <div className="text-gray-300">
                curl {baseUrl}/saml/{env.id}/metadata -o metadata.xml
              </div>
              <div className="mt-3 text-green-400"># Import into your SAML client/provider</div>
              <div className="text-gray-300">
                # Most SAML implementations can auto-configure from metadata URL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
