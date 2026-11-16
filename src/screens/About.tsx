import { useTranslation } from 'react-i18next'
import { Header, Icon } from '../components/ui'
import { go } from '../router'

/** Victor's LinkedIn profile ("Say hi on LinkedIn"). */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/victoriza/'
export const APP_VERSION = '0.1.0'

export function About() {
  const { t } = useTranslation()
  return (
    <div className="screen">
      <Header title={t('about.title')} />
      <main className="stack">
        <div className="card about-hero">
          {Icon.logo}
          <strong>Space Feed</strong>
          <span className="muted small">{t('about.tagline')}</span>
          <span className="muted small">{t('about.version', { version: APP_VERSION })}</span>
        </div>

        <h2 className="section-label">{t('about.author')}</h2>
        <div className="card author">
          <span className="avatar" aria-hidden="true">V</span>
          <span className="author-text">
            <strong>{t('why.madeBy')}</strong>
            <span className="muted">{t('why.feedback')}</span>
          </span>
          <a className="btn-outline" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">{t('why.sayHi')} {Icon.external}</a>
        </div>

        <div className="card list">
          <button className="row link-row" onClick={() => go('why')}>{t('more.about')}{Icon.chevron}</button>
        </div>
        <p className="muted small pad-x">{t('more.dataHint')}</p>
      </main>
    </div>
  )
}
