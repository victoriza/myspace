import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_VERSION, notesSince } from '../lib/changelog'
import { loadLastVersion, saveLastVersion } from '../lib/storage'
import type { Lang } from '../lib/types'
import { useUpdate } from '../lib/update'
import { Icon } from './ui'

/** Quiet "New version available · Update" line at the top of the feed. */
export function UpdateBar() {
  const { t } = useTranslation()
  const update = useUpdate()
  if (!update.showBar) return null
  return (
    <div className="update-bar" role="status">
      <span>{t('update.available')}</span>
      <button className="link-btn strong-ink" onClick={update.apply}>{t('update.apply')}</button>
      <button className="update-close" aria-label={t('update.later')} onClick={update.dismiss}>{Icon.close}</button>
    </div>
  )
}

/** One-time "What's new in vX" card after an update. New installs don't see it. */
export function WhatsNew() {
  const { t, i18n } = useTranslation()
  const [entries, setEntries] = useState(() => {
    const last = loadLastVersion()
    return last === APP_VERSION ? [] : notesSince(last)
  })
  if (!entries.length) return null
  const lang = (i18n.language as Lang) || 'es'
  const close = () => {
    saveLastVersion(APP_VERSION)
    setEntries([])
  }
  return (
    <section className="card whats-new" aria-labelledby="whats-new-title">
      <h2 className="card-title" id="whats-new-title">{t('update.whatsNew', { version: entries[0].version })}</h2>
      <ul>
        {entries.flatMap((e) => e.notes[lang] ?? e.notes.es).map((line) => <li key={line}>{line}</li>)}
      </ul>
      <button className="pill" onClick={close}>{t('update.gotIt')}</button>
    </section>
  )
}
