/**
 * Main Validation Runner
 * Orchestrates OAuth and SAML validation tests
 */

import { OAuth2Validator } from './oauth-validator';
import { SAML2Validator } from './saml-validator';
import fs from 'fs';
import path from 'path';

interface ValidationConfig {
  baseUrl: string;
  oauth?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  };
  saml?: {
    environmentId?: string;
  };
}

class ValidationRunner {
  private config: ValidationConfig;
  private oauthValidator: OAuth2Validator;
  private samlValidator: SAML2Validator;

  constructor(config: ValidationConfig) {
    this.config = config;
    this.oauthValidator = new OAuth2Validator(config.baseUrl);
    this.samlValidator = new SAML2Validator(config.baseUrl);
  }

  /**
   * Run all OAuth validations
   */
  async runOAuthValidations(): Promise<void> {
    console.log('🔐 Starting OAuth 2.0 Validation Tests...\n');

    if (!this.config.oauth) {
      console.log('⚠️  OAuth config not provided, skipping OAuth tests\n');
      return;
    }

    const { clientId, clientSecret, redirectUri } = this.config.oauth;

    if (clientId && clientSecret && redirectUri) {
      console.log('1. Testing Authorization Code Flow...');
      await this.oauthValidator.validateAuthorizationCodeFlow(
        clientId,
        clientSecret,
        redirectUri
      );
      console.log('   ✓ Complete\n');

      console.log('2. Testing PKCE Flow...');
      await this.oauthValidator.validatePKCEFlow(clientId, redirectUri);
      console.log('   ✓ Complete\n');

      console.log('3. Testing Client Credentials Flow...');
      await this.oauthValidator.validateClientCredentialsFlow(clientId, clientSecret);
      console.log('   ✓ Complete\n');

      console.log('4. Testing Security Controls...');
      await this.oauthValidator.validateSecurityControls(clientId);
      console.log('   ✓ Complete\n');
    } else {
      console.log('⚠️  OAuth credentials incomplete, skipping flow tests\n');
    }
  }

  /**
   * Run all SAML validations
   */
  async runSAMLValidations(): Promise<void> {
    console.log('🔒 Starting SAML 2.0 Validation Tests...\n');

    if (!this.config.saml?.environmentId) {
      console.log('⚠️  SAML environment ID not provided, skipping SAML tests\n');
      return;
    }

    const { environmentId } = this.config.saml;

    console.log('1. Testing IdP Metadata Generation...');
    await this.samlValidator.validateIdPMetadata(environmentId);
    console.log('   ✓ Complete\n');

    console.log('2. Testing SSO Flow...');
    await this.samlValidator.validateSSOFlow(environmentId);
    console.log('   ✓ Complete\n');

    // Test with sample SAML assertion
    console.log('3. Validating SAML Assertion Structure...');
    const sampleAssertion = this.generateSampleAssertion();
    this.samlValidator.validateAssertionStructure(sampleAssertion);
    console.log('   ✓ Complete\n');

    console.log('4. Validating SAML Response Structure...');
    const sampleResponse = this.generateSampleResponse(sampleAssertion);
    this.samlValidator.validateResponseStructure(sampleResponse);
    console.log('   ✓ Complete\n');

    console.log('5. Testing SAML Security...');
    this.samlValidator.validateSAMLSecurity(sampleAssertion, sampleResponse);
    console.log('   ✓ Complete\n');

    console.log('6. Testing Attribute Statement...');
    this.samlValidator.validateAttributeStatement(sampleAssertion);
    console.log('   ✓ Complete\n');
  }

