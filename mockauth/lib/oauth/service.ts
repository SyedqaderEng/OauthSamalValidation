import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export class OAuth2Service {
  /**
   * Authorization Code Grant
   */
  static async generateAuthorizationCode(params: {
    clientId: string;
    redirectUri: string;
    scope?: string;
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
  }): Promise<{ code: string; state?: string }> {
    const app = await prisma.oAuthApp.findUnique({
      where: { clientId: params.clientId },
    });

    if (!app) {
      throw new Error('Invalid client_id');
    }

    if (!app.redirectUris.includes(params.redirectUri)) {
      throw new Error('Invalid redirect_uri');
    }

    // Generate authorization code (valid for 10 minutes)
    const code = crypto.randomBytes(32).toString('hex');

    // In production, store this in a separate table or Redis
    // For now, we'll encode it in the JWT
    const authData = {
      code,
      clientId: params.clientId,
      redirectUri: params.redirectUri,
      scope: params.scope,
      codeChallenge: params.codeChallenge,
      codeChallengeMethod: params.codeChallengeMethod,
      exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes
    };

    const encodedCode = jwt.sign(authData, JWT_SECRET);

    return {
      code: encodedCode,
      state: params.state,
    };
  }

  /**
   * Token Exchange (Authorization Code)
   */
  static async exchangeAuthorizationCode(params: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<TokenResponse> {
    // Verify code
    let authData: any;
    try {
      authData = jwt.verify(params.code, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired authorization code');
    }

    // Verify client
    const app = await prisma.oAuthApp.findUnique({
      where: { clientId: params.clientId },
    });

    if (!app) {
      throw new Error('Invalid client_id');
    }

    // Verify client secret
    const secretMatch = await verifyPassword(params.clientSecret, app.clientSecret);
    if (!secretMatch) {
      throw new Error('Invalid client_secret');
    }

    // Verify redirect URI
    if (authData.redirectUri !== params.redirectUri) {
      throw new Error('Invalid redirect_uri');
    }

    // Verify PKCE if used
    if (authData.codeChallenge) {
      if (!params.codeVerifier) {
        throw new Error('code_verifier required for PKCE');
      }

      const hash = crypto
        .createHash('sha256')
        .update(params.codeVerifier)
        .digest('base64url');

      if (hash !== authData.codeChallenge) {
        throw new Error('Invalid code_verifier');
      }
    }

    // Generate tokens
    return this.generateTokens(app.id, authData.scope?.split(' ') || [], app);
  }

  /**
   * Client Credentials Grant
   */
  static async clientCredentialsGrant(params: {
    clientId: string;
    clientSecret: string;
    scope?: string;
  }): Promise<TokenResponse> {
    const app = await prisma.oAuthApp.findUnique({
      where: { clientId: params.clientId },
    });

    if (!app) {
      throw new Error('Invalid client_id');
    }

    if (!app.grantTypes.includes('client_credentials')) {
      throw new Error('client_credentials grant not allowed');
    }

    const secretMatch = await verifyPassword(params.clientSecret, app.clientSecret);
    if (!secretMatch) {
      throw new Error('Invalid client_secret');
    }

    const scopes = params.scope?.split(' ') || [];

    // No refresh token for client credentials
    return this.generateTokens(app.id, scopes, app, false);
  }

  /**
   * Refresh Token Grant
   */
  static async refreshTokenGrant(params: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  }): Promise<TokenResponse> {
    const app = await prisma.oAuthApp.findUnique({
      where: { clientId: params.clientId },
    });

    if (!app) {
      throw new Error('Invalid client_id');
    }

    const secretMatch = await verifyPassword(params.clientSecret, app.clientSecret);
    if (!secretMatch) {
      throw new Error('Invalid client_secret');
    }

    // Find the refresh token
    const token = await prisma.oAuthToken.findUnique({
      where: { refreshToken: params.refreshToken },
    });

    if (!token || token.appId !== app.id) {
      throw new Error('Invalid refresh_token');
    }

    // Check if refresh token is expired
    if (token.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Generate new tokens
    return this.generateTokens(app.id, token.scope, app);
  }

  /**
   * Generate Access and Refresh Tokens
   */
  private static async generateTokens(
    appId: string,
    scopes: string[],
    app: any,
    includeRefreshToken: boolean = true
  ): Promise<TokenResponse> {
    const accessToken = jwt.sign(
      {
        sub: app.clientId,
        client_id: app.clientId,
        scope: scopes.join(' '),
        type: 'access_token',
      },
      JWT_SECRET,
      { expiresIn: app.accessTokenLifetime }
    );

    let refreshToken: string | undefined;
    if (includeRefreshToken && app.grantTypes.includes('refresh_token')) {
      refreshToken = crypto.randomBytes(64).toString('hex');
    }

    // Store tokens in database
    const expiresAt = new Date(Date.now() + app.accessTokenLifetime * 1000);

    await prisma.oAuthToken.create({
      data: {
        appId,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        scope: scopes,
        expiresAt,
      },
    });

    const response: TokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: app.accessTokenLifetime,
      scope: scopes.join(' '),
    };

    if (refreshToken) {
      response.refresh_token = refreshToken;
    }

    return response;
  }

  /**
   * Verify Access Token
   */
  static async verifyAccessToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if token exists and is not revoked
      const tokenRecord = await prisma.oAuthToken.findUnique({
        where: { accessToken: token },
        include: { app: true },
      });

      if (!tokenRecord) {
        throw new Error('Token not found');
      }

      if (tokenRecord.expiresAt < new Date()) {
        throw new Error('Token expired');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Revoke Token
   */
  static async revokeToken(token: string): Promise<void> {
    await prisma.oAuthToken.deleteMany({
      where: {
        OR: [
          { accessToken: token },
          { refreshToken: token },
        ],
      },
    });
  }

  /**
   * Get UserInfo (for userinfo endpoint)
   */
  static async getUserInfo(accessToken: string): Promise<any> {
    const decoded = await this.verifyAccessToken(accessToken);

    return {
      sub: decoded.sub,
      email: 'test@mockauth.dev',
      name: 'Test User',
      email_verified: true,
    };
  }
}
