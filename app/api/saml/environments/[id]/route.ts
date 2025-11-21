import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// GET /api/saml/environments/[id] - Get a specific SAML environment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const environment = await prisma.samlEnvironment.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!environment) {
      return NextResponse.json({ error: 'SAML environment not found' }, { status: 404 });
    }

    // Parse JSON strings
    const parsedEnv = {
      ...environment,
      attributeMappings: environment.attributeMappings ? JSON.parse(environment.attributeMappings) : null,
      testUsers: environment.testUsers ? JSON.parse(environment.testUsers) : null,
      idpMetadata: environment.idpMetadata ? JSON.parse(environment.idpMetadata) : null,
    };

    return NextResponse.json({ environment: parsedEnv });
  } catch (error) {
    console.error('Error fetching SAML environment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/saml/environments/[id] - Delete a SAML environment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if environment exists and belongs to user
    const environment = await prisma.samlEnvironment.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!environment) {
      return NextResponse.json({ error: 'SAML environment not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.samlEnvironment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'delete',
        resourceType: 'saml_environment',
        resourceId: environment.id,
        samlEnvironmentId: environment.id,
      },
    });

    return NextResponse.json({ message: 'SAML environment deleted successfully' });
  } catch (error) {
    console.error('Error deleting SAML environment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
