import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="bg-gradient gradient-1"></div>
        <div className="bg-gradient gradient-2"></div>
        <div className="bg-gradient gradient-3"></div>
      </div>

      {/* Navigation */}
      <nav>
        <div className="container">
          <Link href="/" className="logo">MockAuth</Link>
          <ul className="nav-menu">
            <li><a href="#features">Features</a></li>
            <li><a href="#tools">Tools</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#docs">Docs</a></li>
          </ul>
          <Link href="/dashboard" className="nav-btn">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              <span className="gradient-text">OAuth & SAML</span><br />
              Testing Made Fun
            </h1>
            <p>The ultimate mock authentication playground for developers. Create, test, and debug OAuth and SAML flows in seconds. No configuration, no headaches, just pure testing bliss.</p>
            <div className="hero-cta">
              <Link href="/dashboard" className="btn-hero-primary">Start Testing Free →</Link>
              <a href="#" className="btn-hero-secondary">See How It Works</a>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Demo Section */}
      <section className="terminal-section">
        <div className="container">
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="terminal-dot dot-red"></span>
              <span className="terminal-dot dot-yellow"></span>
              <span className="terminal-dot dot-green"></span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="prompt">$</span> <span className="command">mockauth create oauth-app --name &quot;My Test App&quot;</span>
              </div>
              <div className="terminal-line">
                <span className="output-success">✓ OAuth 2.0 App created successfully!</span>
              </div>
              <div className="terminal-line">
                <span className="output">  App ID: <span className="output-highlight">app_abc123xyz</span></span>
              </div>
              <div className="terminal-line">
                <span className="output">  Client ID: <span className="output-highlight">client_demo_xyz789</span></span>
              </div>
              <div className="terminal-line">
                <span className="output">  Client Secret: <span className="output-highlight">sk_live_xyz123abc456</span></span>
              </div>
              <div className="terminal-line">
                <span className="output">  Token Endpoint: <span className="output-highlight">https://mockauth.dev/oauth/token</span></span>
              </div>
              <div className="terminal-line">&nbsp;</div>
              <div className="terminal-line">
                <span className="prompt">$</span> <span className="command">mockauth create saml-idp --entity-id &quot;myapp&quot;</span>
              </div>
              <div className="terminal-line">
                <span className="output-success">✓ SAML IdP created successfully!</span>
              </div>
              <div className="terminal-line">
                <span className="output">  Entity ID: <span className="output-highlight">https://mockauth.dev/saml/myapp</span></span>
              </div>
              <div className="terminal-line">
                <span className="output">  SSO URL: <span className="output-highlight">https://mockauth.dev/saml/myapp/sso</span></span>
              </div>
              <div className="terminal-line">
                <span className="output">  Metadata: <span className="output-highlight">https://mockauth.dev/saml/myapp/metadata.xml</span></span>
              </div>
              <div className="terminal-line">
                <span className="output">  Auto-expires in: <span className="output-highlight">30 days</span></span>
              </div>
              <div className="terminal-line">&nbsp;</div>
              <div className="terminal-line">
                <span className="prompt">$</span> <span className="cursor">█</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
            <div className="stat-box">
              <h3>&lt;50ms</h3>
              <p>Response Time</p>
            </div>
            <div className="stat-box">
              <h3>50K+</h3>
              <p>Developers</p>
            </div>
            <div className="stat-box">
              <h3>5M+</h3>
              <p>Tests/Month</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
