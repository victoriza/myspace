import { useTranslation } from 'react-i18next'
import { Header, Icon } from '../components/ui'
import { issueUrl } from '../lib/share'
import type { Lang } from '../lib/types'

/** Victor's LinkedIn profile ("Say hi on LinkedIn"). */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/victoriza/'
export { APP_VERSION } from '../lib/changelog'

/** "Quién lo hace": the person behind Space Feed, and where to send ideas. */
export function About() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Lang
  return (
    <div className="screen">
      <Header title={t('about.title')} />
      <main className="stack">
        <div className="card author">
          <span className="avatar" aria-hidden="true">V</span>
          <span className="author-text">
            <strong>{t('why.madeBy')}</strong>
            <span className="muted">{t('why.feedback')}</span>
          </span>
          <a className="btn-outline" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">{t('why.sayHi')} {Icon.external}</a>
        </div>

        <h2 className="section-label">{t('contact.title')}</h2>
        <div className="card list">
          <a className="row link-row more-row" href={issueUrl(t('contact.sourceTitle'), t('contact.sourceBody'), lang, 'about')} target="_blank" rel="noopener noreferrer">
            <span className="row-text"><span className="more-title">{t('contact.source')}</span><span className="muted small">{t('contact.sourceHint')}</span></span>
            {Icon.external}
          </a>
          <a className="row link-row more-row" href={issueUrl(t('contact.bugTitle'), t('contact.bugBody'), lang, 'about')} target="_blank" rel="noopener noreferrer">
            <span className="row-text"><span className="more-title">{t('contact.bug')}</span><span className="muted small">{t('contact.bugHint')}</span></span>
            {Icon.external}
          </a>
        </div>
        <p className="muted small pad-x">{t('contact.note')}</p>
      </main>
    </div>
  )
}
