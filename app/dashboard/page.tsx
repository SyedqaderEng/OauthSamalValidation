import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getDashboardData(userId: string) {
  const [oauthApps, samlEnvironments, recentActivity] = await Promise.all([
    prisma.oAuthApp.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    prisma.samlEnvironment.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
  ]);

  return {
    oauthApps,
    samlEnvironments,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { oauthApps, samlEnvironments, recentActivity } = await getDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-black mb-2">
          Welcome back, <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">{session.user.name || 'User'}</span>
        </h1>
        <p className="text-gray-400">Manage your OAuth apps and SAML environments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🚀</div>
            <div className="text-3xl font-bold text-pink-500">{oauthApps.length}</div>
          </div>
          <h3 className="text-lg font-semibold mb-1">OAuth Apps</h3>
          <p className="text-sm text-gray-400">Active applications</p>
          <Link href="/dashboard/oauth" className="mt-4 inline-block text-pink-500 hover:text-pink-400 text-sm font-medium">
            View all →
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🏢</div>
            <div className="text-3xl font-bold text-purple-500">{samlEnvironments.length}</div>
          </div>
          <h3 className="text-lg font-semibold mb-1">SAML Environments</h3>
          <p className="text-sm text-gray-400">IdP & SP configs</p>
          <Link href="/dashboard/saml" className="mt-4 inline-block text-purple-500 hover:text-purple-400 text-sm font-medium">
            View all →
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🔓</div>
            <div className="text-3xl font-bold text-blue-500">{recentActivity.length}</div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Recent Actions</h3>
          <p className="text-sm text-gray-400">Last 10 activities</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard/oauth/new" className="p-6 rounded-xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/50 hover:border-pink-500 transition group">
            <div className="flex items-center gap-4">
              <div className="text-4xl">➕</div>
              <div>
                <h3 className="font-bold text-lg group-hover:text-pink-400 transition">Create OAuth App</h3>
                <p className="text-sm text-gray-400">Set up a new OAuth 2.0 application</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/saml/new" className="p-6 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 hover:border-purple-500 transition group">
            <div className="flex items-center gap-4">
              <div className="text-4xl">➕</div>
              <div>
                <h3 className="font-bold text-lg group-hover:text-purple-400 transition">Create SAML Environment</h3>
                <p className="text-sm text-gray-400">Set up a new SAML IdP or SP</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent OAuth Apps */}
      {oauthApps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent OAuth Apps</h2>
            <Link href="/dashboard/oauth" className="text-pink-500 hover:text-pink-400 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {oauthApps.map((app: any) => (
              <Link
                key={app.id}
                href={`/dashboard/oauth/${app.id}`}
                className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{app.name}</h3>
                    <p className="text-sm text-gray-400">{app.description || 'No description'}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>Client ID: {app.clientId}</span>
                      <span>•</span>
                      <span>Created {new Date(app.createdAt).toLocaleDateString()}</span>
                      {app.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-500">Expires {new Date(app.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl">🚀</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent SAML Environments */}
      {samlEnvironments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent SAML Environments</h2>
            <Link href="/dashboard/saml" className="text-purple-500 hover:text-purple-400 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {samlEnvironments.map((env: any) => (
              <Link
                key={env.id}
                href={`/dashboard/saml/${env.id}`}
                className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{env.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        env.type === 'idp' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {env.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{env.description || 'No description'}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>Entity ID: {env.entityId}</span>
                      <span>•</span>
                      <span>Created {new Date(env.createdAt).toLocaleDateString()}</span>
                      {env.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-500">Expires {new Date(env.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl">🏢</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {oauthApps.length === 0 && samlEnvironments.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">Get Started</h2>
          <p className="text-gray-400 mb-6">Create your first OAuth app or SAML environment to begin testing</p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/oauth/new" className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold">
              Create OAuth App
            </Link>
            <Link href="/dashboard/saml/new" className="px-6 py-3 rounded-lg bg-white/5 border-2 border-white/20 hover:bg-white/10 transition font-semibold">
              Create SAML Environment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
