import { useTranslation } from 'react-i18next'
import { Header, Switch, TypeTag } from '../components/ui'
import { loadCache } from '../lib/storage'
import { go } from '../router'
import { useApp } from '../state'

export function Sources() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh, sources } = useApp()
  const enabled = new Set(settings.enabledSources)
  const cache = loadCache()
  const mine = sources.filter((s) => enabled.has(s.id) || s.custom)

  const toggle = (id: string, on: boolean) => {
    const next = new Set(enabled)
    if (on) next.add(id)
    else next.delete(id)
    updateSettings({ enabledSources: [...next] })
    setTimeout(() => void refresh({ force: true }), 0)
  }
  const remove = (id: string) => {
    updateSettings({
      customSources: settings.customSources.filter((s) => s.id !== id),
      enabledSources: settings.enabledSources.filter((x) => x !== id),
    })
  }

  return (
    <div className="screen">
      <Header title={t('sources.title')} />
      <main className="stack">
        <h2 className="section-label">{t('sources.yours')}</h2>
        <div className="card list">
          {mine.map((s) => (
            <div key={s.id} className="row">
              <span className="row-text">
                <strong>{s.name}</strong>
                <span className="meta">
                  <TypeTag type={s.type} />
                  {cache[s.id]?.error ? <span className="warn small">{t('sources.error')}</span> : null}
                </span>
              </span>
              {s.custom ? <button className="pill" onClick={() => remove(s.id)}>{t('sources.remove')}</button> : null}
              <Switch label={s.name} checked={enabled.has(s.id)} onChange={(v) => toggle(s.id, v)} />
            </div>
          ))}
        </div>
        <div className="grid-2">
          <button className="btn-primary" onClick={() => go('suggested')}>{t('sources.browse')}</button>
          <button className="btn-dashed" onClick={() => go('add')}>{t('sources.addOwn')}</button>
        </div>
      </main>
    </div>
  )
}
