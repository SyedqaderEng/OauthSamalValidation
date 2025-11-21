import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import {
  generateSpMetadata,
  createAuthnRequest,
  parseSamlResponse,
} from '../saml/samlSp';
import {
  generateIdpMetadata,
  parseAuthnRequest,
  createSamlResponse,
  createIdpInitiatedResponse,
} from '../saml/samlIdp';
import { generateToken } from '../config/jwt';
import bcrypt from 'bcrypt';

const router = Router();

// ====================
// SP MODE ENDPOINTS
// ====================

// SP: Serve metadata
router.get('/metadata', async (req: Request, res: Response): Promise<void> => {
  try {
    const metadata = await generateSpMetadata();
    res.type('application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('SP metadata error:', error);
    res.status(500).json({ error: 'Failed to generate SP metadata' });
  }
});

// SP: Initiate login (create AuthnRequest and redirect to IdP)
router.get('/login/:idpEntityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idpEntityId } = req.params;
    const decodedEntityId = decodeURIComponent(idpEntityId);

    // Create AuthN Request
    const { context, entityEndpoint } = await createAuthnRequest(decodedEntityId);

    // Log the attempt
    await prisma.samlLog.create({
      data: {
        entityId: decodedEntityId,
        eventType: 'SP_INITIATED',
        status: 'PENDING',
        details: {
          redirectUrl: entityEndpoint,
        },
      },
    });

    // Redirect to IdP with SAMLRequest
    res.redirect(entityEndpoint);
  } catch (error) {
    console.error('SP login error:', error);
    res.status(500).json({
      error: 'Failed to initiate SP login',
      details: (error as Error).message,
    });
  }
});

// SP: Assertion Consumer Service (receive SAML response from IdP)
router.post('/acs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { SAMLResponse, RelayState } = req.body;

    if (!SAMLResponse) {
      res.status(400).json({ error: 'SAMLResponse is required' });
      return;
    }

    // Decode and parse SAML response
    const decodedResponse = Buffer.from(SAMLResponse, 'base64').toString('utf-8');

    // Extract IdP entityID from the response
    const entityIdMatch = decodedResponse.match(/Issuer[^>]*>([^<]+)</);
    const idpEntityId = entityIdMatch ? entityIdMatch[1] : '';

    // Parse the SAML response
    const extract = await parseSamlResponse(SAMLResponse, idpEntityId);

    // Extract user info from SAML attributes
    const email = extract.attributes?.email || extract.nameID;
    const username = extract.attributes?.username || email.split('@')[0];
    const displayName = extract.attributes?.name || username;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user from SAML login
      const randomPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          username: username + '_' + Date.now(), // Make unique
          passwordHash,
          displayName,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Log successful SAML login
    await prisma.samlLog.create({
      data: {
        entityId: idpEntityId,
        userId: user.id,
        eventType: 'LOGIN',
        status: 'SUCCESS',
        details: {
          nameID: extract.nameID,
          attributes: extract.attributes,
        },
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/saml-callback?token=${token}`);
  } catch (error) {
    console.error('ACS error:', error);

    // Log failed SAML login
    await prisma.samlLog.create({
      data: {
        entityId: 'unknown',
        eventType: 'LOGIN',
        status: 'FAILURE',
        details: {
          error: (error as Error).message,
        },
      },
    });

    res.status(500).json({
      error: 'Failed to process SAML response',
      details: (error as Error).message,
    });
  }
});

// ====================
// IDP MODE ENDPOINTS
// ====================

// IdP: Serve metadata
router.get('/idp/metadata', async (req: Request, res: Response): Promise<void> => {
  try {
    const metadata = await generateIdpMetadata();
    res.type('application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('IdP metadata error:', error);
    res.status(500).json({ error: 'Failed to generate IdP metadata' });
  }
});

// IdP: SSO endpoint (receive AuthnRequest from SP)
router.get('/idp/sso', async (req: Request, res: Response): Promise<void> => {
  try {
    const { SAMLRequest, RelayState } = req.query;

    if (!SAMLRequest) {
      res.status(400).json({ error: 'SAMLRequest is required' });
      return;
    }

    // Store the SAML request in session for later processing
    // For now, redirect to login page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/saml-idp-login?SAMLRequest=${encodeURIComponent(
      SAMLRequest as string
    )}&RelayState=${encodeURIComponent(RelayState as string || '')}`;

    res.redirect(loginUrl);
  } catch (error) {
    console.error('IdP SSO error:', error);
    res.status(500).json({ error: 'Failed to process SSO request' });
  }
});

// IdP: Process login and create SAML response
router.post('/idp/sso/process', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { spEntityId } = req.body;

    if (!spEntityId) {
      res.status(400).json({ error: 'spEntityId is required' });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create SAML response
    const { context, entityEndpoint } = await createSamlResponse(
      user,
      spEntityId
    );

    // Log the IdP login
    await prisma.samlLog.create({
      data: {
        entityId: spEntityId,
        userId: user.id,
        eventType: 'IDP_INITIATED',
        status: 'SUCCESS',
        details: {
          spEntityId,
          acsUrl: entityEndpoint,
        },
      },
    });

    res.json({
      samlResponse: context,
      acsUrl: entityEndpoint,
    });
  } catch (error) {
    console.error('IdP SSO process error:', error);
    res.status(500).json({
      error: 'Failed to create SAML response',
      details: (error as Error).message,
    });
  }
});

// ====================
// LOGOUT ENDPOINTS
// ====================

// SP: Single Logout
router.get('/slo', async (req: Request, res: Response): Promise<void> => {
  try {
    // Implement SLO logic here
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('SLO error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// IdP: Single Logout
router.get('/idp/slo', async (req: Request, res: Response): Promise<void> => {
  try {
    // Implement IdP SLO logic here
    res.json({ message: 'IdP logout successful' });
  } catch (error) {
    console.error('IdP SLO error:', error);
    res.status(500).json({ error: 'IdP logout failed' });
  }
});

// ====================
// SAML LOGS
// ====================

// Get all SAML logs (admin)
router.get('/logs', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await prisma.samlLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get SAML logs error:', error);
    res.status(500).json({ error: 'Failed to get SAML logs' });
  }
});

export default router;
