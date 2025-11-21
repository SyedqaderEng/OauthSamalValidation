import * as samlify from 'samlify';
import { getCertificates } from './utils';
import { config } from '../config/env';
import prisma from '../config/database';

// Initialize IdP
export const createIdentityProvider = async (entityId?: string) => {
  const { cert, privateKey } = getCertificates();

  const spConfig = await prisma.samlConfig.findFirst();
  const defaultEntityId = entityId || spConfig?.defaultEntityId || config.saml.issuer;

  return samlify.IdentityProvider({
    entityID: defaultEntityId,
    signingCert: cert,
    privateKey: privateKey,
    privateKeyPass: '',
    isAssertionEncrypted: false,
    messageSigningOrder: 'encrypt-then-sign',
    wantAuthnRequestsSigned: false,
    singleSignOnService: [
      {
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: `${config.backendUrl}/saml/idp/sso`,
      },
      {
        Binding: samlify.Constants.namespace.binding.post,
        Location: `${config.backendUrl}/saml/idp/sso`,
      },
    ],
    singleLogoutService: [
      {
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: `${config.backendUrl}/saml/idp/slo`,
      },
    ],
  });
};

// Create Service Provider from metadata
export const createServiceProviderFromMetadata = async (entityId: string) => {
  const entity = await prisma.samlEntity.findUnique({
    where: { entityId },
  });

  if (!entity || entity.type !== 'SP') {
    throw new Error('Service Provider not found');
  }

  return samlify.ServiceProvider({
    metadata: entity.rawXml,
  });
};

// Generate IdP Metadata
export const generateIdpMetadata = async (): Promise<string> => {
  const idp = await createIdentityProvider();
  return idp.getMetadata();
};

// Parse AuthN Request from SP
export const parseAuthnRequest = async (
  request: any,
  spEntityId: string
): Promise<any> => {
  const idp = await createIdentityProvider();
  const sp = await createServiceProviderFromMetadata(spEntityId);

  const { extract } = await idp.parseLoginRequest(sp, 'redirect', request);
  return extract;
};

// Create SAML Response (IdP sends to SP)
export const createSamlResponse = async (
  user: any,
  spEntityId: string,
  requestId?: string
): Promise<{ context: string; entityEndpoint: string }> => {
  const idp = await createIdentityProvider();
  const sp = await createServiceProviderFromMetadata(spEntityId);

  // Build user attributes
  const attributes = {
    email: user.email,
    name: user.displayName || user.username,
    username: user.username,
    userId: user.id,
  };

  const { context } = idp.createLoginResponse(
    sp,
    {
      inResponseTo: requestId,
    },
    'post',
    {
      email: user.email,
      nameID: user.email,
    },
    () => {
      // Custom attributes template
      return {
        attributes: [
          {
            name: 'email',
            valueXsiType: 'xs:string',
            value: attributes.email,
          },
          {
            name: 'name',
            valueXsiType: 'xs:string',
            value: attributes.name,
          },
          {
            name: 'username',
            valueXsiType: 'xs:string',
            value: attributes.username,
          },
          {
            name: 'userId',
            valueXsiType: 'xs:string',
            value: attributes.userId,
          },
        ],
      };
    }
  );

  // Get ACS URL from SP metadata
  const spEntity = await prisma.samlEntity.findUnique({
    where: { entityId: spEntityId },
  });

  const acsUrl = spEntity?.acsUrls[0] || '';

  return {
    context,
    entityEndpoint: acsUrl,
  };
};

// IdP-Initiated Login
export const createIdpInitiatedResponse = async (
  user: any,
  spEntityId: string
): Promise<{ context: string; entityEndpoint: string }> => {
  return createSamlResponse(user, spEntityId);
};
