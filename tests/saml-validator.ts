/**
 * SAML 2.0 Flow Validator
 * Comprehensive testing for SAML 2.0 flows
 */

import crypto from 'crypto';

export interface SAMLValidationResult {
  flow: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, any>;
}

export class SAML2Validator {
  private baseUrl: string;
  private results: SAMLValidationResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Validate IdP Metadata Generation
   */
  async validateIdPMetadata(environmentId: string): Promise<SAMLValidationResult> {
    const result: SAMLValidationResult = {
      flow: 'idp_metadata',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      const metadataResponse = await fetch(
        `${this.baseUrl}/saml/${environmentId}/metadata`
      );

      if (!metadataResponse.ok) {
        result.errors.push(`Metadata endpoint returned ${metadataResponse.status}`);
        return result;
      }

      const metadataXml = await metadataResponse.text();
      result.details.metadataLength = metadataXml.length;

      // Validate XML structure
      if (!metadataXml.includes('<?xml')) {
        result.errors.push('Invalid XML: Missing XML declaration');
      }

      if (!metadataXml.includes('EntityDescriptor')) {
        result.errors.push('Invalid SAML metadata: Missing EntityDescriptor');
      }

      if (!metadataXml.includes('IDPSSODescriptor')) {
        result.errors.push('Invalid IdP metadata: Missing IDPSSODescriptor');
      }

      // Validate required elements
      const requiredElements = [
        'SingleSignOnService',
        'SingleLogoutService',
        'NameIDFormat',
      ];

      requiredElements.forEach(element => {
        if (!metadataXml.includes(element)) {
          result.errors.push(`Missing required element: ${element}`);
        }
      });

      // Check for entityID
      const entityIdMatch = metadataXml.match(/entityID="([^"]+)"/);
      if (entityIdMatch) {
        result.details.entityId = entityIdMatch[1];
      } else {
        result.errors.push('Missing entityID attribute');
      }

      // Check for SSO Location
      const ssoMatch = metadataXml.match(/<md:SingleSignOnService[^>]+Location="([^"]+)"/);
      if (ssoMatch) {
        result.details.ssoUrl = ssoMatch[1];
      } else {
        result.warnings.push('SSO Location not found in metadata');
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate SP Metadata Generation
   */
  async validateSPMetadata(environmentId: string): Promise<SAMLValidationResult> {
    const result: SAMLValidationResult = {
      flow: 'sp_metadata',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      const metadataResponse = await fetch(
        `${this.baseUrl}/saml/${environmentId}/metadata`
      );

      if (!metadataResponse.ok) {
        result.errors.push(`SP Metadata endpoint returned ${metadataResponse.status}`);
        return result;
      }

      const metadataXml = await metadataResponse.text();

      // Validate SP-specific elements
      if (!metadataXml.includes('SPSSODescriptor')) {
        result.errors.push('Invalid SP metadata: Missing SPSSODescriptor');
      }

      if (!metadataXml.includes('AssertionConsumerService')) {
        result.errors.push('Missing required element: AssertionConsumerService');
      }

      // Extract ACS URL
      const acsMatch = metadataXml.match(
        /<md:AssertionConsumerService[^>]+Location="([^"]+)"/
      );
      if (acsMatch) {
        result.details.acsUrl = acsMatch[1];
      } else {
        result.errors.push('Missing ACS Location');
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate SAML Assertion Structure
   */
  validateAssertionStructure(assertionXml: string): SAMLValidationResult {
    const result: SAMLValidationResult = {
      flow: 'saml_assertion',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Check for XML declaration
      if (!assertionXml.includes('<?xml') && !assertionXml.includes('<saml:Assertion')) {
        result.errors.push('Invalid assertion: Not a valid XML document');
        return result;
      }

      // Required elements in a SAML assertion
      const requiredElements = [
        { name: 'Assertion', pattern: /<saml:Assertion/ },
        { name: 'Issuer', pattern: /<saml:Issuer/ },
        { name: 'Subject', pattern: /<saml:Subject/ },
        { name: 'NameID', pattern: /<saml:NameID/ },
        { name: 'Conditions', pattern: /<saml:Conditions/ },
        { name: 'AuthnStatement', pattern: /<saml:AuthnStatement/ },
      ];

      requiredElements.forEach(({ name, pattern }) => {
        if (!pattern.test(assertionXml)) {
          result.errors.push(`Missing required element: ${name}`);
        }
      });

      // Check for required attributes
      if (!assertionXml.match(/ID="_[a-f0-9]+"/)) {
        result.errors.push('Assertion missing valid ID attribute');
      }

      if (!assertionXml.match(/Version="2.0"/)) {
        result.errors.push('Assertion missing or invalid Version attribute');
      }

      if (!assertionXml.match(/IssueInstant="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        result.warnings.push('IssueInstant format may be invalid');
      }

      // Validate time conditions
      const notBeforeMatch = assertionXml.match(/NotBefore="([^"]+)"/);
      const notOnOrAfterMatch = assertionXml.match(/NotOnOrAfter="([^"]+)"/);

      if (notBeforeMatch && notOnOrAfterMatch) {
        const notBefore = new Date(notBeforeMatch[1]);
        const notOnOrAfter = new Date(notOnOrAfterMatch[1]);

        if (notOnOrAfter <= notBefore) {
          result.errors.push('Invalid time window: NotOnOrAfter must be after NotBefore');
        }

        result.details.validityWindow = {
          notBefore: notBeforeMatch[1],
          notOnOrAfter: notOnOrAfterMatch[1],
          durationSeconds: (notOnOrAfter.getTime() - notBefore.getTime()) / 1000,
        };
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate SAML Response Structure
   */
  validateResponseStructure(responseXml: string): SAMLValidationResult {
    const result: SAMLValidationResult = {
      flow: 'saml_response',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Required elements in a SAML response
      const requiredElements = [
        { name: 'Response', pattern: /<samlp:Response/ },
        { name: 'Issuer', pattern: /<saml:Issuer/ },
        { name: 'Status', pattern: /<samlp:Status/ },
        { name: 'StatusCode', pattern: /<samlp:StatusCode/ },
      ];

      requiredElements.forEach(({ name, pattern }) => {
        if (!pattern.test(responseXml)) {
          result.errors.push(`Missing required element: ${name}`);
        }
      });

      // Check for success status
      const statusCodeMatch = responseXml.match(
        /Value="urn:oasis:names:tc:SAML:2\.0:status:([^"]+)"/
      );

      if (statusCodeMatch) {
        result.details.statusCode = statusCodeMatch[1];
        if (statusCodeMatch[1] !== 'Success') {
          result.warnings.push(`Non-success status: ${statusCodeMatch[1]}`);
        }
      }

      // Check if response contains an assertion
      if (!responseXml.includes('<saml:Assertion')) {
        result.warnings.push('Response does not contain an embedded assertion');
      }

      // Validate Destination
      const destinationMatch = responseXml.match(/Destination="([^"]+)"/);
      if (destinationMatch) {
        result.details.destination = destinationMatch[1];
      } else {
        result.warnings.push('Response missing Destination attribute');
      }

      // Check for InResponseTo (SP-initiated)
      const inResponseToMatch = responseXml.match(/InResponseTo="([^"]+)"/);
      if (inResponseToMatch) {
        result.details.inResponseTo = inResponseToMatch[1];
        result.details.initiationType = 'SP-initiated';
      } else {
        result.details.initiationType = 'IdP-initiated';
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate SSO Flow
   */
  async validateSSOFlow(environmentId: string): Promise<SAMLValidationResult> {
    const result: SAMLValidationResult = {
      flow: 'saml_sso',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Test SSO endpoint
      const ssoResponse = await fetch(
        `${this.baseUrl}/saml/${environmentId}/sso`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            SAMLRequest: 'test_request',
          }),
        }
      );

      result.details.ssoEndpointStatus = ssoResponse.status;

      if (ssoResponse.ok) {
        result.details.ssoEndpoint = 'OK';
      } else {
        result.warnings.push(`SSO endpoint returned ${ssoResponse.status}`);
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Security Validation for SAML
   */
  validateSAMLSecurity(
    assertionXml: string,
    responseXml?: string
  ): SAMLValidationResult {
    const result: SAMLValidationResult = {
      flow: 'saml_security',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Check for signature elements
      const hasAssertionSignature = assertionXml.includes('<ds:Signature');
      const hasResponseSignature = responseXml
        ? responseXml.includes('<ds:Signature')
        : false;

      result.details.assertionSigned = hasAssertionSignature;
      result.details.responseSigned = hasResponseSignature;

      if (!hasAssertionSignature && !hasResponseSignature) {
        result.warnings.push(
          'Neither assertion nor response is signed - vulnerable to tampering'
        );
      }

      // Check for encryption
      const isEncrypted = assertionXml.includes('EncryptedAssertion');
      result.details.assertionEncrypted = isEncrypted;

      if (!isEncrypted) {
        result.warnings.push(
          'Assertion is not encrypted - sensitive data may be exposed'
        );
      }

      // Validate Recipient attribute in SubjectConfirmationData
      const recipientMatch = assertionXml.match(/Recipient="([^"]+)"/);
      if (recipientMatch) {
        result.details.recipient = recipientMatch[1];
      } else {
        result.warnings.push('Missing Recipient attribute in SubjectConfirmationData');
      }

      // Check for Audience restriction
      if (!assertionXml.includes('AudienceRestriction')) {
        result.warnings.push('Missing AudienceRestriction - assertion can be used by any SP');
      }

      // Validate time window (not too long)
      const notBeforeMatch = assertionXml.match(/NotBefore="([^"]+)"/);
      const notOnOrAfterMatch = assertionXml.match(/NotOnOrAfter="([^"]+)"/);

      if (notBeforeMatch && notOnOrAfterMatch) {
        const notBefore = new Date(notBeforeMatch[1]);
        const notOnOrAfter = new Date(notOnOrAfterMatch[1]);
        const durationMinutes =
          (notOnOrAfter.getTime() - notBefore.getTime()) / 1000 / 60;

        if (durationMinutes > 60) {
          result.warnings.push(
            `Assertion validity window is very long: ${durationMinutes.toFixed(0)} minutes`
          );
        }
      }

      result.passed = result.errors.length === 0;
    } catch (error: any) {
      result.errors.push(`Exception: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Validate Attribute Statement
   */
  validateAttributeStatement(assertionXml: string): SAMLValidationResult {
    const result: SAMLValidationResult = {
      flow: 'attribute_statement',
      passed: false,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Check for AttributeStatement
      if (!assertionXml.includes('<saml:AttributeStatement')) {
        result.warnings.push('No AttributeStatement found in assertion');
        result.passed = true; // Not an error, just a warning
        return result;
      }

      // Extract attributes
      const attributeMatches = assertionXml.matchAll(
        /<saml:Attribute[^>]+Name="([^"]+)"[^>]*>([\s\S]*?)<\/saml:Attribute>/g
      );

      const attributes: Record<string, string> = {};
      let attributeCount = 0;

      for (const match of attributeMatches) {
        const attrName = match[1];
        const attrContent = match[2];

        // Extract attribute value
        const valueMatch = attrContent.match(
          /<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/
        );
        if (valueMatch) {
          attributes[attrName] = valueMatch[1];
        }

        attributeCount++;
      }

      result.details.attributeCount = attributeCount;
      result.details.attributes = attributes;

      if (attributeCount === 0) {
        result.warnings.push('AttributeStatement exists but contains no attributes');
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
  getResults(): SAMLValidationResult[] {
    return this.results;
  }

  /**
   * Generate summary report
   */
  generateReport(): string {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => r.passed === false).length;
    const total = this.results.length;

    let report = '=== SAML 2.0 Validation Report ===\n\n';
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

      if (Object.keys(result.details).length > 0) {
        report += `   Details:\n`;
        Object.entries(result.details).forEach(([key, value]) => {
          const valueStr =
            typeof value === 'object' ? JSON.stringify(value) : String(value);
          report += `     ${key}: ${valueStr}\n`;
        });
      }

      report += '\n';
    });

    return report;
  }
}
