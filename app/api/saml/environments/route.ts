import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const createEnvSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['idp', 'sp']),
  entityId: z.string().url().optional(),
  acsUrl: z.string().url().optional(),
  ssoUrl: z.string().url().optional(),
  sloUrl: z.string().url().optional(),
  idpMetadata: z.string().optional(), // XML string
  attributeMappings: z.record(z.string(), z.string()).optional(),
  nameIdFormat: z.string().default('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'),
  assertionLifetime: z.number().default(600),
  signAssertions: z.boolean().default(true),
  signResponse: z.boolean().default(true),
  encryptAssertions: z.boolean().default(false),
  testUsers: z.array(z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    customAttributes: z.record(z.string(), z.string()).optional(),
  })).optional(),
});

// GET /api/saml/environments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const environments = await prisma.samlEnvironment.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        entityId: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ environments });
  } catch (error) {
    console.error('Error fetching SAML environments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/saml/environments
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEnvSchema.parse(body);

    // Generate entity ID if not provided
    const entityId = validatedData.entityId ||
      `${process.env.NEXT_PUBLIC_APP_URL}/saml/${crypto.randomBytes(8).toString('hex')}`;

    // Generate URLs based on type
    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/saml`;

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.RESOURCE_EXPIRY_DAYS || '30'));

    const environment = await prisma.samlEnvironment.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        entityId,
        ssoUrl: validatedData.ssoUrl,
        sloUrl: validatedData.sloUrl,
        acsUrl: validatedData.acsUrl,
        idpMetadata: validatedData.idpMetadata || null,
        attributeMappings: validatedData.attributeMappings ? JSON.stringify(validatedData.attributeMappings) : null,
        nameIdFormat: validatedData.nameIdFormat,
        assertionLifetime: validatedData.assertionLifetime,
        signAssertions: validatedData.signAssertions,
        signResponse: validatedData.signResponse,
        encryptAssertions: validatedData.encryptAssertions,
        testUsers: validatedData.testUsers ? JSON.stringify(validatedData.testUsers) : null,
        expiresAt,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'create',
        resourceType: 'saml_environment',
        resourceId: environment.id,
        samlEnvironmentId: environment.id,
      },
    });

    return NextResponse.json({ environment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }

    console.error('Error creating SAML environment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
