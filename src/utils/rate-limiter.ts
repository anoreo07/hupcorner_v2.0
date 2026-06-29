export const RATE_LIMITS = {
  UPLOAD: { windowMs: 15 * 60 * 1000, max: 50 },
  DOWNLOAD: { windowMs: 15 * 60 * 1000, max: 200 },
  SEARCH: { windowMs: 1 * 60 * 1000, max: 60 },
} as const;

const rateMap = new Map<string, { count: number; reset: number }>();

export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip?.trim() || 'unknown';
  }
  return 'unknown';
}

export function checkRateLimit(
  clientIp: string,
  limit: { windowMs: number; max: number }
): { success: boolean; message?: string; resetTime: number } {
  const now = Date.now();
  const entry = rateMap.get(clientIp);

  if (!entry || now > entry.reset) {
    rateMap.set(clientIp, { count: 1, reset: now + limit.windowMs });
    return { success: true, resetTime: now + limit.windowMs };
  }

  entry.count += 1;

  if (entry.count > limit.max) {
    const retryAfter = Math.ceil((entry.reset - now) / 1000);
    return {
      success: false,
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      resetTime: entry.reset,
    };
  }

  return { success: true, resetTime: entry.reset };
}
