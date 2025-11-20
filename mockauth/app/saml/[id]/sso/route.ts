import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAMLService } from '@/lib/saml/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const environment = await prisma.samlEnvironment.findUnique({
      where: { id: params.id },
    });

    if (!environment || environment.type !== 'idp') {
      return NextResponse.json({ error: 'IdP not found' }, { status: 404 });
    }

    // Get test user (use first one if available)
    const testUsers = environment.testUsers as any[];
    const testUser = testUsers && testUsers.length > 0 ? testUsers[0] : {
      email: 'test@mockauth.dev',
      firstName: 'Test',
      lastName: 'User',
    };

    // Build attributes
    const attributes: Record<string, string> = {};
    const attrMappings = environment.attributeMappings as any || {};

    if (attrMappings['email']) {
      attributes[attrMappings['email']] = testUser.email;
    }
    if (attrMappings['firstName']) {
      attributes[attrMappings['firstName']] = testUser.firstName;
    }
    if (attrMappings['lastName']) {
      attributes[attrMappings['lastName']] = testUser.lastName;
    }

    // Add custom attributes
    if (testUser.customAttributes) {
      Object.entries(testUser.customAttributes).forEach(([key, value]) => {
        attributes[key] = value as string;
      });
    }

    // Generate assertion
    const assertionXml = SAMLService.generateAssertion({
      environment,
      nameId: testUser.email,
      attributes,
      recipient: environment.acsUrl || 'https://sp.example.com/acs',
    });

    // Generate SAML response
    const responseXml = SAMLService.generateSAMLResponse({
      environment,
      assertion: assertionXml,
      destination: environment.acsUrl || 'https://sp.example.com/acs',
    });

    // Create session
    await SAMLService.createSession({
      environmentId: environment.id,
      nameId: testUser.email,
      attributes,
    });

    // Base64 encode the response
    const encodedResponse = Buffer.from(responseXml).toString('base64');

    // Return HTML form that auto-submits to ACS
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SAML POST</title>
      </head>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${environment.acsUrl || 'https://sp.example.com/acs'}">
          <input type="hidden" name="SAMLResponse" value="${encodedResponse}" />
          <noscript>
            <button type="submit">Continue</button>
          </noscript>
        </form>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error processing SSO:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Support HTTP-Redirect binding
  return POST(request, { params });
}
