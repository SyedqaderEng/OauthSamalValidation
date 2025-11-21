'use client';

import { useEffect, useState } from 'react';

interface Stats {
  oauthApps: number;
  samlEnvs: number;
  totalTests: number;
  successRate: number;
}

export default function QuickStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    setTimeout(() => {
      setStats({
        oauthApps: 3,
        samlEnvs: 2,
        totalTests: 47,
        successRate: 94,
      });
      setLoading(false);
    }, 300);
  }, []);

  const statItems = [
    { label: 'OAuth Apps', value: stats?.oauthApps || 0, icon: '🚀', gradient: 'from-pink-500 to-purple-500' },
    { label: 'SAML Envs', value: stats?.samlEnvs || 0, icon: '🏢', gradient: 'from-purple-500 to-blue-500' },
    { label: 'Total Tests', value: stats?.totalTests || 0, icon: '🧪', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Success Rate', value: `${stats?.successRate || 0}%`, icon: '✅', gradient: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${item.gradient} bg-opacity-10 border border-white/10`}
        >
          <div className="absolute -right-4 -top-4 text-6xl opacity-20">{item.icon}</div>
          <div className="relative">
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className={`text-3xl font-black mt-1 ${loading ? 'animate-pulse' : ''}`}>
              {loading ? '...' : item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
