# OAuth & SAML Validation Test Suite

Comprehensive validation and security testing for OAuth 2.0 and SAML 2.0 implementations.

## Overview

This test suite provides thorough validation of:
- **OAuth 2.0 Flows**: Authorization Code, PKCE, Client Credentials, Refresh Token
- **SAML 2.0 Flows**: IdP/SP Metadata, SSO, Assertions, Responses
- **Security Controls**: Injection attacks, XSS, JWT security, cryptography, rate limiting

## Test Files

- `oauth-validator.ts` - OAuth 2.0 flow validation
- `saml-validator.ts` - SAML 2.0 flow validation
- `security-validator.ts` - Security testing (XSS, SQL injection, JWT, etc.)
- `run-validation.ts` - Main test orchestrator

## Quick Start

### Prerequisites

```bash
# Ensure the application is running
npm run dev
```

### Configuration

Set environment variables for testing:

```bash
export BASE_URL="http://localhost:3000"
export OAUTH_CLIENT_ID="your_client_id"
export OAUTH_CLIENT_SECRET="your_client_secret"
export OAUTH_REDIRECT_URI="https://example.com/callback"
export SAML_ENVIRONMENT_ID="your_saml_env_id"
```

### Running Tests

```bash
# Run all validation tests
npm run test:validation

# Or run directly with ts-node
npx ts-node tests/run-validation.ts
```

## Test Categories

### OAuth 2.0 Validation

#### Authorization Code Flow
- ✅ Authorization endpoint validation
- ✅ Token exchange validation
- ✅ Response structure validation
- ✅ Error handling

#### PKCE Flow
- ✅ Code challenge generation
- ✅ Code verifier validation
- ✅ S256 challenge method
- ✅ Security improvements verification

#### Client Credentials
- ✅ Client authentication
- ✅ Token response validation
- ✅ Scope handling
- ✅ No refresh token verification

#### Refresh Token
- ✅ Token refresh validation
- ✅ New token issuance
- ✅ Expiration handling

#### UserInfo Endpoint
- ✅ Bearer token validation
- ✅ Claims validation
- ✅ Required fields check

### SAML 2.0 Validation

#### Metadata Generation
- ✅ IdP metadata structure
- ✅ SP metadata structure
- ✅ Required elements validation
- ✅ Endpoint URLs verification

#### Assertion Validation
- ✅ XML structure
- ✅ Required elements (Issuer, Subject, Conditions)
- ✅ Time window validation
- ✅ Attribute statements

#### Response Validation
- ✅ Response structure
- ✅ Status codes
- ✅ Embedded assertions
- ✅ InResponseTo handling

#### SSO Flow
- ✅ SSO endpoint functionality
- ✅ Request handling
- ✅ Response generation

### Security Testing

#### Injection Attacks
- 🔴 SQL Injection testing
- 🔴 XSS payload testing
- 🔴 XXE attack prevention

#### JWT Security
- 🔴 None algorithm attack
- 🟠 Expired token handling
- 🟠 Invalid signature detection

#### OAuth Security
- 🔴 Open redirect protection
- 🟠 CSRF protection (state parameter)
- 🟠 PKCE enforcement

#### SAML Security
- 🔴 XML Signature Wrapping
- 🔴 XXE protection
- 🟠 Assertion replay prevention

#### Cryptography
- ✅ Password hashing (bcrypt)
- ✅ Data encryption (AES-256-GCM)
- ✅ JWT signing algorithms

#### Rate Limiting
- 🟠 Endpoint rate limits
- 🟠 Abuse prevention

**Legend**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

## Output

### Console Output
Real-time test execution progress with clear status indicators:
```
🔐 Starting OAuth 2.0 Validation Tests...

1. Testing Authorization Code Flow...
   ✓ Complete

2. Testing PKCE Flow...
   ✓ Complete
```

### Text Report
Detailed validation report saved to `validation-results/report.txt`:
```
=== OAuth 2.0 Validation Report ===

Total Tests: 8
Passed: 7
Failed: 1
Success Rate: 87.50%
```

### JSON Results
Machine-readable results in `validation-results/results.json`:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "oauth": [...],
  "saml": [...]
}
```

## Test Configuration

### Custom Base URL
```bash
BASE_URL=https://your-domain.com npm run test:validation
```

### OAuth Configuration
```bash
OAUTH_CLIENT_ID=oauth2_abc123 \
OAUTH_CLIENT_SECRET=sk_secret123 \
OAUTH_REDIRECT_URI=https://app.example.com/callback \
npm run test:validation
```

### SAML Configuration
```bash
SAML_ENVIRONMENT_ID=env_abc123 \
npm run test:validation
```

## Interpreting Results

### Success Criteria
- All critical security tests must pass
- OAuth flows must return correct response structures
- SAML metadata must be valid XML with required elements
- No open redirect or injection vulnerabilities

### Common Issues

#### Failed Authorization Tests
- **Cause**: Invalid client credentials or configuration
- **Solution**: Verify client_id, client_secret, and redirect_uri

#### Failed Metadata Tests
- **Cause**: SAML environment not properly configured
- **Solution**: Check entity ID and endpoint URLs

#### Failed Security Tests
- **Cause**: Potential vulnerabilities detected
- **Solution**: Review security implementation immediately

## Continuous Integration

### GitHub Actions Example

```yaml
name: Security Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run dev &
      - run: sleep 10
      - run: npm run test:validation
```

## Contributing

To add new validation tests:

1. Add test method to appropriate validator class
2. Call method from `run-validation.ts`
3. Document expected behavior
4. Update this README

## Security Disclosure

If tests reveal actual vulnerabilities, please report them privately to the maintainers before public disclosure.

## License

MIT - See LICENSE file for details
