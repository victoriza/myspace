import { useTranslation } from 'react-i18next'
import { Icon } from '../components/ui'
import { go } from '../router'
import { useApp } from '../state'

export function Done() {
  const { t } = useTranslation()
  const { settings } = useApp()
  return (
    <main className="done">
      <div className="done-sky-warm" aria-hidden="true" />
      <div className="stars done-stars" aria-hidden="true">
        {[[13, 90], [41, 60], [72, 120], [87, 200], [25, 180], [58, 30], [93, 110], [6, 250]].map(([x, y], k) => (
          <span key={k} style={{ left: `${x}%`, top: y, animationDelay: `${3.2 + k * 0.5}s, ${4 + k * 0.6}s` }} />
        ))}
      </div>
      <div className="done-text">
        <p className="eyebrow">{t('done.eyebrow')}</p>
        <h1>{t('done.title')}</h1>
        <p>{t('done.text')}</p>
      </div>
      <div className="done-sun" aria-hidden="true" />
      <div className="done-sea" aria-hidden="true">
        <svg className="wave w1" viewBox="0 0 780 60" preserveAspectRatio="none"><path d="M0 30 Q 48.75 14 97.5 30 T 195 30 T 292.5 30 T 390 30 T 487.5 30 T 585 30 T 682.5 30 T 780 30 V60 H0 Z" fill="#2A3557" /></svg>
        <svg className="wave w2" viewBox="0 0 780 60" preserveAspectRatio="none"><path d="M0 30 Q 65 16 130 30 T 260 30 T 390 30 T 520 30 T 650 30 T 780 30 V60 H0 Z" fill="#232D4C" /></svg>
      </div>
      <div className="done-bottom">
        <h2>{t('done.ideas')}</h2>
        <div className="ideas">
          <div><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E9B949" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2" /><path d="M9 21l2-6 3 3v3" /><path d="M7 12l3-4 4 2 3 3" /></svg>{t('done.walk')}</div>
          <div><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E9B949" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5a2 2 0 0 1 2-2h5v17H5a2 2 0 0 0-2 2z" /><path d="M21 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z" /></svg>{t('done.read')}</div>
          <div><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E9B949" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>{t('done.call')}</div>
        </div>
        <div className="opens">{t('done.opens', { hour: settings.openHour })}</div>
        <button className="btn-link light look-back" onClick={() => go()}>
          {Icon.back}
          {t('done.lookBack')}
        </button>
      </div>
    </main>
  )
}
