import type { FeedItem, Source } from './types'

/** Parses RSS 2.0 / RSS 1.0 / Atom (incl. YouTube channel feeds) into feed items. */
export function parseFeed(xml: string, source: Source): FeedItem[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) return []
  const entries = [...byLocal(doc.documentElement, 'item', true), ...byLocal(doc.documentElement, 'entry', true)]
  const items: FeedItem[] = []
  for (const el of entries) {
    const item = parseEntry(el, source)
    if (item) items.push(item)
  }
  return items
}

function parseEntry(el: Element, source: Source): FeedItem | null {
  const title = clean(childText(el, 'title'))
  const link = entryLink(el)
  if (!title || !link) return null

  const dateStr = childText(el, 'pubDate') || childText(el, 'published') || childText(el, 'updated') || childText(el, 'date')
  const parsed = Date.parse(dateStr)
  const date = Number.isFinite(parsed) ? parsed : Date.now()

  const contentHtml = childText(el, 'encoded') || (child(el, 'content')?.getAttribute('type')?.includes('html') ? childText(el, 'content') : '') || ''
  const descHtml = childText(el, 'description') || childText(el, 'summary') || mediaDescription(el) || ''
  const summary = truncate(htmlToText(descHtml || contentHtml), 280)
  const content = contentHtml && htmlToText(contentHtml).length > 600 ? contentHtml : undefined

  const videoId = childText(el, 'videoId') || undefined
  const isShort = /\/shorts\//.test(link)
  const author = clean(child(el, 'author') ? childText(child(el, 'author')!, 'name') || childText(el, 'author') : childText(el, 'creator')) || undefined

  return {
    id: source.id + '::' + (childText(el, 'guid') || childText(el, 'id') || link),
    sourceId: source.id,
    sourceName: source.name,
    type: source.type,
    title,
    link,
    date,
    summary,
    content,
    image: entryImage(el, descHtml + contentHtml),
    author,
    videoId,
    isShort,
  }
}

// ---------- helpers ----------

/** Direct children (or all descendants if deep) with a given local name, ignoring namespaces. */
function byLocal(root: Element, name: string, deep = false): Element[] {
  if (deep) return [...root.getElementsByTagNameNS('*', name)]
  return [...root.children].filter((c) => c.localName === name)
}

function child(el: Element, name: string): Element | undefined {
  return byLocal(el, name)[0]
}

function childText(el: Element, name: string): string {
  return (child(el, name)?.textContent || '').trim()
}

function mediaDescription(el: Element): string {
  const group = child(el, 'group')
  return group ? childText(group, 'description') : ''
}

function entryLink(el: Element): string {
  const links = byLocal(el, 'link')
  for (const l of links) {
    const href = l.getAttribute('href')
    const rel = l.getAttribute('rel')
    if (href && (!rel || rel === 'alternate')) return href
  }
  const text = links.find((l) => (l.textContent || '').trim())?.textContent?.trim()
  if (text) return text
  const guid = child(el, 'guid')
  if (guid && /^https?:/.test(guid.textContent || '')) return guid.textContent!.trim()
  return ''
}

function entryImage(el: Element, html: string): string | undefined {
  const group = child(el, 'group') || el
  const thumb = byLocal(group, 'thumbnail')[0]?.getAttribute('url') || byLocal(el, 'thumbnail')[0]?.getAttribute('url')
  if (thumb) return thumb
  const media = byLocal(el, 'content').find((c) => (c.getAttribute('medium') === 'image' || (c.getAttribute('type') || '').startsWith('image')) && c.getAttribute('url'))
  if (media) return media.getAttribute('url')!
  const enc = byLocal(el, 'enclosure').find((e) => (e.getAttribute('type') || '').startsWith('image'))
  if (enc) return enc.getAttribute('url') || undefined
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m && /^https:/.test(m[1]) ? m[1] : undefined
}

export function htmlToText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return clean(doc.body.textContent || '')
}

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

export function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 20)).trimEnd() + '…'
}

/** First sentence of a text, for the "In short" box. */
export function firstSentence(s: string, max = 220): string {
  const m = s.match(/^.+?[.!?](\s|$)/)
  return truncate((m ? m[0] : s).trim(), max)
}

/** Finds an RSS/Atom feed link announced in an HTML page. */
export function findFeedLink(html: string, baseUrl: string): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const link = doc.querySelector('link[rel="alternate"][type="application/rss+xml"], link[rel="alternate"][type="application/atom+xml"]')
  const href = link?.getAttribute('href')
  if (!href) return null
  try {
    return new URL(href, baseUrl).toString()
  } catch {
    return null
  }
}

/** Finds a YouTube channel id (UC…) in a channel page. */
export function findChannelId(html: string): string | null {
  const m =
    html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]{22})/) ||
    html.match(/"externalId":"(UC[\w-]{22})"/) ||
    html.match(/"channelId":"(UC[\w-]{22})"/) ||
    html.match(/itemprop="identifier" content="(UC[\w-]{22})"/)
  return m ? m[1] : null
}

/** Title of an HTML page or feed, for naming a new source. */
export function findTitle(text: string): string | null {
  const m = text.match(/<title[^>]*>([^<]{1,120})<\/title>/i)
  if (!m) return null
  const t = m[1].replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim()
  return t.replace(/\s*-\s*YouTube$/, '') || null
}
