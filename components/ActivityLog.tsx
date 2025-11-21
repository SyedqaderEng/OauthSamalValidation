'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'oauth_created' | 'oauth_test' | 'saml_created' | 'saml_test' | 'token_exchange' | 'login' | 'api_call';
  description: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  details?: Record<string, string>;
}

const typeIcons: Record<Activity['type'], string> = {
  oauth_created: '🚀',
  oauth_test: '🔐',
  saml_created: '🏢',
  saml_test: '🔑',
  token_exchange: '🔄',
  login: '👤',
  api_call: '📡',
};

const typeColors: Record<Activity['type'], string> = {
  oauth_created: 'from-pink-500 to-purple-500',
  oauth_test: 'from-purple-500 to-blue-500',
  saml_created: 'from-blue-500 to-cyan-500',
  saml_test: 'from-cyan-500 to-green-500',
  token_exchange: 'from-green-500 to-emerald-500',
  login: 'from-yellow-500 to-orange-500',
  api_call: 'from-orange-500 to-red-500',
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated activities - in production, fetch from API
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'oauth_created',
        description: 'Created OAuth 2.0 app "My Test App"',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: 'success',
        details: { client_id: 'oauth_abc123' },
      },
      {
        id: '2',
        type: 'token_exchange',
        description: 'Token exchange completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'success',
        details: { grant_type: 'authorization_code' },
      },
      {
        id: '3',
        type: 'saml_test',
        description: 'SAML SSO test initiated',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: 'success',
      },
      {
        id: '4',
        type: 'api_call',
        description: 'API request to /oauth/token',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'error',
        details: { error: 'invalid_client' },
      },
      {
        id: '5',
        type: 'login',
        description: 'Logged in from Chrome on macOS',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: 'success',
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition group"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeColors[activity.type]} flex items-center justify-center flex-shrink-0`}>
              <span className="text-lg">{typeIcons[activity.type]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{activity.description}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  activity.status === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
              {activity.details && (
                <div className="mt-2 text-xs text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition">
                  {Object.entries(activity.details).map(([key, value]) => (
                    <span key={key} className="mr-3">{key}: {value}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
