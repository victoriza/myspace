import { describe, expect, it } from 'vitest'
import { lookAt, luminance, sceneAt } from './sky'

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
