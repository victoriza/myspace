import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { SourceIcon } from '../components/bits'
import { Header, hostOf, Switch, TypeTag } from '../components/ui'
import { sourceTopics } from '../lib/feed'
import { loadCache, type SourceCache } from '../lib/storage'
import { timeAgo } from '../lib/time'
import { INTERESTS, type Lang, type Source, type Topic } from '../lib/types'
import { go } from '../router'
import { useApp } from '../state'

const DAY = 24 * 60 * 60 * 1000

/** One quiet line about how a source is doing: new today, quiet, or not answering. */
function health(s: Source, cache: SourceCache, t: TFunction, lang: Lang, now = Date.now()): { text: string; down: boolean } {
  const c = cache[s.id]
  if (!c) return { text: t('health.unchecked'), down: false }
  if (c.error) return { text: c.okAt ? t('health.downSince', { ago: timeAgo(c.okAt, lang) }) : t('health.down'), down: true }
  const newest = c.items.reduce((m, i) => Math.max(m, i.date), 0)
  if (!newest) return { text: t('health.empty'), down: false }
  const today = c.items.filter((i) => now - i.date < DAY).length
  return { text: today ? t('health.fresh', { count: today, ago: timeAgo(newest, lang) }) : t('health.quiet', { ago: timeAgo(newest, lang) }), down: false }
}

export function Sources() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Lang
  const { settings, updateSettings, refresh, sources } = useApp()
  const [query, setQuery] = useState('')
  const enabled = new Set(settings.enabledSources)
  const cache = loadCache()
  const mine = sources.filter((s) => enabled.has(s.id) || s.custom)
  const topicOf = sourceTopics(settings)

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

  // Grouped by interest; pictures of the day and your own sources get their own groups.
  const q = query.trim().toLowerCase()
  const shown = q ? mine.filter((s) => s.name.toLowerCase().includes(q) || (s.url && hostOf(s.url).includes(q))) : mine
  type Group = { id: string; label: string; list: Source[] }
  const groups: Group[] = []
  const add = (id: string, label: string, list: Source[]) => list.length && groups.push({ id, label, list })
  add('custom', t('interests.yours'), shown.filter((s) => s.custom && !s.topic))
  INTERESTS.forEach((topic: Topic) => add(topic, t(`interests.${topic}`), shown.filter((s) => s.type !== 'picture' && topicOf(s.id) === topic && !(s.custom && !s.topic))))
  add('pictures', t('interests.pictures'), shown.filter((s) => s.type === 'picture'))
  const placed = new Set(groups.flatMap((g) => g.list.map((s) => s.id)))
  add('other', t('interests.yours'), shown.filter((s) => !placed.has(s.id)))

  return (
    <div className="screen">
      <Header title={t('sources.title')} />
      <main className="stack">
        {mine.length > 12 ? (
          <div className="search-row">
            <label className="sr-only" htmlFor="source-search">{t('sources.search')}</label>
            <input id="source-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('sources.search')} autoComplete="off" />
          </div>
        ) : null}

        {groups.map((g) => (
          <section key={g.id} className="stack-tight" aria-labelledby={`sg-${g.id}`}>
            <h2 className="section-label" id={`sg-${g.id}`}>{g.label}</h2>
            <div className="card list">
              {g.list.map((s) => {
                const h = health(s, cache, t, lang)
                const on = enabled.has(s.id)
                return (
                  <div key={s.id} className={`row source-row${on ? '' : ' is-off'}`}>
                    <SourceIcon name={s.name} host={s.kind === 'youtube' ? undefined : s.site ? hostOf(s.site) : s.url ? hostOf(s.url) : undefined} size={20} />
                    <span className="row-text">
                      <span className="source-name"><strong>{s.name}</strong>{s.type === 'video' || s.type === 'newsletter' ? <TypeTag type={s.type} /> : null}</span>
                      <span className={`small ${h.down ? 'warn' : 'muted'}`}>{on ? h.text : t('sources.off')}</span>
                    </span>
                    {s.custom ? <button className="pill" onClick={() => remove(s.id)}>{t('sources.remove')}</button> : null}
                    <Switch label={s.name} checked={on} onChange={(v) => toggle(s.id, v)} />
                  </div>
                )
              })}
            </div>
          </section>
        ))}
        {q && !shown.length ? <p className="muted small center">{t('sources.noMatch')}</p> : null}

        <div className="grid-2">
          <button className="btn-primary" onClick={() => go('suggested')}>{t('sources.browse')}</button>
          <button className="btn-dashed" onClick={() => go('add')}>{t('sources.addOwn')}</button>
        </div>
      </main>
    </div>
  )
}
