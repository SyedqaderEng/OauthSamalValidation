'use client';

import { useState } from 'react';

const tips = [
  {
    title: 'Use PKCE for Public Clients',
    description: 'Always implement PKCE (Proof Key for Code Exchange) for mobile and single-page applications to prevent authorization code interception.',
    severity: 'high',
  },
  {
    title: 'Validate Redirect URIs',
    description: 'Strictly validate redirect URIs to prevent open redirector vulnerabilities and token theft.',
    severity: 'critical',
  },
  {
    title: 'Set Short Token Expiry',
    description: 'Use short-lived access tokens (15-60 minutes) and refresh tokens for better security.',
    severity: 'medium',
  },
  {
    title: 'Rotate Client Secrets',
    description: 'Regularly rotate client secrets, especially after team member departures.',
    severity: 'medium',
  },
  {
    title: 'Implement Token Revocation',
    description: 'Always provide a way to revoke tokens when users log out or report suspicious activity.',
    severity: 'high',
  },
];

const severityColors = {
  critical: 'border-red-500/50 bg-red-500/10',
  high: 'border-orange-500/50 bg-orange-500/10',
  medium: 'border-yellow-500/50 bg-yellow-500/10',
};

const severityBadge = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
};

export default function SecurityTips() {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => setCurrentTip((prev) => (prev + 1) % tips.length);
  const prevTip = () => setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);

  const tip = tips[currentTip];

  return (
    <div className={`rounded-xl border p-6 ${severityColors[tip.severity as keyof typeof severityColors]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold">Security Tip</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityBadge[tip.severity as keyof typeof severityBadge]}`}>
          {tip.severity.toUpperCase()}
        </span>
      </div>
      <h4 className="font-semibold mb-2">{tip.title}</h4>
      <p className="text-sm text-gray-400 mb-4">{tip.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTip(i)}
              className={`w-2 h-2 rounded-full transition ${i === currentTip ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prevTip} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            ←
          </button>
          <button onClick={nextTip} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
