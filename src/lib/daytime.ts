/** Part of the day, for the greeting, the living logo and the warm palette. */
export type DayPart = 'morning' | 'afternoon' | 'evening'

export function dayPart(date = new Date()): DayPart {
  const h = date.getHours()
  if (h >= 6 && h < 13) return 'morning'
  if (h >= 13 && h < 20) return 'afternoon'
  return 'evening'
}

/** Keeps <html data-daypart="…"> in sync so CSS can warm the colours as the day goes on. */
export function trackDayPart(): () => void {
  const apply = () => {
    document.documentElement.dataset.daypart = dayPart()
  }
  apply()
  const id = setInterval(apply, 5 * 60 * 1000)
  return () => clearInterval(id)
}

/** Height of the logo's sun (y in a 28×28 box): low at dawn/dusk, highest around 14:00. */
export function sunY(date = new Date()): number {
  const h = date.getHours() + date.getMinutes() / 60
  const t = Math.min(1, Math.abs(h - 14) / 8) // 0 at 14:00, 1 at 6:00 / 22:00
  return Math.round((8 + t * 5) * 10) / 10 // 8 (high) … 13 (low)
}
