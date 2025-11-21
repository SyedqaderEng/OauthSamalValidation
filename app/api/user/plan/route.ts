import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserPlanInfo, upgradePlan, PLAN_LIMITS, PlanType } from '@/lib/plan-limits';

// GET /api/user/plan - Get current user's plan info
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planInfo = await getUserPlanInfo(session.user.id);
    if (!planInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      plan: planInfo,
      limits: PLAN_LIMITS,
    });
  } catch (error) {
    console.error('Error fetching plan info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/plan - Upgrade plan (would integrate with payment in production)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: PlanType };

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // In production, this would:
    // 1. Create a Stripe checkout session
    // 2. Wait for webhook confirmation
    // 3. Then upgrade the plan

    await upgradePlan(session.user.id, plan);

    const updatedPlanInfo = await getUserPlanInfo(session.user.id);

    return NextResponse.json({
      success: true,
      plan: updatedPlanInfo,
      message: `Successfully upgraded to ${plan} plan`,
    });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
