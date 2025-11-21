import React from 'react';
import { SamlLog } from '../types';

interface Props {
  logs: SamlLog[];
}

const SamlStatusCard: React.FC<Props> = ({ logs }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-100';
      case 'FAILURE':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'SP_INITIATED':
        return 'SP Initiated';
      case 'IDP_INITIATED':
        return 'IdP Initiated';
      case 'LOGIN':
        return 'Login';
      case 'LOGOUT':
        return 'Logout';
      case 'ERROR':
        return 'Error';
      default:
        return eventType;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent SAML Activity
      </h3>
      {logs.length === 0 ? (
        <p className="text-gray-500 text-sm">No SAML activity yet</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border-l-4 border-primary-500 pl-4 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {getEventTypeLabel(log.eventType)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Entity ID: {log.entityId}
              </p>
              {log.details && log.details.nameID && (
                <p className="text-sm text-gray-600">
                  NameID: {log.details.nameID}
                </p>
              )}
              {log.details && log.details.error && (
                <p className="text-sm text-red-600 mt-1">
                  Error: {log.details.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SamlStatusCard;
