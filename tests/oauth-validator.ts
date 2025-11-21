/**
 * OAuth 2.0 Flow Validator
 * Comprehensive testing for OAuth 2.0 flows
 */

import crypto from 'crypto';

export interface OAuthValidationResult {
  flow: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, any>;
}

export class OAuth2Validator {
  private baseUrl: string;
  private results: OAuthValidationResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Validate Authorization Code Flow
   */
  async validateAuthorizationCodeFlow(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      flow: 'authorization_code',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Step 1: Authorization Request
      const authorizeUrl = new URL(`${this.baseUrl}/oauth/authorize`);
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('redirect_uri', redirectUri);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('scope', 'openid profile email');
      authorizeUrl.searchParams.set('state', crypto.randomBytes(16).toString('hex'));

      const authorizeResponse = await fetch(authorizeUrl.toString());

      if (!authorizeResponse.ok) {
        result.errors.push(`Authorization endpoint returned ${authorizeResponse.status}`);
        return result;
      }

      // Extract authorization code from redirect (simulated)
      result.details.authorizationEndpoint = 'OK';

      // Step 2: Token Exchange
      const tokenResponse = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: 'test_code', // This would be from actual flow
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      result.details.tokenEndpoint = tokenResponse.ok ? 'OK' : 'FAILED';

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();

        // Validate token response structure
        if (!tokenData.access_token) {
          result.errors.push('Missing access_token in response');
        }
        if (!tokenData.token_type) {
          result.errors.push('Missing token_type in response');
        }
        if (!tokenData.expires_in) {
          result.warnings.push('Missing expires_in in response');
        }

        result.details.tokenResponse = tokenData;
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate PKCE Flow
   */
  async validatePKCEFlow(
    clientId: string,
    redirectUri: string
  ): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      flow: 'authorization_code_pkce',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Generate PKCE parameters
      const codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

      result.details.codeVerifier = codeVerifier;
      result.details.codeChallenge = codeChallenge;

      // Step 1: Authorization Request with PKCE
      const authorizeUrl = new URL(`${this.baseUrl}/oauth/authorize`);
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('redirect_uri', redirectUri);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('code_challenge', codeChallenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');
      authorizeUrl.searchParams.set('scope', 'openid profile');

      const authorizeResponse = await fetch(authorizeUrl.toString());
      result.details.authorizationWithPKCE = authorizeResponse.ok ? 'OK' : 'FAILED';

      // Validate PKCE is properly handled
      if (authorizeResponse.ok) {
        result.details.pkceSupported = true;
      } else {
        result.errors.push('PKCE flow not supported or failed');
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate Client Credentials Flow
   */
  async validateClientCredentialsFlow(
    clientId: string,
    clientSecret: string
  ): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      flow: 'client_credentials',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      const tokenResponse = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'api:read api:write',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        result.errors.push(`Token request failed: ${JSON.stringify(errorData)}`);
        return result;
      }

      const tokenData = await tokenResponse.json();

      // Validate response structure
      if (!tokenData.access_token) {
        result.errors.push('Missing access_token');
      }
      if (tokenData.token_type !== 'Bearer') {
        result.errors.push(`Invalid token_type: ${tokenData.token_type}`);
      }
      if (!tokenData.expires_in) {
        result.warnings.push('Missing expires_in');
      }
      if (tokenData.refresh_token) {
        result.warnings.push('Client credentials should not include refresh_token');
      }

      result.details.tokenResponse = tokenData;
      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate Refresh Token Flow
   */
  async validateRefreshTokenFlow(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      flow: 'refresh_token',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      const tokenResponse = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        result.errors.push(`Refresh request failed: ${JSON.stringify(errorData)}`);
        return result;
      }

      const tokenData = await tokenResponse.json();

      // Validate new tokens
      if (!tokenData.access_token) {
        result.errors.push('Missing new access_token');
      }
      if (!tokenData.expires_in) {
        result.warnings.push('Missing expires_in');
      }

      result.details.newTokenResponse = tokenData;
      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate UserInfo Endpoint
   */
  async validateUserInfoEndpoint(accessToken: string): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      flow: 'userinfo_endpoint',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      const userInfoResponse = await fetch(`${this.baseUrl}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        result.errors.push(`UserInfo endpoint returned ${userInfoResponse.status}`);
        return result;
      }

      const userInfo = await userInfoResponse.json();

      // Validate required claims
      if (!userInfo.sub) {
        result.errors.push('Missing required claim: sub');
      }

      result.details.userInfo = userInfo;
      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Security Validation Tests
   */
  async validateSecurityControls(clientId: string): Promise<OAuthValidationResult> {
    const result: OAuthValidationResult = {
      flow: 'security_controls',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Test 1: Invalid redirect_uri should be rejected
      const invalidRedirectTest = await fetch(
        `${this.baseUrl}/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=https://evil.com/callback&` +
        `response_type=code`
      );

      if (invalidRedirectTest.ok) {
        result.errors.push('Security: Invalid redirect_uri was accepted');
      } else {
        result.details.redirectUriValidation = 'OK';
      }

      // Test 2: Missing client_id should be rejected
      const missingClientTest = await fetch(
        `${this.baseUrl}/oauth/authorize?` +
        `redirect_uri=https://example.com/callback&` +
        `response_type=code`
      );

      if (missingClientTest.ok) {
        result.errors.push('Security: Missing client_id was accepted');
      } else {
        result.details.clientIdValidation = 'OK';
      }

      // Test 3: Invalid grant type should be rejected
      const invalidGrantTest = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'invalid_grant',
          client_id: clientId,
        }),
      });

      const grantResponse = await invalidGrantTest.json();
      if (grantResponse.error !== 'unsupported_grant_type') {
        result.errors.push('Security: Invalid grant type not properly rejected');
      } else {
        result.details.grantTypeValidation = 'OK';
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Get all validation results
   */
  getResults(): OAuthValidationResult[] {
    return this.results;
  }

  /**
   * Generate summary report
   */
  generateReport(): string {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => r.passed === false).length;
    const total = this.results.length;

    let report = '=== OAuth 2.0 Validation Report ===\n\n';
    report += `Total Tests: ${total}\n`;
    report += `Passed: ${passed}\n`;
    report += `Failed: ${failed}\n`;
    report += `Success Rate: ${((passed / total) * 100).toFixed(2)}%\n\n`;

    report += '=== Detailed Results ===\n\n';

    this.results.forEach((result, index) => {
      report += `${index + 1}. ${result.flow.toUpperCase()}\n`;
      report += `   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;

      if (result.errors.length > 0) {
        report += `   Errors:\n`;
        result.errors.forEach(err => {
          report += `     - ${err}\n`;
        });
      }

      if (result.warnings.length > 0) {
        report += `   Warnings:\n`;
        result.warnings.forEach(warn => {
          report += `     - ${warn}\n`;
        });
      }

      report += '\n';
    });

    return report;
  }
}
