import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background Animation */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-r from-pink-600/50 to-transparent top-[-200px] right-[-200px] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-r from-purple-600/50 to-transparent bottom-[-200px] left-[-200px] animate-pulse"></div>
      </div>

      {/* Floating Notification Cards */}
      <div className="fixed top-24 right-8 z-40 space-y-4">
        <div className="floating-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-xl shadow-2xl animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 text-xl">✓</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-green-400 mb-1">OAuth 2.0 App Created!</div>
              <div className="text-xs font-mono text-gray-300 space-y-1">
                <div>client_id: <span className="text-pink-400">demo_abc123</span></div>
                <div>client_secret: <span className="text-pink-400">sk_xyz789</span></div>
                <div className="text-green-400 mt-2">✓ Ready to authenticate!</div>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            MockAuth
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#demo" className="text-gray-300 hover:text-white transition">Demo</a>
            <Link href="/login" className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                  OAuth & SAML
                </span>
                <br />
                Testing Made Simple
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Create mock OAuth 2.0 and SAML 2.0 environments in seconds. Test authentication flows without the complexity of setting up real identity providers.
              </p>
              <div className="flex gap-4">
                <Link href="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold">
                  Start Free →
                </Link>
                <Link href="/login" className="px-8 py-4 rounded-full bg-white/5 border-2 border-white/20 hover:bg-white/10 transition font-semibold">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Console Demo */}
            <div className="bg-[#1a1a1f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm text-gray-400 font-mono">OAuth 2.0 Flow</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-green-400">$ curl -X POST https://mockauth.dev/oauth/token \</div>
                <div className="text-gray-400 pl-4">-d "grant_type=authorization_code" \</div>
                <div className="text-gray-400 pl-4">-d "client_id=demo_abc123" \</div>
                <div className="text-gray-400 pl-4">-d "client_secret=sk_xyz789"</div>
                <div className="text-purple-400 mt-3">→ Response:</div>
                <div className="bg-black/40 p-3 rounded border border-white/5 text-xs">
                  {`{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200..."
}`}
                </div>
                <div className="text-green-400 flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span>✓ Authentication successful</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400">Powerful features for modern authentication testing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* OAuth 2.0 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/50 transition hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🚀</div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">OAuth 2.0</h3>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Authorization Code Flow
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> PKCE Support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Client Credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Refresh Tokens
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Custom Scopes
                </li>
              </ul>
            </div>

            {/* SAML 2.0 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/50 transition hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🏢</div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">SAML 2.0</h3>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Identity Provider (IdP)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Service Provider (SP)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Metadata Exchange
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Signed Assertions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> SSO Testing
                </li>
              </ul>
            </div>

            {/* Developer Tools */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/50 transition hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🔓</div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Free Tools</h3>
              <ul className="text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> JWT Decoder
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> SAML Response Parser
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Base64 Encoder/Decoder
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Signature Verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> No Login Required
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">$0</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 5 OAuth Apps
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 3 SAML Environments
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> All Decoder Tools
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 30-Day Auto Expiry
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Community Support
                </li>
              </ul>
              <Link href="/signup" className="block w-full px-6 py-3 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition text-center font-semibold">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-2 border-pink-500/50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-sm font-bold">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">$29</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Unlimited OAuth Apps
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Unlimited SAML Envs
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Custom Expiry (up to 1yr)
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> API Access
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Priority Support
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Team Collaboration
                </li>
              </ul>
              <Link href="/signup" className="block w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition text-center font-semibold">
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">Custom</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Self-Hosted Option
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Custom Integrations
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> SLA Guarantee
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Dedicated Support
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Custom Training
                </li>
              </ul>
              <Link href="/contact" className="block w-full px-6 py-3 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition text-center font-semibold">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-6 bg-white/[0.02]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                See It In Action
              </span>
            </h2>
            <p className="text-xl text-gray-400">Watch how easy it is to set up OAuth 2.0</p>
          </div>

          <div className="bg-[#1a1a1f] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 px-4 py-2 border-b border-white/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-sm text-gray-400 font-mono">terminal</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-4">
              <div>
                <span className="text-purple-400">~$</span>
                <span className="text-gray-300 ml-2">mockauth create-oauth-app</span>
              </div>
              <div className="text-gray-400">
                <div>? App name: My Test App</div>
                <div>? Grant types: authorization_code, refresh_token</div>
                <div>? Redirect URI: http://localhost:3000/callback</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-4 space-y-2">
                <div className="text-green-400 font-bold">✓ OAuth App Created Successfully!</div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Client ID: <span className="text-pink-400">oauth_abc123xyz789</span></div>
                  <div>Client Secret: <span className="text-pink-400">sk_live_aBcD1234XyZ5678</span></div>
                  <div className="pt-2 text-yellow-400">⚠ Save your client secret securely - it won't be shown again!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-black mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
              Ready to Start Testing?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who trust MockAuth for their authentication testing needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold text-lg">
              Start Free Today →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                MockAuth
              </div>
              <p className="text-gray-400 text-sm">
                Simple OAuth & SAML testing for modern developers.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition">Demo</a></li>
                <li><Link href="/dashboard/tools" className="hover:text-white transition">Free Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition">Guides</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-400 text-sm">
            © 2024 MockAuth. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
