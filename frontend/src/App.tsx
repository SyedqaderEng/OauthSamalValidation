import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ImportMetadata from './pages/ImportMetadata';
import ExportMetadata from './pages/ExportMetadata';
import SamlTestConsole from './pages/SamlTestConsole';
import SamlCallback from './pages/SamlCallback';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/saml-callback" element={<SamlCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import-metadata"
        element={
          <ProtectedRoute>
            <ImportMetadata />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-metadata"
        element={
          <ProtectedRoute>
            <ExportMetadata />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saml-console"
        element={
          <ProtectedRoute>
            <SamlTestConsole />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
