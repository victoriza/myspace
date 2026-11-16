import { useTranslation } from 'react-i18next'
import { Icon, LangSwitch } from '../components/ui'
import { back, go } from '../router'
import { useApp } from '../state'

/** Replace with Victor's real profile URL. */
export const LINKEDIN_URL = 'https://www.linkedin.com/'

const DOTS = [['#E6EEF8', '#1F4F8A'], ['#DDEFE8', '#1F5A45'], ['#FBEEDC', '#7A4A12'], ['#EFE9F8', '#5A3E8C'], ['#F7E3DC', '#7A2E17'], ['#E1EEF0', '#1F5A63']]

export function Why() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useApp()
  const principles = t('why.principles', { returnObjects: true }) as string[][]
  const firstRun = !settings.onboarded

  return (
    <div className="screen why">
      <div className="why-hero">
        <svg className="why-sun" aria-hidden="true" width="130" height="130" viewBox="0 0 140 140">
          <circle cx="70" cy="62" r="34" fill="#E9B949" />
          <path d="M10 100c20-14 40 14 60 0s40 14 60 0M10 118c20-14 40 14 60 0s40 14 60 0" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
        <div className="why-top">
          {firstRun ? <span /> : (
            <button className="icon-btn light" aria-label={t('nav.back')} onClick={back}>
              {Icon.back}
            </button>
          )}
          <LangSwitch dark value={settings.lang} onChange={(lang) => updateSettings({ lang })} />
        </div>
        <h1>{t('why.title')}</h1>
        <p>{t('why.intro')}</p>
      </div>

      <main className="why-list">
        {principles.map(([title, body], i) => (
          <div key={i} className="card principle">
            <span className="dot" style={{ background: DOTS[i][0], color: DOTS[i][1] }} aria-hidden="true">{i + 1}</span>
            <span>
              <strong>{title}</strong>
              <span className="muted">{body}</span>
            </span>
          </div>
        ))}
      </main>

      <div className="why-bottom">
        <div className="card author">
          <span className="avatar" aria-hidden="true">V</span>
          <span className="author-text">
            <strong>{t('why.madeBy')}</strong>
            <span className="muted">{t('why.feedback')}</span>
          </span>
          <a className="btn-outline" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">{t('why.sayHi')}</a>
        </div>
        {firstRun ? (
          <button className="btn-primary" onClick={() => go('suggested')}>{t('why.start')}</button>
        ) : null}
      </div>
    </div>
  )
}
