import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, Switch, TypeTag } from '../components/ui'
import { timeAgo } from '../lib/time'
import type { ContentType, FeedItem } from '../lib/types'
import { go } from '../router'
import { useApp } from '../state'

export function Feed({ welcome }: { welcome?: string | null }) {
  const { t } = useTranslation()
  const { today, seen, settings, loading, failedSources } = useApp()
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const [hideSeen, setHideSeen] = useState(false)

  const items = useMemo(() => today?.items ?? [], [today])
  const presentTypes = useMemo(() => [...new Set(items.map((i) => i.type))], [items])
  const inFilter = items.filter((i) => filter === 'all' || i.type === filter)
  const fresh = inFilter.filter((i) => !seen[i.id])
  const old = inFilter.filter((i) => seen[i.id])
  const allFresh = items.filter((i) => !seen[i.id])
  const allDone = items.length > 0 && allFresh.length === 0

  return (
    <div className="screen with-nav">
      <header className="feed-header">
        <div className="brand">
          {Icon.logo}
          <h1>Space Feed</h1>
        </div>
        <div className="social-buttons">
          {settings.shortcuts.instagram ? (
            <button className="social-btn ig" aria-label={t('feed.instagramFriends')} onClick={() => go('open', 'instagram')}>IG</button>
          ) : null}
          {settings.shortcuts.tiktok ? (
            <button className="social-btn tt" aria-label={t('feed.tiktokFriends')} onClick={() => go('open', 'tiktok')}>TT</button>
          ) : null}
        </div>
      </header>

      {welcome ? <div className="notice">{welcome}</div> : null}

      {presentTypes.length > 1 ? (
        <div className="chips" role="radiogroup" aria-label={t('types.all')}>
          {(['all', ...presentTypes] as const).map((type) => (
            <button key={type} role="radio" aria-checked={filter === type} className={`chip ${filter === type ? 'on' : ''}`} onClick={() => setFilter(type)}>
              {t(`types.${type}`)}
            </button>
          ))}
        </div>
      ) : null}

      {items.length ? (
        <div className="status-row">
          <span className="muted small">
            <strong className="ink">{t('feed.newCount', { count: fresh.length })}</strong> · {t('feed.seenCount', { count: old.length })}
          </span>
          <label className="inline-switch">
            {t('feed.hideSeen')}
            <Switch checked={hideSeen} onChange={setHideSeen} label={t('feed.hideSeen')} />
          </label>
        </div>
      ) : null}

      {failedSources.length ? <p className="muted small pad-x">{t('feed.refreshError')}</p> : null}

      <main className="stack">
        {allDone ? (
          <section className="done-card">
            <svg aria-hidden="true" width="96" height="70" viewBox="0 0 96 70" className="done-card-sun">
              <circle cx="48" cy="40" r="20" fill="#E9B949" />
              <rect x="0" y="40" width="96" height="30" fill="#1E2952" />
              <path d="M8 44c10-6 20 6 30 0s20 6 30 0 20 6 22 2" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
            <h2>{t('feed.doneTitle')}</h2>
            <p>{t('feed.doneText')}</p>
            <button className="btn-sun" onClick={() => go('done')}>{t('feed.closeForToday')}</button>
          </section>
        ) : null}
        {fresh.map((item) => <Card key={item.id} item={item} isSeen={false} />)}
        {!hideSeen && old.length ? (
          <>
            <div className="divider"><span />{t('feed.seenEarlier')}<span /></div>
            {old.map((item) => <Card key={item.id} item={item} isSeen />)}
          </>
        ) : null}

        {!allDone && items.length ? (
          <p className="muted small center">{t('feed.left', { count: allFresh.length })}</p>
        ) : !items.length && !loading ? (
          <div className="card empty">
            <p>{t('feed.empty')}</p>
            <button className="btn-primary" onClick={() => go('sources')}>{t('feed.addSources')}</button>
          </div>
        ) : null}
      </main>
      <BottomNav active="feed" />
    </div>
  )
}

function Card({ item, isSeen }: { item: FeedItem; isSeen: boolean }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en' | 'ca'
  const open = () => go(item.type === 'video' && item.videoId ? 'video' : 'article', item.id)
  const seenMark = isSeen ? (
    <span className="seen-mark">{Icon.check}{item.type === 'video' ? t('feed.watched') : t('feed.seen')}</span>
  ) : (
    <span className="new-dot" aria-label="new" />
  )
  const meta = (
    <span className="meta">
      <TypeTag type={item.type} />
      <span className="muted">{item.sourceName} · {timeAgo(item.date, lang)}</span>
      {seenMark}
    </span>
  )

  if (item.type === 'video') {
    return (
      <button className={`card video-card ${isSeen ? 'is-seen' : ''}`} onClick={open}>
        <span className="thumb" style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined}>
          <span className="play">{Icon.play}</span>
          {isSeen ? <span className="watched-bar" /> : null}
        </span>
        <span className="video-text">
          {meta}
          <span className="title">{item.title}</span>
        </span>
      </button>
    )
  }

  if (item.type === 'picture') {
    return (
      <button className={`card picture-card ${isSeen ? 'is-seen' : ''}`} onClick={open}>
        <span className="picture" style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined} />
        <span className="picture-text">
          {meta}
          <span className="title">{item.title}</span>
        </span>
      </button>
    )
  }

  return (
    <button className={`card text-card ${isSeen ? 'is-seen' : ''}`} onClick={open}>
      {meta}
      <span className="title">{item.title}</span>
      {item.summary ? <span className="summary">{item.summary}</span> : null}
    </button>
  )
}
