import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FeedItem } from '../lib/types'
import { useApp } from '../state'

/**
 * Quiet "Not interested? Remove <source>" link at the end of an opened item.
 * Inline confirm (no pop-up), then "Source removed · Undo" in place for 5 s.
 */
export function RemoveSource({ item }: { item: FeedItem }) {
  const { t } = useTranslation()
  const { removeSource, settings } = useApp()
  const [step, setStep] = useState<'idle' | 'confirm' | 'removed'>('idle')
  const [undo, setUndo] = useState<(() => void) | null>(null)
  const name = item.sourceName

  useEffect(() => {
    if (!undo) return
    const timer = setTimeout(() => setUndo(null), 5000)
    return () => clearTimeout(timer)
  }, [undo])

  // Already off (e.g. removed from another item, or switched off in Sources).
  const isOff = !settings.enabledSources.includes(item.sourceId)
  if (isOff && step !== 'removed') return <p className="remove-source muted small">{t('remove.removed', { name })}</p>

  if (step === 'removed') {
    return undo ? (
      <p className="remove-source small" role="status">
        <span className="muted">{t('remove.toast')} · </span>
        <button className="link-btn strong-ink" onClick={() => { undo(); setUndo(null); setStep('idle') }}>{t('remove.undo')}</button>
      </p>
    ) : (
      <p className="remove-source muted small">{t('remove.removed', { name })}</p>
    )
  }

  if (step === 'confirm') {
    return (
      <p className="remove-source small">
        <span className="muted">{t('remove.confirm', { name })}</span>
        <br />
        <button className="link-btn strong" onClick={() => { setUndo(() => removeSource(item.sourceId, item.id)); setStep('removed') }}>{t('remove.yes')}</button>
        <span className="muted"> · </span>
        <button className="link-btn" onClick={() => setStep('idle')}>{t('remove.cancel')}</button>
      </p>
    )
  }

  return (
    <p className="remove-source small">
      <button className="link-btn muted" onClick={() => setStep('confirm')}>{t('remove.ask', { name })}</button>
    </p>
  )
}
