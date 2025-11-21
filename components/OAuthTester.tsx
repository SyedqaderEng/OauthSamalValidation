'use client';

import { useState } from 'react';

interface OAuthApp {
  id: string;
  clientId: string;
  grantTypes: string[];
  redirectUris: string[];
  scopes: string[];
}

interface OAuthTesterProps {
  app: OAuthApp;
}

export default function OAuthTester({ app }: OAuthTesterProps) {
  const [selectedGrantType, setSelectedGrantType] = useState(app.grantTypes[0]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([app.scopes[0]]);
  const [redirectUri, setRedirectUri] = useState(app.redirectUris[0]);
  const [code, setCode] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';

  const handleStartAuthFlow = () => {
    const params = new URLSearchParams({
      client_id: app.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: selectedScopes.join(' '),
    });

    const authUrl = `${baseUrl}/oauth/authorize?${params.toString()}`;
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  const handleExchangeCode = async () => {
    if (!code || !clientSecret) {
      setError('Please provide both authorization code and client secret');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: app.clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error_description || data.error || 'Token exchange failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientCredentials = async () => {
    if (!clientSecret) {
      setError('Please provide client secret');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: app.clientId,
          client_secret: clientSecret,
          scope: selectedScopes.join(' '),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error_description || data.error || 'Token request failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async (refreshToken: string) => {
    if (!clientSecret) {
      setError('Please provide client secret');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: app.clientId,
          client_secret: clientSecret,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error_description || data.error || 'Token refresh failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        🧪 OAuth Flow Tester
      </h3>

      {/* Grant Type Selection */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">Select Grant Type</label>
        <select
          value={selectedGrantType}
          onChange={(e) => setSelectedGrantType(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm"
        >
          {app.grantTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Scope Selection */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">Select Scopes</label>
        <div className="flex flex-wrap gap-2">
          {app.scopes.map((scope) => (
            <label
              key={scope}
              className={`px-3 py-2 rounded-lg border cursor-pointer transition ${
                selectedScopes.includes(scope)
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedScopes.includes(scope)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedScopes([...selectedScopes, scope]);
                  } else {
                    setSelectedScopes(selectedScopes.filter((s) => s !== scope));
                  }
                }}
                className="mr-2"
              />
              {scope}
            </label>
          ))}
        </div>
      </div>

      {/* Redirect URI */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">Redirect URI</label>
        <select
          value={redirectUri}
          onChange={(e) => setRedirectUri(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm"
        >
          {app.redirectUris.map((uri) => (
            <option key={uri} value={uri}>
              {uri}
            </option>
          ))}
        </select>
      </div>

      {/* Authorization Code Flow */}
      {selectedGrantType === 'authorization_code' && (
        <div className="space-y-4">
          <div>
            <button
              onClick={handleStartAuthFlow}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold"
            >
              🚀 Start Authorization Flow
            </button>
            <p className="text-xs text-gray-500 mt-2">
              This will open a new window for user authorization. After approval, you'll receive a code in the redirect URI.
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Authorization Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste authorization code here"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Client Secret</label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your client secret"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
            />
          </div>

          <button
            onClick={handleExchangeCode}
            disabled={isLoading || !code || !clientSecret}
            className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            {isLoading ? '⏳ Exchanging...' : '🔄 Exchange Code for Token'}
          </button>
        </div>
      )}

      {/* Client Credentials Flow */}
      {selectedGrantType === 'client_credentials' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Client Secret</label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your client secret"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
            />
          </div>

          <button
            onClick={handleClientCredentials}
            disabled={isLoading || !clientSecret}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            {isLoading ? '⏳ Requesting...' : '🎫 Get Access Token'}
          </button>
        </div>
      )}

      {/* PKCE Flow */}
      {selectedGrantType === 'pkce' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <p className="text-sm">
              ℹ️ PKCE flow requires code challenge generation on the client side.
              Use the authorization flow above with the PKCE parameters.
            </p>
          </div>
          <button
            onClick={handleStartAuthFlow}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold"
          >
            🚀 Start PKCE Flow
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          <div className="flex items-start gap-2">
            <span className="text-xl">❌</span>
            <div className="flex-1">
              <div className="font-semibold mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Response</label>
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
              ✓ Success
            </span>
          </div>
          <div className="bg-black/50 rounded-lg p-4 border border-green-500/30 overflow-x-auto">
            <pre className="text-xs font-mono text-gray-300">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {response.refresh_token && (
            <button
              onClick={() => handleRefreshToken(response.refresh_token)}
              disabled={isLoading}
              className="mt-3 w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition text-sm font-semibold"
            >
              🔄 Use Refresh Token
            </button>
          )}
        </div>
      )}
    </div>
  );
}
