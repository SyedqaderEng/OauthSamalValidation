import crypto from 'crypto';
import { create } from 'xmlbuilder2';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';

export interface SamlAssertion {
  id: string;
  issuer: string;
  nameId: string;
  attributes: Record<string, string>;
  sessionIndex: string;
  issueInstant: string;
  notBefore: string;
  notOnOrAfter: string;
}

export class SAMLService {
  /**
   * Generate SAML Assertion
   */
  static generateAssertion(params: {
    environment: any;
    nameId: string;
    attributes?: Record<string, string>;
    recipient: string;
  }): string {
    const assertionId = `_${crypto.randomBytes(16).toString('hex')}`;
    const sessionIndex = `_${crypto.randomBytes(16).toString('hex')}`;
    const issueInstant = new Date().toISOString();

    const notBefore = new Date();
    notBefore.setMinutes(notBefore.getMinutes() - 5);

    const notOnOrAfter = new Date();
    notOnOrAfter.setSeconds(notOnOrAfter.getSeconds() + params.environment.assertionLifetime);

    const assertion = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('saml:Assertion', {
        'xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'ID': assertionId,
        'Version': '2.0',
        'IssueInstant': issueInstant,
      })
        .ele('saml:Issuer').txt(params.environment.entityId).up()
        .ele('saml:Subject')
          .ele('saml:NameID', {
            'Format': params.environment.nameIdFormat,
          }).txt(params.nameId).up()
          .ele('saml:SubjectConfirmation', {
            'Method': 'urn:oasis:names:tc:SAML:2.0:cm:bearer',
          })
            .ele('saml:SubjectConfirmationData', {
              'NotOnOrAfter': notOnOrAfter.toISOString(),
              'Recipient': params.recipient,
            }).up()
          .up()
        .up()
        .ele('saml:Conditions', {
          'NotBefore': notBefore.toISOString(),
          'NotOnOrAfter': notOnOrAfter.toISOString(),
        })
          .ele('saml:AudienceRestriction')
            .ele('saml:Audience').txt(params.recipient).up()
          .up()
        .up()
        .ele('saml:AuthnStatement', {
          'AuthnInstant': issueInstant,
          'SessionIndex': sessionIndex,
        })
          .ele('saml:AuthnContext')
            .ele('saml:AuthnContextClassRef').txt('urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport').up()
          .up()
        .up();

    // Add attributes
    if (params.attributes && Object.keys(params.attributes).length > 0) {
      const attrStatement = assertion.ele('saml:AttributeStatement');

      Object.entries(params.attributes).forEach(([name, value]) => {
        attrStatement
          .ele('saml:Attribute', { 'Name': name })
            .ele('saml:AttributeValue', {
              'xsi:type': 'xs:string',
            }).txt(value).up()
          .up();
      });
    }

    return assertion.end({ prettyPrint: true });
  }

  /**
   * Generate SAML Response
   */
  static generateSAMLResponse(params: {
    environment: any;
    assertion: string;
    destination: string;
    inResponseTo?: string;
  }): string {
    const responseId = `_${crypto.randomBytes(16).toString('hex')}`;
    const issueInstant = new Date().toISOString();

    const response = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('samlp:Response', {
        'xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        'xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        'ID': responseId,
        'Version': '2.0',
        'IssueInstant': issueInstant,
        'Destination': params.destination,
        ...(params.inResponseTo && { 'InResponseTo': params.inResponseTo }),
      })
        .ele('saml:Issuer').txt(params.environment.entityId).up()
        .ele('samlp:Status')
          .ele('samlp:StatusCode', {
            'Value': 'urn:oasis:names:tc:SAML:2.0:status:Success',
          }).up()
        .up()
        .import(create(params.assertion).first());

    return response.end({ prettyPrint: true });
  }

  /**
   * Generate IdP Metadata
   */
  static generateIdPMetadata(environment: any): string {
    const metadata = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('md:EntityDescriptor', {
        'xmlns:md': 'urn:oasis:names:tc:SAML:2.0:metadata',
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        'entityID': environment.entityId,
      })
        .ele('md:IDPSSODescriptor', {
          'WantAuthnRequestsSigned': 'false',
          'protocolSupportEnumeration': 'urn:oasis:names:tc:SAML:2.0:protocol',
        })
          .ele('md:KeyDescriptor', { 'use': 'signing' })
            .ele('ds:KeyInfo')
              .ele('ds:X509Data')
                .ele('ds:X509Certificate').txt('MOCK_CERTIFICATE_DATA').up()
              .up()
            .up()
          .up()
          .ele('md:SingleLogoutService', {
            'Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
            'Location': environment.sloUrl || `${process.env.NEXT_PUBLIC_APP_URL}/saml/${environment.id}/slo`,
          }).up()
          .ele('md:NameIDFormat').txt(environment.nameIdFormat).up()
          .ele('md:SingleSignOnService', {
            'Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
            'Location': environment.ssoUrl || `${process.env.NEXT_PUBLIC_APP_URL}/saml/${environment.id}/sso`,
          }).up()
          .ele('md:SingleSignOnService', {
            'Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
            'Location': environment.ssoUrl || `${process.env.NEXT_PUBLIC_APP_URL}/saml/${environment.id}/sso`,
          }).up()
        .up();

    return metadata.end({ prettyPrint: true });
  }

  /**
   * Generate SP Metadata
   */
  static generateSPMetadata(environment: any): string {
    const metadata = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('md:EntityDescriptor', {
        'xmlns:md': 'urn:oasis:names:tc:SAML:2.0:metadata',
        'entityID': environment.entityId,
      })
        .ele('md:SPSSODescriptor', {
          'AuthnRequestsSigned': 'false',
          'WantAssertionsSigned': 'true',
          'protocolSupportEnumeration': 'urn:oasis:names:tc:SAML:2.0:protocol',
        })
          .ele('md:NameIDFormat').txt(environment.nameIdFormat).up()
          .ele('md:AssertionConsumerService', {
            'Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
            'Location': environment.acsUrl,
            'index': '0',
            'isDefault': 'true',
          }).up()
        .up();

    return metadata.end({ prettyPrint: true });
  }

  /**
   * Parse SAML Metadata from XML
   */
  static parseMetadata(xmlString: string): any {
    // Simplified metadata parsing
    // In production, use a proper XML parser like xml2js
    const entityIdMatch = xmlString.match(/entityID="([^"]+)"/);
    const ssoMatch = xmlString.match(/<md:SingleSignOnService[^>]+Location="([^"]+)"/);
    const sloMatch = xmlString.match(/<md:SingleLogoutService[^>]+Location="([^"]+)"/);

    return {
      entityId: entityIdMatch ? entityIdMatch[1] : null,
      ssoUrl: ssoMatch ? ssoMatch[1] : null,
      sloUrl: sloMatch ? sloMatch[1] : null,
    };
  }

  /**
   * Create SAML Session
   */
  static async createSession(params: {
    environmentId: string;
    nameId: string;
    attributes: Record<string, string>;
  }): Promise<string> {
    const sessionId = crypto.randomBytes(16).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hour session

    await prisma.samlSession.create({
      data: {
        environmentId: params.environmentId,
        sessionId,
        nameId: params.nameId,
        sessionData: params.attributes,
        expiresAt,
      },
    });

    return sessionId;
  }
}
