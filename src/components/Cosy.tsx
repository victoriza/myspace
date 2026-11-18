import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dayPart, sunY, themeAt } from '../lib/daytime'

/** The header logo, alive: the sun's height follows the time of day and it glows very slowly. */
export function LivingLogo() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [])
  const part = dayPart(now)
  const y = sunY(now)
  const sun = part === 'evening' ? '#E8913A' : '#E9B949'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="living-logo">
      <defs>
        <clipPath id="logo-clip"><rect width="28" height="28" rx="7" /></clipPath>
        <radialGradient id="logo-glow"><stop offset="0" stopColor={sun} stopOpacity="0.55" /><stop offset="1" stopColor={sun} stopOpacity="0" /></radialGradient>
      </defs>
      <g clipPath="url(#logo-clip)">
        <rect width="28" height="28" fill="#1E2952" />
        <circle className="logo-glow" cx="14" cy={y} r="9" fill="url(#logo-glow)" />
        <circle cx="14" cy={y} r="5" fill={sun} />
        <rect x="0" y="16.5" width="28" height="12" fill="#1E2952" />
        <path d="M6 18c2.7-2 5.3 2 8 0s5.3 2 8 0M6 22c2.7-2 5.3 2 8 0s5.3 2 8 0" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/** "Good morning ☀️" + a short line, by time of day. */
export function Greeting() {
  const { t } = useTranslation()
  const part = dayPart()
  return (
    <div className="greeting">
      <p className="greeting-hello">
        {t(`greeting.${part}`)}
        {part !== 'afternoon' ? <span aria-hidden="true">{part === 'morning' ? ' ☀️' : ' 🌙'}</span> : null}
      </p>
      <p className="greeting-line muted small">{t(`greeting.${part}Line`)}</p>
    </div>
  )
}

/** Small sun-over-waves strip shown while the feed refreshes in the background. */
export function MiniLoader() {
  const { t } = useTranslation()
  const messages = t('loading.messages', { returnObjects: true }) as string[]
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 2600)
    return () => clearInterval(id)
  }, [messages.length])
  return (
    <div className="mini-loader" role="status" aria-live="polite">
      <svg width="44" height="28" viewBox="0 0 44 28" aria-hidden="true">
        <circle className="mini-sun" cx="22" cy="16" r="7" fill="#E9B949" />
        <rect x="0" y="17" width="44" height="11" fill="var(--paper)" />
        <g className="mini-waves">
          <path d="M-22 19c3.7-2.6 7.3 2.6 11 0s7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0" stroke="#4A7A90" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M-22 24c3.7-2.6 7.3 2.6 11 0s7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0 7.3 2.6 11 0" stroke="#2E4F6E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <span key={i} className="mini-msg">{messages[i]}</span>
    </div>
  )
}

/**
 * After a change in Personalizar: a short, unhurried "preparing your feed" scene.
 * The sun (or the moon at night) rises once over still water, three soft lines, then it fades away.
 * Stays at least ~2.6 s, longer only if the feed is still being built. Plays once; "reduce motion" makes it brief and still.
 */
export function Preparing({ busy, onDone }: { busy: boolean; onDone: () => void }) {
  const { t } = useTranslation()
  const messages = t('prepare.messages', { returnObjects: true }) as string[]
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const night = themeAt() === 'night'
  const [step, setStep] = useState(0)
  const [minDone, setMinDone] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    const a = setTimeout(() => setStep((s) => Math.max(s, 1)), reduce ? 300 : 1300)
    const b = setTimeout(() => setMinDone(true), reduce ? 700 : 2600)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [reduce])

  useEffect(() => {
    if (!minDone || busy) return
    setStep(2)
    const a = setTimeout(() => setLeaving(true), reduce ? 250 : 800)
    const b = setTimeout(() => done.current(), reduce ? 300 : 1400)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [minDone, busy, reduce])

  return (
    <div className={`preparing${night ? ' night' : ''}${leaving ? ' leaving' : ''}`}>
      {night ? (
        <div className="prep-stars" aria-hidden="true">
          {[[14, 18], [30, 9], [52, 22], [71, 12], [86, 26], [42, 33], [8, 38], [92, 6]].map(([x, y], k) => (
            <span key={k} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.4 + k * 0.18}s` }} />
          ))}
        </div>
      ) : null}
      <div className={night ? 'prep-moon' : 'prep-sun'} aria-hidden="true" />
      <div className="prep-sea" aria-hidden="true">
        <svg className="prep-wave a" viewBox="0 0 780 40" preserveAspectRatio="none"><path d="M0 20 Q 48.75 6 97.5 20 T 195 20 T 292.5 20 T 390 20 T 487.5 20 T 585 20 T 682.5 20 T 780 20 V40 H0 Z" /></svg>
        <svg className="prep-wave b" viewBox="0 0 780 40" preserveAspectRatio="none"><path d="M0 22 Q 65 10 130 22 T 260 22 T 390 22 T 520 22 T 650 22 T 780 22 V40 H0 Z" /></svg>
      </div>
      <p key={step} className="prep-msg" role="status" aria-live="polite">{messages[Math.min(step, messages.length - 1)]}</p>
    </div>
  )
}
