import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import i18n from './i18n'
import { buildDailyFeed, dayKey } from './lib/feed'
import { fetchSource } from './lib/fetchers'
import { allSources } from './lib/sources'
import {
  clearAll,
  clearToday,
  defaultSettings,
  loadCache,
  loadSeen,
  loadSettings,
  loadToday,
  saveCache,
  saveSeen,
  saveSettings,
  saveToday,
  type TodayFeed,
} from './lib/storage'
import type { FeedItem, Settings, Source } from './lib/types'

const CACHE_FRESH_MS = 30 * 60 * 1000

interface AppState {
  settings: Settings
  seen: Record<string, number>
  today: TodayFeed | null
  loading: boolean
  failedSources: string[]
  sources: Source[]
  updateSettings: (patch: Partial<Settings>) => void
  markSeen: (id: string) => void
  refresh: (opts?: { force?: boolean }) => Promise<void>
  itemById: (id: string) => FeedItem | undefined
  /** Turns a source off and drops its other items from today's feed. Returns an undo function. */
  removeSource: (sourceId: string, keepItemId?: string) => () => void
  resetAll: () => void
}

const Ctx = createContext<AppState | null>(null)

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}

/** Start of the current feed day (ms). */
function dayStart(now: number, openHour: number): number {
  const d = new Date(now - openHour * 3600_000)
  d.setHours(openHour, 0, 0, 0)
  return d.getTime()
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [seen, setSeen] = useState<Record<string, number>>(() => loadSeen())
  const [today, setToday] = useState<TodayFeed | null>(() => loadToday())
  const [loading, setLoading] = useState(false)
  const [failedSources, setFailed] = useState<string[]>([])
  const running = useRef<Promise<void> | null>(null)
  // Refs mirror the latest values for async work (refresh); they're only written outside render.
  const settingsRef = useRef(settings)
  const seenRef = useRef(seen)

  const sources = useMemo(() => allSources(settings.customSources), [settings.customSources])

  useEffect(() => {
    void i18n.changeLanguage(settings.lang)
    document.documentElement.lang = settings.lang
  }, [settings.lang])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    const next = { ...settingsRef.current, ...patch }
    settingsRef.current = next
    saveSettings(next)
    setSettings(next)
  }, [])

  const markSeen = useCallback((id: string) => {
    if (seenRef.current[id]) return
    const next = { ...seenRef.current, [id]: Date.now() }
    seenRef.current = next
    saveSeen(next)
    setSeen(next)
  }, [])

  const refresh = useCallback(async (opts: { force?: boolean } = {}) => {
    if (running.current) return running.current
    const job = (async () => {
      const s = settingsRef.current
      const now = Date.now()
      const day = dayKey(now, s.openHour)
      const current = loadToday()
      if (!opts.force && current && current.day === day) {
        setToday(current)
        return
      }
      setLoading(true)
      const cache = loadCache()
      const enabled = allSources(s.customSources).filter((src) => s.enabledSources.includes(src.id))
      const failed: string[] = []
      const results = await Promise.all(
        enabled.map(async (src) => {
          const cached = cache[src.id]
          if (cached && !cached.error && now - cached.at < CACHE_FRESH_MS) return cached.items
          try {
            const items = await fetchSource(src, s.lang)
            cache[src.id] = { at: now, items }
            return items
          } catch {
            failed.push(src.name)
            cache[src.id] = { at: now, items: cached?.items || [], error: true }
            return cached?.items || []
          }
        }),
      )
      saveCache(cache)
      // Items already seen *today* stay in today's feed (under "Seen earlier").
      const start = dayStart(now, s.openHour)
      const seenBefore = Object.fromEntries(Object.entries(seenRef.current).filter(([, t]) => t < start))
      const { items } = buildDailyFeed(results.flat(), s, seenBefore, now)
      const next = { day, items }
      saveToday(next)
      setToday(next)
      setFailed(failed)
      setLoading(false)
    })()
    running.current = job
    try {
      await job
    } finally {
      running.current = null
      setLoading(false)
    }
  }, [])

  const itemById = useCallback((id: string) => today?.items.find((i) => i.id === id), [today])

  const removeSource = useCallback((sourceId: string, keepItemId?: string) => {
    const prevEnabled = settingsRef.current.enabledSources
    const prevToday = loadToday()
    updateSettings({ enabledSources: prevEnabled.filter((id) => id !== sourceId) })
    if (prevToday) {
      const next = { ...prevToday, items: prevToday.items.filter((i) => i.sourceId !== sourceId || i.id === keepItemId) }
      saveToday(next)
      setToday(next)
    }
    return () => {
      updateSettings({ enabledSources: [...new Set([...settingsRef.current.enabledSources, sourceId])] })
      if (prevToday) {
        saveToday(prevToday)
        setToday(prevToday)
      }
    }
  }, [updateSettings])

  const resetAll = useCallback(() => {
    clearAll()
    clearToday()
    const d = defaultSettings()
    settingsRef.current = d
    seenRef.current = {}
    setSettings(d)
    setSeen({})
    setToday(null)
  }, [])

  const value = useMemo<AppState>(
    () => ({ settings, seen, today, loading, failedSources, sources, updateSettings, markSeen, refresh, itemById, removeSource, resetAll }),
    [settings, seen, today, loading, failedSources, sources, updateSettings, markSeen, refresh, itemById, removeSource, resetAll],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
