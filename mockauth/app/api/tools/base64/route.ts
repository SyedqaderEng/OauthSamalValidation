import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    if (!action || !data) {
      return NextResponse.json(
        { error: 'Action and data are required' },
        { status: 400 }
      );
    }

    let result: string;
    let inputStats: any;
    let outputStats: any;

    if (action === 'encode') {
      result = Buffer.from(data, 'utf-8').toString('base64');
      inputStats = {
        characters: data.length,
        bytes: Buffer.byteLength(data, 'utf-8'),
        lines: data.split('\n').length,
      };
      outputStats = {
        characters: result.length,
        bytes: Buffer.byteLength(result, 'utf-8'),
      };
    } else if (action === 'decode') {
      try {
        result = Buffer.from(data, 'base64').toString('utf-8');
        inputStats = {
          characters: data.length,
          bytes: Buffer.byteLength(data, 'utf-8'),
        };
        outputStats = {
          characters: result.length,
          bytes: Buffer.byteLength(result, 'utf-8'),
          lines: result.split('\n').length,
        };
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid base64 string' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "encode" or "decode"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      result,
      inputStats,
      outputStats,
      efficiency: inputStats.bytes > 0 ? Math.round((outputStats.bytes / inputStats.bytes) * 100) : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process base64', details: error.message },
      { status: 500 }
    );
  }
}
