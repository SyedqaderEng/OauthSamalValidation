import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

const ImportMetadata: React.FC = () => {
  const [xml, setXml] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setXml(event.target?.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setResult(null);
    setLoading(true);

    try {
      const response = await apiService.importMetadata(xml);
      setResult(response.entity);
      setSuccess(true);
      setXml('');
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import metadata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Import SAML Metadata</h1>
          <p className="mt-2 text-gray-600">
            Upload an XML file or paste the metadata content below
          </p>
        </div>

        {/* Success Message */}
        {success && result && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">
              ✓ Metadata imported successfully!
            </h3>
            <div className="text-sm text-green-700">
              <p>
                <strong>Type:</strong> {result.type}
              </p>
              <p>
                <strong>Entity ID:</strong> {result.entityId}
              </p>
              {result.ssoUrl && (
                <p>
                  <strong>SSO URL:</strong> {result.ssoUrl}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload XML File
              </label>
              <input
                type="file"
                accept=".xml,text/xml"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Paste XML */}
            <div>
              <label
                htmlFor="xml"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Paste XML Metadata
              </label>
              <textarea
                id="xml"
                rows={15}
                value={xml}
                onChange={(e) => setXml(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono"
                placeholder="<EntityDescriptor xmlns=&quot;urn:oasis:names:tc:SAML:2.0:metadata&quot; ...>"
              />
              <p className="mt-2 text-sm text-gray-500">
                Paste the complete SAML metadata XML here
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !xml.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Importing...' : 'Import Metadata'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-semibold mb-2">Help</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Metadata must be valid SAML 2.0 XML format</li>
            <li>Supports both Service Provider (SP) and Identity Provider (IdP) metadata</li>
            <li>The system will automatically detect the type and extract relevant information</li>
            <li>If an entity with the same Entity ID exists, it will be updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportMetadata;
