import { explain, politicalMatch, scoreText, threshold, type HiddenKind } from './filters'
import { sourceMeta } from './sources'
import type { FeedItem, Settings, Topic } from './types'

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
/** Pictures are short (≈1 min) and calm: keep at least this many in every day. */
export const MIN_PICTURES_PER_DAY = 2
/** No subject (science, planet, progress…) may take more than this share of the day's reading time… */
const TOPIC_SHARE = 0.4
/** …but always allow at least this many minutes of it. */
const TOPIC_MIN_MINUTES = 6

/** Topic of an item, from its source. Videos and pictures have their own caps, so they don't count. */
export function topicOf(item: FeedItem): Topic | undefined {
  if (item.type === 'video' || item.type === 'picture') return undefined
  return sourceMeta(item.sourceId)?.topic
}
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
  hidden: { item: FeedItem; reason: 'type' | 'old' | 'seen' | 'politics' | 'calm' | 'short' | 'channel'; kind?: HiddenKind; word?: string }[]
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
    else {
      const politics = settings.hidePolitics ? politicalMatch(item.title, item.summary) : null
      if (politics) {
        hidden.push({ item, reason: 'politics', kind: 'politics', word: politics })
        continue
      }
      const score = scoreText(item.title, item.summary, settings.blockWords)
      if (score.blocked || score.score >= threshold(settings.strictness)) hidden.push({ item, reason: 'calm', ...explain(score.reasons) })
      else kept.push(item)
    }
  }
  return { kept, hidden }
}

/**
 * Step 4: fill the daily time budget — at least MIN_PICTURES_PER_DAY pictures, then newest first,
 * at most PER_SOURCE_CAP per source, no topic over TOPIC_SHARE of the time,
 * at most MAX_VIDEOS_PER_DAY videos, no video over 20 min. Items that don't fit are skipped
 * so a shorter one can still use the remaining time.
 */
export function pickDaily(items: FeedItem[], budgetMinutes: number, getTopic: (i: FeedItem) => Topic | undefined = topicOf): FeedItem[] {
  const topicCap = Math.max(TOPIC_MIN_MINUTES, Math.round(budgetMinutes * TOPIC_SHARE))
  const perTopic = new Map<Topic, number>()
  const sorted = [...items].sort((a, b) => b.date - a.date)
  const perSource = new Map<string, number>()
  const picked: FeedItem[] = []
  let used = 0
  let videos = 0
  // Reserve pictures first (newest, one per source before repeating a source) so newer news can't push them out.
  const pictures = sorted.filter((i) => i.type === 'picture')
  const firstPerSource = pictures.filter((p, i) => pictures.findIndex((q) => q.sourceId === p.sourceId) === i)
  const reserve = [...firstPerSource, ...pictures.filter((p) => !firstPerSource.includes(p))]
  for (const item of reserve) {
    if (picked.length >= MIN_PICTURES_PER_DAY) break
    const mins = estimateMinutes(item)
    if (used + mins > budgetMinutes) break
    perSource.set(item.sourceId, (perSource.get(item.sourceId) || 0) + 1)
    picked.push(item)
    used += mins
  }
  for (const item of sorted) {
    if (picked.includes(item)) continue
    const n = perSource.get(item.sourceId) || 0
    if (n >= PER_SOURCE_CAP) continue
    const mins = estimateMinutes(item)
    if (item.type === 'video' && (videos >= MAX_VIDEOS_PER_DAY || mins > 20)) continue
    if (used + mins > budgetMinutes) continue
    const topic = getTopic(item)
    if (topic && (perTopic.get(topic) || 0) + mins > topicCap) continue
    if (topic) perTopic.set(topic, (perTopic.get(topic) || 0) + mins)
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

/** An item the calm or politics filter set aside today (shown in Filters → "Hidden today"). */
export interface HiddenItem {
  item: FeedItem
  kind: HiddenKind
  word?: string
}
const MAX_HIDDEN_LISTED = 20

/** The whole pipeline: filter → pick → order. */
export function buildDailyFeed(all: FeedItem[], settings: Settings, seen: Record<string, number>, now: number) {
  const { kept, hidden } = filterItems(all, settings, seen, now)
  const picked = orderMixed(pickDaily(kept, settings.minutesPerDay))
  const filtered: HiddenItem[] = hidden
    .filter((h) => h.kind)
    .sort((a, b) => b.item.date - a.item.date)
    .slice(0, MAX_HIDDEN_LISTED)
    .map((h) => ({ item: h.item, kind: h.kind!, word: h.word }))
  return { items: picked, hidden, filtered }
}

/** "Day" key: the feed day starts at settings.openHour local time. */
export function dayKey(now: number, openHour: number): string {
  const d = new Date(now - openHour * 60 * 60 * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * The item "Next" leads to: the next unseen item after the current one in feed order,
 * wrapping around to earlier unseen items. Null when everything else is seen (→ Done).
 */
export function nextItem(items: FeedItem[], currentId: string, seen: Record<string, number>): FeedItem | null {
  const i = items.findIndex((it) => it.id === currentId)
  const after = items.slice(i + 1).find((it) => !seen[it.id] && it.id !== currentId)
  if (after) return after
  return items.slice(0, Math.max(i, 0)).find((it) => !seen[it.id] && it.id !== currentId) ?? null
}
