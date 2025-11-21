import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { parseMetadata, validateMetadataXml } from '../saml/metadata';
import { generateSpMetadata, generateIdpMetadata } from '../saml/samlSp';

const router = Router();

// Import metadata (upload or paste XML)
router.post('/import', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { xml } = req.body;

    if (!xml || typeof xml !== 'string') {
      res.status(400).json({ error: 'XML metadata is required' });
      return;
    }

    // Validate XML
    if (!validateMetadataXml(xml)) {
      res.status(400).json({ error: 'Invalid SAML metadata XML' });
      return;
    }

    // Parse metadata
    const parsed = await parseMetadata(xml);

    // Check if entity already exists
    const existingEntity = await prisma.samlEntity.findUnique({
      where: { entityId: parsed.entityId },
    });

    if (existingEntity) {
      // Update existing entity
      const updated = await prisma.samlEntity.update({
        where: { entityId: parsed.entityId },
        data: {
          rawXml: xml,
          parsedJson: parsed as any,
          type: parsed.type,
          ssoUrl: parsed.ssoUrl,
          sloUrl: parsed.sloUrl,
          acsUrls: parsed.acsUrls,
          certificates: parsed.certificates,
          active: true,
        },
      });

      res.json({
        message: 'Metadata updated successfully',
        entity: updated,
      });
      return;
    }

    // Create new entity
    const entity = await prisma.samlEntity.create({
      data: {
        type: parsed.type,
        entityId: parsed.entityId,
        rawXml: xml,
        parsedJson: parsed as any,
        ssoUrl: parsed.ssoUrl,
        sloUrl: parsed.sloUrl,
        acsUrls: parsed.acsUrls,
        certificates: parsed.certificates,
        active: true,
      },
    });

    res.status(201).json({
      message: 'Metadata imported successfully',
      entity,
    });
  } catch (error) {
    console.error('Import metadata error:', error);
    res.status(500).json({
      error: 'Failed to import metadata',
      details: (error as Error).message,
    });
  }
});

// Export SP metadata
router.get('/export/sp', async (req: Request, res: Response): Promise<void> => {
  try {
    const metadata = await generateSpMetadata();
    res.type('application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('Export SP metadata error:', error);
    res.status(500).json({
      error: 'Failed to generate SP metadata',
      details: (error as Error).message,
    });
  }
});

// Export IdP metadata
router.get('/export/idp', async (req: Request, res: Response): Promise<void> => {
  try {
    const metadata = await generateIdpMetadata();
    res.type('application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('Export IdP metadata error:', error);
    res.status(500).json({
      error: 'Failed to generate IdP metadata',
      details: (error as Error).message,
    });
  }
});

// List all imported metadata
router.get('/list', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const entities = await prisma.samlEntity.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        entityId: true,
        ssoUrl: true,
        sloUrl: true,
        acsUrls: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ entities });
  } catch (error) {
    console.error('List metadata error:', error);
    res.status(500).json({ error: 'Failed to list metadata' });
  }
});

// Get single metadata entity
router.get('/:entityId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId } = req.params;

    const entity = await prisma.samlEntity.findUnique({
      where: { entityId: decodeURIComponent(entityId) },
    });

    if (!entity) {
      res.status(404).json({ error: 'Entity not found' });
      return;
    }

    res.json({ entity });
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({ error: 'Failed to get metadata' });
  }
});

// Delete metadata
router.delete('/:entityId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId } = req.params;

    await prisma.samlEntity.delete({
      where: { entityId: decodeURIComponent(entityId) },
    });

    res.json({ message: 'Metadata deleted successfully' });
  } catch (error) {
    console.error('Delete metadata error:', error);
    res.status(500).json({ error: 'Failed to delete metadata' });
  }
});

export default router;
