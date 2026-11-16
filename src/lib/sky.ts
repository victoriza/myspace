/**
 * The home sky: colours, sun/moon and stars for any time of day.
 * Four looks (dawn, day, sunset, night) blend smoothly by the hour, so 19:30 and 20:30 look different.
 */
export interface SkyLook {
  sky: [string, string, string, string] // top → horizon
  sea: string // just under the horizon
  ground: string // page colour further down
  wave1: string
  wave2: string
  card: string
}

const NIGHT: SkyLook = { sky: ['#0C1129', '#141C3D', '#1E2952', '#26345F'], sea: '#1A2347', ground: '#131A35', wave1: '#1F2A55', wave2: '#25315F', card: '#FBFAFD' }
const DAWN: SkyLook = { sky: ['#E9B9B6', '#F3CDBE', '#FBE3CC', '#FDEFD9'], sea: '#EBD3C8', ground: '#F7EFE7', wave1: '#EAC9BE', wave2: '#F1DACF', card: '#FFFFFF' }
const DAY: SkyLook = { sky: ['#8FC0E6', '#B9D9EF', '#E2EEF3', '#F4F2EA'], sea: '#DCE8EC', ground: '#F5F3EC', wave1: '#C9DDE6', wave2: '#DCE9EE', card: '#FFFFFF' }
const SUNSET: SkyLook = { sky: ['#3F4380', '#8A5E8A', '#E08A6E', '#F8C37A'], sea: '#4A4F80', ground: '#EFE6E8', wave1: '#4E5385', wave2: '#5D5F8C', card: '#FFFDFC' }

/** Hour → look; between two key hours the colours blend. */
const KEYS: [number, SkyLook][] = [
  [0, NIGHT], [5.5, NIGHT], [7.5, DAWN], [10, DAY], [17, DAY], [19.5, SUNSET], [21.5, NIGHT], [24, NIGHT],
]

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
export function mix(a: string, b: string, t: number): string {
  const [x, y] = [hex(a), hex(b)]
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}
/** Relative luminance (0 dark … 1 light). */
export function luminance(c: string): number {
  const [r, g, b] = hex(c).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const smooth = (t: number) => t * t * (3 - 2 * t)

export function lookAt(hour: number): SkyLook {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < KEYS.length - 2 && h >= KEYS[i + 1][0]) i++
  const [h0, a] = KEYS[i]
  const [h1, b] = KEYS[i + 1]
  const t = smooth(h1 === h0 ? 0 : Math.min(1, Math.max(0, (h - h0) / (h1 - h0))))
  const m = (x: string, y: string) => mix(x, y, t)
  return {
    sky: [m(a.sky[0], b.sky[0]), m(a.sky[1], b.sky[1]), m(a.sky[2], b.sky[2]), m(a.sky[3], b.sky[3])],
    sea: m(a.sea, b.sea),
    ground: m(a.ground, b.ground),
    wave1: m(a.wave1, b.wave1),
    wave2: m(a.wave2, b.wave2),
    card: m(a.card, b.card),
  }
}

export interface SkyScene {
  look: SkyLook
  /** Text on the sky should be light (sunset, night). */
  lightText: boolean
  /** The page under the horizon is dark (night). */
  darkGround: boolean
  /** Sun position in a 390-wide box whose horizon is at `horizon`; null when it's below the horizon. */
  sun: { x: number; y: number; r: number; color: string } | null
  moon: boolean
  /** 0…1 */
  stars: number
  clouds: number
}

const SUNRISE = 6.5
const SUNSET_H = 20.5

export function sceneAt(date: Date, horizon: number): SkyScene {
  const hour = date.getHours() + date.getMinutes() / 60
  const look = lookAt(hour)
  const elevation = Math.sin((Math.PI * (hour - SUNRISE)) / (SUNSET_H - SUNRISE)) // 1 at midday, <0 at night
  const up = hour >= SUNRISE - 0.3 && hour <= SUNSET_H + 0.3
  const e = Math.max(0, elevation)
  const sun = up
    ? {
        x: 312,
        // Low suns sit half behind the waves, so they don't run behind the chips for long.
        y: Math.round(horizon + 8 - e * (horizon - 64)),
        r: Math.round(17 + (1 - e) * 19),
        color: mix('#F7A24C', '#F6C552', Math.min(1, e * 1.6)),
      }
    : null
  const darkness = Math.min(1, Math.max(0, (0.12 - luminance(look.sky[0])) / 0.1))
  return {
    look,
    lightText: luminance(look.sky[1]) < 0.3,
    darkGround: luminance(look.ground) < 0.3,
    sun,
    moon: !up,
    stars: darkness,
    clouds: Math.max(0, 1 - darkness * 1.5) * (luminance(look.sky[1]) < 0.3 ? 0.5 : 0.85),
  }
}

/** Sky colour at a given height (for the chips bar when it sticks to the top). */
export function skyColorAt(look: SkyLook, y: number, height: number): string {
  const stops = [0, 0.4, 0.8, 1]
  const f = Math.min(1, Math.max(0, y / height))
  let i = 0
  while (i < 2 && f > stops[i + 1]) i++
  return mix(look.sky[i], look.sky[i + 1], (f - stops[i]) / (stops[i + 1] - stops[i]))
}
