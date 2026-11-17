import { useTranslation } from 'react-i18next'
import { nextItem } from '../lib/feed'
import { goReplace, openItem } from '../router'
import { useApp } from '../state'
import { Icon } from './ui'

/** Sticky "Next" button for the reader and the player: next unseen item, or Done after the last one. */
export function NextBar({ currentId }: { currentId: string }) {
  const { t } = useTranslation()
  const { today, seen } = useApp()
  const next = today ? nextItem(today.items, currentId, seen) : null
  return (
    <nav className="sticky-bottom next-bar" aria-label={t('article.next')}>
      {next ? (
        <button className="btn-primary" onClick={() => openItem(next, true)}>
          <span className="next-label">{t('article.next')}</span>
          {Icon.arrow}
        </button>
      ) : (
        <button className="btn-sun big" onClick={() => goReplace('done')}>{t('article.finish')}</button>
      )}
      {next ? <span className="next-title muted small">{next.title}</span> : null}
    </nav>
  )
}
