import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAMLService } from '@/lib/saml/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const environment = await prisma.samlEnvironment.findUnique({
      where: { id: params.id },
    });

    if (!environment) {
      return NextResponse.json({ error: 'SAML environment not found' }, { status: 404 });
    }

    let metadata: string;

    if (environment.type === 'idp') {
      metadata = SAMLService.generateIdPMetadata(environment);
    } else {
      metadata = SAMLService.generateSPMetadata(environment);
    }

    return new NextResponse(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${environment.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_metadata.xml"`,
      },
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
