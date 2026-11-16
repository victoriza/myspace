import type { Lang } from './types'

/** "25 min", "2 h", "3 d" — localized, short. */
export function timeAgo(ts: number, lang: Lang, now = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'short' })
  const sec = Math.round((ts - now) / 1000)
  const abs = Math.abs(sec)
  if (abs < 3600) return rtf.format(Math.round(sec / 60) || -1, 'minute')
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), 'hour')
  return rtf.format(Math.round(sec / 86400), 'day')
}

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
