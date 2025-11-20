'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSAMLEnvironmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'idp' as 'idp' | 'sp',
    entityId: '',
    ssoUrl: '',
    sloUrl: '',
    acsUrl: '',
    nameidFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    assertionLifetime: 300,
    signAssertions: true,
    signResponse: true,
    encryptAssertions: false,
    attributeMappings: {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/saml/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create SAML environment');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/saml/${data.environment.id}`);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const updateAttributeMapping = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributeMappings: {
        ...prev.attributeMappings,
        [key]: value,
      },
    }));
  };

  const nameidFormatOptions = [
    { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress', label: 'Email Address' },
    { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified', label: 'Unspecified' },
    { value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent', label: 'Persistent' },
    { value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient', label: 'Transient' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/saml" className="text-purple-500 hover:text-purple-400 text-sm mb-4 inline-block">
          ← Back to SAML Environments
        </Link>
        <h1 className="text-4xl font-black mb-2">Create SAML Environment</h1>
        <p className="text-gray-400">Set up a new SAML 2.0 Identity Provider or Service Provider</p>
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
            <label className="block text-sm font-medium mb-2">Environment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              placeholder="My SAML Environment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition resize-none"
              placeholder="A brief description of your SAML environment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <div className="grid md:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.type === 'idp'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="idp"
                  checked={formData.type === 'idp'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: 'idp' }))}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium">Identity Provider (IdP)</span>
                  <p className="text-xs text-gray-400">Authenticates users</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.type === 'sp'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="sp"
                  checked={formData.type === 'sp'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: 'sp' }))}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium">Service Provider (SP)</span>
                  <p className="text-xs text-gray-400">Consumes authentication</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SAML Configuration */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">SAML Configuration</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Entity ID *</label>
            <input
              type="url"
              value={formData.entityId}
              onChange={(e) => setFormData(prev => ({ ...prev, entityId: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              placeholder="https://example.com/saml/metadata"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier for this SAML entity</p>
          </div>

          {formData.type === 'idp' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">SSO URL *</label>
                <input
                  type="url"
                  value={formData.ssoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, ssoUrl: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                  placeholder="https://example.com/saml/sso"
                />
                <p className="text-xs text-gray-500 mt-1">Single Sign-On endpoint URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SLO URL</label>
                <input
                  type="url"
                  value={formData.sloUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sloUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                  placeholder="https://example.com/saml/slo"
                />
                <p className="text-xs text-gray-500 mt-1">Single Logout endpoint URL (optional)</p>
              </div>
            </>
          )}

          {formData.type === 'sp' && (
            <div>
              <label className="block text-sm font-medium mb-2">ACS URL *</label>
              <input
                type="url"
                value={formData.acsUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, acsUrl: e.target.value }))}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                placeholder="https://example.com/saml/acs"
              />
              <p className="text-xs text-gray-500 mt-1">Assertion Consumer Service URL</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">NameID Format</label>
            <select
              value={formData.nameidFormat}
              onChange={(e) => setFormData(prev => ({ ...prev, nameidFormat: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
            >
              {nameidFormatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assertion Lifetime (seconds)</label>
            <input
              type="number"
              value={formData.assertionLifetime}
              onChange={(e) => setFormData(prev => ({ ...prev, assertionLifetime: parseInt(e.target.value) }))}
              min={60}
              max={3600}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 300 (5 minutes)</p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Security Settings</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.signAssertions}
                onChange={(e) => setFormData(prev => ({ ...prev, signAssertions: e.target.checked }))}
                className="w-4 h-4"
              />
              <div>
                <span className="font-medium">Sign Assertions</span>
                <p className="text-xs text-gray-500">Digitally sign SAML assertions</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.signResponse}
                onChange={(e) => setFormData(prev => ({ ...prev, signResponse: e.target.checked }))}
                className="w-4 h-4"
              />
              <div>
                <span className="font-medium">Sign Response</span>
                <p className="text-xs text-gray-500">Digitally sign SAML response</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.encryptAssertions}
                onChange={(e) => setFormData(prev => ({ ...prev, encryptAssertions: e.target.checked }))}
                className="w-4 h-4"
              />
              <div>
                <span className="font-medium">Encrypt Assertions</span>
                <p className="text-xs text-gray-500">Encrypt SAML assertions for added security</p>
              </div>
            </label>
          </div>
        </div>

        {/* Attribute Mappings */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold">Attribute Mappings</h2>
          <p className="text-sm text-gray-400">Map SAML attributes to user properties</p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="text"
                value={formData.attributeMappings.email}
                onChange={(e) => updateAttributeMapping('email', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition text-sm"
                placeholder="email"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">First Name</label>
              <input
                type="text"
                value={formData.attributeMappings.firstName}
                onChange={(e) => updateAttributeMapping('firstName', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition text-sm"
                placeholder="firstName"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.attributeMappings.lastName}
                onChange={(e) => updateAttributeMapping('lastName', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition text-sm"
                placeholder="lastName"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create SAML Environment'}
          </button>
          <Link
            href="/dashboard/saml"
            className="px-8 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
