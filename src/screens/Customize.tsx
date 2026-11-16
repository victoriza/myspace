import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, LangSwitch, Segmented, Switch } from '../components/ui'
import { CONTENT_TYPES } from '../lib/types'
import { go } from '../router'
import { useApp } from '../state'

export function Customize() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const change = (patch: Parameters<typeof updateSettings>[0]) => {
    updateSettings(patch)
    // Rebuild today's feed with the new choices (uses cached sources, no extra waiting).
    setTimeout(() => void refresh({ force: true }), 0)
  }

  return (
    <div className="screen with-nav">
      <header className="top-header">
        <div className="row-between">
          <h1>{t('customize.title')}</h1>
          <LangSwitch value={settings.lang} onChange={(lang) => updateSettings({ lang })} />
        </div>
        <p className="muted small">{t('customize.subtitle')}</p>
      </header>

      <main className="stack">
        <h2 className="section-label">{t('customize.whatsIn')}</h2>
        <div className="card list">
          {CONTENT_TYPES.map((type) => (
            <div key={type} className="row">
              <span className={`tag tag-${type} tag-wide`}>{t(`types.${type}`)}</span>
              <span className="muted small grow">{t(`typesDetail.${type}`)}</span>
              <Switch
                label={t(`types.${type}`)}
                checked={settings.types[type]}
                onChange={(v) => change({ types: { ...settings.types, [type]: v } })}
              />
            </div>
          ))}
        </div>

        <h2 className="section-label">{t('customize.howMuch')}</h2>
        <div className="card pad-card stack-tight">
          <Segmented
            label={t('customize.howMuch')}
            value={settings.perDay}
            onChange={(perDay) => change({ perDay })}
            options={[10, 20, 30].map((n) => ({ value: n as 10 | 20 | 30, label: String(n) }))}
          />
          <p className="muted small">{t('customize.items', { count: settings.perDay })} · {t('customize.ends')}</p>
        </div>

        <div className="card list">
          <button className="row link-row" onClick={() => go('filters')}>{t('customize.filters')}{Icon.chevron}</button>
          <button className="row link-row" onClick={() => go('sources')}>{t('customize.sources')}{Icon.chevron}</button>
          <button className="row link-row" onClick={() => go('why')}>{t('customize.why')}{Icon.chevron}</button>
        </div>
      </main>
      <BottomNav active="customize" />
    </div>
  )
}
