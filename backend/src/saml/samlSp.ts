import * as samlify from 'samlify';
import { getCertificates, formatCertificate } from './utils';
import { config } from '../config/env';
import prisma from '../config/database';

// Initialize SP
export const createServiceProvider = async (entityId?: string) => {
  const { cert, privateKey } = getCertificates();

  const spConfig = await prisma.samlConfig.findFirst();
  const defaultEntityId = entityId || spConfig?.defaultEntityId || config.saml.issuer;

  return samlify.ServiceProvider({
    entityID: defaultEntityId,
    authnRequestsSigned: true,
    wantAssertionsSigned: true,
    wantMessageSigned: true,
    wantLogoutResponseSigned: true,
    wantLogoutRequestSigned: true,
    privateKey: privateKey,
    privateKeyPass: '',
    isAssertionEncrypted: false,
    assertionConsumerService: [
      {
        Binding: samlify.Constants.namespace.binding.post,
        Location: `${config.backendUrl}/saml/acs`,
      },
      {
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: `${config.backendUrl}/saml/acs`,
      },
    ],
    singleLogoutService: [
      {
        Binding: samlify.Constants.namespace.binding.post,
        Location: `${config.backendUrl}/saml/slo`,
      },
    ],
  });
};

// Create Identity Provider from metadata
export const createIdentityProviderFromMetadata = async (entityId: string) => {
  const entity = await prisma.samlEntity.findUnique({
    where: { entityId },
  });

  if (!entity || entity.type !== 'IDP') {
    throw new Error('Identity Provider not found');
  }

  return samlify.IdentityProvider({
    metadata: entity.rawXml,
  });
};

// Generate SP Metadata
export const generateSpMetadata = async (): Promise<string> => {
  const sp = await createServiceProvider();
  return sp.getMetadata();
};

// Create AuthN Request (SP-Initiated Login)
export const createAuthnRequest = async (
  targetIdpEntityId: string
): Promise<{ context: string; entityEndpoint: string }> => {
  const sp = await createServiceProvider();
  const idp = await createIdentityProviderFromMetadata(targetIdpEntityId);

  const { context, entityEndpoint } = sp.createLoginRequest(idp, 'redirect');

  return { context, entityEndpoint };
};

// Parse SAML Response from IdP
export const parseSamlResponse = async (
  samlResponse: string,
  idpEntityId: string
) => {
  const sp = await createServiceProvider();
  const idp = await createIdentityProviderFromMetadata(idpEntityId);

  const { extract } = await sp.parseLoginResponse(idp, 'post', {
    body: { SAMLResponse: samlResponse },
  });

  return extract;
};
