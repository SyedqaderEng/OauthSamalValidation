import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { SamlConfig } from '../types';

const ExportMetadata: React.FC = () => {
  const [config, setConfig] = useState<SamlConfig | null>(null);
  const [spMetadata, setSpMetadata] = useState('');
  const [idpMetadata, setIdpMetadata] = useState('');
  const [loadingSp, setLoadingSp] = useState(false);
  const [loadingIdp, setLoadingIdp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { config } = await apiService.getSamlConfig();
      setConfig(config);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const fetchSpMetadata = async () => {
    setLoadingSp(true);
    setError('');
    try {
      const url = apiService.getSpMetadataUrl();
      const response = await fetch(url);
      const xml = await response.text();
      setSpMetadata(xml);
    } catch (err: any) {
      setError('Failed to fetch SP metadata');
    } finally {
      setLoadingSp(false);
    }
  };

  const fetchIdpMetadata = async () => {
    setLoadingIdp(true);
    setError('');
    try {
      const url = apiService.getIdpMetadataUrl();
      const response = await fetch(url);
      const xml = await response.text();
      setIdpMetadata(xml);
    } catch (err: any) {
      setError('Failed to fetch IdP metadata');
    } finally {
      setLoadingIdp(false);
    }
  };

  const downloadMetadata = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Metadata copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Export SAML Metadata</h1>
          <p className="mt-2 text-gray-600">
            Download or copy your SAML metadata for Service Provider or Identity Provider
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Current Configuration */}
        {config && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-semibold">
              Current App Role: <span className="font-bold">{config.appRole}</span>
            </p>
            <p className="text-blue-800 text-sm mt-1">
              Entity ID: {config.defaultEntityId}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Provider Metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Service Provider (SP) Metadata
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Use this metadata to configure an external Identity Provider to trust this application as a Service Provider.
            </p>

            <div className="space-y-3 mb-4">
              <button
                onClick={fetchSpMetadata}
                disabled={loadingSp}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loadingSp ? 'Loading...' : 'Load SP Metadata'}
              </button>

              {spMetadata && (
                <>
                  <button
                    onClick={() => downloadMetadata(spMetadata, 'sp-metadata.xml')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download XML
                  </button>
                  <button
                    onClick={() => copyToClipboard(spMetadata)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Copy to Clipboard
                  </button>
                </>
              )}
            </div>

            {spMetadata && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata XML
                </label>
                <textarea
                  readOnly
                  value={spMetadata}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                />
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>Metadata URL:</strong>
              </p>
              <code className="text-xs text-gray-800 block mt-1 break-all">
                {apiService.getSpMetadataUrl()}
              </code>
            </div>
          </div>

          {/* Identity Provider Metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Identity Provider (IdP) Metadata
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Use this metadata to configure an external Service Provider to trust this application as an Identity Provider.
            </p>

            <div className="space-y-3 mb-4">
              <button
                onClick={fetchIdpMetadata}
                disabled={loadingIdp}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loadingIdp ? 'Loading...' : 'Load IdP Metadata'}
              </button>

              {idpMetadata && (
                <>
                  <button
                    onClick={() => downloadMetadata(idpMetadata, 'idp-metadata.xml')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download XML
                  </button>
                  <button
                    onClick={() => copyToClipboard(idpMetadata)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Copy to Clipboard
                  </button>
                </>
              )}
            </div>

            {idpMetadata && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata XML
                </label>
                <textarea
                  readOnly
                  value={idpMetadata}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                />
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>Metadata URL:</strong>
              </p>
              <code className="text-xs text-gray-800 block mt-1 break-all">
                {apiService.getIdpMetadataUrl()}
              </code>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-900 font-semibold mb-2">Important Notes</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Metadata URLs are publicly accessible without authentication</li>
            <li>These URLs can be used directly in external SAML configurations</li>
            <li>Ensure your certificates are properly configured before sharing metadata</li>
            <li>Metadata includes signing certificates and endpoint URLs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportMetadata;
