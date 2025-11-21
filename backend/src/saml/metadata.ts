import xml2js from 'xml2js';
import { extractEntityId } from './utils';

export interface ParsedMetadata {
  entityId: string;
  type: 'SP' | 'IDP';
  ssoUrl?: string;
  sloUrl?: string;
  acsUrls: string[];
  certificates: string[];
}

export const parseMetadata = async (
  xmlString: string
): Promise<ParsedMetadata> => {
  const parser = new xml2js.Parser({
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix],
  });

  try {
    const result = await parser.parseStringPromise(xmlString);
    const descriptor = result.EntityDescriptor;

    if (!descriptor) {
      throw new Error('Invalid SAML metadata: No EntityDescriptor found');
    }

    const entityId = descriptor.$.entityID;
    const certificates: string[] = [];
    let type: 'SP' | 'IDP' = 'SP';
    let ssoUrl: string | undefined;
    let sloUrl: string | undefined;
    const acsUrls: string[] = [];

    // Determine if this is SP or IDP metadata
    const spDescriptor = descriptor.SPSSODescriptor;
    const idpDescriptor = descriptor.IDPSSODescriptor;

    if (idpDescriptor) {
      type = 'IDP';

      // Extract SSO URL
      const ssoServices = Array.isArray(idpDescriptor.SingleSignOnService)
        ? idpDescriptor.SingleSignOnService
        : [idpDescriptor.SingleSignOnService];

      const redirectSso = ssoServices.find(
        (s: any) => s.$.Binding?.includes('HTTP-Redirect')
      );
      const postSso = ssoServices.find(
        (s: any) => s.$.Binding?.includes('HTTP-POST')
      );
      ssoUrl = redirectSso?.$.Location || postSso?.$.Location;

      // Extract SLO URL
      if (idpDescriptor.SingleLogoutService) {
        const sloServices = Array.isArray(idpDescriptor.SingleLogoutService)
          ? idpDescriptor.SingleLogoutService
          : [idpDescriptor.SingleLogoutService];
        sloUrl = sloServices[0]?.$.Location;
      }

      // Extract certificates
      if (idpDescriptor.KeyDescriptor) {
        const keyDescriptors = Array.isArray(idpDescriptor.KeyDescriptor)
          ? idpDescriptor.KeyDescriptor
          : [idpDescriptor.KeyDescriptor];

        keyDescriptors.forEach((kd: any) => {
          const cert =
            kd.KeyInfo?.X509Data?.X509Certificate;
          if (cert) {
            certificates.push(
              typeof cert === 'string' ? cert : cert.toString()
            );
          }
        });
      }
    } else if (spDescriptor) {
      type = 'SP';

      // Extract ACS URLs
      const acsServices = Array.isArray(
        spDescriptor.AssertionConsumerService
      )
        ? spDescriptor.AssertionConsumerService
        : [spDescriptor.AssertionConsumerService];

      acsServices.forEach((acs: any) => {
        if (acs?.$.Location) {
          acsUrls.push(acs.$.Location);
        }
      });

      // Extract SLO URL
      if (spDescriptor.SingleLogoutService) {
        const sloServices = Array.isArray(spDescriptor.SingleLogoutService)
          ? spDescriptor.SingleLogoutService
          : [spDescriptor.SingleLogoutService];
        sloUrl = sloServices[0]?.$.Location;
      }

      // Extract certificates
      if (spDescriptor.KeyDescriptor) {
        const keyDescriptors = Array.isArray(spDescriptor.KeyDescriptor)
          ? spDescriptor.KeyDescriptor
          : [spDescriptor.KeyDescriptor];

        keyDescriptors.forEach((kd: any) => {
          const cert = kd.KeyInfo?.X509Data?.X509Certificate;
          if (cert) {
            certificates.push(
              typeof cert === 'string' ? cert : cert.toString()
            );
          }
        });
      }
    }

    return {
      entityId,
      type,
      ssoUrl,
      sloUrl,
      acsUrls,
      certificates,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse SAML metadata: ${(error as Error).message}`
    );
  }
};

export const validateMetadataXml = (xmlString: string): boolean => {
  try {
    // Basic XML validation
    if (!xmlString.includes('EntityDescriptor')) {
      return false;
    }
    if (!xmlString.includes('entityID=')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
