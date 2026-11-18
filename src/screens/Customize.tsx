import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, Segmented, Switch } from '../components/ui'
import { interestPatch, readableIn, SUGGESTED_SOURCES } from '../lib/sources'
import { CONTENT_TYPES, INTEREST_GROUPS, type Lang, type Topic } from '../lib/types'
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
  const topicsOff = settings.topicsOff ?? []
  // Switching an interest on/off switches its suggested sources together.
  const toggleInterest = (interest: Topic) => change(interestPatch(settings, interest))
  // How many suggested sources (that you can read) each interest brings.
  const available = (topic: Topic) => SUGGESTED_SOURCES.filter((s) => s.topic === topic && readableIn(s.lang, settings.lang)).length

  return (
    <div className="screen with-nav">
      <header className="top-header">
        <h1>{t('customize.title')}</h1>
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

        <h2 className="section-label">{t('interests.title')}</h2>
        <div className="card pad-card stack-tight">
          {INTEREST_GROUPS.map((group) => (
            <div key={group.id} className="interest-group" role="group" aria-labelledby={`ig-${group.id}`}>
              <h3 id={`ig-${group.id}`} className="group-label">{t(`interests.groups.${group.id}`)}</h3>
              <div className="interest-chips">
                {group.interests.map((topic) => {
                  const on = !topicsOff.includes(topic)
                  const n = available(topic)
                  return (
                    <button key={topic} className={`chip interest ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleInterest(topic)}>
                      {on ? Icon.check : null}
                      {t(`interests.${topic}`)}
                      {n ? <span className="chip-count" aria-label={`, ${t('interests.count', { count: n })}`}>{n}</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <p className="muted small">{t('interests.help')}</p>
        </div>

        <h2 className="section-label">{t('customize.language')}</h2>
        <div className="card pad-card">
          <Segmented<Lang>
            label={t('customize.language')}
            value={settings.lang}
            onChange={(lang) => updateSettings({ lang })}
            options={(['es', 'ca', 'en'] as const).map((l) => ({ value: l, label: t(`langs.${l}`), lang: l }))}
          />
        </div>

        <h2 className="section-label">{t('customize.howMuch')}</h2>
        <div className="card pad-card stack-tight">
          <Segmented
            label={t('customize.howMuch')}
            value={settings.minutesPerDay}
            onChange={(minutesPerDay) => change({ minutesPerDay })}
            options={[10, 20, 30].map((n) => ({ value: n as 10 | 20 | 30, label: t('customize.minutes', { count: n }) }))}
          />
          <p className="muted small">{t('customize.timeHelp')}</p>
        </div>

        <div className="card list">
          <button className="row link-row" onClick={() => go('filters')}>{t('customize.filters')}{Icon.chevron}</button>
          <button className="row link-row" onClick={() => go('sources')}>{t('customize.sources')}{Icon.chevron}</button>
          <button className="row link-row" onClick={() => go('add')}>{t('more.addSource')}{Icon.chevron}</button>
        </div>
      </main>
      <BottomNav active="customize" />
    </div>
  )
}
