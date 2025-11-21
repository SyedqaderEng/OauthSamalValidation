import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Service } from '@/lib/oauth/service';

async function parseBody(request: NextRequest): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } else if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const result: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        result[key] = value;
      }
    });
    return result;
  } else if (contentType.includes('application/json')) {
    return await request.json();
  }

  // Default to URL-encoded
  const text = await request.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request);

    const grantType = data.grant_type;
    const clientId = data.client_id;
    const clientSecret = data.client_secret;

    if (!grantType || !clientId) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let tokenResponse;

    switch (grantType) {
      case 'authorization_code':
        const code = data.code;
        const redirectUri = data.redirect_uri;
        const codeVerifier = data.code_verifier;

        if (!code || !redirectUri) {
          return NextResponse.json(
            { error: 'invalid_request', error_description: 'Missing code or redirect_uri' },
            { status: 400 }
          );
        }

        tokenResponse = await OAuth2Service.exchangeAuthorizationCode({
          code,
          clientId,
          clientSecret: clientSecret || '',
          redirectUri,
          codeVerifier,
        });
        break;

      case 'client_credentials':
        if (!clientSecret) {
          return NextResponse.json(
            { error: 'invalid_request', error_description: 'Client credentials require client_secret' },
            { status: 400 }
          );
        }

        tokenResponse = await OAuth2Service.clientCredentialsGrant({
          clientId,
          clientSecret,
          scope: data.scope,
        });
        break;

      case 'refresh_token':
        const refreshToken = data.refresh_token;

        if (!refreshToken) {
          return NextResponse.json(
            { error: 'invalid_request', error_description: 'Missing refresh_token' },
            { status: 400 }
          );
        }

        tokenResponse = await OAuth2Service.refreshTokenGrant({
          refreshToken,
          clientId,
          clientSecret: clientSecret || '',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'unsupported_grant_type', error_description: `Grant type '${grantType}' is not supported` },
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
