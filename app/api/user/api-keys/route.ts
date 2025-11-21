import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(['read', 'write'])).default(['read']),
  expiresInDays: z.number().min(1).max(365).optional(),
});

function generateApiKey(): string {
  return `mk_${crypto.randomBytes(32).toString('hex')}`;
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// GET /api/user/api-keys - List all API keys for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createApiKeySchema.parse(body);

    // Generate the API key
    const plainTextKey = generateApiKey();
    const hashedKey = hashApiKey(plainTextKey);
    const keyPrefix = plainTextKey.substring(0, 10);

    // Calculate expiration date if provided
    let expiresAt: Date | null = null;
    if (validatedData.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);
    }

    // Create the API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        keyHash: hashedKey,
        keyPrefix,
        permissions: JSON.stringify(validatedData.permissions),
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Return the plain text key only once
    return NextResponse.json({
      apiKey: plainTextKey,
      key: {
        ...apiKey,
        permissions: JSON.parse(apiKey.permissions),
      },
      message: 'Store this API key securely. It will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }

    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
