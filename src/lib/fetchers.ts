import { findChannelId, findDurationSeconds, findFeedLink, findTitle, parseFeed } from './parse'
import { loadChannelIds, loadDurations, saveChannelIds, saveDurations } from './storage'
import type { FeedItem, Lang, Source } from './types'

const RELAY = '/api/relay'
const TIMEOUT_MS = 12000

async function withTimeout(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

/** Fetches any URL through our own Vercel relay (sites usually block browsers from reading them directly). */
export async function viaRelay(url: string): Promise<string> {
  const res = await withTimeout(`${RELAY}?url=${encodeURIComponent(url)}`)
  if (!res.ok) throw new Error(`relay ${res.status}`)
  return res.text()
}

export const youtubeFeedUrl = (channelId: string) => `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
/** The channel's "videos only" playlist (UC… → UULF…): no Shorts, so the ~15 items YouTube gives are all real videos. */
export const youtubeVideosOnlyUrl = (channelId: string) => `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${channelId.slice(2)}`

/** Resolves a YouTube @handle to its channel id (cached on the phone). */
export async function resolveChannelId(source: Source): Promise<string | null> {
  if (source.channelId) return source.channelId
  if (!source.handle) return null
  const cache = loadChannelIds()
  if (cache[source.handle]) return cache[source.handle]
  const html = await viaRelay(`https://www.youtube.com/${source.handle}`)
  const id = findChannelId(html)
  if (id) saveChannelIds({ ...cache, [source.handle]: id })
  return id
}

/** Wikipedia picture of the day — today's and yesterday's, so there are always pictures to pick from. */
async function fetchWikipediaPicture(source: Source, lang: Lang): Promise<FeedItem[]> {
  const days = [0, 1].map((back) => new Date(Date.now() - back * 24 * 60 * 60 * 1000))
  const results = await Promise.allSettled(days.map((d) => fetchWikipediaDay(source, lang, d)))
  const items = results.flatMap((r) => (r.status === 'fulfilled' && r.value ? [r.value] : []))
  if (!items.length && results[0].status === 'rejected') throw results[0].reason
  return items
}

async function fetchWikipediaDay(source: Source, lang: Lang, d: Date): Promise<FeedItem | null> {
  const path = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`
  const res = await withTimeout(`https://${lang}.wikipedia.org/api/rest_v1/feed/featured/${path}`)
  if (!res.ok) throw new Error('wikipedia ' + res.status)
  const data = await res.json()
  const img = data.image
  if (!img) return null
  const title = (img.description?.text as string | undefined)?.replace(/<[^>]+>/g, '').trim() || (img.title as string).replace(/^File:/, '').replace(/\.[a-z]+$/i, '')
  return {
    id: `${source.id}::${path}`,
    sourceId: source.id,
    sourceName: source.name,
    type: 'picture',
    title: title.length > 160 ? title.slice(0, 157) + '…' : title,
    link: img.file_page || `https://commons.wikimedia.org/wiki/${encodeURIComponent(img.title)}`,
    date: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 6),
    summary: img.artist?.text ? `© ${String(img.artist.text).replace(/<[^>]+>/g, '').trim()}` : '',
    image: img.thumbnail?.source || img.image?.source,
  }
}

async function fetchHackerNews(source: Source): Promise<FeedItem[]> {
  const ids: number[] = await (await withTimeout('https://hacker-news.firebaseio.com/v0/topstories.json')).json()
  const top = await Promise.all(
    ids.slice(0, 12).map(async (id) => {
      try {
        return await (await withTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)).json()
      } catch {
        return null
      }
    }),
  )
  return top
    .filter((s) => s && s.title && s.type === 'story')
    .map((s) => ({
      id: `${source.id}::${s.id}`,
      sourceId: source.id,
      sourceName: source.name,
      type: 'tech' as const,
      title: s.title as string,
      link: (s.url as string) || `https://news.ycombinator.com/item?id=${s.id}`,
      date: (s.time as number) * 1000,
      summary: s.url ? new URL(s.url).hostname.replace(/^www\./, '') : 'news.ycombinator.com',
    }))
}

/** Step 1: collect the latest items of one source. */
export async function fetchSource(source: Source, lang: Lang): Promise<FeedItem[]> {
  switch (source.kind) {
    case 'wikipedia':
      return fetchWikipediaPicture(source, lang)
    case 'hn':
      return fetchHackerNews(source)
    case 'youtube': {
      const id = await resolveChannelId(source)
      if (!id) throw new Error('channel not found')
      let items: FeedItem[] = []
      try {
        items = parseFeed(await viaRelay(youtubeVideosOnlyUrl(id)), source)
      } catch {
        /* some channels have no videos-only playlist: use the full channel feed */
      }
      if (!items.length) items = parseFeed(await viaRelay(youtubeFeedUrl(id)), source)
      return withDurations(items)
    }
    default:
      return fetchRss(source)
  }
}

