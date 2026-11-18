import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SourceIcon } from '../components/bits'
import { Header, hostOf, Icon, TypeTag } from '../components/ui'
import { SOURCE_INFO } from '../lib/sourceInfo'
import { interestPatch, readableIn, SUGGESTED_SOURCES } from '../lib/sources'
import { INTEREST_GROUPS, INTERESTS, type Lang, type Source, type Topic } from '../lib/types'
import { back, go } from '../router'
import { useApp } from '../state'

/**
 * First run: "What are you into?" (interests) → the sources for those interests, grouped, each with one line.
 * From Sources → "Browse suggested": straight to the grouped sources.
 */
export function Suggested() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const firstRun = !settings.onboarded
  const [step, setStep] = useState<'topics' | 'sources'>(firstRun ? 'topics' : 'sources')
  const topicsOff = settings.topicsOff ?? []
  const interestsOn = INTERESTS.filter((x) => !topicsOff.includes(x))

  if (step === 'topics') {
    return (
      <div className="screen">
        <Header title={t('onboard.askTitle')} onBack={() => go('why')} />
        <main className="stack">
          <p className="screen-intro">{t('onboard.askSub')}</p>
          {INTEREST_GROUPS.map((group) => (
            <section key={group.id} className="stack-tight" aria-labelledby={`og-${group.id}`}>
              <h2 className="section-label" id={`og-${group.id}`}>{t(`interests.groups.${group.id}`)}</h2>
              <div className="card pad-card">
                <div className="interest-chips big">
                  {group.interests.map((topic) => {
                    const on = !topicsOff.includes(topic)
                    return (
                      <button key={topic} className={`chip interest ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => updateSettings(interestPatch(settings, topic))}>
                        {on ? Icon.check : null}
                        {t(`interests.${topic}`)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
          ))}
        </main>
        <div className="sticky-bottom">
          <button className="btn-primary" disabled={!interestsOn.length} onClick={() => { setStep('sources'); window.scrollTo(0, 0) }}>
            {interestsOn.length ? t('onboard.next', { count: interestsOn.length }) : t('onboard.pickOne')}
            {interestsOn.length ? Icon.arrow : null}
          </button>
        </div>
      </div>
    )
  }

  return <SourcesStep firstRun={firstRun} interestsOn={interestsOn} onTopics={() => { setStep('topics'); window.scrollTo(0, 0) }} start={() => { updateSettings({ onboarded: true }); void refresh({ force: true }); go() }} />
}

function SourcesStep({ firstRun, interestsOn, onTopics, start }: { firstRun: boolean; interestsOn: Topic[]; onTopics: () => void; start: () => void }) {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const lang = settings.lang
  const enabled = new Set(settings.enabledSources)
  const count = SUGGESTED_SOURCES.filter((s) => enabled.has(s.id)).length
  const readable = (s: Source) => readableIn(s.lang, lang) || enabled.has(s.id)

  const toggle = (id: string) => {
    const next = new Set(enabled)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    updateSettings({ enabledSources: [...next] })
  }

  const groups = interestsOn
    .map((topic) => ({ id: topic as string, label: t(`interests.${topic}`), list: SUGGESTED_SOURCES.filter((s) => s.topic === topic && s.type !== 'picture' && readable(s)) }))
    .concat([{ id: 'pictures', label: t('interests.pictures'), list: SUGGESTED_SOURCES.filter((s) => s.type === 'picture' && (!s.topic || interestsOn.includes(s.topic))) }])
    .filter((g) => g.list.length)

  return (
    <div className="screen">
      <Header title={t('onboard.sourcesTitle')} onBack={firstRun ? onTopics : back} />
      <main className="stack">
        <p className="screen-intro">{t('onboard.sourcesSub')}</p>
        {groups.map((g) => (
          <section key={g.id} className="stack-tight" aria-labelledby={`ss-${g.id}`}>
            <h2 className="section-label" id={`ss-${g.id}`}>{g.label}</h2>
            <div className="card list">
              {g.list.map((s) => (
                <SourceRow key={s.id} source={s} on={enabled.has(s.id)} lang={lang} onToggle={() => toggle(s.id)} />
              ))}
            </div>
          </section>
        ))}
        {!firstRun ? <p className="muted small center pad-x">{t('onboard.browseHint')}</p> : null}
      </main>
      <div className="sticky-bottom">
        {firstRun ? (
          <>
            <button className="btn-primary" onClick={start} disabled={count === 0}>{t('suggested.start', { count })}</button>
            <button className="btn-link" onClick={onTopics}>{t('onboard.changeTopics')}</button>
          </>
        ) : (
          <>
            <button className="btn-primary" onClick={() => { void refresh({ force: true }); back() }}>{t('nav.back')}</button>
            <button className="btn-link" onClick={() => go('add')}>{t('suggested.own')}</button>
          </>
        )}
      </div>
    </div>
  )
}

function SourceRow({ source: s, on, lang, onToggle }: { source: Source; on: boolean; lang: Lang; onToggle: () => void }) {
  const { t } = useTranslation()
  const desc = SOURCE_INFO[s.id]?.[lang]
  const host = s.kind === 'youtube' ? undefined : s.kind === 'wikipedia' ? 'wikipedia.org' : s.site ? hostOf(s.site) : s.url ? hostOf(s.url) : undefined
  const details = [s.kind !== 'wikipedia' && s.lang !== lang ? t(`inLang.${s.lang}`) : null, s.often ? t(`often.${s.often}`) : null].filter(Boolean).join(' · ')
  return (
    <div className="row suggest-row">
      <SourceIcon name={s.name} host={host} size={24} />
      <span className="row-text">
        <span className="source-name"><strong>{s.name}</strong>{s.type === 'video' || s.type === 'newsletter' ? <TypeTag type={s.type} /> : null}</span>
        {desc ? <span className="small ink-2">{desc}</span> : null}
        {details ? <span className="muted small">{details}</span> : null}
      </span>
      <button className={`pill ${on ? 'pill-on' : ''}`} aria-pressed={on} aria-label={`${t('suggested.add')} ${s.name}`} onClick={onToggle}>
        {on ? <>{Icon.check} {t('suggested.added')}</> : t('suggested.add')}
      </button>
    </div>
  )
}
