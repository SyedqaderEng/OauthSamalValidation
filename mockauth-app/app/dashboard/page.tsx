import Link from "next/link";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <>
      {/* Animated Background */}
      <div className="bg-animation-dashboard">
        <div className="bg-gradient-dash gradient-dash-1"></div>
        <div className="bg-gradient-dash gradient-dash-2"></div>
      </div>

      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="logo">MockAuth</div>
        <div className="top-nav-right">
          <input type="text" className="search-bar" placeholder="Search apps, environments..." />
          <div className="icon-button">🔔</div>
          <div className="icon-button">⚙️</div>
          <div className="user-menu">
            <div className="user-avatar">JD</div>
            <span>John Doe</span>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Main</div>
            <ul className="sidebar-menu">
              <li className="sidebar-item active">
                <span className="sidebar-icon">📊</span>
                Dashboard
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">🔑</span>
                OAuth Apps
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">🛡️</span>
                SAML Environments
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">🔧</span>
                Developer Tools
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Management</div>
            <ul className="sidebar-menu">
              <li className="sidebar-item">
                <span className="sidebar-icon">📦</span>
                Metadata Library
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">📋</span>
                Activity Logs
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">👥</span>
                Team Settings
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">🔐</span>
                API Keys
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Resources</div>
            <ul className="sidebar-menu">
              <li className="sidebar-item">
                <span className="sidebar-icon">📚</span>
                Documentation
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">💬</span>
                Support
              </li>
              <li className="sidebar-item">
                <span className="sidebar-icon">⚡</span>
                API Status
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening with your auth testing environments.</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid-dashboard">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">OAuth Apps</div>
                <div className="stat-icon">🔑</div>
              </div>
              <div className="stat-value">12</div>
              <div className="stat-change">+3 this week</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">SAML Environments</div>
                <div className="stat-icon">🛡️</div>
              </div>
              <div className="stat-value">8</div>
              <div className="stat-change">+2 this week</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">API Calls (30d)</div>
                <div className="stat-icon">📊</div>
              </div>
              <div className="stat-value">24.5K</div>
              <div className="stat-change">+18% from last month</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Expiring Soon</div>
                <div className="stat-icon">⏰</div>
              </div>
              <div className="stat-value">3</div>
              <div className="stat-change negative">Action needed</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <div className="action-btn">
                <div className="action-icon">➕</div>
                <div className="action-label">New OAuth App</div>
              </div>
              <div className="action-btn">
                <div className="action-icon">🆕</div>
                <div className="action-label">New SAML IdP</div>
              </div>
              <div className="action-btn">
                <div className="action-icon">📤</div>
                <div className="action-label">Import Metadata</div>
              </div>
              <div className="action-btn">
                <div className="action-icon">🔓</div>
                <div className="action-label">Decode JWT</div>
              </div>
            </div>
          </div>

          {/* Active OAuth Apps */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Active OAuth Apps</h2>
              <span className="view-all-btn">View All →</span>
            </div>
            <div className="resource-grid">
              <div className="resource-card">
                <div className="resource-header">
                  <div className="resource-info">
                    <h3>Production API Testing</h3>
                    <div className="resource-meta">
                      <span>Created 15 days ago</span>
                      <span>•</span>
                      <span>1,245 requests</span>
                    </div>
                  </div>
                  <span className="status-badge status-active">Active</span>
                </div>
                <div className="resource-details">
                  <div className="detail-item">
                    <div className="detail-label">Client ID</div>
                    <div className="detail-value">client_prod_abc123xyz</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Grant Type</div>
                    <div className="detail-value">authorization_code</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Expires In</div>
                    <div className="detail-value">15 days</div>
                  </div>
                </div>
                <div className="resource-actions">
                  <button className="btn btn-primary">View Details</button>
                  <button className="btn btn-secondary">Copy Credentials</button>
                  <button className="btn btn-secondary">Export Config</button>
                  <button className="btn btn-danger">Delete</button>
                </div>
              </div>

              <div className="resource-card">
                <div className="resource-header">
                  <div className="resource-info">
                    <h3>Mobile App OAuth</h3>
                    <div className="resource-meta">
                      <span>Created 8 days ago</span>
                      <span>•</span>
                      <span>892 requests</span>
                    </div>
                  </div>
                  <span className="status-badge status-active">Active</span>
                </div>
                <div className="resource-details">
                  <div className="detail-item">
                    <div className="detail-label">Client ID</div>
                    <div className="detail-value">client_mobile_xyz789abc</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Grant Type</div>
                    <div className="detail-value">authorization_code + PKCE</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Expires In</div>
                    <div className="detail-value">22 days</div>
                  </div>
                </div>
                <div className="resource-actions">
                  <button className="btn btn-primary">View Details</button>
                  <button className="btn btn-secondary">Copy Credentials</button>
                  <button className="btn btn-secondary">Export Config</button>
                  <button className="btn btn-danger">Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Active SAML Environments */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Active SAML Environments</h2>
              <span className="view-all-btn">View All →</span>
            </div>
            <div className="resource-grid">
              <div className="resource-card">
                <div className="resource-header">
                  <div className="resource-info">
                    <h3>Enterprise SSO Test</h3>
                    <div className="resource-meta">
                      <span>IdP Mode</span>
                      <span>•</span>
                      <span>Created 22 days ago</span>
                    </div>
                  </div>
                  <span className="status-badge status-expiring">Expiring Soon</span>
                </div>
                <div className="resource-details">
                  <div className="detail-item">
                    <div className="detail-label">Entity ID</div>
                    <div className="detail-value">https://mockauth.dev/saml/enterprise-sso</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">SSO URL</div>
                    <div className="detail-value">https://mockauth.dev/saml/sso/ent</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Expires In</div>
                    <div className="detail-value">8 days</div>
                  </div>
                </div>
                <div className="resource-actions">
                  <button className="btn btn-primary">View Details</button>
                  <button className="btn btn-secondary">Download Metadata</button>
                  <button className="btn btn-secondary">Extend Expiry</button>
                  <button className="btn btn-danger">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
