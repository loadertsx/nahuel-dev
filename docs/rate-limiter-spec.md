# Rate Limiter Specification

## Overview

This document specifies a rate limiting system for the nahuel-dev application using Cloudflare KV as the storage backend. The rate limiter protects authentication endpoints against brute-force attacks and abuse.

---

## Table of Contents

1. [Goals and Non-Goals](#goals-and-non-goals)
2. [Protected Endpoints](#protected-endpoints)
3. [Rate Limiting Strategy](#rate-limiting-strategy)
4. [Algorithm: Sliding Window Log](#algorithm-sliding-window-log)
5. [Client Identification](#client-identification)
6. [Storage Design](#storage-design)
7. [Response Format](#response-format)
8. [Error Handling](#error-handling)
9. [Logging and Monitoring](#logging-and-monitoring)
10. [Architecture](#architecture)
11. [Configuration](#configuration)
12. [Security Considerations](#security-considerations)

---

## Goals and Non-Goals

### Goals

- Prevent brute-force attacks on authentication endpoints
- Limit abuse from automated scripts and bots
- Provide clear feedback to rate-limited clients
- Maintain service availability during attacks
- Log rate limit events for security monitoring

### Non-Goals

- DDoS protection (handled by Cloudflare's edge network)
- Rate limiting authenticated API endpoints
- Per-user rate limiting (uses IP-based limiting)
- Geographic or ASN-based blocking

---

## Protected Endpoints

The rate limiter applies to authentication-related endpoints only:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/login` | POST | Admin login form submission |
| `/api/auth/*` | ALL | Better Auth API endpoints (sign-in, sign-out, session management) |

### Why These Endpoints?

1. **`/admin/login`**: Direct target for credential stuffing and brute-force attacks
2. **`/api/auth/*`**: Better Auth's API surface includes sign-in endpoints that could be exploited

### Excluded Endpoints

- Public read endpoints (`/blog/*`, `/notes/*`, `/about`, etc.)
- Static assets
- Health checks

---

## Rate Limiting Strategy

### Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Max Requests** | 5 | Allows legitimate retry attempts while blocking sustained attacks |
| **Window Duration** | 15 minutes (900 seconds) | Long enough to deter attackers, short enough to not frustrate legitimate users |
| **Identifier** | Client IP address | Simple, effective, cannot be spoofed on Cloudflare |

### Behavior

1. Each IP address is allowed **5 requests** to protected endpoints within any **15-minute sliding window**
2. When the limit is exceeded, subsequent requests receive HTTP 429 until the window expires
3. The window "slides" - each request is tracked individually and expires after 15 minutes

### Example Timeline

```
Time 00:00 - Request 1 -> Allowed (4 remaining)
Time 00:01 - Request 2 -> Allowed (3 remaining)
Time 00:02 - Request 3 -> Allowed (2 remaining)
Time 00:03 - Request 4 -> Allowed (1 remaining)
Time 00:04 - Request 5 -> Allowed (0 remaining)
Time 00:05 - Request 6 -> BLOCKED (429 response)
Time 00:10 - Request 7 -> BLOCKED (429 response)
Time 15:00 - Request 8 -> Allowed (Request 1 expired, 4 remaining)
Time 15:01 - Request 9 -> Allowed (Request 2 expired, 4 remaining)
```

---

## Algorithm: Sliding Window Log

### Why Sliding Window?

We use a **sliding window log** algorithm instead of simpler alternatives:

| Algorithm | Pros | Cons |
|-----------|------|------|
| **Fixed Window** | Simple, low storage | Burst vulnerability at window boundaries |
| **Sliding Window Counter** | Memory efficient | Approximate, can over-count |
| **Sliding Window Log** | Precise, no burst vulnerability | Slightly more storage |
| **Token Bucket** | Smooth rate limiting | More complex, overkill for auth |

**Chosen: Sliding Window Log** - Precise tracking without burst vulnerabilities.

### How It Works

1. **Store timestamps**: Each request's timestamp is stored in an array
2. **Filter expired**: On each check, remove timestamps older than the window
3. **Count remaining**: If count < limit, allow and add new timestamp
4. **Block if exceeded**: If count >= limit, reject without adding timestamp

### Pseudocode

```
function checkRateLimit(ip, maxRequests, windowSeconds):
    key = "ratelimit:auth:" + ip
    now = currentTimeMs()
    windowStart = now - (windowSeconds * 1000)

    // Get existing timestamps
    data = KV.get(key)
    timestamps = data?.timestamps ?? []

    // Remove expired timestamps
    timestamps = timestamps.filter(ts => ts > windowStart)

    // Check limit
    if timestamps.length < maxRequests:
        timestamps.push(now)
        KV.put(key, {timestamps}, ttl=windowSeconds+60)
        return {allowed: true, remaining: maxRequests - timestamps.length}
    else:
        return {allowed: false, remaining: 0, retryAfter: calculateRetryAfter(timestamps)}
```

### Retry-After Calculation

The `Retry-After` value tells clients when they can retry:

```
oldestTimestamp = timestamps[0]
resetTime = oldestTimestamp + windowMs
retryAfterSeconds = (resetTime - now) / 1000
```

---

## Client Identification

### Primary: CF-Connecting-IP

Cloudflare provides the `CF-Connecting-IP` header containing the true client IP address. This header:

- Cannot be spoofed by clients (set by Cloudflare edge)
- Handles proxy chains correctly
- Available on all Cloudflare plans

### Fallback Chain

```
1. CF-Connecting-IP (Cloudflare edge)
2. X-Forwarded-For (first IP, for non-CF environments)
3. "unknown" (last resort)
```

### IPv6 Handling

Both IPv4 and IPv6 addresses are supported. Each address format is treated as a unique identifier:

- `192.168.1.1` and `2001:db8::1` are separate rate limit buckets
- No IPv6 prefix aggregation (each /128 is unique)

---

## Storage Design

### Cloudflare KV Namespace

A dedicated KV namespace stores rate limit data:

```
Binding: RATE_LIMIT_KV
Purpose: Store request timestamps per IP
```

### Key Format

```
ratelimit:auth:<ip_address>
```

**Examples:**
- `ratelimit:auth:203.0.113.42`
- `ratelimit:auth:2001:db8::1`

### Value Format

JSON object containing timestamp array:

```json
{
  "timestamps": [
    1703952000000,
    1703952100000,
    1703952200000
  ]
}
```

- Timestamps are Unix milliseconds
- Array is ordered chronologically (oldest first)
- Maximum array size: 5 elements (equals maxRequests)

### TTL Strategy

Each KV entry has an automatic expiration:

```
TTL = windowSeconds + 60 seconds buffer
    = 900 + 60
    = 960 seconds
```

**Why the buffer?**
- Ensures entries aren't deleted mid-check due to clock drift
- KV eventually removes expired entries automatically
- No manual garbage collection needed

### Storage Estimates

| Metric | Value |
|--------|-------|
| Key size | ~30-50 bytes |
| Value size | ~50-100 bytes |
| Entry size | ~150 bytes |
| 1000 unique IPs | ~150 KB |
| 10000 unique IPs | ~1.5 MB |

KV free tier includes 1 GB storage - more than sufficient.

---

## Response Format

### Rate Limited Response (HTTP 429)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 847
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1703953200

{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 847
}
```

### Response Headers

| Header | Description | Example |
|--------|-------------|---------|
| `Retry-After` | Seconds until client can retry | `847` |
| `X-RateLimit-Limit` | Maximum requests per window | `5` |
| `X-RateLimit-Remaining` | Requests remaining in window | `0` |
| `X-RateLimit-Reset` | Unix timestamp when window resets | `1703953200` |

### Response Body

```typescript
{
  error: string;        // Machine-readable error code
  message: string;      // Human-readable message
  retryAfter: number;   // Seconds until retry (matches header)
}
```

---

## Error Handling

### Fail-Open Strategy

If the rate limiter encounters an error (KV unavailable, timeout, etc.), requests are **allowed to proceed**:

```typescript
try {
  result = await checkRateLimit(kv, ip, config);
  if (!result.allowed) return rateLimitResponse();
} catch (error) {
  console.error("[RateLimit] Error:", error);
  // ALLOW request to proceed
}
```

### Why Fail-Open?

| Strategy | Behavior on Error | Risk |
|----------|-------------------|------|
| **Fail-Open** | Allow all requests | Brief window of no protection |
| **Fail-Closed** | Block all requests | Potential self-DoS |

**Chosen: Fail-Open** - A brief window without rate limiting is preferable to blocking all legitimate users during a KV outage.

### Error Scenarios

| Scenario | Handling |
|----------|----------|
| KV read timeout | Log error, allow request |
| KV write failure | Log error, allow request (check still worked) |
| Invalid data in KV | Treat as empty, start fresh |
| JSON parse error | Treat as empty, start fresh |

---

## Logging and Monitoring

### Log Format

All rate limit events are logged to console in JSON format:

**Allowed Request:**
```json
{
  "type": "rate_limit_check",
  "ip": "203.0.113.42",
  "path": "/admin/login",
  "remaining": 4,
  "resetAt": "2024-12-30T15:00:00.000Z",
  "timestamp": "2024-12-30T14:45:00.000Z"
}
```

**Blocked Request:**
```json
{
  "type": "rate_limit_blocked",
  "ip": "203.0.113.42",
  "path": "/admin/login",
  "remaining": 0,
  "resetAt": "2024-12-30T15:00:00.000Z",
  "timestamp": "2024-12-30T14:50:00.000Z"
}
```

### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `rate_limit_check` or `rate_limit_blocked` |
| `ip` | string | Client IP address |
| `path` | string | Request path |
| `remaining` | number | Requests remaining after this check |
| `resetAt` | string | ISO 8601 timestamp when window resets |
| `timestamp` | string | ISO 8601 timestamp of this event |

### Viewing Logs

Logs are available in:
- **Local development**: Terminal output
- **Production**: Cloudflare Dashboard > Workers & Pages > [Your Worker] > Logs

### Alerting (Future Enhancement)

Consider setting up alerts for:
- High volume of blocked requests from single IP
- Sudden spike in rate limit events
- Errors in rate limit checks

---

## Architecture

### Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Workers Runtime                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      workers/app.ts                            │  │
│  │                                                                │  │
│  │  1. Receive request                                           │  │
│  │  2. Check if path needs rate limiting                         │  │
│  │  3. If yes:                                                   │  │
│  │     a. Extract client IP                                      │  │
│  │     b. Check rate limit (read/write KV)                       │  │
│  │     c. If blocked: return 429                                 │  │
│  │  4. Pass to React Router                                      │  │
│  │                                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                           │                                          │
│                           ▼                                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    React Router                                │  │
│  │                                                                │  │
│  │  - Loaders                                                    │  │
│  │  - Actions                                                    │  │
│  │  - Components                                                 │  │
│  │                                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Cloudflare KV                                   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  RATE_LIMIT_KV namespace                                     │    │
│  │                                                              │    │
│  │  ratelimit:auth:203.0.113.42 -> {"timestamps":[...]}        │    │
│  │  ratelimit:auth:198.51.100.1 -> {"timestamps":[...]}        │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Why Worker-Level Integration?

Rate limiting is implemented at the worker entry point (`workers/app.ts`) rather than in React Router middleware:

| Location | Pros | Cons |
|----------|------|------|
| **Worker entry (chosen)** | Blocks before any app logic runs, minimal resource usage | Tighter coupling to worker |
| **React Router middleware** | Framework-native | Still loads React Router for blocked requests |
| **Route-level** | Granular control | Duplicated logic, more resource usage |

---

## Configuration

### Cloudflare Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT_KV",
      "id": "<production_namespace_id>",
      "preview_id": "<preview_namespace_id>"
    }
  ]
}
```

### Rate Limit Configuration

```typescript
// workers/app.ts
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,           // Requests per window
  windowSeconds: 15 * 60,   // 15 minutes in seconds
};
```

### Path Matching Configuration

```typescript
// workers/app.ts
function shouldRateLimit(request: Request): boolean {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // POST to admin login
  if (path === "/admin/login" && method === "POST") {
    return true;
  }

  // All Better Auth endpoints
  if (path.startsWith("/api/auth/")) {
    return true;
  }

  return false;
}
```

---

## Security Considerations

### IP Spoofing Prevention

- `CF-Connecting-IP` is set by Cloudflare and cannot be spoofed by clients
- Do not trust `X-Forwarded-For` in production (client-controllable)
- Fall back to `X-Forwarded-For` only for local development

### Shared IP Addresses

Users behind NAT, corporate proxies, or VPNs may share IP addresses:

- **Risk**: Legitimate users blocked due to others' abuse
- **Mitigation**: 5 requests per 15 minutes is generous for legitimate use
- **Future**: Consider authenticated user bypass for logged-in admins

### Distributed Attacks

The rate limiter protects against single-IP attacks. Distributed attacks (botnets) require additional measures:

- Cloudflare Bot Management
- Cloudflare WAF rules
- CAPTCHA after failed attempts (future enhancement)

### Information Disclosure

The rate limit response does not reveal:
- Whether the username/email exists
- Which specific endpoint was targeted
- Internal system details

### Timing Attacks

Rate limit checks add minimal latency (~1-5ms for KV read/write). This does not introduce meaningful timing side channels.

---

## Implementation Checklist

- [ ] Create KV namespace (production and preview)
- [ ] Update `wrangler.jsonc` with KV binding
- [ ] Run `bun run cf-typegen` to regenerate types
- [ ] Create `workers/rate-limiter.ts` utility module
- [ ] Update `workers/app.ts` with rate limiting integration
- [ ] Test locally with `bun run dev`
- [ ] Deploy to production with `bun run deploy`
- [ ] Verify rate limiting works in production
- [ ] Monitor logs for rate limit events

---

## Future Enhancements

1. **Authenticated User Bypass**: Skip rate limiting for authenticated admin sessions
2. **Progressive Penalties**: Increase block duration for repeat offenders
3. **CAPTCHA Integration**: Show CAPTCHA after N failed attempts
4. **IP Allowlist**: Exempt trusted IPs (office, CI/CD)
5. **Per-Endpoint Limits**: Different limits for different endpoints
6. **Analytics Dashboard**: Visualize rate limit events over time
7. **Webhook Alerts**: Notify on suspicious activity patterns
