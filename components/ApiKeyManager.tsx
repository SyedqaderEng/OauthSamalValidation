'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CopyButton from './CopyButton';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

interface ApiKeyManagerProps {
  apiKeys: ApiKey[];
  userId: string;
}

export default function ApiKeyManager({ apiKeys, userId }: ApiKeyManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please provide a name for the API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data.apiKey); // The plain text API key
        setNewKeyName('');
        setNewKeyPermissions(['read']);
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create API key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to revoke API key');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleDismissCreatedKey = () => {
    setCreatedKey(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      {/* Created Key Display (one-time) */}
      {createdKey && (
        <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">✓</span>
            <div className="flex-1">
              <h3 className="font-bold text-green-400 mb-1">API Key Created Successfully!</h3>
              <p className="text-sm text-gray-300">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/30 px-4 py-3 rounded-lg border border-green-500/30 font-mono text-sm break-all">
              {createdKey}
            </code>
            <CopyButton text={createdKey} label="Copy" />
          </div>
          <button
            onClick={handleDismissCreatedKey}
            className="mt-3 w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
          >
            I've copied the key
          </button>
        </div>
      )}

      {/* Create New Key Form */}
      {isCreating && !createdKey ? (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-4">Create New API Key</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Permissions</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newKeyPermissions.includes('read')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewKeyPermissions([...newKeyPermissions, 'read']);
                      } else {
                        setNewKeyPermissions(newKeyPermissions.filter(p => p !== 'read'));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Read (View OAuth apps and SAML environments)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newKeyPermissions.includes('write')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewKeyPermissions([...newKeyPermissions, 'write']);
                      } else {
                        setNewKeyPermissions(newKeyPermissions.filter(p => p !== 'write'));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Write (Create and modify resources)</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateKey}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition font-semibold text-sm"
              >
                {isLoading ? '⏳ Creating...' : '✓ Create API Key'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setError(null);
                  setNewKeyName('');
                  setNewKeyPermissions(['read']);
                }}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : !createdKey ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold text-sm"
        >
          ➕ Create New API Key
        </button>
      ) : null}

      {/* Existing API Keys List */}
      {apiKeys.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400">Your API Keys</h3>
          {apiKeys.map((key) => {
            const permissions = JSON.parse(key.permissions) as string[];
            return (
              <div
                key={key.id}
                className="p-4 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">{key.name}</span>
                    <code className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10">
                      {key.keyPrefix}...
                    </code>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                    {key.lastUsedAt && (
                      <>
                        <span>•</span>
                        <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                      </>
                    )}
                    {key.expiresAt && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-500">
                          Expires {new Date(key.expiresAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="ml-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition text-sm text-red-400"
                >
                  Revoke
                </button>
              </div>
            );
          })}
        </div>
      )}

      {apiKeys.length === 0 && !isCreating && !createdKey && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No API keys yet. Create one to get started with programmatic access.
        </div>
      )}
    </div>
  );
}
