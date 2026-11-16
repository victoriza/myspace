import { describe, expect, it } from 'vitest'
import { GET, isSameOrigin, rateLimited } from '../../api/relay'

const req = (headers: Record<string, string>) => new Request('https://feed.example.com/api/relay?url=https://example.org/feed', { headers })

describe('relay protection', () => {
  it('serves only the app itself', () => {
    expect(isSameOrigin(req({ 'sec-fetch-site': 'same-origin' }))).toBe(true)
    expect(isSameOrigin(req({ 'sec-fetch-site': 'cross-site' }))).toBe(false)
    expect(isSameOrigin(req({ origin: 'https://feed.example.com' }))).toBe(true)
    expect(isSameOrigin(req({ referer: 'https://evil.example/page' }))).toBe(false)
    expect(isSameOrigin(req({}))).toBe(false)
  })

  it('refuses other sites before fetching anything', async () => {
    const res = await GET(req({ 'sec-fetch-site': 'cross-site' }))
    expect(res.status).toBe(403)
  })

  it('limits requests per IP', () => {
    const now = 1_000_000
    for (let i = 0; i < 300; i++) expect(rateLimited('1.2.3.4', now)).toBe(false)
    expect(rateLimited('1.2.3.4', now)).toBe(true)
    expect(rateLimited('5.6.7.8', now)).toBe(false)
    expect(rateLimited('1.2.3.4', now + 11 * 60 * 1000)).toBe(false) // new window
  })
})
