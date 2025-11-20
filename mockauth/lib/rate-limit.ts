import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const requestStore = new Map<string, RequestRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (record.resetTime < now) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, identifier: string): Promise<NextResponse | null> => {
    const now = Date.now();
    const record = requestStore.get(identifier);

    if (!record || record.resetTime < now) {
      // First request or window expired
      requestStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }

    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment counter
    record.count++;
    requestStore.set(identifier, record);

    return null; // Allow request
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP
  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },

  // API endpoints - moderate limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // OAuth/SAML endpoints - lenient limits
  oauth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300,
  },

  // Public tools - very lenient
  tools: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
};

/**
 * Apply rate limiting to an API route
 * Usage:
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await applyRateLimit(request, rateLimitConfigs.auth);
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // Continue with request handling...
 * }
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<NextResponse | null> {
  const id = identifier || getClientIp(request);
  const limiter = rateLimit(config);
  return await limiter(request, id);
}

/**
 * Get rate limit status for a client
 */
export function getRateLimitStatus(identifier: string, config: RateLimitConfig): {
  limit: number;
  remaining: number;
  reset: Date;
} {
  const record = requestStore.get(identifier);
  const now = Date.now();

  if (!record || record.resetTime < now) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: new Date(now + config.windowMs),
    };
  }

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    reset: new Date(record.resetTime),
  };
}
