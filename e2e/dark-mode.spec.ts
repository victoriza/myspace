import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { PNG } from 'pngjs'
import pkg from '../package.json' with { type: 'json' }
import { mockNetwork, seedReturningUser } from './fixtures'

/**
 * Dark mode (and light mode) at different times of day.
 * Text drawn straight on the home sky can't be checked by axe (the sky is a separate layer behind the page),
 * so these tests hide the text, read the real pixels behind it and compute the WCAG contrast ratio.
 */

const HOURS: [number, number][] = [[7, 30], [11, 0], [15, 0], [19, 40], [22, 30]]
const SCHEMES = ['light', 'dark'] as const
/** Everything that sits on the sky or the sea of the home screen (not inside a card). */
const ON_SKY = ['.feed-main .chip:not(.on)', '.feed-main .chip.on', '.greeting-hello', '.greeting-line', '.status-row .muted', '.listen-pill', '.feed-end .muted', '.finish-link', '.seen-toggle']

type RGB = [number, number, number]
const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const ratio = (a: RGB, b: RGB) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

function averageColor(png: Buffer): RGB {
  const img = PNG.sync.read(png)
  let r = 0, g = 0, b = 0, n = 0
  for (let i = 0; i < img.data.length; i += 4) {
    r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++
  }
  return [r / n, g / n, b / n]
}

/** Contrast of an element's text against what is really behind it. */
async function measure(loc: Locator) {
  await loc.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await loc.page().waitForTimeout(150)
  const info = await loc.evaluate((el) => {
    const cs = getComputedStyle(el)
    let opacity = 1
    for (let e: Element | null = el; e; e = e.parentElement) opacity *= Number(getComputedStyle(e).opacity)
    const m = cs.color.match(/[\d.]+/g)!.map(Number)
    return { rgb: m.slice(0, 3) as [number, number, number], alpha: (m[3] ?? 1) * opacity, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight) }
  })
  // Hide the text (and icons drawn in currentColor), photograph what's behind, then put it back.
  await loc.evaluate((el) => {
    for (const e of [el, ...el.querySelectorAll('*')] as HTMLElement[]) {
      e.dataset.e2eStyle = e.getAttribute('style') ?? ''
      e.style.setProperty('color', 'transparent', 'important')
      e.style.setProperty('text-decoration-color', 'transparent', 'important')
    }
  })
  // Only the area the text actually covers (a full-width line's empty right side may hold the sun's glow).
  const box = await loc.evaluate((el) => {
    const r = document.createRange()
    r.selectNodeContents(el)
    const t = r.getBoundingClientRect()
    const own = el.getBoundingClientRect()
    // Buttons and pills: their own box (their background is part of the design).
    const useOwn = getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'
    const b = useOwn || !t.width ? own : t
    return { x: b.left, y: b.top, width: b.width, height: b.height }
  })
  const bg = averageColor(await loc.page().screenshot({ clip: box, animations: 'disabled' }))
  await loc.evaluate((el) => {
    for (const e of [el, ...el.querySelectorAll('*')] as HTMLElement[]) e.setAttribute('style', e.dataset.e2eStyle ?? '')
  })
  const text = info.rgb.map((c, i) => c * info.alpha + bg[i] * (1 - info.alpha)) as RGB
  const large = info.size >= 24 || (info.size >= 18.66 && info.weight >= 700)
  return { ratio: ratio(text, bg), needed: large ? 3 : 4.5, text, bg }
}

async function openFeed(page: Page, scheme: (typeof SCHEMES)[number], h: number, m: number) {
  await page.emulateMedia({ colorScheme: scheme })
  const now = Date.UTC(2026, 10, 19, h - 1, m) // Madrid is UTC+1 in November
  await page.clock.setFixedTime(new Date(now))
  await mockNetwork(page, now)
  await seedReturningUser(page, pkg.version)
  await page.goto('/en/')
  await expect(page.locator('.card').first()).toBeVisible({ timeout: 20_000 })
  await page.waitForTimeout(1200) // cards rise in
}

for (const scheme of SCHEMES) {
  for (const [h, m] of HOURS) {
    const when = `${h}:${String(m).padStart(2, '0')}`
    test(`${scheme} mode at ${when}: text on the sky is readable`, async ({ page }) => {
      await openFeed(page, scheme, h, m)
      // Open one card and come back, so the folded "already seen" line is there too.
      await page.locator('.text-card').first().click()
      await page.goBack()
      await expect(page.locator('.card').first()).toBeVisible()
      await page.waitForTimeout(800)

      const problems: string[] = []
      await page.evaluate(() => window.scrollTo(0, 0))
      for (const sel of ON_SKY) {
        const loc = page.locator(sel).first()
        if (!(await loc.count()) || !(await loc.isVisible())) continue
        const r = await measure(loc)
        if (r.ratio < r.needed) problems.push(`${sel}: ${r.ratio.toFixed(2)}:1 (needs ${r.needed}:1) text rgb(${r.text.map(Math.round)}) on rgb(${r.bg.map(Math.round)})`)
      }
      expect(problems, problems.join('\n')).toEqual([])
    })

    test(`${scheme} mode at ${when}: cards pass axe`, async ({ page }) => {
      await openFeed(page, scheme, h, m)
      const results = await new AxeBuilder({ page }).include('.card').withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }

  test(`${scheme} mode: every other screen passes axe`, async ({ page }) => {
    await openFeed(page, scheme, 11, 0)
    const screens = ['#/customize', '#/sources', '#/filters', '#/add', '#/more', '#/about', '#/rules', '#/changelog', '#/suggested']
    const problems: string[] = []
    for (const hash of screens) {
      await page.goto('/en/' + hash)
      await page.waitForTimeout(500)
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      problems.push(...r.violations.map((v) => `${hash} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`))
    }
    // The reader, opened from the feed.
    await page.goto('/en/')
    await page.locator('.text-card').first().click()
    await page.waitForTimeout(600)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    problems.push(...r.violations.map((v) => `reader ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`))
    expect(problems).toEqual([])
  })
}
