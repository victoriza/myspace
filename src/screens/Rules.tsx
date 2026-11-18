import { useTranslation } from 'react-i18next'
import { Header } from '../components/ui'

/** "Cómo elegimos las fuentes": the editorial rules, on their own small screen. */
export function Rules() {
  const { t } = useTranslation()
  return (
    <div className="screen">
      <Header title={t('rules.title')} />
      <main className="stack">
        <section className="card pad-card">
          <ol className="rules">
            {(t('rules.list', { returnObjects: true }) as string[]).map((r) => <li key={r}>{r}</li>)}
          </ol>
        </section>
      </main>
    </div>
  )
}
