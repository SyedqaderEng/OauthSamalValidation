import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getSAMLEnvironments(userId: string) {
  return await prisma.samlEnvironment.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function SAMLEnvironmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const environments = await getSAMLEnvironments(session.user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-2">SAML Environments</h1>
          <p className="text-gray-400">Manage your SAML 2.0 IdP and SP configurations</p>
        </div>
        <Link
          href="/dashboard/saml/new"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
        >
          ➕ Create SAML Environment
        </Link>
      </div>

      {/* Environments List */}
      {environments.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold mb-2">No SAML Environments Yet</h2>
          <p className="text-gray-400 mb-6">Create your first SAML environment to start testing</p>
          <Link
            href="/dashboard/saml/new"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
          >
            Create SAML Environment
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {environments.map((env) => (
            <div
              key={env.id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{env.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      env.type === 'idp'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    }`}>
                      {env.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{env.description || 'No description'}</p>
                </div>
                <div className="text-3xl">🏢</div>
              </div>

              {/* Environment Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Entity ID</label>
                  <code className="text-sm bg-white/5 px-3 py-1 rounded border border-white/10 block truncate">
                    {env.entityId}
                  </code>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">NameID Format</label>
                  <code className="text-sm bg-white/5 px-3 py-1 rounded border border-white/10 block truncate">
                    {env.nameidFormat}
                  </code>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-2 mb-4">
                {env.ssoUrl && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">SSO URL</label>
                    <code className="text-xs bg-white/5 px-3 py-1 rounded border border-white/10 block truncate">
                      {env.ssoUrl}
                    </code>
                  </div>
                )}
                {env.acsUrl && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">ACS URL</label>
                    <code className="text-xs bg-white/5 px-3 py-1 rounded border border-white/10 block truncate">
                      {env.acsUrl}
                    </code>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {env.signAssertions && (
                  <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Signed Assertions
                  </span>
                )}
                {env.signResponse && (
                  <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Signed Response
                  </span>
                )}
                {env.encryptAssertions && (
                  <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    🔒 Encrypted
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>Created {new Date(env.createdAt).toLocaleDateString()}</span>
                {env.expiresAt && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-500">
                      Expires {new Date(env.expiresAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/saml/${env.id}`}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
                >
                  View Details
                </Link>
                <Link
                  href={`/dashboard/saml/${env.id}/edit`}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
                >
                  Edit
                </Link>
                <Link
                  href={`/saml/${env.id}/metadata`}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:border-purple-500 transition text-sm font-medium text-purple-400"
                  target="_blank"
                >
                  Download Metadata
                </Link>
                {env.type === 'idp' && (
                  <Link
                    href={`/saml/${env.id}/sso`}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:border-purple-500 transition text-sm font-medium text-purple-400"
                    target="_blank"
                  >
                    Test SSO
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
