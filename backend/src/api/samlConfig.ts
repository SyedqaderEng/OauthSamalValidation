import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get current SAML configuration
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await prisma.samlConfig.findFirst();

    if (!config) {
      // Create default config
      config = await prisma.samlConfig.create({
        data: {
          appRole: 'BOTH',
          defaultEntityId: 'http://localhost:3001',
        },
      });
    }

    res.json({
      config: {
        id: config.id,
        appRole: config.appRole,
        defaultEntityId: config.defaultEntityId,
        hasSigningCert: !!config.signingCert,
        hasEncryptionCert: !!config.encryptionCert,
      },
    });
  } catch (error) {
    console.error('Get SAML config error:', error);
    res.status(500).json({ error: 'Failed to get SAML configuration' });
  }
});

// Update SAML configuration
router.put('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      appRole: z.enum(['SP', 'IDP', 'BOTH']),
      defaultEntityId: z.string().url().optional(),
    });

    const body = schema.parse(req.body);

    let config = await prisma.samlConfig.findFirst();

    if (config) {
      config = await prisma.samlConfig.update({
        where: { id: config.id },
        data: body,
      });
    } else {
      config = await prisma.samlConfig.create({
        data: {
          appRole: body.appRole,
          defaultEntityId: body.defaultEntityId || 'http://localhost:3001',
        },
      });
    }

    res.json({
      message: 'SAML configuration updated successfully',
      config: {
        id: config.id,
        appRole: config.appRole,
        defaultEntityId: config.defaultEntityId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Update SAML config error:', error);
    res.status(500).json({ error: 'Failed to update SAML configuration' });
  }
});

export default router;
