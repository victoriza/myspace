import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, Switch, TypeTag } from '../components/ui'
import { UpdateBar, WhatsNew } from '../components/Updates'
import { Greeting, LivingLogo, MiniLoader } from '../components/Cosy'
import { totalMinutes } from '../lib/feed'
import { timeAgo } from '../lib/time'
import type { ContentType, FeedItem } from '../lib/types'
import { go } from '../router'
import { sourceMeta } from '../lib/sources'
import { useApp } from '../state'

export function Feed({ welcome }: { welcome?: string | null }) {
  const { t } = useTranslation()
  const { today, seen, settings, loading, failedSources, markSeen } = useApp()
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const [hideSeen, setHideSeen] = useState(false)
  // Grouping (new vs "seen earlier") uses what was seen when the feed opened,
  // so cards don't jump around while you scroll and they get marked as seen.
  const [seenAtOpen] = useState(() => ({ ...seen }))
  // Cards rise in gently on the first open of the day only.
  const [arrive] = useState(() => {
    const day = today?.day
    if (!day) return false
    let last: string | null = null
    try {
      last = localStorage.getItem('sf.arrived.v1')
      localStorage.setItem('sf.arrived.v1', day)
    } catch {
      /* private mode */
    }
    return last !== day
  })

  const items = useMemo(() => today?.items ?? [], [today])
  const presentTypes = useMemo(() => [...new Set(items.map((i) => i.type))], [items])
  const inFilter = items.filter((i) => filter === 'all' || i.type === filter)
  const fresh = inFilter.filter((i) => !seenAtOpen[i.id])
  const old = inFilter.filter((i) => seenAtOpen[i.id])
  const newCount = inFilter.filter((i) => !seen[i.id]).length
  const allFresh = items.filter((i) => !seen[i.id])
  const allDone = items.length > 0 && allFresh.length === 0

  const { register, endRef } = useSeenOnScroll(markSeen)

  return (
    <div className="screen with-nav">
      <header className="feed-header">
        <div className="brand">
          <LivingLogo />
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

      <Greeting />
      <UpdateBar />
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
            <strong className="ink">{t('feed.todayTime', { count: totalMinutes(items) })}</strong> · {t('feed.newCount', { count: newCount })}
          </span>
          <label className="inline-switch">
            {t('feed.hideSeen')}
            <Switch checked={hideSeen} onChange={setHideSeen} label={t('feed.hideSeen')} />
          </label>
        </div>
      ) : null}

      {loading && today ? <MiniLoader /> : null}
      {failedSources.length ? <p className="muted small pad-x">{t('feed.refreshError')}</p> : null}

      <main className="stack">
        <WhatsNew />
        {fresh.map((item, i) => (
          <Card key={item.id} item={item} isSeen={!!seen[item.id]} cardRef={register(item.id, !!seen[item.id])} arriveIndex={arrive ? i : undefined} />
        ))}
        {!hideSeen && old.length ? (
          <>
            <div className="divider"><span />{t('feed.seenEarlier')}<span /></div>
            {old.map((item) => <Card key={item.id} item={item} isSeen seenBefore />)}
          </>
        ) : null}

        <div ref={endRef} aria-hidden="true" className="end-sentinel" />

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
        ) : items.length ? (
          <p className="muted small center">{t('feed.left', { count: allFresh.length })}</p>
        ) : !loading ? (
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

/**
 * Marks items as seen while scrolling:
 * - a card that was on screen and then scrolled up past the top counts as seen;
 * - reaching the end of the list marks every card you've had on screen as seen.
 */
function useSeenOnScroll(markSeen: (id: string) => void) {
  const shown = useRef(new Set<string>())
  const nodes = useRef(new Map<Element, string>())
  const observer = useRef<IntersectionObserver | null>(null)
  const endObserver = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = nodes.current.get(e.target)
          if (!id) continue
          if (e.isIntersecting && e.intersectionRatio >= 0.6) shown.current.add(id)
          else if (!e.isIntersecting && shown.current.has(id) && e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0) + 1) markSeen(id)
        }
      },
      { threshold: [0, 0.6] },
    )
    nodes.current.forEach((_, el) => observer.current!.observe(el))
    return () => observer.current?.disconnect()
  }, [markSeen])

  const register = (id: string, already: boolean) => (el: HTMLElement | null) => {
    if (!el || already) return
    if (!nodes.current.has(el)) {
      nodes.current.set(el, id)
      observer.current?.observe(el)
    }
  }

  const endRef = (el: HTMLDivElement | null) => {
    endObserver.current?.disconnect()
    if (!el || typeof IntersectionObserver === 'undefined') return
    endObserver.current = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        // You reached the end: everything you've had on screen counts as seen.
        nodes.current.forEach((id, node) => {
          const r = node.getBoundingClientRect()
          if (shown.current.has(id) || r.bottom <= window.innerHeight) markSeen(id)
        })
      }
    })
    endObserver.current.observe(el)
  }

  return { register, endRef }
}

function Card({ item, isSeen, cardRef, arriveIndex, seenBefore }: { item: FeedItem; isSeen: boolean; cardRef?: (el: HTMLElement | null) => void; arriveIndex?: number; seenBefore?: boolean }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en' | 'ca'
  const open = () => go(item.type === 'video' && item.videoId ? 'video' : 'article', item.id)
  const angle = sourceMeta(item.sourceId)?.angle
  const arriveCls = arriveIndex !== undefined ? ' arrive' : ''
  const arriveStyle = arriveIndex !== undefined ? { animationDelay: `${Math.min(arriveIndex, 7) * 70}ms` } : undefined
  const seenMark = isSeen ? (
    <span className={`seen-mark${seenBefore ? '' : ' just-seen'}`}>{Icon.check}{t('feed.seen')}</span>
  ) : (
    <span className="new-dot" aria-label="new" />
  )
  const meta = (
    <span className="meta">
      <TypeTag type={item.type} />
      {angle ? <span className={`angle angle-${angle}`}>{t(`angles.${angle}`)}</span> : null}
      <span className="muted">{item.sourceName} · {timeAgo(item.date, lang)}</span>
      {seenMark}
    </span>
  )

  if (item.type === 'video') {
    const videoMeta = (
      <span className="meta">
        <TypeTag type={item.type} />
        <span className="muted">{item.sourceName}{item.minutes ? ` · ${item.minutes} min` : ''} · {timeAgo(item.date, lang)}</span>
        {seenMark}
      </span>
    )
    return (
      <button ref={cardRef} className={`card video-card ${isSeen ? 'is-seen' : ''}${arriveCls}`} style={arriveStyle} onClick={open}>
        <span className="thumb" style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined}>
          <span className="play">{Icon.play}</span>
        </span>
        <span className="video-text">
          {videoMeta}
          <span className="title">{item.title}</span>
        </span>
      </button>
    )
  }

  if (item.type === 'picture') {
    return (
      <button ref={cardRef} className={`card picture-card ${isSeen ? 'is-seen' : ''}${arriveCls}`} style={arriveStyle} onClick={open}>
        <span className="picture" style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined} />
        <span className="picture-text">
          {meta}
          <span className="title">{item.title}</span>
        </span>
      </button>
    )
  }

  return (
    <button ref={cardRef} className={`card text-card ${isSeen ? 'is-seen' : ''}${arriveCls}`} style={arriveStyle} onClick={open}>
      {meta}
      <span className="title">{item.title}</span>
      {item.summary ? <span className="summary">{item.summary}</span> : null}
    </button>
  )
}
