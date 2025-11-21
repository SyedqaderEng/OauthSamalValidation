'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
        copied
          ? 'bg-green-500/20 border-green-500/50 text-green-400'
          : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
      }`}
      title={copied ? 'Copied!' : `Copy ${label}`}
    >
      {copied ? (
        <>
          <span className="mr-1">✓</span>
          Copied
        </>
      ) : (
        <>
          <span className="mr-1">📋</span>
          {label}
        </>
      )}
    </button>
  );
}
