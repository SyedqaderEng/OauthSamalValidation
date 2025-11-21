import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProfileForm from '@/components/ProfileForm';
import ApiKeyManager from '@/components/ApiKeyManager';
import AccountStats from '@/components/AccountStats';

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      oauthApps: {
        where: { deletedAt: null },
        select: { id: true },
      },
      samlEnvironments: {
        where: { deletedAt: null },
        select: { id: true },
      },
      apiKeys: {
        where: { revokedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return user;
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await getUserData(session.user.id);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      {/* Account Statistics */}
      <AccountStats
        oauthAppsCount={user.oauthApps.length}
        samlEnvironmentsCount={user.samlEnvironments.length}
        apiKeysCount={user.apiKeys.length}
      />

      {/* Profile Information */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-2xl font-black">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <ProfileForm user={user} />
      </div>

      {/* API Keys Management */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🔑 API Keys
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Create and manage API keys to access the OAuth & SAML testing platform programmatically.
        </p>
        <ApiKeyManager apiKeys={user.apiKeys} userId={user.id} />
      </div>

      {/* Account Information */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          ℹ️ Account Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500 block mb-1">User ID</label>
            <code className="text-sm bg-black/30 px-3 py-2 rounded border border-white/10 block break-all">
              {user.id}
            </code>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Member Since</label>
            <div className="text-sm px-3 py-2">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Email Verified</label>
            <div className="text-sm px-3 py-2">
              {user.emailVerified ? (
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                  ✓ Verified
                </span>
              ) : (
                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                  ⚠️ Not Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Last Updated</label>
            <div className="text-sm px-3 py-2">
              {new Date(user.updatedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Limits */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📊 Resource Usage
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">OAuth Apps</div>
            <div className="text-3xl font-black text-pink-400 mb-1">
              {user.oauthApps.length} <span className="text-lg text-gray-500">/ 5</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(user.oauthApps.length / 5) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">SAML Environments</div>
            <div className="text-3xl font-black text-purple-400 mb-1">
              {user.samlEnvironments.length} <span className="text-lg text-gray-500">/ 3</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(user.samlEnvironments.length / 3) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">API Keys</div>
            <div className="text-3xl font-black text-cyan-400 mb-1">
              {user.apiKeys.length} <span className="text-lg text-gray-500">/ ∞</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: '20%' }}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          <p>
            ℹ️ <strong>Free Plan:</strong> Resources automatically expire after 30 days.
            <Link href="/#pricing" className="ml-2 underline hover:text-yellow-300">
              Upgrade to Pro
            </Link>{' '}
            for unlimited resources.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-red-400">
          ⚠️ Danger Zone
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Irreversible and destructive actions for your account.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-red-500/20">
            <div>
              <div className="font-semibold text-red-400">Delete All OAuth Apps</div>
              <div className="text-sm text-gray-400">
                Permanently delete all your OAuth applications and tokens
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-red-600/50 border border-red-500/50 text-sm font-medium cursor-not-allowed opacity-50"
            >
              Delete Apps
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-red-500/20">
            <div>
              <div className="font-semibold text-red-400">Delete All SAML Environments</div>
              <div className="text-sm text-gray-400">
                Permanently delete all your SAML configurations
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-red-600/50 border border-red-500/50 text-sm font-medium cursor-not-allowed opacity-50"
            >
              Delete Environments
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-red-500/20">
            <div>
              <div className="font-semibold text-red-400">Delete Account</div>
              <div className="text-sm text-gray-400">
                Permanently delete your account and all associated data
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-red-600/50 border border-red-500/50 text-sm font-medium cursor-not-allowed opacity-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
