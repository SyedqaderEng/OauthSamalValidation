import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateAppSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  redirectUris: z.array(z.string().url()).optional(),
  scopes: z.array(z.string()).optional(),
});

// GET /api/oauth/apps/[id] - Get a specific OAuth app
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const app = await prisma.oAuthApp.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'OAuth app not found' }, { status: 404 });
    }

    // Don't return the hashed client secret
    const { clientSecret, ...appWithoutSecret } = app;

    return NextResponse.json({ app: appWithoutSecret });
  } catch (error) {
    console.error('Error fetching OAuth app:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/oauth/apps/[id] - Update an OAuth app
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateAppSchema.parse(body);

    // Check if app exists and belongs to user
    const existingApp = await prisma.oAuthApp.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingApp) {
      return NextResponse.json({ error: 'OAuth app not found' }, { status: 404 });
    }

    // Update the app
    const updatedApp = await prisma.oAuthApp.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'update',
        resourceType: 'oauth_app',
        resourceId: updatedApp.id,
        oauthAppId: updatedApp.id,
        metadata: validatedData,
      },
    });

    const { clientSecret, ...appWithoutSecret } = updatedApp;

    return NextResponse.json({ app: appWithoutSecret });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    console.error('Error updating OAuth app:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/oauth/apps/[id] - Delete an OAuth app
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if app exists and belongs to user
    const existingApp = await prisma.oAuthApp.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingApp) {
      return NextResponse.json({ error: 'OAuth app not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.oAuthApp.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'delete',
        resourceType: 'oauth_app',
        resourceId: existingApp.id,
        oauthAppId: existingApp.id,
      },
    });

    return NextResponse.json({ message: 'OAuth app deleted successfully' });
  } catch (error) {
    console.error('Error deleting OAuth app:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
