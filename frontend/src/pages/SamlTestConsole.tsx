import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { SamlEntity, SamlLog } from '../types';

const SamlTestConsole: React.FC = () => {
  const [entities, setEntities] = useState<SamlEntity[]>([]);
  const [logs, setLogs] = useState<SamlLog[]>([]);
  const [selectedIdp, setSelectedIdp] = useState('');
  const [selectedSp, setSelectedSp] = useState('');
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadLogs();
  }, []);

  const loadData = async () => {
    try {
      const { entities: allEntities } = await apiService.listMetadata();
      setEntities(allEntities);
    } catch (error) {
      console.error('Failed to load entities:', error);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const { logs: samlLogs } = await apiService.getSamlLogs(20);
      setLogs(samlLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSpInitiatedLogin = () => {
    if (!selectedIdp) {
      alert('Please select an Identity Provider');
      return;
    }
    const url = apiService.getSamlLoginUrl(selectedIdp);
    window.location.href = url;
  };

  const handleIdpInitiatedLogin = async () => {
    if (!selectedSp) {
      alert('Please select a Service Provider');
      return;
    }

    setLoading(true);
    try {
      const { samlResponse, acsUrl } = await apiService.processSamlIdpLogin(selectedSp);

      // Create a form and submit it to the SP's ACS URL
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = acsUrl;

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'SAMLResponse';
      input.value = samlResponse;

      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      alert('Failed to initiate IdP login: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const idpEntities = entities.filter((e) => e.type === 'IDP');
  const spEntities = entities.filter((e) => e.type === 'SP');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILURE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">SAML Test Console</h1>
          <p className="mt-2 text-gray-600">
            Test SAML authentication flows and view detailed logs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SP-Initiated Login */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              SP-Initiated Login Test
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This application acts as a Service Provider and initiates login with an external Identity Provider.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Identity Provider
                </label>
                <select
                  value={selectedIdp}
                  onChange={(e) => setSelectedIdp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Choose IdP --</option>
                  {idpEntities.map((entity) => (
                    <option key={entity.id} value={entity.entityId}>
                      {entity.entityId}
                    </option>
                  ))}
                </select>
                {idpEntities.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600">
                    No IdP entities imported. Import IdP metadata first.
                  </p>
                )}
              </div>

              <button
                onClick={handleSpInitiatedLogin}
                disabled={!selectedIdp}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start SP-Initiated Login
              </button>

              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>What happens:</strong>
                </p>
                <ol className="text-xs text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                  <li>Creates SAML AuthnRequest</li>
                  <li>Redirects to IdP SSO endpoint</li>
                  <li>User logs in at IdP</li>
                  <li>IdP sends SAML Response to ACS</li>
                  <li>User is authenticated</li>
                </ol>
              </div>
            </div>
          </div>

          {/* IdP-Initiated Login */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              IdP-Initiated Login Test
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This application acts as an Identity Provider and sends a SAML assertion to an external Service Provider.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service Provider
                </label>
                <select
                  value={selectedSp}
                  onChange={(e) => setSelectedSp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Choose SP --</option>
                  {spEntities.map((entity) => (
                    <option key={entity.id} value={entity.entityId}>
                      {entity.entityId}
                    </option>
                  ))}
                </select>
                {spEntities.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600">
                    No SP entities imported. Import SP metadata first.
                  </p>
                )}
              </div>

              <button
                onClick={handleIdpInitiatedLogin}
                disabled={!selectedSp || loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Start IdP-Initiated Login'}
              </button>

              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-xs text-green-800">
                  <strong>What happens:</strong>
                </p>
                <ol className="text-xs text-green-700 mt-1 space-y-1 list-decimal list-inside">
                  <li>User is already logged in</li>
                  <li>Creates SAML Response with user attributes</li>
                  <li>Signs the assertion</li>
                  <li>POSTs to SP's ACS endpoint</li>
                  <li>SP validates and logs user in</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* SAML Logs */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">SAML Request/Response Logs</h2>
            <button
              onClick={loadLogs}
              disabled={logsLoading}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              {logsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No SAML logs yet. Try testing a login flow above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.eventType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                        {log.entityId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user?.email || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Endpoints Reference */}
        <div className="mt-6 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">SAML Endpoints Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 mb-1">Service Provider (SP)</p>
              <ul className="space-y-1 text-gray-700">
                <li>
                  <strong>Metadata:</strong> <code className="bg-white px-1 rounded">/saml/metadata</code>
                </li>
                <li>
                  <strong>ACS:</strong> <code className="bg-white px-1 rounded">/saml/acs</code>
                </li>
                <li>
                  <strong>Login:</strong> <code className="bg-white px-1 rounded">/saml/login/:idpEntityId</code>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Identity Provider (IdP)</p>
              <ul className="space-y-1 text-gray-700">
                <li>
                  <strong>Metadata:</strong> <code className="bg-white px-1 rounded">/saml/idp/metadata</code>
                </li>
                <li>
                  <strong>SSO:</strong> <code className="bg-white px-1 rounded">/saml/idp/sso</code>
                </li>
                <li>
                  <strong>SLO:</strong> <code className="bg-white px-1 rounded">/saml/idp/slo</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamlTestConsole;
