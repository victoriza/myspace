import { useTranslation } from 'react-i18next'
import { Header } from '../components/ui'
import { SUGGESTED_SOURCES } from '../lib/sources'
import { CONTENT_TYPES } from '../lib/types'
import { back, go } from '../router'
import { useApp } from '../state'

const LANG_LABEL = { es: 'ES', en: 'EN', ca: 'CA' }

export function Suggested() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const firstRun = !settings.onboarded
  const enabled = new Set(settings.enabledSources)
  const count = SUGGESTED_SOURCES.filter((s) => enabled.has(s.id)).length

  const toggle = (id: string) => {
    const next = new Set(enabled)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    updateSettings({ enabledSources: [...next] })
  }

  const start = () => {
    updateSettings({ onboarded: true })
    void refresh({ force: true })
    go()
  }

  return (
    <div className="screen">
      <Header title={t('suggested.title')} onBack={firstRun ? () => go('why') : back} />
      <main className="stack">
        <p className="screen-intro">{t('suggested.subtitle')}</p>
        {CONTENT_TYPES.map((type) => {
          const list = SUGGESTED_SOURCES.filter((s) => s.type === type)
          if (!list.length) return null
          return (
            <section key={type} className="stack-tight">
              <h2 className="section-label">{t(`suggested.groups.${type}`)}</h2>
              <div className="card list">
                {list.map((s) => {
                  const on = enabled.has(s.id)
                  return (
                    <div key={s.id} className="row">
                      <span className="row-text">
                        <strong>{s.name}</strong>
                        <span className="muted small">{LANG_LABEL[s.lang]}</span>
                      </span>
                      <button className={`pill ${on ? 'pill-on' : ''}`} aria-pressed={on} onClick={() => toggle(s.id)}>
                        {on ? t('suggested.added') : t('suggested.add')}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>
      <div className="sticky-bottom">
        {firstRun ? (
          <button className="btn-primary" onClick={start} disabled={count === 0}>{t('suggested.start', { count })}</button>
        ) : (
          <button className="btn-primary" onClick={() => { void refresh({ force: true }); back() }}>{t('nav.back')}</button>
        )}
        <button className="btn-link" onClick={() => go('add')}>{t('suggested.own')}</button>
      </div>
    </div>
  )
}
