import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getOAuthApps(userId: string) {
  return await prisma.oAuthApp.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function OAuthAppsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const apps = await getOAuthApps(session.user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-2">OAuth Apps</h1>
          <p className="text-gray-400">Manage your OAuth 2.0 applications</p>
        </div>
        <Link
          href="/dashboard/oauth/new"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold"
        >
          ➕ Create OAuth App
        </Link>
      </div>

      {/* Apps List */}
      {apps.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">No OAuth Apps Yet</h2>
          <p className="text-gray-400 mb-6">Create your first OAuth 2.0 application to start testing</p>
          <Link
            href="/dashboard/oauth/new"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold"
          >
            Create OAuth App
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{app.name}</h3>
                  <p className="text-gray-400 text-sm">{app.description || 'No description'}</p>
                </div>
                <div className="text-3xl">🚀</div>
              </div>

              {/* App Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Client ID</label>
                  <code className="text-sm bg-white/5 px-3 py-1 rounded border border-white/10 block">
                    {app.clientId}
                  </code>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Grant Types</label>
                  <div className="flex flex-wrap gap-1">
                    {app.grantTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 text-xs rounded bg-pink-500/20 text-pink-400 border border-pink-500/30"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>Created {new Date(app.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{app.redirectUris.length} redirect URIs</span>
                <span>•</span>
                <span>{app.scopes.length} scopes</span>
                {app.expiresAt && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-500">
                      Expires {new Date(app.expiresAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/oauth/${app.id}`}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
                >
                  View Details
                </Link>
                <Link
                  href={`/dashboard/oauth/${app.id}/edit`}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
                >
                  Edit
                </Link>
                <Link
                  href={`/oauth/authorize?client_id=${app.clientId}&redirect_uri=${app.redirectUris[0]}&response_type=code&scope=${app.scopes.join(' ')}`}
                  className="px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-500/50 hover:border-pink-500 transition text-sm font-medium text-pink-400"
                  target="_blank"
                >
                  Test OAuth Flow
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
