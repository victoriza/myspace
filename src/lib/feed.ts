import { isCalm, isPolitical } from './filters'
import type { FeedItem, Settings } from './types'

const DAY = 24 * 60 * 60 * 1000

/** Max age of an item to be considered, by type (positive sites publish less often). */
const MAX_AGE: Record<FeedItem['type'], number> = {
  news: 7 * DAY,
  newsletter: 14 * DAY,
  tech: 2 * DAY,
  video: 14 * DAY,
  picture: 2 * DAY,
}
const PER_SOURCE_CAP = 3
const MAX_VIDEOS_PER_DAY = 2
/** Videos without a known length are assumed to take this long (YouTube RSS has no duration). */
export const DEFAULT_VIDEO_MINUTES = 10
const WORDS_PER_MINUTE = 220

/** Estimated minutes an item takes if you open it. */
export function estimateMinutes(item: FeedItem): number {
  switch (item.type) {
    case 'video':
      return item.minutes ?? DEFAULT_VIDEO_MINUTES
    case 'picture':
      return 1
    default: {
      if (item.content) {
        const words = item.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length
        return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
      }
      // Summary only: read the summary, maybe open the site.
      return item.type === 'tech' ? 3 : 2
    }
  }
}

export interface FilterOutcome {
  kept: FeedItem[]
  hidden: { item: FeedItem; reason: 'type' | 'old' | 'seen' | 'politics' | 'calm' | 'short' | 'channel' }[]
}

/** Steps 2 + 3: keep only new items, then apply the person's filters. */
export function filterItems(items: FeedItem[], settings: Settings, seen: Record<string, number>, now: number): FilterOutcome {
  const kept: FeedItem[] = []
  const hidden: FilterOutcome['hidden'] = []
  const seenIds = new Set<string>()
  for (const item of items) {
    if (seenIds.has(item.id)) continue
    seenIds.add(item.id)
    if (!settings.types[item.type]) hidden.push({ item, reason: 'type' })
    else if (now - item.date > MAX_AGE[item.type]) hidden.push({ item, reason: 'old' })
    else if (seen[item.id]) hidden.push({ item, reason: 'seen' })
    else if (item.type === 'video' && settings.skipShorts && item.isShort) hidden.push({ item, reason: 'short' })
    else if (settings.blockedChannels.includes(item.sourceId)) hidden.push({ item, reason: 'channel' })
    else if (settings.hidePolitics && isPolitical(item.title, item.summary)) hidden.push({ item, reason: 'politics' })
    else if (!isCalm(item.title, item.summary, settings.strictness, settings.blockWords)) hidden.push({ item, reason: 'calm' })
    else kept.push(item)
  }
  return { kept, hidden }
}

/**
 * Step 4: fill the daily time budget — newest first, at most PER_SOURCE_CAP per source,
 * at most MAX_VIDEOS_PER_DAY videos, no video over 20 min. Items that don't fit are skipped
 * so a shorter one can still use the remaining time.
 */
export function pickDaily(items: FeedItem[], budgetMinutes: number): FeedItem[] {
  const sorted = [...items].sort((a, b) => b.date - a.date)
  const perSource = new Map<string, number>()
  const picked: FeedItem[] = []
  let used = 0
  let videos = 0
  for (const item of sorted) {
    const n = perSource.get(item.sourceId) || 0
    if (n >= PER_SOURCE_CAP) continue
    const mins = estimateMinutes(item)
    if (item.type === 'video' && (videos >= MAX_VIDEOS_PER_DAY || mins > 20)) continue
    if (used + mins > budgetMinutes) continue
    perSource.set(item.sourceId, n + 1)
    picked.push(item)
    used += mins
    if (item.type === 'video') videos++
    if (used >= budgetMinutes) break
  }
  return picked
}

/** Total estimated minutes of a list of items. */
export function totalMinutes(items: FeedItem[]): number {
  return items.reduce((sum, i) => sum + estimateMinutes(i), 0)
}

/** Step 5: newest first, but never two videos in a row (and no two items of the same source in a row when avoidable). */
export function orderMixed(items: FeedItem[]): FeedItem[] {
  const pool = [...items].sort((a, b) => b.date - a.date)
  const out: FeedItem[] = []
  while (pool.length) {
    const prev = out[out.length - 1]
    let idx = pool.findIndex((it) => !prev || (!(it.type === 'video' && prev.type === 'video') && it.sourceId !== prev.sourceId))
    if (idx < 0) idx = pool.findIndex((it) => !prev || !(it.type === 'video' && prev.type === 'video'))
    if (idx < 0) idx = 0
    out.push(pool.splice(idx, 1)[0])
  }
  return out
}

/** The whole pipeline: filter → pick → order. */
export function buildDailyFeed(all: FeedItem[], settings: Settings, seen: Record<string, number>, now: number) {
  const { kept, hidden } = filterItems(all, settings, seen, now)
  const picked = orderMixed(pickDaily(kept, settings.minutesPerDay))
  return { items: picked, hidden }
}

/** "Day" key: the feed day starts at settings.openHour local time. */
export function dayKey(now: number, openHour: number): string {
  const d = new Date(now - openHour * 60 * 60 * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
