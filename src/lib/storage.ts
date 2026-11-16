import { defaultEnabledSources } from './sources'
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
  return {
    lang: detectLang(),
    onboarded: false,
    types: { news: true, video: true, newsletter: true, tech: false, picture: true },
    perDay: 20,
    strictness: 'balanced',
    hidePolitics: true,
    skipShorts: true,
    blockWords: ['drama', 'salseo', 'polémica', 'reaction'],
    blockedChannels: [],
    enabledSources: defaultEnabledSources(),
    customSources: [],
    shortcuts: { instagram: true, tiktok: true },
    openHour: 7,
  }
}

export function loadSettings(): Settings {
  const d = defaultSettings()
  const s = read<Partial<Settings>>(K.settings, {})
  return { ...d, ...s, types: { ...d.types, ...(s.types || {}) }, shortcuts: { ...d.shortcuts, ...(s.shortcuts || {}) } }
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
