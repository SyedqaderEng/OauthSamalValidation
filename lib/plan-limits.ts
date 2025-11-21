import prisma from './prisma';

export const PLAN_LIMITS = {
  free: {
    maxOAuthApps: 5,
    maxSamlEnvs: 3,
    maxExpiry: 30, // days
    apiAccess: false,
    teamCollaboration: false,
  },
  pro: {
    maxOAuthApps: -1, // unlimited
    maxSamlEnvs: -1, // unlimited
    maxExpiry: 365, // 1 year
    apiAccess: true,
    teamCollaboration: true,
  },
  enterprise: {
    maxOAuthApps: -1,
    maxSamlEnvs: -1,
    maxExpiry: -1, // unlimited
    apiAccess: true,
    teamCollaboration: true,
    selfHosted: true,
    customIntegrations: true,
    sla: true,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}

export async function checkOAuthAppLimit(userId: string): Promise<PlanCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, maxOAuthApps: true },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found', current: 0, limit: 0 };
  }

  const currentCount = await prisma.oAuthApp.count({
    where: { userId, deletedAt: null },
  });

  const limit = user.maxOAuthApps;

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current: currentCount, limit: -1 };
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limit} OAuth apps. Upgrade to Pro for unlimited apps.`,
      current: currentCount,
      limit,
    };
  }

  return { allowed: true, current: currentCount, limit };
}

export async function checkSamlEnvLimit(userId: string): Promise<PlanCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, maxSamlEnvs: true },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found', current: 0, limit: 0 };
  }

  const currentCount = await prisma.samlEnvironment.count({
    where: { userId, deletedAt: null },
  });

  const limit = user.maxSamlEnvs;

  if (limit === -1) {
    return { allowed: true, current: currentCount, limit: -1 };
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limit} SAML environments. Upgrade to Pro for unlimited environments.`,
      current: currentCount,
      limit,
    };
  }

  return { allowed: true, current: currentCount, limit };
}

export async function getMaxExpiry(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxExpiry: true },
  });

  return user?.maxExpiry || 30;
}

export async function checkApiAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiAccess: true },
  });

  return user?.apiAccess || false;
}

export async function upgradePlan(userId: string, newPlan: PlanType): Promise<void> {
  const planLimits = PLAN_LIMITS[newPlan];

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: newPlan,
      maxOAuthApps: planLimits.maxOAuthApps,
      maxSamlEnvs: planLimits.maxSamlEnvs,
      maxExpiry: planLimits.maxExpiry,
      apiAccess: planLimits.apiAccess,
      planExpiresAt: newPlan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for paid plans
    },
  });
}

export async function getUserPlanInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      maxOAuthApps: true,
      maxSamlEnvs: true,
      maxExpiry: true,
      apiAccess: true,
      planExpiresAt: true,
    },
  });

  if (!user) return null;

  const [oauthCount, samlCount] = await Promise.all([
    prisma.oAuthApp.count({ where: { userId, deletedAt: null } }),
    prisma.samlEnvironment.count({ where: { userId, deletedAt: null } }),
  ]);

  return {
    ...user,
    oauthAppsUsed: oauthCount,
    samlEnvsUsed: samlCount,
  };
}
