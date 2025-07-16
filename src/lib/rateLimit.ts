// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; last: number }>();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.last > windowMs) {
    rateLimitMap.set(key, { count: 1, last: now });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count++;
  entry.last = now;
  rateLimitMap.set(key, entry);
  return false;
}
