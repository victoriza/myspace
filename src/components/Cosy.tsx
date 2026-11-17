import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dayPart, sunY } from '../lib/daytime'

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
