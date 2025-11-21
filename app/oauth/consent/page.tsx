import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ConsentForm from '@/components/ConsentForm';

async function getOAuthApp(clientId: string) {
  return await prisma.oAuthApp.findFirst({
    where: {
      clientId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      clientId: true,
      scopes: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    response_type?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    // Store return URL and redirect to login
    const params = await searchParams;
    const returnUrl = `/oauth/consent?${new URLSearchParams(params as any).toString()}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
  }

  const params = await searchParams;
  const { client_id, redirect_uri, scope, state, response_type, code_challenge, code_challenge_method } = params;

  if (!client_id || !redirect_uri) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-red-500/30">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Request</h1>
            <p className="text-gray-400">Missing required OAuth parameters.</p>
            <Link href="/" className="mt-6 inline-block text-pink-400 hover:text-pink-300">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const app = await getOAuthApp(client_id);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-red-500/30">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Unknown Application</h1>
            <p className="text-gray-400">The OAuth application was not found or is invalid.</p>
            <Link href="/" className="mt-6 inline-block text-pink-400 hover:text-pink-300">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const requestedScopes = scope?.split(' ').filter(Boolean) || [];
  const availableScopes = JSON.parse(app.scopes) as string[];
  const validScopes = requestedScopes.filter((s: string) => availableScopes.includes(s));

  const scopeDescriptions: Record<string, string> = {
    'read:profile': 'View your basic profile information',
    'read:email': 'View your email address',
    'write:profile': 'Update your profile information',
    'read:data': 'Access your data',
    'write:data': 'Modify your data',
    'openid': 'Authenticate with OpenID Connect',
    'profile': 'View your profile',
    'email': 'View your email',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              MockAuth
            </span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          {/* App Info */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{app.name}</h1>
            {app.description && (
              <p className="text-gray-400 text-sm">{app.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              by {app.user.name || app.user.email}
            </p>
          </div>

          {/* Authorization Request */}
          <div className="mb-6 p-4 rounded-lg bg-black/30 border border-white/10">
            <p className="text-sm text-gray-300 text-center">
              <strong className="text-white">{app.name}</strong> wants to access your account
            </p>
          </div>

          {/* Requested Permissions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              This will allow the application to:
            </h3>
            <ul className="space-y-2">
              {validScopes.map((scope: string) => (
                <li key={scope} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-green-400">✓</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{scope}</div>
                    <div className="text-xs text-gray-500">
                      {scopeDescriptions[scope] || `Access to ${scope}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center font-bold">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{session.user.name || 'User'}</div>
                <div className="text-xs text-gray-400">{session.user.email}</div>
              </div>
              <Link href="/login" className="text-xs text-pink-400 hover:text-pink-300">
                Not you?
              </Link>
            </div>
          </div>

          {/* Consent Form */}
          <ConsentForm
            clientId={client_id}
            redirectUri={redirect_uri}
            scope={validScopes.join(' ')}
            state={state}
            responseType={response_type || 'code'}
            codeChallenge={code_challenge}
            codeChallengeMethod={code_challenge_method}
          />

          {/* Security Notice */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            By authorizing, you agree to the app's terms of service and privacy policy.
            You can revoke access at any time from your settings.
          </p>
        </div>

        {/* Redirect URI Notice */}
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-gray-500 text-center">
            You will be redirected to: <br />
            <code className="text-pink-400 break-all">{redirect_uri}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