  /**
   * Generate comprehensive validation report
   */
  generateComprehensiveReport(): string {
    let report = '';
    report += '╔════════════════════════════════════════════════════════════════╗\n';
    report += '║         OAuth & SAML Validation Report                        ║\n';
    report += '║         Generated: ' + new Date().toISOString().padEnd(43) + '║\n';
    report += '╚════════════════════════════════════════════════════════════════╝\n\n';

    // OAuth Report
    const oauthResults = this.oauthValidator.getResults();
    if (oauthResults.length > 0) {
      report += this.oauthValidator.generateReport();
      report += '\n';
    }

    // SAML Report
    const samlResults = this.samlValidator.getResults();
    if (samlResults.length > 0) {
      report += this.samlValidator.generateReport();
      report += '\n';
    }

    // Overall Summary
    const allResults = [...oauthResults, ...samlResults];
    const totalPassed = allResults.filter(r => r.passed).length;
    const totalFailed = allResults.filter(r => r.passed === false).length;
    const totalWarnings = allResults.reduce((sum, r) => sum + r.warnings.length, 0);

    report += '=== OVERALL SUMMARY ===\n\n';
    report += `Total Tests Run: ${allResults.length}\n`;
    report += `✅ Passed: ${totalPassed}\n`;
    report += `❌ Failed: ${totalFailed}\n`;
    report += `⚠️  Total Warnings: ${totalWarnings}\n`;
    report += `Success Rate: ${((totalPassed / allResults.length) * 100).toFixed(2)}%\n\n`;

    // Recommendations
    report += '=== RECOMMENDATIONS ===\n\n';

    if (totalFailed > 0) {
      report += '❗ Critical Issues Found:\n';
      allResults
        .filter(r => !r.passed)
        .forEach(r => {
          report += `  - ${r.flow}: ${r.errors.join(', ')}\n`;
        });
      report += '\n';
    }

    if (totalWarnings > 0) {
      report += '⚠️  Security Warnings:\n';
      let warningCount = 0;
      allResults.forEach(r => {
        r.warnings.forEach(w => {
          if (warningCount < 10) {
            // Limit to top 10 warnings
            report += `  - ${w}\n`;
            warningCount++;
          }
        });
      });
      report += '\n';
    }

    if (totalFailed === 0 && totalWarnings === 0) {
      report += '✅ All tests passed with no warnings! Excellent implementation.\n\n';
    }

    return report;
  }

  /**
   * Save report to file
   */
  async saveReport(reportPath: string): Promise<void> {
    const report = this.generateComprehensiveReport();
    const dir = path.dirname(reportPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`\n📄 Report saved to: ${reportPath}\n`);
  }

  /**
   * Generate sample SAML assertion for testing
   */
  private generateSampleAssertion(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                ID="_abc123def456"
                Version="2.0"
                IssueInstant="2024-01-01T12:00:00Z">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>
    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
      <saml:SubjectConfirmationData NotOnOrAfter="2024-01-01T12:10:00Z" Recipient="https://sp.example.com/acs"/>
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions NotBefore="2024-01-01T11:55:00Z" NotOnOrAfter="2024-01-01T12:10:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://sp.example.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="2024-01-01T12:00:00Z" SessionIndex="_session123">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>
  <saml:AttributeStatement>
    <saml:Attribute Name="email">
      <saml:AttributeValue xsi:type="xs:string">user@example.com</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="firstName">
      <saml:AttributeValue xsi:type="xs:string">John</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="lastName">
      <saml:AttributeValue xsi:type="xs:string">Doe</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`;
  }

  /**
   * Generate sample SAML response for testing
   */
  private generateSampleResponse(assertion: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                ID="_response123"
                Version="2.0"
                IssueInstant="2024-01-01T12:00:00Z"
                Destination="https://sp.example.com/acs"
                InResponseTo="_request123">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  ${assertion}
</samlp:Response>`;
  }

  /**
   * Run all validations
   */
  async runAll(): Promise<void> {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     OAuth & SAML Validation Test Suite                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    await this.runOAuthValidations();
    await this.runSAMLValidations();

    console.log('✅ All validation tests completed!\n');
  }
}

// Main execution
async function main() {
  const config: ValidationConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    oauth: {
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_REDIRECT_URI || 'https://example.com/callback',
    },
    saml: {
      environmentId: process.env.SAML_ENVIRONMENT_ID,
    },
  };

  const runner = new ValidationRunner(config);
  await runner.runAll();

  const reportPath = path.join(process.cwd(), 'validation-results', 'report.txt');
  await runner.saveReport(reportPath);

  // Also save JSON results
  const jsonPath = path.join(process.cwd(), 'validation-results', 'results.json');
  const jsonResults = {
    timestamp: new Date().toISOString(),
    oauth: runner['oauthValidator'].getResults(),
    saml: runner['samlValidator'].getResults(),
  };

  const dir = path.dirname(jsonPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(jsonPath, JSON.stringify(jsonResults, null, 2), 'utf-8');
  console.log(`📊 JSON results saved to: ${jsonPath}\n`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { ValidationRunner, ValidationConfig };
