import { useTranslation } from 'react-i18next'
import { Header } from '../components/ui'
import { CHANGELOG } from '../lib/changelog'
import type { Lang } from '../lib/types'

/** Every version, newest first, in the person's language. */
export function Changelog() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Lang
  return (
    <div className="screen">
      <Header title={t('changelog.title')} />
      <main className="stack">
        <ol className="changelog">
          {CHANGELOG.map((v, i) => (
            <li key={v.version} className={`card pad-card stack-tight${i === 0 ? ' latest' : ''}`}>
              <h2 className="card-title">{t('changelog.version', { version: v.version })}</h2>
              <ul>
                {v.notes[lang].map((n) => <li key={n}>{n}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
