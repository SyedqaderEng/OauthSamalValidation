'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewOAuthAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grantTypes: ['authorization_code'] as string[],
    redirectUris: [''],
    scopes: ['openid', 'profile', 'email'],
    accessTokenLifetime: 3600,
    refreshTokenLifetime: 86400,
    autoApprove: true,
    isPublic: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/oauth/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          redirectUris: formData.redirectUris.filter(uri => uri.trim() !== ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create OAuth app');
        setLoading(false);
        return;
      }

      // Show the client secret before redirecting
      if (data.app?.clientSecret) {
        setShowSecret(true);
        setTimeout(() => {
          router.push(`/dashboard/oauth/${data.app.id}`);
        }, 5000);
      } else {
        router.push('/dashboard/oauth');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const toggleGrantType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      grantTypes: prev.grantTypes.includes(type)
        ? prev.grantTypes.filter(t => t !== type)
        : [...prev.grantTypes, type],
    }));
  };

  const toggleScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const addRedirectUri = () => {
    setFormData(prev => ({
      ...prev,
      redirectUris: [...prev.redirectUris, ''],
    }));
  };

  const updateRedirectUri = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      redirectUris: prev.redirectUris.map((uri, i) => i === index ? value : uri),
    }));
  };

  const removeRedirectUri = (index: number) => {
    setFormData(prev => ({
      ...prev,
      redirectUris: prev.redirectUris.filter((_, i) => i !== index),
    }));
  };

  const grantTypeOptions = [
    { value: 'authorization_code', label: 'Authorization Code' },
    { value: 'client_credentials', label: 'Client Credentials' },
    { value: 'refresh_token', label: 'Refresh Token' },
    { value: 'password', label: 'Password (Resource Owner)' },
  ];

  const scopeOptions = [
    { value: 'openid', label: 'OpenID' },
    { value: 'profile', label: 'Profile' },
    { value: 'email', label: 'Email' },
    { value: 'address', label: 'Address' },
    { value: 'phone', label: 'Phone' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/oauth" className="text-pink-500 hover:text-pink-400 text-sm mb-4 inline-block">
          ← Back to OAuth Apps
        </Link>
        <h1 className="text-4xl font-black mb-2">Create OAuth App</h1>
        <p className="text-gray-400">Set up a new OAuth 2.0 application for testing</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-2">App Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition"
              placeholder="My OAuth App"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition resize-none"
              placeholder="A brief description of your OAuth app"
            />
          </div>
        </div>

        {/* Grant Types */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Grant Types</h2>
          <p className="text-sm text-gray-400">Select which OAuth flows this app will support</p>

          <div className="grid md:grid-cols-2 gap-3">
            {grantTypeOptions.map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.grantTypes.includes(option.value)
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.grantTypes.includes(option.value)}
                  onChange={() => toggleGrantType(option.value)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Redirect URIs */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Redirect URIs</h2>
          <p className="text-sm text-gray-400">Allowed callback URLs for OAuth flows</p>

          <div className="space-y-3">
            {formData.redirectUris.map((uri, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={uri}
                  onChange={(e) => updateRedirectUri(index, e.target.value)}
                  required
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition"
                  placeholder="https://example.com/callback"
                />
                {formData.redirectUris.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRedirectUri(index)}
                    className="px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/50 hover:border-red-500 transition text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRedirectUri}
            className="text-pink-500 hover:text-pink-400 text-sm font-medium"
          >
            + Add Redirect URI
          </button>
        </div>

        {/* Scopes */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Scopes</h2>
          <p className="text-sm text-gray-400">Select which scopes this app can request</p>

          <div className="flex flex-wrap gap-3">
            {scopeOptions.map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition ${
                  formData.scopes.includes(option.value)
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.scopes.includes(option.value)}
                  onChange={() => toggleScope(option.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Advanced Settings</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Access Token Lifetime (seconds)</label>
              <input
                type="number"
                value={formData.accessTokenLifetime}
                onChange={(e) => setFormData(prev => ({ ...prev, accessTokenLifetime: parseInt(e.target.value) }))}
                min={60}
                max={86400}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 3600 (1 hour)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Refresh Token Lifetime (seconds)</label>
              <input
                type="number"
                value={formData.refreshTokenLifetime}
                onChange={(e) => setFormData(prev => ({ ...prev, refreshTokenLifetime: parseInt(e.target.value) }))}
                min={3600}
                max={2592000}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 86400 (24 hours)</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoApprove}
                onChange={(e) => setFormData(prev => ({ ...prev, autoApprove: e.target.checked }))}
                className="w-4 h-4"
              />
              <div>
                <span className="font-medium">Auto-approve</span>
                <p className="text-xs text-gray-500">Skip consent screen for testing</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4"
              />
              <div>
                <span className="font-medium">Public client</span>
                <p className="text-xs text-gray-500">Client secret not required (for mobile/SPA apps)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create OAuth App'}
          </button>
          <Link
            href="/dashboard/oauth"
            className="px-8 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
