import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateClientId, generateClientSecret, hashPassword } from '@/lib/crypto';
import { applyRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { z } from 'zod';

const createAppSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  grantTypes: z.array(z.enum(['authorization_code', 'client_credentials', 'refresh_token', 'pkce'])),
  redirectUris: z.array(z.string().url()),
  scopes: z.array(z.string()).default(['read:profile']),
  accessTokenLifetime: z.number().default(3600),
  refreshTokenLifetime: z.number().default(2592000),
  autoApprove: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

// GET /api/oauth/apps - List all OAuth apps for the authenticated user
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, rateLimitConfigs.api);
  if (rateLimitResult) return rateLimitResult;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apps = await prisma.oAuthApp.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        clientId: true,
        grantTypes: true,
        scopes: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error fetching OAuth apps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/oauth/apps - Create a new OAuth app
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, rateLimitConfigs.api);
  if (rateLimitResult) return rateLimitResult;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAppSchema.parse(body);

    // Generate client credentials
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const hashedSecret = await hashPassword(clientSecret);

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.RESOURCE_EXPIRY_DAYS || '30'));

    // Create OAuth app
    const app = await prisma.oAuthApp.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        clientId,
        clientSecret: hashedSecret,
        grantTypes: validatedData.grantTypes,
        redirectUris: validatedData.redirectUris,
        scopes: validatedData.scopes,
        accessTokenLifetime: validatedData.accessTokenLifetime,
        refreshTokenLifetime: validatedData.refreshTokenLifetime,
        autoApprove: validatedData.autoApprove,
        isPublic: validatedData.isPublic,
        expiresAt,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'create',
        resourceType: 'oauth_app',
        resourceId: app.id,
        oauthAppId: app.id,
      },
    });

    // Return the app with the plain-text client secret (only shown once)
    return NextResponse.json(
      {
        app: {
          ...app,
          clientSecret, // Plain text, only returned on creation
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    console.error('Error creating OAuth app:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
