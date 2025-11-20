'use client';

import { useState } from 'react';

type Tool = 'jwt' | 'saml' | 'base64';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>('jwt');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2">Decoder Tools</h1>
        <p className="text-gray-400">Free tools for decoding and analyzing authentication tokens</p>
      </div>

      {/* Tool Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTool('jwt')}
          className={`px-6 py-3 font-semibold transition ${
            activeTool === 'jwt'
              ? 'border-b-2 border-pink-500 text-pink-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          JWT Decoder
        </button>
        <button
          onClick={() => setActiveTool('saml')}
          className={`px-6 py-3 font-semibold transition ${
            activeTool === 'saml'
              ? 'border-b-2 border-purple-500 text-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          SAML Decoder
        </button>
        <button
          onClick={() => setActiveTool('base64')}
          className={`px-6 py-3 font-semibold transition ${
            activeTool === 'base64'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Base64 Encoder/Decoder
        </button>
      </div>

      {/* Tool Content */}
      <div>
        {activeTool === 'jwt' && <JWTDecoder />}
        {activeTool === 'saml' && <SAMLDecoder />}
        {activeTool === 'base64' && <Base64Tool />}
      </div>
    </div>
  );
}

function JWTDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDecode = async () => {
    setError('');
    setDecoded(null);
    setLoading(true);

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
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold mb-4">JWT Decoder</h2>
        <p className="text-sm text-gray-400 mb-4">
          Decode and verify JSON Web Tokens (JWT). This tool parses the token and displays its header and payload.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">JWT Token</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent transition resize-none font-mono text-sm"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          <button
            onClick={handleDecode}
            disabled={loading || !token.trim()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Decoding...' : 'Decode JWT'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {decoded && (
        <div className="space-y-4">
          {/* Verification Status */}
          <div className={`p-4 rounded-lg border ${
            decoded.verified
              ? 'bg-green-500/10 border-green-500/50 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
          }`}>
            {decoded.verified ? '✓ Token signature verified' : '⚠ Token signature not verified'}
            {decoded.verificationError && (
              <p className="text-sm mt-1">Error: {decoded.verificationError}</p>
            )}
          </div>

          {/* Header */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold mb-3">Header</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold mb-3">Payload</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
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
        setLoading(false);
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
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold mb-4">SAML Decoder</h2>
        <p className="text-sm text-gray-400 mb-4">
          Decode SAML responses and assertions. Accepts base64-encoded or raw XML input.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SAML Response (Base64 or XML)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition resize-none font-mono text-sm"
              placeholder="PHNhbWxwOlJlc3BvbnNlIC8+... or <samlp:Response>...</samlp:Response>"
            />
          </div>

          <button
            onClick={handleDecode}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Decoding...' : 'Decode SAML'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {decoded && (
        <div className="space-y-4">
          {/* Decoded XML */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold mb-3">Decoded SAML</h3>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
              {decoded.decoded}
            </pre>
          </div>

          {/* Parsed Attributes */}
          {decoded.attributes && Object.keys(decoded.attributes).length > 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold mb-3">Extracted Attributes</h3>
              <div className="space-y-2">
                {Object.entries(decoded.attributes).map(([key, value]) => (
                  <div key={key} className="flex gap-4">
                    <span className="font-medium text-purple-400 min-w-[120px]">{key}:</span>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    setError('');
    setOutput('');
    setLoading(true);

    try {
      const response = await fetch('/api/tools/base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: mode, data: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${mode} data`);
        setLoading(false);
        return;
      }

      setOutput(data.result);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold mb-4">Base64 Encoder/Decoder</h2>
        <p className="text-sm text-gray-400 mb-4">
          Encode plain text to Base64 or decode Base64 strings back to plain text.
        </p>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === 'encode'
                  ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === 'decode'
                  ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Decode
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none font-mono text-sm"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            />
          </div>

          <button
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : mode === 'encode' ? 'Encode' : 'Decode'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {output && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold mb-3">Result</h3>
          <div className="bg-black/30 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap break-all">{output}</pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(output);
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
