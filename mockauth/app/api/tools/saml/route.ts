import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { samlData } = await request.json();

    if (!samlData) {
      return NextResponse.json({ error: 'SAML data is required' }, { status: 400 });
    }

    let xml = samlData;

    // Check if it's base64 encoded
    try {
      if (!samlData.trim().startsWith('<')) {
        xml = Buffer.from(samlData, 'base64').toString('utf-8');
      }
    } catch (e) {
      // If base64 decode fails, assume it's already XML
    }

    // Simple XML parsing to extract key information
    const extractValue = (pattern: RegExp): string | null => {
      const match = xml.match(pattern);
      return match ? match[1] : null;
    };

    const info = {
      type: xml.includes('samlp:Response') ? 'Response' : xml.includes('samlp:AuthnRequest') ? 'AuthnRequest' : 'Unknown',
      issuer: extractValue(/<saml:Issuer[^>]*>([^<]+)<\/saml:Issuer>/),
      destination: extractValue(/Destination="([^"]+)"/),
      responseId: extractValue(/ID="([^"]+)"/),
      issueInstant: extractValue(/IssueInstant="([^"]+)"/),
      status: extractValue(/<samlp:StatusCode[^>]+Value="([^"]+)"/),
      nameId: extractValue(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/),
      nameIdFormat: extractValue(/<saml:NameID[^>]+Format="([^"]+)"/),
      assertionId: extractValue(/<saml:Assertion[^>]+ID="([^"]+)"/),
      sessionIndex: extractValue(/SessionIndex="([^"]+)"/),
      notBefore: extractValue(/NotBefore="([^"]+)"/),
      notOnOrAfter: extractValue(/NotOnOrAfter="([^"]+)"/),
      audience: extractValue(/<saml:Audience>([^<]+)<\/saml:Audience>/),
    };

    // Extract attributes
    const attributes: Array<{ name: string; value: string }> = [];
    const attrRegex = /<saml:Attribute[^>]+Name="([^"]+)"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/g;
    let match;

    while ((match = attrRegex.exec(xml)) !== null) {
      attributes.push({
        name: match[1],
        value: match[2],
      });
    }

    return NextResponse.json({
      info,
      attributes,
      xml,
      formatted: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to decode SAML', details: error.message },
      { status: 500 }
    );
  }
}
