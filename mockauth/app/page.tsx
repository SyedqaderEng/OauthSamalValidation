import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Animation */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-r from-pink-600/50 to-transparent top-[-200px] right-[-200px]"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-r from-purple-600/50 to-transparent bottom-[-200px] left-[-200px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            MockAuth
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/login" className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
              OAuth & SAML
            </span>
            <br />
            Testing Made Simple
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Create mock OAuth and SAML environments in seconds. Test authentication flows without the complexity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold">
              Start Free →
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-full bg-white/5 border-2 border-white/20 hover:bg-white/10 transition font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-3">OAuth 2.0</h3>
              <p className="text-gray-400">All grant types supported. PKCE, client credentials, refresh tokens.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-3">SAML 2.0</h3>
              <p className="text-gray-400">Full IdP and SP support. Test SSO flows with metadata exchange.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-4xl mb-4">🔓</div>
              <h3 className="text-2xl font-bold mb-3">Free Tools</h3>
              <p className="text-gray-400">JWT, SAML, and Base64 decoders. Completely free and serverless.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
