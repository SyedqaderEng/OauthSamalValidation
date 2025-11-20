import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Service } from '@/lib/oauth/service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const grantType = formData.get('grant_type') as string;
    const clientId = formData.get('client_id') as string;
    const clientSecret = formData.get('client_secret') as string;

    if (!grantType || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let tokenResponse;

    switch (grantType) {
      case 'authorization_code':
        const code = formData.get('code') as string;
        const redirectUri = formData.get('redirect_uri') as string;
        const codeVerifier = formData.get('code_verifier') as string | undefined;

        if (!code || !redirectUri) {
          return NextResponse.json(
            { error: 'invalid_request' },
            { status: 400 }
          );
        }

        tokenResponse = await OAuth2Service.exchangeAuthorizationCode({
          code,
          clientId,
          clientSecret,
          redirectUri,
          codeVerifier,
        });
        break;

      case 'client_credentials':
        const scope = formData.get('scope') as string | undefined;

        tokenResponse = await OAuth2Service.clientCredentialsGrant({
          clientId,
          clientSecret,
          scope,
        });
        break;

      case 'refresh_token':
        const refreshToken = formData.get('refresh_token') as string;

        if (!refreshToken) {
          return NextResponse.json(
            { error: 'invalid_request' },
            { status: 400 }
          );
        }

        tokenResponse = await OAuth2Service.refreshTokenGrant({
          refreshToken,
          clientId,
          clientSecret,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'unsupported_grant_type' },
          { status: 400 }
        );
    }

    return NextResponse.json(tokenResponse);
  } catch (error: any) {
    console.error('Token error:', error);
    return NextResponse.json(
      { error: 'invalid_grant', error_description: error.message },
      { status: 400 }
    );
  }
}
