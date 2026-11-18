import { lookAt, luminance } from './sky'

/** Part of the day, for the greeting, the living logo and the warm palette. */
export type DayPart = 'morning' | 'afternoon' | 'evening'

export function dayPart(date = new Date()): DayPart {
  const h = date.getHours()
  if (h >= 6 && h < 13) return 'morning'
  if (h >= 13 && h < 20) return 'afternoon'
  return 'evening'
}

/** Night by the clock: the same moment the home sky's ground turns dark (≈ 20:23 → 6:36). */
export function isNightAt(date = new Date()): boolean {
  return luminance(lookAt(date.getHours() + date.getMinutes() / 60).ground) < 0.3
}

const darkMode = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches

/** The evening theme is on at night, or all day when the phone is in dark mode. */
export const themeAt = (date = new Date()): 'day' | 'night' => (isNightAt(date) || darkMode() ? 'night' : 'day')

/**
 * Keeps <html data-daypart="…" data-theme="…"> in sync so CSS can warm the colours as the day goes on
 * and switch every screen to the evening theme with the sky. Also tints the phone's status bar.
 */
export function trackDayPart(): () => void {
  const apply = () => {
    const root = document.documentElement
    root.dataset.daypart = dayPart()
    const theme = themeAt()
    if (root.dataset.theme !== theme) root.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#0C1129' : '#1E2952')
  }
  apply()
  const id = setInterval(apply, 60 * 1000)
  const mq = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null
  mq?.addEventListener?.('change', apply)
  return () => {
    clearInterval(id)
    mq?.removeEventListener?.('change', apply)
  }
}

/** Height of the logo's sun (y in a 28×28 box): low at dawn/dusk, highest around 14:00. */
export function sunY(date = new Date()): number {
  const h = date.getHours() + date.getMinutes() / 60
  const t = Math.min(1, Math.abs(h - 14) / 8) // 0 at 14:00, 1 at 6:00 / 22:00
  return Math.round((8 + t * 5) * 10) / 10 // 8 (high) … 13 (low)
}
