import { NextRequest, NextResponse } from 'next/server';
import { explainAuthFlow, suggestSecurityImprovements } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, protocol, details, config } = body;

    if (type === 'explain') {
      const explanation = await explainAuthFlow(protocol || 'oauth', details || {});
      return NextResponse.json({ explanation });
    }

    if (type === 'security') {
      const suggestions = await suggestSecurityImprovements(config || {});
      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
