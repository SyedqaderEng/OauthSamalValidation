import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Decode without verification (for testing purposes)
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid JWT format' }, { status: 400 });
    }

    // Try to verify (will fail if secret is wrong, but that's ok for testing)
    let verified = false;
    let verificationError = null;

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
      verified = true;
    } catch (error: any) {
      verificationError = error.message;
    }

    return NextResponse.json({
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature,
      verified,
      verificationError,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to decode JWT', details: error.message },
      { status: 500 }
    );
  }
}
