/**
 * Space Feed relay — fetches a public RSS/Atom feed (or the HTML page that announces one)
 * and passes it back to the app. Browsers block most sites from being read directly by web apps,
 * so this is the only server piece. It needs no keys and stores nothing.
 *
 * GET /api/relay?url=https://example.com/feed
 *
 * Abuse protection (no keys, so it can't be perfect):
 * - only requests made by the app itself (same origin) are served;
 * - at most RATE_LIMIT requests per IP every RATE_WINDOW_MS (per server instance);
 * - only feeds, HTML and plain text, at most 3 MB, never private/internal addresses.
 */

const MAX_BYTES = 3 * 1024 * 1024
const TIMEOUT_MS = 10000
const RATE_LIMIT = 300
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, { count: number; reset: number }>()

/** Simple fixed-window limiter. Lives in memory, so it's per instance — enough to stop casual abuse. */
export function rateLimited(ip: string, now = Date.now()): boolean {
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
  const entry = hits.get(ip)
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

/**
 * True when the request comes from a page on our own site. Browsers set Sec-Fetch-Site (and can't be
 * made to lie about it); older ones fall back to Origin/Referer. Requests with none of them are refused.
 */
export function isSameOrigin(request: Request): boolean {
  const site = request.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin'
  const self = new URL(request.url).host
  const from = request.headers.get('origin') || request.headers.get('referer')
  if (!from) return false
  try {
    return new URL(from).host === self
  } catch {
    return false
  }
}

const ALLOWED_TYPES = /(xml|rss|atom|html|text\/plain)/i

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return true
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])]
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
  }
  return false
}

function json(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export async function GET(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json(403, 'only for the Space Feed app')
  const ip = (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) return json(429, 'too many requests')

  const target = new URL(request.url).searchParams.get('url')
  if (!target) return json(400, 'missing url')

  let url: URL
  try {
    url = new URL(target)
  } catch {
    return json(400, 'invalid url')
  }
  if (!['http:', 'https:'].includes(url.protocol)) return json(400, 'only http(s)')
  if (url.port && !['80', '443'].includes(url.port)) return json(400, 'port not allowed')
  if (isBlockedHost(url.hostname)) return json(400, 'host not allowed')

  const headers: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 (compatible; SpaceFeedRelay/1.0; +https://github.com/)',
    accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5',
    'accept-language': 'es,en;q=0.8,ca;q=0.7',
  }
  // Skip YouTube's EU cookie-consent page so channel pages can be read.
  if (/(^|\.)youtube\.com$/.test(url.hostname)) headers.cookie = 'SOCS=CAI; CONSENT=YES+cb'

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const upstream = await fetch(url, { headers, redirect: 'follow', signal: ctrl.signal })
    const finalHost = new URL(upstream.url).hostname
    if (isBlockedHost(finalHost)) return json(400, 'redirect not allowed')
    if (!upstream.ok) return json(502, `upstream ${upstream.status}`)

    const type = upstream.headers.get('content-type') || 'text/plain'
    if (!ALLOWED_TYPES.test(type)) return json(415, 'not a feed or page')

    const reader = upstream.body?.getReader()
    if (!reader) return json(502, 'empty response')
    const chunks: BlobPart[] = []
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BYTES) {
        await reader.cancel()
        return json(413, 'too large')
      }
      chunks.push(value as Uint8Array<ArrayBuffer>)
    }
    const body = new Blob(chunks)
    return new Response(body, {
      status: 200,
      headers: {
        // Always plain text: the relay must never render someone else's HTML on our own domain.
        'content-type': 'text/plain; charset=utf-8',
        'x-upstream-content-type': type,
        'content-security-policy': "sandbox; default-src 'none'",
        // Vercel's CDN keeps a copy for 30 min, so many users reading the same feed cost one fetch.
        'cache-control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError'
    return json(aborted ? 504 : 502, aborted ? 'timeout' : 'fetch failed')
  } finally {
    clearTimeout(timer)
  }
}
