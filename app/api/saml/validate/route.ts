import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';

const validateSchema = z.object({
  samlResponse: z.string().min(1),
  environmentId: z.string().optional(),
});

// POST /api/saml/validate - Validate and parse a SAML response
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = validateSchema.parse(body);

    let xmlString = validatedData.samlResponse;

    // Check if it's base64 encoded
    if (!xmlString.trim().startsWith('<') && !xmlString.trim().startsWith('<?xml')) {
      try {
        xmlString = Buffer.from(xmlString, 'base64').toString('utf-8');
      } catch {
        return NextResponse.json({ error: 'Invalid SAML response format' }, { status: 400 });
      }
    }

    // Basic XML parsing to extract key elements
    const parsed: any = {
      raw: xmlString,
      isValid: true,
      attributes: {},
      assertions: [],
    };

    // Extract Issuer
    const issuerMatch = xmlString.match(/<(?:saml2?:|)Issuer[^>]*>([^<]+)<\/(?:saml2?:|)Issuer>/i);
    if (issuerMatch) {
      parsed.issuer = issuerMatch[1].trim();
    }

    // Extract NameID
    const nameIdMatch = xmlString.match(/<(?:saml2?:|)NameID[^>]*>([^<]+)<\/(?:saml2?:|)NameID>/i);
    if (nameIdMatch) {
      parsed.nameId = nameIdMatch[1].trim();
      parsed.attributes['NameID'] = nameIdMatch[1].trim();
    }

    // Extract Destination
    const destMatch = xmlString.match(/Destination\s*=\s*["']([^"']+)["']/i);
    if (destMatch) {
      parsed.destination = destMatch[1];
    }

    // Extract InResponseTo
    const inResponseToMatch = xmlString.match(/InResponseTo\s*=\s*["']([^"']+)["']/i);
    if (inResponseToMatch) {
      parsed.inResponseTo = inResponseToMatch[1];
    }

    // Extract IssueInstant
    const issueInstantMatch = xmlString.match(/IssueInstant\s*=\s*["']([^"']+)["']/i);
    if (issueInstantMatch) {
      parsed.issueInstant = issueInstantMatch[1];
    }

    // Extract Status
    const statusMatch = xmlString.match(/<(?:samlp?:|)StatusCode[^>]*Value\s*=\s*["']([^"']+)["'][^>]*\/?>/i);
    if (statusMatch) {
      parsed.status = statusMatch[1];
      parsed.isSuccess = statusMatch[1].includes('Success');
    }

    // Extract Attributes
    const attrRegex = /<(?:saml2?:|)Attribute[^>]*Name\s*=\s*["']([^"']+)["'][^>]*>[\s\S]*?<(?:saml2?:|)AttributeValue[^>]*>([^<]+)<\/(?:saml2?:|)AttributeValue>/gi;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(xmlString)) !== null) {
      const attrName = attrMatch[1].split('/').pop() || attrMatch[1];
      parsed.attributes[attrName] = attrMatch[2].trim();
    }

    // Extract SessionIndex
    const sessionIndexMatch = xmlString.match(/SessionIndex\s*=\s*["']([^"']+)["']/i);
    if (sessionIndexMatch) {
      parsed.sessionIndex = sessionIndexMatch[1];
    }

    // Check for signatures
    parsed.hasSigning = xmlString.includes('ds:Signature') || xmlString.includes('Signature');
    parsed.hasEncryption = xmlString.includes('EncryptedAssertion') || xmlString.includes('xenc:');

    // Extract conditions
    const notBeforeMatch = xmlString.match(/NotBefore\s*=\s*["']([^"']+)["']/i);
    const notOnOrAfterMatch = xmlString.match(/NotOnOrAfter\s*=\s*["']([^"']+)["']/i);
    if (notBeforeMatch || notOnOrAfterMatch) {
      parsed.conditions = {
        notBefore: notBeforeMatch ? notBeforeMatch[1] : null,
        notOnOrAfter: notOnOrAfterMatch ? notOnOrAfterMatch[1] : null,
      };
    }

    // Validate timing (if conditions exist)
    if (parsed.conditions) {
      const now = new Date();
      if (parsed.conditions.notBefore && new Date(parsed.conditions.notBefore) > now) {
        parsed.warnings = parsed.warnings || [];
        parsed.warnings.push('Assertion is not yet valid (NotBefore is in the future)');
      }
      if (parsed.conditions.notOnOrAfter && new Date(parsed.conditions.notOnOrAfter) < now) {
        parsed.warnings = parsed.warnings || [];
        parsed.warnings.push('Assertion has expired (NotOnOrAfter is in the past)');
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }

    console.error('Error validating SAML response:', error);
    return NextResponse.json({ error: 'Failed to parse SAML response' }, { status: 500 });
  }
}
