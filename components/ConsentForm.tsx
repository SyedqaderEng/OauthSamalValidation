'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConsentFormProps {
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
  responseType: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export default function ConsentForm({
  clientId,
  redirectUri,
  scope,
  state,
  responseType,
  codeChallenge,
  codeChallengeMethod,
}: ConsentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuthorize = async () => {
    setIsLoading(true);

    try {
      // Build the authorization URL
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: scope,
      });

      if (state) params.set('state', state);
      if (codeChallenge) params.set('code_challenge', codeChallenge);
      if (codeChallengeMethod) params.set('code_challenge_method', codeChallengeMethod);
      params.set('consent', 'true'); // Indicate consent was given

      // Redirect to the authorization endpoint which will generate the code
      window.location.href = `/oauth/authorize?${params.toString()}`;
    } catch (error) {
      console.error('Authorization error:', error);
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    // Redirect back with error
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set('error', 'access_denied');
    errorUrl.searchParams.set('error_description', 'User denied the authorization request');
    if (state) errorUrl.searchParams.set('state', state);

    window.location.href = errorUrl.toString();
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDeny}
        disabled={isLoading}
        className="flex-1 py-3 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 transition font-semibold"
      >
        Deny
      </button>
      <button
        onClick={handleAuthorize}
        disabled={isLoading}
        className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition font-semibold"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Authorizing...
          </span>
        ) : (
          'Authorize'
        )}
      </button>
    </div>
  );
}
