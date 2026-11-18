import { useTranslation } from 'react-i18next'
import { Header, Icon } from '../components/ui'

/** Victor's LinkedIn profile ("Say hi on LinkedIn"). */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/victoriza/'
export { APP_VERSION } from '../lib/changelog'

/** "Quién lo hace": the person behind Space Feed, and where to send ideas. */
export function About() {
  const { t } = useTranslation()
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
      </main>
    </div>
  )
}
