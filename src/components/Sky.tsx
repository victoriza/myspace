import type { SkyScene } from '../lib/sky'
import { mix } from '../lib/sky'

const STARS: [number, number, number, number][] = [
  [9, 40, 3, 0], [24, 96, 2, 1.2], [38, 28, 3, 2.1], [54, 70, 2, 0.6], [67, 22, 3, 1.8], [12, 150, 2, 2.6], [31, 170, 2, 0.9], [59, 140, 2.5, 1.5], [94, 120, 2, 0.3], [90, 180, 2, 2.2], [46, 118, 2, 3], [72, 96, 2, 1.1],
]

/**
 * The sky behind the home screen: fixed in place, so the cards slide over it as you scroll.
 * Gradient sky, sun or moon, stars at night, slow clouds by day, drifting waves on the horizon,
 * and a "sea" that fades into the page colour.
 */
export function SkyBackdrop({ scene, horizon }: { scene: SkyScene; horizon: number }) {
  const L = scene.look
  const skyH = horizon + 20
  return (
    <div className="sky-backdrop" aria-hidden="true">
      <div className="sky-top" style={{ height: skyH, background: `linear-gradient(180deg, ${L.sky[0]} 0%, ${L.sky[1]} 40%, ${L.sky[2]} 80%, ${L.sky[3]} 100%)` }}>
        {scene.stars > 0 ? (
          <div className="sky-stars" style={{ opacity: scene.stars }}>
            {STARS.filter(([, y]) => y < horizon - 8).map(([x, y, s, d], i) => (
              <span key={i} style={{ left: `${x}%`, top: y, width: s, height: s, animationDelay: `${d}s` }} />
            ))}
          </div>
        ) : null}
        {scene.clouds > 0 ? (
          <div className="sky-clouds" style={{ opacity: scene.clouds }}>
            <span className="cloud c1" style={{ background: mix(L.sky[3], '#ffffff', 0.7), top: Math.min(62, horizon - 70) }} />
            <span className="cloud c2" style={{ background: mix(L.sky[3], '#ffffff', 0.6), top: Math.min(118, horizon - 40) }} />
          </div>
        ) : null}
        {scene.sun ? (
          <span className="sky-sun" style={{ width: scene.sun.r * 2, height: scene.sun.r * 2, top: scene.sun.y - scene.sun.r, right: 78 - scene.sun.r, background: scene.sun.color, boxShadow: `0 0 ${scene.sun.r * 1.6}px ${scene.sun.r * 0.5}px ${scene.sun.color}66` }} />
        ) : null}
        {scene.moon ? (
          <span className="sky-moon" style={{ top: 40, right: 56 }}>
            <span style={{ background: L.sky[0] }} />
          </span>
        ) : null}
      </div>
      <div className="sky-sea" style={{ top: horizon + 18, background: `linear-gradient(180deg, ${L.sea} 0px, ${mix(L.sea, L.ground, 0.5)} 90px, ${L.ground} 260px)` }} />
      <div className="sky-waves" style={{ top: horizon }}>
        <svg className="sky-wave a" viewBox="0 0 780 60" preserveAspectRatio="none">
          <path d="M0 30 Q 24 24 48.75 30 T 97.5 30 T 146 30 T 195 30 T 244 30 T 292.5 30 T 341 30 T 390 30 T 439 30 T 487.5 30 T 536 30 T 585 30 T 634 30 T 682.5 30 T 731 30 T 780 30 V60 H0 Z" fill={L.wave1} />
        </svg>
        <svg className="sky-wave b" viewBox="0 0 780 60" preserveAspectRatio="none">
          <path d="M0 30 Q 32 25 65 30 T 130 30 T 195 30 T 260 30 T 325 30 T 390 30 T 455 30 T 520 30 T 585 30 T 650 30 T 715 30 T 780 30 V60 H0 Z" fill={L.wave2} />
        </svg>
      </div>
    </div>
  )
}
