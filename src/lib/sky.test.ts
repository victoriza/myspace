import { describe, expect, it } from 'vitest'
import { contrast, lookAt, luminance, sceneAt, skyColorAt, skyText } from './sky'

const at = (h: number, m = 0) => new Date(2026, 10, 16, h, m)

describe('home sky', () => {
  it('follows the clock: dawn, day, sunset, night', () => {
    expect(lookAt(7.5).sky[0]).toBe('#e9b9b6')
    expect(lookAt(13).sky[0]).toBe('#8fc0e6')
    expect(lookAt(19.5).sky[0]).toBe('#3f4380')
    expect(lookAt(23).sky[0]).toBe('#0c1129')
  })

  it('blends between looks (19:30 and 20:30 differ)', () => {
    expect(lookAt(20.5).sky[0]).not.toBe(lookAt(19.5).sky[0])
    expect(lookAt(20.5).sky[0]).not.toBe(lookAt(23).sky[0])
  })

  it('sun high at midday, low near sunset, moon and stars at night', () => {
    const noon = sceneAt(at(13, 30), 200)
    const eve = sceneAt(at(19, 45), 200)
    const night = sceneAt(at(23), 200)
    expect(noon.sun!.y).toBeLessThan(eve.sun!.y)
    expect(noon.sun!.r).toBeLessThan(eve.sun!.r)
    expect(night.sun).toBeNull()
    expect(night.moon).toBe(true)
    expect(night.stars).toBeGreaterThan(0.9)
    expect(noon.stars).toBe(0)
  })

  it('switches text and page colours so they stay readable', () => {
    expect(sceneAt(at(13), 200).lightText).toBe(false)
    expect(sceneAt(at(19, 30), 200).lightText).toBe(true)
    expect(sceneAt(at(23), 200).darkGround).toBe(true)
    expect(sceneAt(at(13), 200).darkGround).toBe(false)
    expect(luminance('#ffffff')).toBeCloseTo(1)
  })
})

describe('home sky contrast, every 15 minutes of the day', () => {
  const horizon = 200
  const H = horizon + 20
  const slots = Array.from({ length: 96 }, (_, i) => at(Math.floor(i / 4), (i % 4) * 15))
  it('title, greeting, its line and the status line stay readable (WCAG AA)', () => {
    const fails: string[] = []
    for (const d of slots) {
      const s = sceneAt(d, horizon)
      const c = skyText(s, horizon)
      const label = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
      const check = (what: string, fg: string, bg: string, min: number) => {
        const r = contrast(fg, bg)
        if (r < min) fails.push(`${label} ${what} ${r.toFixed(2)}`)
      }
      check('title', c.heroInk, skyColorAt(s.look, 30, H), 3) // 22 px bold
      check('greeting', c.heroInk, skyColorAt(s.look, 70, H), 3) // 26 px
      check('greeting line', c.heroSub, skyColorAt(s.look, 100, H), 4.5) // 14 px
      check('status', c.seaInk, s.look.sea, 4.5)
      check('status strong', c.seaStrong, s.look.sea, 4.5)
    }
    expect(fails).toEqual([])
  })
})
