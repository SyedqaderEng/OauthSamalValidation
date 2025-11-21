'use client';

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';

type Tool = 'jwt' | 'saml' | 'base64' | 'url' | 'hash' | 'encrypt';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>('jwt');

  const tools = [
    { id: 'jwt' as Tool, name: 'JWT Decoder', icon: '🔑', color: 'pink' },
    { id: 'saml' as Tool, name: 'SAML Decoder', icon: '🏢', color: 'purple' },
    { id: 'base64' as Tool, name: 'Base64', icon: '📝', color: 'blue' },
    { id: 'url' as Tool, name: 'URL Encoder', icon: '🔗', color: 'cyan' },
    { id: 'hash' as Tool, name: 'Hash Generator', icon: '#️⃣', color: 'green' },
    { id: 'encrypt' as Tool, name: 'Encrypt/Decrypt', icon: '🔐', color: 'yellow' },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Slogan */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Developer Tools
        </h1>
        <p className="text-xl text-gray-400 mb-2">
          Decode. Encode. Encrypt. Analyze.
        </p>
        <p className="text-sm text-gray-500">
          Free, fast, and secure tools for authentication testing
        </p>
      </div>

      {/* Tool Tabs - Card Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-4 rounded-xl transition-all duration-300 ${
              activeTool === tool.id
                ? `bg-${tool.color}-500/20 border-2 border-${tool.color}-500 shadow-lg shadow-${tool.color}-500/20 scale-105`
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-102'
            }`}
          >
            <div className="text-2xl mb-2">{tool.icon}</div>
            <div className={`text-sm font-semibold ${
              activeTool === tool.id ? `text-${tool.color}-400` : 'text-gray-400'
            }`}>
              {tool.name}
            </div>
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="min-h-[500px]">
        {activeTool === 'jwt' && <JWTDecoder />}
        {activeTool === 'saml' && <SAMLDecoder />}
        {activeTool === 'base64' && <Base64Tool />}
        {activeTool === 'url' && <URLTool />}
        {activeTool === 'hash' && <HashGenerator />}
        {activeTool === 'encrypt' && <EncryptionTool />}
      </div>
    </div>
  );
}

function JWTDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDecode = async () => {
    if (!token.trim()) return;

    setError('');
    setDecoded(null);
    setLoading(true);
    setIsAnimating(true);

    try {
      const response = await fetch('/api/tools/jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to decode JWT');
        setLoading(false);
        setIsAnimating(false);
        return;
      }

      // Delay for animation effect
      setTimeout(() => {
        setDecoded(data);
        setIsAnimating(false);
      }, 500);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30">
            🔑
          </div>
          <div>
            <h2 className="text-2xl font-bold">JWT Token Decoder</h2>
            <p className="text-sm text-gray-400">Decode and analyze JSON Web Tokens instantly</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Paste your JWT Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={5}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 resize-none font-mono text-sm placeholder-gray-600"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <button
              onClick={() => setToken(sampleToken)}
              className="absolute top-9 right-3 px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-gray-400"
            >
              Use Sample
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDecode}
              disabled={loading || !token.trim()}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                loading || !token.trim()
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Decoding...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span> Decode Token
                </span>
              )}
            </button>
            <button
              onClick={() => { setToken(''); setDecoded(null); setError(''); }}
              className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 animate-shake">
              <span className="text-2xl">❌</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Section - Animated */}
      {(decoded || isAnimating) && (
        <div className={`space-y-4 transition-all duration-500 ${isAnimating ? 'opacity-50 scale-98' : 'opacity-100 scale-100'}`}>
          {/* Verification Status */}
          <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${
            decoded?.verified
              ? 'bg-green-500/10 border-green-500/50'
              : 'bg-yellow-500/10 border-yellow-500/50'
          }`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
              decoded?.verified ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              {decoded?.verified ? '✅' : '⚠️'}
            </div>
            <div>
              <div className={`font-bold text-lg ${decoded?.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                {decoded?.verified ? 'Signature Verified' : 'Signature Not Verified'}
              </div>
              {decoded?.verificationError && (
                <p className="text-sm text-gray-400 mt-1">{decoded.verificationError}</p>
              )}
            </div>
          </div>

          {/* Token Parts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Header */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
                  <span className="text-xl">📋</span> Header
                </h3>
                <CopyButton text={JSON.stringify(decoded?.header, null, 2)} label="Copy" />
              </div>
              <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto text-sm font-mono text-gray-300 border border-white/5">
                {JSON.stringify(decoded?.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                  <span className="text-xl">📦</span> Payload
                </h3>
                <CopyButton text={JSON.stringify(decoded?.payload, null, 2)} label="Copy" />
              </div>
              <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto text-sm font-mono text-gray-300 border border-white/5">
                {JSON.stringify(decoded?.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Signature */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <span className="text-xl">🔏</span> Signature
              </h3>
              <CopyButton text={decoded?.signature || ''} label="Copy" />
            </div>
            <code className="block bg-black/50 p-4 rounded-xl overflow-x-auto text-sm font-mono text-gray-300 border border-white/5 break-all">
              {decoded?.signature}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

function SAMLDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDecode = async () => {
    if (!input.trim()) return;
    setError('');
    setDecoded(null);
    setLoading(true);

    try {
      const response = await fetch('/api/tools/saml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samlData: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to decode SAML');
        return;
      }

      setDecoded(data);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
            🏢
          </div>
          <div>
            <h2 className="text-2xl font-bold">SAML Response Decoder</h2>
            <p className="text-sm text-gray-400">Decode Base64 or XML SAML responses</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none font-mono text-sm"
            placeholder="Paste Base64 encoded SAML or raw XML..."
          />

          <button
            onClick={handleDecode}
            disabled={loading || !input.trim()}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl hover:shadow-purple-500/30 transition-all font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Decoding...' : '🔍 Decode SAML'}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              ❌ {error}
            </div>
          )}
        </div>
      </div>

      {decoded && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📄</span> Decoded SAML
          </h3>
          <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96">
            {decoded.decoded}
          </pre>
          {decoded.attributes && Object.keys(decoded.attributes).length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <h4 className="font-bold text-purple-400 mb-3">Extracted Attributes</h4>
              <div className="space-y-2">
                {Object.entries(decoded.attributes).map(([key, value]) => (
                  <div key={key} className="flex gap-3 text-sm">
                    <span className="text-purple-400 font-medium min-w-[140px]">{key}:</span>
                    <span className="text-gray-300">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('decode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleProcess = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (err) {
      setOutput('Error: Invalid input');
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl">
          📝
        </div>
        <div>
          <h2 className="text-2xl font-bold">Base64 Encoder/Decoder</h2>
          <p className="text-sm text-gray-400">Convert between plain text and Base64</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              mode === m
                ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {m === 'encode' ? '📤 Encode' : '📥 Decode'}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">
            {mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 transition resize-none font-mono text-sm"
            placeholder={mode === 'encode' ? 'Enter text...' : 'Enter Base64...'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Result</label>
          <textarea
            value={output}
            readOnly
            rows={6}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-sm text-green-400"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleProcess}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition font-bold"
        >
          {mode === 'encode' ? '📤 Encode' : '📥 Decode'}
        </button>
        <CopyButton text={output} label="Copy Result" />
      </div>
    </div>
  );
}

function URLTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleProcess = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (err) {
      setOutput('Error: Invalid input');
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border border-cyan-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-2xl">
          🔗
        </div>
        <div>
          <h2 className="text-2xl font-bold">URL Encoder/Decoder</h2>
          <p className="text-sm text-gray-400">Encode or decode URL components</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              mode === m
                ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {m === 'encode' ? '📤 Encode' : '📥 Decode'}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 transition resize-none font-mono text-sm mb-4"
        placeholder={mode === 'encode' ? 'https://example.com/path?query=hello world' : 'https%3A%2F%2Fexample.com...'}
      />

      <button
        onClick={handleProcess}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:shadow-lg transition font-bold mb-4"
      >
        {mode === 'encode' ? '📤 Encode URL' : '📥 Decode URL'}
      </button>

      {output && (
        <div className="p-4 rounded-xl bg-black/50 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Result:</span>
            <CopyButton text={output} label="Copy" />
          </div>
          <code className="block text-sm font-mono text-cyan-400 break-all">{output}</code>
        </div>
      )}
    </div>
  );
}

function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      // Generate hashes using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
      const results: Record<string, string> = {};

      for (const algo of algorithms) {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        results[algo] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // MD5 simulation (not secure, for display only)
      results['MD5'] = 'Use server-side for MD5';

      setHashes(results);
    } catch (err) {
      console.error('Hash error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-2xl">
          #️⃣
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hash Generator</h2>
          <p className="text-sm text-gray-400">Generate cryptographic hashes (SHA-1, SHA-256, SHA-512)</p>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 transition resize-none font-mono text-sm mb-4"
        placeholder="Enter text to hash..."
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition font-bold mb-4 disabled:opacity-50"
      >
        {loading ? 'Generating...' : '#️⃣ Generate Hashes'}
      </button>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="p-4 rounded-xl bg-black/50 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-green-400">{algo}</span>
                <CopyButton text={hash} label="Copy" />
              </div>
              <code className="block text-xs font-mono text-gray-300 break-all">{hash}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EncryptionTool() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!input.trim() || !password.trim()) {
      setError('Please provide both input and password');
      return;
    }
    setError('');
    setOutput('');

    try {
      // Derive key from password
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      const keyMaterial = await crypto.subtle.importKey(
        'raw', passwordData, 'PBKDF2', false, ['deriveKey']
      );

      const salt = encoder.encode('mockauth-salt');
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      if (mode === 'encrypt') {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          encoder.encode(input)
        );

        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        setOutput(btoa(String.fromCharCode(...combined)));
      } else {
        const combined = Uint8Array.from(atob(input), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          data
        );

        setOutput(new TextDecoder().decode(decrypted));
      }
    } catch (err) {
      setError(mode === 'decrypt' ? 'Decryption failed. Wrong password or corrupted data.' : 'Encryption failed.');
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-2xl">
          🔐
        </div>
        <div>
          <h2 className="text-2xl font-bold">AES-256 Encryption</h2>
          <p className="text-sm text-gray-400">Encrypt and decrypt text with a password (AES-256-GCM)</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['encrypt', 'decrypt'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setOutput(''); setError(''); }}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              mode === m
                ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {m === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 transition resize-none font-mono text-sm"
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter encrypted text (Base64)...'}
        />

        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 transition font-mono text-sm"
            placeholder="Enter password..."
          />
          <span className="absolute right-4 top-3 text-gray-500 text-sm">🔑</span>
        </div>

        <button
          onClick={handleProcess}
          disabled={!input.trim() || !password.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg transition font-bold disabled:opacity-50"
        >
          {mode === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            ❌ {error}
          </div>
        )}

        {output && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-green-400">
                {mode === 'encrypt' ? '🔒 Encrypted' : '🔓 Decrypted'} Result:
              </span>
              <CopyButton text={output} label="Copy" />
            </div>
            <code className="block text-sm font-mono text-gray-300 break-all">{output}</code>
          </div>
        )}
      </div>
    </div>
  );
}
