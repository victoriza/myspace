import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Sun rising over calm waves, with rotating messages. Respects "reduce motion" (see CSS). */
export function Loading({ onContinue }: { onContinue?: () => void }) {
  const { t } = useTranslation()
  const messages = t('loading.messages', { returnObjects: true }) as string[]
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 2600)
    return () => clearInterval(id)
  }, [messages.length])

  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="stars" aria-hidden="true">
        {[[62, 120, 3.2, 0], [300, 92, 4.1, 0.8], [210, 170, 3.6, 1.6], [120, 230, 5, 0.3], [330, 250, 4.4, 2.1]].map(([x, y, d, delay], k) => (
          <span key={k} style={{ left: `${(x / 390) * 100}%`, top: y, animationDuration: `${d}s`, animationDelay: `${delay}s` }} />
        ))}
      </div>
      <div className="sun-wrap" aria-hidden="true">
        <div className="sun">
          <div className="sun-glow" />
          <div className="sun-core" />
        </div>
      </div>
      <div className="waves" aria-hidden="true">
        <Wave className="w1" fill="#2E4F6E" />
        <Wave className="w2" fill="#3A6580" />
        <Wave className="w3" fill="#4A7A90" />
        <div className="sea" />
      </div>
      <div className="loading-text">
        <h1>Space Feed</h1>
        <p key={i} className="loading-msg">{messages[i]}</p>
        <div className="dots" aria-hidden="true"><span /><span /><span /></div>
      </div>
      {onContinue ? (
        <button className="loading-tap" onClick={onContinue}>
          {t('loading.tap')}
        </button>
      ) : null}
    </div>
  )
}

function Wave({ className, fill }: { className: string; fill: string }) {
  return (
    <svg className={`wave ${className}`} viewBox="0 0 780 60" preserveAspectRatio="none">
      <path d="M0 30 Q 48.75 12 97.5 30 T 195 30 T 292.5 30 T 390 30 T 487.5 30 T 585 30 T 682.5 30 T 780 30 V60 H0 Z" fill={fill} />
    </svg>
  )
}
