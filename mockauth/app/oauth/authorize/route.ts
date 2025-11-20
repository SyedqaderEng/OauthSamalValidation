import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Service } from '@/lib/oauth/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const responseType = searchParams.get('response_type');
    const scope = searchParams.get('scope') || '';
    const state = searchParams.get('state') || undefined;
    const codeChallenge = searchParams.get('code_challenge') || undefined;
    const codeChallengeMethod = searchParams.get('code_challenge_method') || undefined;

    if (!clientId || !redirectUri || !responseType) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (responseType !== 'code') {
      return NextResponse.json(
        { error: 'unsupported_response_type' },
        { status: 400 }
      );
    }

    // Generate authorization code
    const result = await OAuth2Service.generateAuthorizationCode({
      clientId,
      redirectUri,
      scope,
      state,
      codeChallenge,
      codeChallengeMethod,
    });

    // Redirect back to client with code
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', result.code);
    if (result.state) {
      redirectUrl.searchParams.set('state', result.state);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    return NextResponse.json(
      { error: 'server_error', error_description: error.message },
      { status: 500 }
    );
  }
}
