import { describe, expect, it } from 'vitest'
import { buildDailyFeed, estimateMinutes, nextItem, orderMixed, pickDaily, totalMinutes } from './feed'
import { compareVersions, notesSince } from './changelog'
import { findDurationSeconds, findLanguage, parseFeed } from './parse'
import { defaultEnabledSources, interestPatch, sourcesForTopic, SUGGESTED_SOURCES } from './sources'
import { SOURCE_INFO } from './sourceInfo'
import { defaultSettings, loadSettings } from './storage'
import { INTERESTS, type FeedItem, type Source, type Topic } from './types'

const now = Date.UTC(2026, 10, 16, 10)
const H = 60 * 60 * 1000

function item(i: number, over: Partial<FeedItem> = {}): FeedItem {
  return { id: 'i' + i, sourceId: 's' + (i % 3), sourceName: 'S', type: 'news', title: 'Calm title ' + i, link: 'https://x/' + i, date: now - i * H, summary: '', ...over }
}

describe('feed pipeline', () => {
  it('caps items per source and fills the time budget', () => {
    const items = Array.from({ length: 30 }, (_, i) => item(i)) // summary-only news ≈ 2 min each
    expect(pickDaily(items, 30).length).toBe(9) // 3 sources × 3 each = 18 min
    expect(totalMinutes(pickDaily(items, 10))).toBeLessThanOrEqual(10)
    expect(pickDaily(items, 10).length).toBe(5)
  })

  it('allows at most 2 videos a day and skips items that do not fit', () => {
    const videos = Array.from({ length: 5 }, (_, i) => item(i, { type: 'video', sourceId: 'v' + i }))
    const long = item(10, { sourceId: 'long', content: '<p>' + 'word '.repeat(220 * 15) + '</p>' }) // 15 min read
    const short = item(11, { sourceId: 'short' })
    const picked = pickDaily([...videos, long, short], 30)
    expect(picked.filter((i) => i.type === 'video').length).toBe(2) // 20 min
    expect(picked.map((i) => i.id)).toContain('i11') // 2 min still fits
    expect(picked.map((i) => i.id)).not.toContain('i10') // 15 min doesn't
    expect(estimateMinutes(long)).toBe(15)
  })

  it('keeps at least 2 pictures a day, one per source first, even when newer news fills the budget', () => {
    const news = Array.from({ length: 30 }, (_, i) => item(i, { sourceId: 'n' + (i % 10) }))
    const pics = [
      item(40, { type: 'picture', sourceId: 'wiki' }),
      item(41, { type: 'picture', sourceId: 'wiki' }),
      item(42, { type: 'picture', sourceId: 'apod' }),
    ]
    const picked = pickDaily([...news, ...pics], 10)
    const pictures = picked.filter((i) => i.type === 'picture')
    expect(pictures.length).toBe(2)
    expect(new Set(pictures.map((p) => p.sourceId)).size).toBe(2)
    expect(totalMinutes(picked)).toBeLessThanOrEqual(10)
  })

  it('keeps any one topic under ~40% of the reading time', () => {
    const science = Array.from({ length: 12 }, (_, i) => item(i, { sourceId: 'sci' + i }))
    const progress = Array.from({ length: 12 }, (_, i) => item(20 + i, { sourceId: 'prog' + i }))
    const topic = (i: FeedItem): Topic => (i.sourceId.startsWith('sci') ? 'science' : 'progress')
    const picked = pickDaily([...science, ...progress], 20, topic)
    const sciMinutes = totalMinutes(picked.filter((i) => topic(i) === 'science'))
    expect(sciMinutes).toBeLessThanOrEqual(8)
    expect(totalMinutes(picked)).toBe(16) // 8 + 8: the rest stays empty rather than all-science
  })

  it('lists what the filters hid today, with the reason', () => {
    const s = defaultSettings()
    const items = [
      item(1, { title: 'El Gobierno aprueba una ley', sourceId: 'a' }),
      item(2, { title: 'Miracle cure works in mice', sourceId: 'b' }),
      item(3, { title: 'Your weekly horoscope', sourceId: 'c' }),
      item(4, { title: 'Seagrass is returning to the coast', sourceId: 'd' }),
    ]
    const { items: today, filtered } = buildDailyFeed(items, s, {}, now)
    expect(today.map((i) => i.id)).toEqual(['i4'])
    expect(filtered.map((h) => [h.item.id, h.kind])).toEqual([['i1', 'politics'], ['i2', 'hype'], ['i3', 'pseudo']])
    expect(filtered[0].word).toBe('gobierno')
  })

  it('reads a video length from the watch page', () => {
    expect(findDurationSeconds('..."videoDetails":{"videoId":"x","lengthSeconds":"754","keywords"...')).toBe(754)
    expect(findDurationSeconds('<meta itemprop="duration" content="PT1H2M3S">')).toBe(3723)
    expect(findDurationSeconds('<html></html>')).toBeNull()
  })

  it('shows what is new only for versions newer than the last one seen', () => {
    expect(compareVersions('0.10.0', '0.4.0')).toBeGreaterThan(0)
    expect(compareVersions('0.4.0', '0.4.0')).toBe(0)
    expect(notesSince('0.3.0').map((e) => e.version)).toEqual(['0.10.0', '0.9.3'])
    expect(notesSince('0.10.0')).toEqual([])
  })

  it('leaves out switched-off interests (videogames start off)', () => {
    const s = defaultSettings()
    expect(s.topicsOff).toContain('games')
    const items = [item(1, { sourceId: 'game-developer', title: 'How a tiny team built a cosy farming game' }), item(2, { sourceId: 'owid' })]
    expect(buildDailyFeed(items, s, {}, now).items.map((i) => i.id)).toEqual(['i2'])
    const on = { ...s, topicsOff: [] }
    expect(buildDailyFeed(items, on, {}, now).items.map((i) => i.id).sort()).toEqual(['i1', 'i2'])
  })

  it('switching videogames on brings its sources (in languages you read)', () => {
    expect(sourcesForTopic('games', 'es')).toEqual(['game-developer', 'devuego', 'anaitgames', 'yt-gmtk', 'yt-noclip', 'yt-dayoscript'])
    expect(sourcesForTopic('games', 'en')).toEqual(['game-developer', 'yt-gmtk', 'yt-noclip'])
  })

  it('every suggested source has a one-line description in ES, EN and CA, and a unique id', () => {
    const ids = SUGGESTED_SOURCES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of SUGGESTED_SOURCES) {
      for (const l of ['es', 'en', 'ca'] as const) expect(SOURCE_INFO[s.id]?.[l], `${s.id} ${l}`).toBeTruthy()
    }
  })

  it('every interest has suggested sources, and new people start with seven interests on', () => {
    for (const topic of INTERESTS) expect(SUGGESTED_SOURCES.some((s) => s.topic === topic), topic).toBe(true)
    expect(INTERESTS.filter((x) => !defaultSettings().topicsOff.includes(x))).toEqual(['progress', 'solutions', 'planet', 'society', 'nature', 'science', 'space'])
  })

  it('existing people keep their interests; new ones that start off are switched off once', () => {
    localStorage.setItem('sf.settings.v1', JSON.stringify({ onboarded: true, enabledSources: ['owid'], topicsOff: ['games'] }))
    const s = loadSettings()
    expect(s.topicsOff).toEqual(expect.arrayContaining(['games', 'mind', 'history', 'art', 'music', 'places']))
    expect(s.topicsOff).not.toContain('space')
    expect(s.topicsOff).not.toContain('nature')
    expect(s.topicsOff).not.toContain('culture')
    // Culture and tech were on before: only the new ones change.
    localStorage.setItem('sf.settings.v1', JSON.stringify({ onboarded: true, enabledSources: ['owid'], topicsOff: ['science'] }))
    const t = loadSettings()
    expect(t.topicsOff).toEqual(expect.arrayContaining(['science', 'nature', 'space']))
    expect(t.topicsOff).not.toContain('culture')
    localStorage.clear()
  })

  it('switching an interest on and off brings and removes its sources', () => {
    const s = { ...defaultSettings(), lang: 'es' as const }
    const on = { ...s, ...interestPatch(s, 'mind') }
    expect(on.topicsOff).not.toContain('mind')
    expect(on.enabledSources).toEqual(expect.arrayContaining(['greater-good', 'psyche']))
    const off = { ...on, ...interestPatch(on, 'mind') }
    expect(off.topicsOff).toContain('mind')
    expect(off.enabledSources).not.toContain('psyche')
  })

  it('reads the language a feed declares', () => {
    expect(findLanguage('<rss><channel><language>ca-ES</language>')).toBe('ca')
    expect(findLanguage('<feed xmlns="x" xml:lang="en-US">')).toBe('en')
    expect(findLanguage('<rss><channel><language>fr</language>')).toBeNull()
  })

  it('reserves videos like pictures, even when newer news would fill the day', () => {
    const H = 3600e3
    const news = Array.from({ length: 14 }, (_, i) => item(i, { sourceId: 'n' + (i % 7), date: now - i * H }))
    const pics = [item(30, { type: 'picture', sourceId: 'apod', date: now - 20 * H }), item(31, { type: 'picture', sourceId: 'wiki', date: now - 13 * H })]
    const vids = [
      item(40, { type: 'video', sourceId: 'kurz', minutes: 12, date: now - 50 * H }),
      item(41, { type: 'video', sourceId: 'curio', minutes: 9, date: now - 30 * H }),
      item(42, { type: 'video', sourceId: 'mini', minutes: 4, date: now - 80 * H }),
    ]
    const all = [...news, ...pics, ...vids]
    const videosAt = (b: number) => pickDaily(all, b).filter((i) => i.type === 'video').map((i) => i.id)
    expect(videosAt(10)).toEqual(['i42']) // 10 min: only the 4-min one fits next to 2 pictures
    expect(videosAt(20)[0]).toBe('i41') // 20 min: the newest video that fits (+ a short 2nd one if ≥5 min stay to read)
    expect(videosAt(30).length).toBe(2) // 30 min: two, still ≥5 min to read
    for (const b of [10, 20, 30]) expect(totalMinutes(pickDaily(all, b))).toBeLessThanOrEqual(b)
  })

  it('never puts two videos in a row when it can avoid it', () => {
    const items = [
      item(1, { type: 'video', sourceId: 'v1' }),
      item(2, { type: 'video', sourceId: 'v2' }),
      item(3, { type: 'news', sourceId: 'n1' }),
      item(4, { type: 'video', sourceId: 'v3' }),
      item(5, { type: 'news', sourceId: 'n2' }),
    ]
    const ordered = orderMixed(items)
    for (let i = 1; i < ordered.length; i++) expect(ordered[i].type === 'video' && ordered[i - 1].type === 'video').toBe(false)
  })

  it('drops seen, old, political and dramatic items', () => {
    const settings = defaultSettings()
    const items = [
      item(1),
      item(2, { title: 'El Gobierno presenta su plan' }),
      item(3, { title: 'SHOCKING drama!!!' }),
      item(4, { date: now - 30 * 24 * H }),
      item(5),
    ]
    const { items: out, hidden } = buildDailyFeed(items, settings, { i5: now }, now)
    expect(out.map((i) => i.id)).toEqual(['i1'])
    expect(hidden.map((h) => h.reason).sort()).toEqual(['calm', 'old', 'politics', 'seen'])
  })
})