const RECENT_MS = 14 * 24 * 60 * 60 * 1000
const MAX_LOOKUPS_PER_CHANNEL = 4

/**
 * YouTube's channel feed has no video length, so read it from each recent video's page
 * (once per video, then cached on the phone). Videos we can't read keep the 10-minute guess.
 */
async function withDurations(items: FeedItem[]): Promise<FeedItem[]> {
  const cache = loadDurations()
  const now = Date.now()
  const missing = items
    .filter((i) => i.videoId && !i.isShort && cache[i.videoId] === undefined && now - i.date < RECENT_MS)
    .slice(0, MAX_LOOKUPS_PER_CHANNEL)
  if (missing.length) {
    await Promise.all(
      missing.map(async (i) => {
        try {
          const secs = findDurationSeconds(await viaRelay(`https://www.youtube.com/watch?v=${encodeURIComponent(i.videoId!)}`))
          if (secs) cache[i.videoId!] = secs
        } catch {
          /* keep the guess */
        }
      }),
    )
    saveDurations({ ...loadDurations(), ...cache })
  }
  return items.map((i) => {
    const secs = i.videoId ? cache[i.videoId] : undefined
    if (!secs) return i
    return { ...i, minutes: Math.max(1, Math.round(secs / 60)), isShort: i.isShort || secs <= 60 }
  })
}

/** RSS/Atom. If the feed URL breaks and the source has a home page, find the feed there (and remember it). */
async function fetchRss(source: Source): Promise<FeedItem[]> {
  const key = 'feed:' + source.id
  const url = loadChannelIds()[key] || source.url!
  try {
    const items = parseFeed(await viaRelay(url), source)
    if (items.length || !source.site) return items
  } catch (e) {
    if (!source.site) throw e
  }
  const found = await discoverSource(source.site!)
  const feedUrl = found?.source.kind === 'rss' ? found.source.url : undefined
  if (!feedUrl || feedUrl === url) throw new Error('feed not found')
  saveChannelIds({ ...loadChannelIds(), [key]: feedUrl })
  return parseFeed(await viaRelay(feedUrl), source)
}

export interface Discovered {
  source: Source
  sample: FeedItem[]
}

/**
 * "Add your own": takes any link (website, Substack, YouTube channel or a feed URL)
 * and finds the feed behind it.
 */
export async function discoverSource(input: string): Promise<Discovered | null> {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '')
  const id = 'custom-' + Math.random().toString(36).slice(2, 9)

  // YouTube channel
  if (host === 'youtube.com' || host === 'youtu.be') {
    const fromUrl = parsed.searchParams.get('channel_id') || parsed.pathname.match(/\/channel\/(UC[\w-]{22})/)?.[1]
    let channelId = fromUrl || null
    let html = ''
    if (!channelId) {
      html = await viaRelay(url)
      channelId = findChannelId(html)
    }
    if (!channelId) return null
    const xml = await viaRelay(youtubeFeedUrl(channelId))
    const name = findTitle(xml) || findTitle(html) || 'YouTube'
    const source: Source = { id, name, lang: 'es', type: 'video', kind: 'youtube', channelId, custom: true }
    return { source, sample: parseFeed(xml, source).slice(0, 3) }
  }

  // A feed URL, or a page that announces its feed
  const tryFeed = async (feedUrl: string, type: Source['type']) => {
    const xml = await viaRelay(feedUrl)
    const probe: Source = { id, name: '', lang: 'es', type, kind: 'rss', url: feedUrl, custom: true }
    const items = parseFeed(xml, probe)
    if (!items.length) return null
    probe.name = findTitle(xml) || host
    return { source: probe, sample: parseFeed(xml, probe).slice(0, 3) }
  }

  const isNewsletter = /substack\.com$|beehiiv\.com$|buttondown\.(email|com)$|ghost\.io$|campaign-archive\.com$/.test(host)
  const type: Source['type'] = isNewsletter ? 'newsletter' : 'news'

  const direct = await tryFeed(url, type).catch(() => null)
  if (direct) return direct

  const html = await viaRelay(url).catch(() => '')
  const announced = html ? findFeedLink(html, url) : null
  if (announced) {
    const r = await tryFeed(announced, type).catch(() => null)
    if (r) return r
  }
  // Common patterns: Substack/WordPress /feed, Ghost /rss
  for (const path of ['/feed', '/rss', '/feed.xml', '/atom.xml']) {
    const r = await tryFeed(parsed.origin + path, type).catch(() => null)
    if (r) return r
  }
  return null
}
