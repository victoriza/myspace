import { defaultEnabledSources, SUGGESTED_SOURCES, V01_SOURCE_IDS } from './sources'
import type { HiddenItem } from './feed'
import type { FeedItem, Lang, Settings } from './types'

/** Small wrapper around localStorage that never throws (private mode, quota, etc.). */
const memory = new Map<string, string>()

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key) ?? memory.get(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  const raw = JSON.stringify(value)
  try {
    localStorage.setItem(key, raw)
  } catch {
    memory.set(key, raw)
  }
}

const K = {
  settings: 'sf.settings.v1',
  seen: 'sf.seen.v1',
  today: 'sf.today.v1',
  cache: 'sf.cache.v1',
  channels: 'sf.channels.v1',
  socialSession: 'sf.social.v1',
  durations: 'sf.durations.v1',
}

export function detectLang(): Lang {
  const langs = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []
  for (const l of langs) {
    const code = (l || '').slice(0, 2).toLowerCase()
    if (code === 'ca') return 'ca'
    if (code === 'es') return 'es'
    if (code === 'en') return 'en'
  }
  return 'es'
}

export function defaultSettings(): Settings {
  const lang = detectLang()
  return {
    lang,
    onboarded: false,
    types: { news: true, video: true, newsletter: true, tech: false, picture: true },
    minutesPerDay: 20,
    strictness: 'balanced',
    hidePolitics: true,
    skipShorts: true,
    blockWords: ['drama', 'salseo', 'polémica', 'reaction'],
    blockedChannels: [],
    enabledSources: defaultEnabledSources(lang),
    customSources: [],
    shortcuts: { instagram: true, tiktok: true },
    knownSources: SUGGESTED_SOURCES.map((s) => s.id),
    openHour: 7,
  }
}

export function loadSettings(): Settings {
  const d = defaultSettings()
  const s = read<Partial<Settings> & { perDay?: unknown }>(K.settings, {})
  delete s.perDay // v0 used an item count; now it's minutes
  const merged: Settings = { ...d, ...s, types: { ...d.types, ...(s.types || {}) }, shortcuts: { ...d.shortcuts, ...(s.shortcuts || {}) } }
  // New suggested sources that are on by default: switch them on once for existing users.
  if (s.enabledSources) {
    const known = new Set(s.knownSources ?? V01_SOURCE_IDS)
    const defaults = new Set(defaultEnabledSources(merged.lang))
    const added = SUGGESTED_SOURCES.filter((src) => !known.has(src.id) && defaults.has(src.id)).map((src) => src.id)
    merged.enabledSources = [...new Set([...s.enabledSources, ...added])]
    merged.knownSources = SUGGESTED_SOURCES.map((src) => src.id)
  }
  // v0.2: "Hide channel" became "Remove source" — hidden channels are now simply switched-off sources.
  if (merged.blockedChannels.length) {
    merged.enabledSources = merged.enabledSources.filter((id) => !merged.blockedChannels.includes(id))
    merged.blockedChannels = []
  }
  return merged
}
export const saveSettings = (s: Settings) => write(K.settings, s)

const MONTH = 30 * 24 * 60 * 60 * 1000
export function loadSeen(): Record<string, number> {
  const seen = read<Record<string, number>>(K.seen, {})
  const cutoff = Date.now() - MONTH
  for (const [id, t] of Object.entries(seen)) if (t < cutoff) delete seen[id]
  return seen
}
export const saveSeen = (s: Record<string, number>) => write(K.seen, s)

export interface TodayFeed {
  day: string
  items: FeedItem[]
  /** What the calm/politics filters set aside today. */
  filtered?: HiddenItem[]
}
export const loadToday = () => read<TodayFeed | null>(K.today, null)
export const saveToday = (t: TodayFeed) => write(K.today, t)
export const clearToday = () => write(K.today, null)

export interface SourceCache {
  [sourceId: string]: { at: number; items: FeedItem[]; error?: boolean }
}
export const loadCache = () => read<SourceCache>(K.cache, {})
export function saveCache(c: SourceCache) {
  // Keep the cache small: drop content of old items.
  for (const entry of Object.values(c)) entry.items = entry.items.slice(0, 15)
  write(K.cache, c)
}

export const loadChannelIds = () => read<Record<string, string>>(K.channels, {})
export const saveChannelIds = (c: Record<string, string>) => write(K.channels, c)

export interface SocialSession {
  app: 'instagram' | 'tiktok'
  openedAt: number
  limitMin: number
}
export const loadSocial = () => read<SocialSession | null>(K.socialSession, null)
export const saveSocial = (s: SocialSession | null) => write(K.socialSession, s)

export function clearAll() {
  try {
    Object.values(K).forEach((k) => localStorage.removeItem(k))
  } catch {
    memory.clear()
  }
}

/** Video lengths in seconds, by YouTube video id (so each video's page is read only once). */
export const loadDurations = () => read<Record<string, number>>(K.durations, {})
export function saveDurations(d: Record<string, number>) {
  const entries = Object.entries(d)
  write(K.durations, Object.fromEntries(entries.slice(Math.max(0, entries.length - 300))))
}
