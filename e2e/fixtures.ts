import type { Page } from '@playwright/test'

/** Long enough to pass the 50-word rule. */
const BODY =
  'Volunteers and local researchers measured what changed over three years and shared the results openly, so other towns could copy the method. ' +
  'The project grew step by step, with neighbours, schools and gardeners working together on every street. ' +
  'Two years later the results held, and a short public guide explains which steps mattered most and how long they took.'

const ITEMS = [
  'Seagrass meadows are returning to the coast',
  'A village reopens its school thanks to new families',
  'Child mortality keeps falling, new data show',
  'Cities cool their streets by planting trees',
  'A library that lends tools now has 3,000 members',
  'Solar panels on reservoirs save water and power homes',
]

function rss(title: string, now: number): string {
  const items = ITEMS.map(
    (t, i) => `<item><title>${t} · ${title.replace(/^www\./, '').split('.')[0]}</title><link>https://example.org/${encodeURIComponent(title)}/${i}</link>
<guid>${title}-${i}</guid><pubDate>${new Date(now - (i + 1) * 3_600_000).toUTCString()}</pubDate>
<description>${t}. ${BODY}</description></item>`,
  ).join('')
  return `<?xml version="1.0"?><rss version="2.0"><channel><title>${title}</title><language>en</language>${items}</channel></rss>`
}

/** Every feed answers with the same calm stories (titles made unique per source — the app merges duplicates); YouTube, Wikipedia and Hacker News stay empty. */
export async function mockNetwork(page: Page, now: number) {
  await page.route('**/api/relay**', (route) => {
    const target = new URL(route.request().url()).searchParams.get('url') ?? ''
    if (/youtube\.com/.test(target)) return route.fulfill({ status: 404, body: '' })
    const name = new URL(target).hostname
    return route.fulfill({ status: 200, contentType: 'text/plain', body: rss(name, now) })
  })
  await page.route(/wikipedia\.org|wikimedia\.org|firebaseio\.com|favicon\.ico/, (route) => route.fulfill({ status: 404, body: '' }))
}

/** Skip onboarding: an existing person, in English, who has already seen what's new. */
export async function seedReturningUser(page: Page, version: string) {
  await page.addInitScript((v) => {
    localStorage.setItem('sf.settings.v1', JSON.stringify({ onboarded: true, lang: 'en' }))
    localStorage.setItem('sf.version.v1', JSON.stringify(v))
    localStorage.setItem('sf.install.v1', JSON.stringify({ state: 'done' }))
  }, version)
}
