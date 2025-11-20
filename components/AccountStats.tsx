'use client';

interface AccountStatsProps {
  oauthAppsCount: number;
  samlEnvironmentsCount: number;
  apiKeysCount: number;
}

export default function AccountStats({
  oauthAppsCount,
  samlEnvironmentsCount,
  apiKeysCount,
}: AccountStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-4xl">🚀</span>
          <span className="text-3xl font-black text-pink-400">{oauthAppsCount}</span>
        </div>
        <h3 className="text-lg font-bold">OAuth Apps</h3>
        <p className="text-sm text-gray-400">Active OAuth 2.0 applications</p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-4xl">🏢</span>
          <span className="text-3xl font-black text-purple-400">{samlEnvironmentsCount}</span>
        </div>
        <h3 className="text-lg font-bold">SAML Environments</h3>
        <p className="text-sm text-gray-400">Active SAML 2.0 configurations</p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-4xl">🔑</span>
          <span className="text-3xl font-black text-cyan-400">{apiKeysCount}</span>
        </div>
        <h3 className="text-lg font-bold">API Keys</h3>
        <p className="text-sm text-gray-400">Active programmatic access keys</p>
      </div>
    </div>
  );
}
