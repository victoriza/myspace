import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, LangSwitch, Segmented, Switch } from '../components/ui'
import { allSourcesOfTopic, sourcesForTopic, topicsOfInterest } from '../lib/sources'
import { CONTENT_TYPES, INTERESTS, type Topic } from '../lib/types'
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
  const toggleInterest = (interest: Topic) => {
    const topics = topicsOfInterest(interest)
    if (topicsOff.includes(interest)) {
      const add = topics.flatMap((tp) => sourcesForTopic(tp, settings.lang))
      change({ topicsOff: topicsOff.filter((x) => x !== interest), enabledSources: [...new Set([...settings.enabledSources, ...add])] })
    } else {
      const remove = new Set(topics.flatMap(allSourcesOfTopic))
      change({ topicsOff: [...topicsOff, interest], enabledSources: settings.enabledSources.filter((id) => !remove.has(id)) })
    }
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

        <h2 className="section-label">{t('interests.title')}</h2>
        <div className="card pad-card stack-tight">
          <div className="interest-chips" role="group" aria-label={t('interests.title')}>
            {INTERESTS.map((topic) => {
              const on = !topicsOff.includes(topic)
              return (
                <button key={topic} className={`chip interest ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleInterest(topic)}>
                  {on ? Icon.check : null}
                  {t(`interests.${topic}`)}
                </button>
              )
            })}
          </div>
          <p className="muted small">{t('interests.help')}</p>
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
          <button className="row link-row" onClick={() => go('why')}>{t('customize.why')}{Icon.chevron}</button>
        </div>
      </main>
      <BottomNav active="customize" />
    </div>
  )
}
