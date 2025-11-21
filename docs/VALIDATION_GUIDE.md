# OAuth & SAML Validation Guide

Comprehensive guide for validating OAuth 2.0 and SAML 2.0 implementations.

## Table of Contents

1. [Overview](#overview)
2. [OAuth 2.0 Validation](#oauth-20-validation)
3. [SAML 2.0 Validation](#saml-20-validation)
4. [Security Validation](#security-validation)
5. [Test Execution](#test-execution)
6. [Interpreting Results](#interpreting-results)
7. [Best Practices](#best-practices)

## Overview

This platform implements comprehensive OAuth 2.0 and SAML 2.0 authentication protocols. The validation test suite ensures:

- **Protocol Compliance**: Adherence to RFC specifications
- **Security Standards**: Protection against common attacks
- **Functional Correctness**: Proper implementation of flows
- **Error Handling**: Graceful degradation and error responses

## OAuth 2.0 Validation

### Implemented Grant Types

#### ✅ Authorization Code Flow (RFC 6749)
**Standard OAuth flow for server-side applications**

Flow:
1. Client redirects user to `/oauth/authorize`
2. User authenticates and grants consent
3. Authorization server returns code
4. Client exchanges code for tokens at `/oauth/token`

Validation Points:
- ✅ client_id validation
- ✅ redirect_uri whitelist check
- ✅ state parameter for CSRF protection
- ✅ Authorization code expiration (10 minutes)
- ✅ Token response structure

Example Request:
```http
GET /oauth/authorize?
  client_id=oauth2_abc123&
  redirect_uri=https://app.example.com/callback&
  response_type=code&
  scope=openid profile email&
  state=random_state_value
```

#### ✅ PKCE Extension (RFC 7636)
**Enhanced security for public clients**

Flow:
1. Client generates code_verifier (random string)
2. Client creates code_challenge = SHA256(code_verifier)
3. Authorization request includes code_challenge
4. Token request includes code_verifier for validation

Validation Points:
- ✅ S256 challenge method support
- ✅ Code verifier validation
- ✅ Challenge/verifier mismatch rejection

Example:
```javascript
// Generate PKCE parameters
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Authorization request
GET /oauth/authorize?
  client_id=public_client&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256&
  ...

// Token request
POST /oauth/token
  grant_type=authorization_code&
  code=auth_code&
  code_verifier=original_verifier&
  ...
```

#### ✅ Client Credentials (RFC 6749)
**Machine-to-machine authentication**

Flow:
1. Client authenticates with client_id and client_secret
2. Receives access token directly
3. No user interaction or refresh token

Validation Points:
- ✅ Client authentication
- ✅ No refresh token in response
- ✅ Scope validation

Example:
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=service_app&
client_secret=sk_secret123&
scope=api:read api:write
```

#### ✅ Refresh Token (RFC 6749)
**Token renewal without re-authentication**

Validation Points:
- ✅ Refresh token validity
- ✅ Client authentication
- ✅ New token issuance
- ✅ Expiration handling

### OAuth Endpoints

| Endpoint | Method | Purpose | Spec |
|----------|--------|---------|------|
| `/oauth/authorize` | GET | Authorization endpoint | RFC 6749 §3.1 |
| `/oauth/token` | POST | Token endpoint | RFC 6749 §3.2 |
| `/oauth/userinfo` | GET | UserInfo endpoint | OIDC Core |
| `/oauth/revoke` | POST | Token revocation | RFC 7009 |
| `/.well-known/oauth-authorization-server` | GET | Metadata | RFC 8414 |

### Token Structure

**Access Token (JWT)**:
```json
{
  "sub": "oauth2_abc123",
  "client_id": "oauth2_abc123",
  "scope": "openid profile email",
  "type": "access_token",
  "iat": 1640000000,
  "exp": 1640003600
}
```

**Token Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "1234567890abcdef...",
  "scope": "openid profile email"
}
```

## SAML 2.0 Validation

### SAML Modes

#### ✅ Identity Provider (IdP) Mode
Acts as authentication provider for service providers

Features:
- ✅ Metadata generation
- ✅ SSO endpoint (POST and Redirect bindings)
- ✅ Assertion generation
- ✅ Attribute mapping
- ✅ Session management

#### ✅ Service Provider (SP) Mode
Consumes authentication from identity providers

Features:
- ✅ Metadata generation
- ✅ ACS (Assertion Consumer Service)
- ✅ Assertion validation
- ✅ IdP metadata import

### SAML Endpoints

| Endpoint | Purpose | Binding |
|----------|---------|---------|
| `/saml/{id}/metadata` | Metadata XML | HTTP GET |
| `/saml/{id}/sso` | Single Sign-On | HTTP POST/Redirect |
| `/saml/{id}/acs` | Assertion Consumer | HTTP POST |
| `/saml/{id}/slo` | Single Logout | HTTP POST/Redirect |

### SAML Assertion Structure

**Required Elements**:
```xml
<saml:Assertion ID="_unique_id" Version="2.0" IssueInstant="...">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <saml:Subject>
    <saml:NameID>user@example.com</saml:NameID>
    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
      <saml:SubjectConfirmationData NotOnOrAfter="..." Recipient="..."/>
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions NotBefore="..." NotOnOrAfter="...">
    <saml:AudienceRestriction>
      <saml:Audience>https://sp.example.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="..." SessionIndex="...">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>...</saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>
  <saml:AttributeStatement>
    <!-- Attributes -->
  </saml:AttributeStatement>
</saml:Assertion>
```

**Validation Checks**:
- ✅ Version="2.0"
- ✅ Unique ID (starts with letter/underscore)
- ✅ Valid IssueInstant timestamp
- ✅ Issuer matches IdP entity ID
- ✅ Subject contains NameID
- ✅ Time window (NotBefore < NotOnOrAfter)
- ✅ Audience restriction present
- ✅ AuthnStatement with SessionIndex

### Metadata Validation

**IdP Metadata**:
```xml
<EntityDescriptor entityID="https://idp.example.com">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:KeyInfo>...</ds:KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="..." Location="..."/>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <SingleSignOnService Binding="..." Location="..."/>
  </IDPSSODescriptor>
</EntityDescriptor>
```

**Validation Points**:
- ✅ Valid entityID (URL format)
- ✅ IDPSSODescriptor present
- ✅ At least one SingleSignOnService
- ✅ NameIDFormat specified
- ✅ Signing key present

## Security Validation

### OWASP Top 10 Coverage

#### 🔴 A03:2021 - Injection

**SQL Injection**:
```javascript
// Attack vector
client_id='; DROP TABLE users--

// Expected: 400/404 error
// Validation: Parameterized queries only
```

**XXE (XML External Entity)**:
```xml
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<samlp:Response>
  <saml:Subject>&xxe;</saml:Subject>
</samlp:Response>

// Expected: Rejection
// Validation: External entities disabled
```

#### 🔴 A05:2021 - Security Misconfiguration

**Open Redirect**:
```javascript
// Attack vector
redirect_uri=https://evil.com/steal-tokens

// Expected: Invalid redirect_uri error
// Validation: Strict whitelist checking
```

**None Algorithm Attack**:
```javascript
// JWT header: {"alg": "none"}
// Expected: Token rejection
// Validation: Algorithm whitelist enforced
```

#### 🟠 A07:2021 - Authentication Failures

**Weak Passwords**: Rejected at registration
**Brute Force**: Rate limiting on auth endpoints
**Session Management**: Secure HTTP-only cookies

### Cryptographic Standards

| Component | Algorithm | Key Size | Standard |
|-----------|-----------|----------|----------|
| Password Hashing | bcrypt | Work factor: 10 | Industry standard |
| Data Encryption | AES-GCM | 256-bit | NIST recommended |
| JWT Signing | HS256 | 256-bit | RFC 7518 |
| Random Values | crypto.randomBytes | - | CSPRNG |

### Security Headers

```http
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

## Test Execution

### Prerequisites

1. **Start the application**:
```bash
npm run dev
```

2. **Create test credentials**:
```bash
# Create OAuth app via dashboard
# Note: clientId and clientSecret

# Create SAML environment via dashboard
# Note: environmentId
```

3. **Set environment variables**:
```bash
export BASE_URL="http://localhost:3000"
export OAUTH_CLIENT_ID="oauth2_..."
export OAUTH_CLIENT_SECRET="sk_..."
export OAUTH_REDIRECT_URI="https://example.com/callback"
export SAML_ENVIRONMENT_ID="env_..."
```

### Run Tests

```bash
# Full validation suite
npm run test:validation

# Individual test suites
npm run test:oauth
npm run test:saml
npm run test:security
```

### CI/CD Integration

```yaml
# .github/workflows/validate.yml
name: OAuth & SAML Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Start server
        run: npm run dev &

      - name: Wait for server
        run: sleep 10

      - name: Run validation tests
        run: npm run test:validation
        env:
          OAUTH_CLIENT_ID: ${{ secrets.TEST_CLIENT_ID }}
          OAUTH_CLIENT_SECRET: ${{ secrets.TEST_CLIENT_SECRET }}

      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: validation-results
          path: validation-results/
```

## Interpreting Results

### Report Structure

```
=== OAuth 2.0 Validation Report ===

Total Tests: 8
Passed: 7
Failed: 1
Success Rate: 87.50%

=== Detailed Results ===

1. AUTHORIZATION_CODE
   Status: ✅ PASSED

2. CLIENT_CREDENTIALS
   Status: ❌ FAILED
   Errors:
     - Invalid client_secret

=== OVERALL SUMMARY ===

Total Tests Run: 15
✅ Passed: 14
❌ Failed: 1
⚠️  Total Warnings: 3
Success Rate: 93.33%
```

### Severity Levels

| Level | Symbol | Description | Action Required |
|-------|--------|-------------|-----------------|
| Critical | 🔴 | Security vulnerability | Immediate fix |
| High | 🟠 | Significant issue | Fix before production |
| Medium | 🟡 | Improvement needed | Address soon |
| Low | 🟢 | Minor issue | Optional enhancement |

### Common Failures

#### "Invalid redirect_uri"
**Cause**: redirect_uri not in whitelist
**Fix**: Add URI to OAuth app configuration

#### "Expired authorization code"
**Cause**: Code used after 10-minute window
**Fix**: Exchange code immediately after receiving

#### "SAML metadata missing EntityDescriptor"
**Cause**: Malformed XML or incorrect structure
**Fix**: Regenerate metadata or check configuration

## Best Practices

### OAuth 2.0

1. **Always use PKCE** for public clients
2. **Validate redirect_uri** against strict whitelist
3. **Use state parameter** for CSRF protection
4. **Short-lived access tokens** (1 hour max)
5. **Rotate refresh tokens** on each use
6. **Use HTTPS** for all endpoints

### SAML 2.0

1. **Sign assertions** for integrity
2. **Encrypt assertions** for confidentiality
3. **Validate signatures** before parsing XML
4. **Check time windows** (NotBefore/NotOnOrAfter)
5. **Verify Audience** restriction
6. **Use secure bindings** (HTTP POST preferred)

### Security

1. **Rate limit** all public endpoints
2. **Hash secrets** before storage (bcrypt)
3. **Encrypt sensitive data** at rest (AES-256)
4. **Disable external entities** in XML parser
5. **Validate input** on all endpoints
6. **Log security events** for audit

### Monitoring

1. **Track failed authentications**
2. **Alert on unusual patterns**
3. **Monitor token expiration rates**
4. **Review audit logs regularly**
5. **Test disaster recovery**

## Compliance Checklists

### OAuth 2.0 (RFC 6749)

- [x] Authorization endpoint (§3.1)
- [x] Token endpoint (§3.2)
- [x] Client authentication (§3.2.1)
- [x] Authorization code grant (§4.1)
- [x] Client credentials grant (§4.4)
- [x] Refresh token grant (§6)
- [x] Error responses (§4.1.2.1, §5.2)

### PKCE (RFC 7636)

- [x] Code verifier generation
- [x] Code challenge creation (S256)
- [x] Challenge validation
- [x] Verifier verification

### OpenID Connect Core

- [x] UserInfo endpoint
- [x] ID token structure
- [x] Standard claims
- [ ] Discovery endpoint (planned)

### SAML 2.0 Core

- [x] Assertion structure (§2.3)
- [x] Subject element (§2.4)
- [x] Conditions element (§2.5)
- [x] AuthnStatement (§2.7.2)
- [x] AttributeStatement (§2.7.3)

### SAML 2.0 Metadata

- [x] EntityDescriptor (§2.3)
- [x] IDPSSODescriptor (§2.4)
- [x] SPSSODescriptor (§2.4)
- [x] KeyDescriptor (§2.4.1.1)
- [x] Endpoint elements

## Troubleshooting

### Tests Failing to Connect

```bash
# Check if server is running
curl http://localhost:3000/api/health

# Verify port
lsof -i :3000

# Check environment variables
echo $BASE_URL
```

### Invalid Credentials

```bash
# Recreate OAuth app
# 1. Login to dashboard
# 2. Navigate to OAuth Apps
# 3. Create new app
# 4. Copy credentials

# Update environment
export OAUTH_CLIENT_ID="new_id"
export OAUTH_CLIENT_SECRET="new_secret"
```

### Rate Limiting

```bash
# Wait for rate limit window to reset
# Or increase limits in lib/rate-limit.ts

# Check current limits
grep -A 5 "rateLimitConfigs" lib/rate-limit.ts
```

## References

- [RFC 6749: OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7636: PKCE](https://tools.ietf.org/html/rfc7636)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [SAML 2.0 Core](http://docs.oasis-open.org/security/saml/v2.0/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
