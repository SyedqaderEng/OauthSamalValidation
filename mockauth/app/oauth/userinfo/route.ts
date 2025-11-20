import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Service } from '@/lib/oauth/service';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'invalid_token' },
        { status: 401 }
      );
    }

    const accessToken = authorization.substring(7);
    const userInfo = await OAuth2Service.getUserInfo(accessToken);

    return NextResponse.json(userInfo);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'invalid_token', error_description: error.message },
      { status: 401 }
    );
  }
}
