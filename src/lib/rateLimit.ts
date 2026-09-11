type RateLimitEntry = { count: number; resetAt: number };

const buckets = new Map<string, RateLimitEntry>();

export function getClientKey(request: { headers?: Headers | Record<string, unknown> }, scope: string) {
  const getHeader = (name: string) => {
    if (!request.headers) return undefined;
    if (request.headers instanceof Headers) return request.headers.get(name) || undefined;
    const value = request.headers[name] ?? request.headers[name.toLowerCase()];
    return Array.isArray(value) ? String(value[0]) : typeof value === "string" ? value : undefined;
  };
  const forwarded = getHeader("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = getHeader("x-real-ip")?.trim();
  return `${scope}:${forwarded || realIp || "unknown"}`;
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  current.count += 1;
  if (current.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return new Response(JSON.stringify({ error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSeconds) },
  });
}
