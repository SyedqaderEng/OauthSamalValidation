import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';
import SamlStatusCard from '../components/SamlStatusCard';
import { SamlLog, SamlConfig, SamlEntity } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SamlLog[]>([]);
  const [config, setConfig] = useState<SamlConfig | null>(null);
  const [entities, setEntities] = useState<SamlEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [logsRes, configRes, entitiesRes] = await Promise.all([
        apiService.getUserSamlLogs(),
        apiService.getSamlConfig(),
        apiService.listMetadata(),
      ]);
      setLogs(logsRes.logs);
      setConfig(configRes.config);
      setEntities(entitiesRes.entities);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              SAML Test Platform
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome, {user?.displayName || user?.username}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-base font-medium text-gray-900">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="text-base font-medium text-gray-900">
                {user?.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : 'First time login'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="text-base font-medium text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* SAML Configuration */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            SAML Configuration
          </h3>
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">App Role</p>
                <p className="text-base font-medium text-gray-900">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      config.appRole === 'BOTH'
                        ? 'bg-purple-100 text-purple-800'
                        : config.appRole === 'SP'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {config.appRole}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Default Entity ID</p>
                <p className="text-base font-medium text-gray-900 truncate">
                  {config.defaultEntityId}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/import-metadata"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Import Metadata
            </h3>
            <p className="text-sm text-gray-600">
              Upload or paste SAML metadata XML
            </p>
          </Link>
          <Link
            to="/export-metadata"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Export Metadata
            </h3>
            <p className="text-sm text-gray-600">
              Download SP or IdP metadata
            </p>
          </Link>
          <Link
            to="/saml-console"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              SAML Test Console
            </h3>
            <p className="text-sm text-gray-600">
              Test SAML flows and view logs
            </p>
          </Link>
        </div>

        {/* Imported Entities Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Imported SAML Entities ({entities.length})
          </h3>
          {entities.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No SAML entities imported yet. Import metadata to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entities.slice(0, 5).map((entity) => (
                    <tr key={entity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entity.type === 'SP'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {entity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                        {entity.entityId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entity.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {entity.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SAML Activity */}
        <SamlStatusCard logs={logs} />
      </main>
    </div>
  );
};

export default Dashboard;
