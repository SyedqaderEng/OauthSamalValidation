import Link from 'next/link';

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to access this resource.',
    Verification: 'The verification link may have expired or already been used.',
    OAuthSignin: 'Error occurred while trying to sign in with OAuth provider.',
    OAuthCallback: 'Error occurred during OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth account.',
    EmailCreateAccount: 'Could not create email account.',
    Callback: 'Error occurred during callback.',
    OAuthAccountNotLinked: 'This email is already associated with another account.',
    EmailSignin: 'Error sending verification email.',
    CredentialsSignin: 'Invalid email or password.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An unexpected error occurred.',
  };

  const error = searchParams?.error || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              MockAuth
            </span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-red-500/30 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Authentication Error</h1>
            <p className="text-gray-400">{errorMessage}</p>
          </div>

          {error && error !== 'Default' && (
            <div className="mb-6 p-3 rounded-lg bg-black/30 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">Error Code:</p>
              <code className="text-sm text-red-400">{error}</code>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 transition font-semibold text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold text-center"
            >
              Go Home
            </Link>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Need help?{' '}
          <a href="#" className="text-pink-400 hover:text-pink-300">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