describe('parsing', () => {
  const src: Source = { id: 'src', name: 'Src', lang: 'en', type: 'news', kind: 'rss' }
  it('parses RSS 2.0', () => {
    const xml = `<?xml version="1.0"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>T</title>
      <item><title>Hello &amp; welcome</title><link>https://a.com/1</link><pubDate>Mon, 16 Nov 2026 08:00:00 GMT</pubDate>
      <description>&lt;p&gt;Short &lt;b&gt;summary&lt;/b&gt;.&lt;/p&gt;</description><guid>g1</guid></item></channel></rss>`
    const [it0] = parseFeed(xml, src)
    expect(it0.title).toBe('Hello & welcome')
    expect(it0.summary).toBe('Short summary.')
    expect(it0.link).toBe('https://a.com/1')
  })
  it('parses a YouTube Atom feed', () => {
    const xml = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
      <title>Chan</title><entry><id>yt:video:abc</id><yt:videoId>abc</yt:videoId><title>How tides work</title>
      <link rel="alternate" href="https://www.youtube.com/watch?v=abc"/><published>2026-11-15T10:00:00+00:00</published>
      <media:group><media:title>How tides work</media:title><media:thumbnail url="https://i.ytimg.com/vi/abc/hqdefault.jpg" width="480" height="360"/><media:description>Desc</media:description></media:group></entry>
      <entry><id>yt:video:def</id><yt:videoId>def</yt:videoId><title>Short one</title><link rel="alternate" href="https://www.youtube.com/shorts/def"/><published>2026-11-15T11:00:00+00:00</published></entry></feed>`
    const items = parseFeed(xml, { ...src, type: 'video', kind: 'youtube' })
    expect(items[0].videoId).toBe('abc')
    expect(items[0].image).toContain('ytimg')
    expect(items[0].summary).toBe('Desc')
    expect(items[1].isShort).toBe(true)
  })
})

describe('suggested sources', () => {
  it('turns Catalan sources on by default only for Catalan users', () => {
    expect(defaultEnabledSources('ca')).toContain('metode')
    expect(defaultEnabledSources('es')).not.toContain('metode')
    expect(defaultEnabledSources('es')).toContain('noticias-positivas')
  })
})

describe('next item', () => {
  const items = [item(1), item(2), item(3), item(4)]
  it('goes to the following unseen item, then wraps, then ends', () => {
    expect(nextItem(items, 'i1', {})?.id).toBe('i2')
    expect(nextItem(items, 'i2', { i3: 1 })?.id).toBe('i4')
    expect(nextItem(items, 'i4', { i2: 1, i3: 1 })?.id).toBe('i1')
    expect(nextItem(items, 'i4', { i1: 1, i2: 1, i3: 1, i4: 1 })).toBeNull()
  })
})

describe('v0.10 sharing and contact', () => {
  it('builds a prefilled GitHub issue with version, language and screen', async () => {
    const { issueUrl, landingUrl } = await import('./share')
    const url = issueUrl('Fuente sugerida: ', 'Enlace:\n', 'ca', 'about')
    expect(url.startsWith('https://github.com/victoriza/myspace/issues/new?title=Fuente%20sugerida')).toBe(true)
    expect(decodeURIComponent(url)).toContain('Space Feed 0.10.0 · ca · about')
    expect(landingUrl('es')).toBe('https://myspace.victoriza.com/')
    expect(landingUrl('ca')).toBe('https://myspace.victoriza.com/ca/')
  })
  it('orders 0.10 after 0.9', async () => {
    const { notesSince } = await import('./changelog')
    expect(notesSince('0.9.3').map((e) => e.version)).toEqual(['0.10.0'])
  })
})
