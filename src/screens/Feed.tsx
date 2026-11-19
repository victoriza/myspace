import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, TypeTag } from '../components/ui'
import { Picture, SourceIcon, sourceSite, useOnline, videoLength } from '../components/bits'
import { useInstallOffer } from '../lib/install'
import { FeedListen } from '../components/Listen'
import { saveClosedDay } from '../lib/storage'
import { UpdateBar, WhatsNew } from '../components/Updates'
import { Greeting, LivingLogo, MiniLoader, Preparing } from '../components/Cosy'
import { SkyBackdrop } from '../components/Sky'
import { sceneAt, skyColorAt, skyText } from '../lib/sky'
import { totalMinutes } from '../lib/feed'
import { timeAgo } from '../lib/time'
import type { ContentType, FeedItem } from '../lib/types'
import { go } from '../router'
import { itemLang, sourceMeta } from '../lib/sources'
import { useApp } from '../state'

export function Feed() {
  const { t, i18n } = useTranslation()
  const { today, seen, loading, feedChanged, clearFeedChanged, markSeen } = useApp()
  // Back from Personalizar with changes: a calm "preparing your feed" moment, then the cards rise in.
  const [preparing, setPreparing] = useState(() => feedChanged())
  const [revealed, setRevealed] = useState(false)
  useEffect(() => clearFeedChanged(), [clearFeedChanged])
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  // "Already seen" starts folded into one quiet line.
  const [showOld, setShowOld] = useState(false)
  const online = useOnline()
  // Grouping (new vs "seen earlier") uses what was seen when the feed opened,
  // so cards don't jump around while you scroll and they get marked as seen.
  const [seenAtOpen] = useState(() => ({ ...seen }))
  // Cards rise in gently on the first open of the day (and after the "preparing" scene).
  const [arriveDay] = useState(() => {
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

  const arrive = arriveDay || revealed
  const items = useMemo(() => today?.items ?? [], [today])
  const presentTypes = useMemo(() => [...new Set(items.map((i) => i.type))], [items])
  const inFilter = items.filter((i) => filter === 'all' || i.type === filter)
  const fresh = inFilter.filter((i) => !seenAtOpen[i.id])
  const old = inFilter.filter((i) => seenAtOpen[i.id])
  const newCount = inFilter.filter((i) => !seen[i.id]).length
  const allFresh = items.filter((i) => !seen[i.id])
  const allDone = items.length > 0 && allFresh.length === 0

  const { heroRef, chipsRef, sentinelRef, horizon, stuck, chipsH } = useHorizon(`${presentTypes.length > 1}-${items.length > 0}`)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])
  const scene = sceneAt(now, horizon)
  const L = scene.look
  // Text colours are picked for contrast at this exact time (tested every 15 min of the day).
  const ink = skyText(scene, horizon)
  const skyVars = {
    '--hero-ink': ink.heroInk,
    '--hero-sub': ink.heroSub,
    '--sea-ink': ink.seaInk,
    '--sea-strong': ink.seaStrong,
    '--stuck-bg': `linear-gradient(180deg, ${skyColorAt(L, 0, horizon + 20)}, ${skyColorAt(L, chipsH, horizon + 20)})`,
  } as CSSProperties

  return (
    <div className={`screen with-nav sky-home${ink.light ? ' sky-light' : ''}${scene.darkGround ? ' sky-dark' : ''}`} style={skyVars}>
      <SkyBackdrop scene={scene} horizon={horizon} />
      <header ref={heroRef} className="sky-hero">
      <div className="feed-header">
        <div className="brand">
          <LivingLogo />
          <h1>Space Feed</h1>
        </div>
      </div>

      <Greeting />
      <UpdateBar />
      </header>

      <main className="feed-main">
      <div ref={sentinelRef} className="chips-sentinel" aria-hidden="true" />
      {presentTypes.length > 1 ? (
        <div ref={chipsRef} className={`chips sky-chips${stuck ? ' stuck' : ''}`} role="radiogroup" aria-label={t('feed.show')}>
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
        </div>
      ) : null}

      {fresh.length && !preparing ? (
        <div className="feed-listen-row">
          <FeedListen items={fresh} appLang={i18n.language as 'es'} onHeard={markSeen} />
        </div>
      ) : null}

      {!online ? <p className="quiet-line small" role="status">{t('offline')}</p> : null}
      {loading && today && online ? <MiniLoader /> : null}

      {preparing ? <Preparing busy={loading} onDone={() => { setRevealed(true); setPreparing(false) }} /> : null}
      <div className="stack" key={preparing ? 'waiting' : 'shown'}>
        <WhatsNew />
        {fresh.map((item, i) => (
          <Card key={item.id} item={item} isSeen={!!seen[item.id]} arriveIndex={arrive ? i : undefined} />
        ))}
        {old.length ? (
          <>
            <button className="seen-toggle" aria-expanded={showOld} aria-controls="seen-earlier" onClick={() => setShowOld((v) => !v)}>
              <span className="seen-toggle-line" aria-hidden="true" />
              <span>{showOld ? t('feed.seenHide') : t('feed.seenToggle', { count: old.length })}</span>
              <span className={`seen-toggle-chev${showOld ? ' open' : ''}`} aria-hidden="true">{Icon.chevron}</span>
              <span className="seen-toggle-line" aria-hidden="true" />
            </button>
            <div id="seen-earlier" className="stack-tight" hidden={!showOld}>
              {showOld ? old.map((item) => <Card key={item.id} item={item} isSeen seenBefore />) : null}
            </div>
          </>
        ) : null}

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
        {allDone ? <InstallCard day={today?.day} /> : items.length ? (
          <div className="feed-end">
            <p className="muted small center">{t('feed.left', { count: allFresh.length })}</p>
            <button className="btn-link finish-link" onClick={() => { if (today) saveClosedDay(today.day); go('done') }}>{t('feed.finishToday')}</button>
          </div>
        ) : !loading ? (
          <div className="card empty">
            <p>{t('feed.empty')}</p>
            <button className="btn-primary" onClick={() => go('sources')}>{t('feed.addSources')}</button>
          </div>
        ) : null}
      </div>
      </main>
      <BottomNav active="feed" />
    </div>
  )
}

/**
 * Where the horizon goes: just under the chips (or the greeting when there are no chips).
 * Also tells when the chips have stuck to the top, so they get a sky-coloured background.
 */
function useHorizon(layoutKey: string) {
  const heroRef = useRef<HTMLElement | null>(null)
  const chipsRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [horizon, setHorizon] = useState(200)
  const [chipsH, setChipsH] = useState(52)
  const [stuck, setStuck] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      const hero = heroRef.current
      if (!hero) return
      const chips = chipsRef.current
      const box = (chips ?? hero).getBoundingClientRect()
      const bottom = box.bottom + window.scrollY
      setHorizon(Math.round(bottom + 4))
      if (chips) setChipsH(chips.offsetHeight)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    if (heroRef.current) ro.observe(heroRef.current)
    if (chipsRef.current) ro.observe(chipsRef.current)
    return () => ro.disconnect()
  }, [layoutKey])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { heroRef, chipsRef, sentinelRef, horizon, stuck, chipsH }
}

/** "Put it on your home screen?" — once, at the end of the first day. */
function InstallCard({ day }: { day?: string }) {
  const { t } = useTranslation()
  const offer = useInstallOffer(day)
  if (!offer.show) return null
  return (
    <section className="card install-card" aria-labelledby="install-title">
      <h2 id="install-title" className="card-title">{t('install.title')}</h2>
      <p className="muted small">{offer.canPrompt ? t('install.text') : t('install.ios')}</p>
      <div className="row-start">
        {offer.canPrompt ? <button className="btn-primary small" onClick={offer.install}>{t('install.yes')}</button> : null}
        <button className="btn-link" onClick={offer.dismiss}>{t('install.no')}</button>
      </div>
    </section>
  )
}

/** A card in the feed. Only opening it marks it as seen (scrolling past doesn't). */
function Card({ item, isSeen, arriveIndex, seenBefore }: { item: FeedItem; isSeen: boolean; arriveIndex?: number; seenBefore?: boolean }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en' | 'ca'
  const open = () => go(item.type === 'video' && item.videoId ? 'video' : 'article', item.id)
  const angle = sourceMeta(item.sourceId)?.angle
  const textLang = itemLang(item.sourceId, lang)
  const arriveCls = arriveIndex !== undefined ? ' arrive' : ''
  const arriveStyle = arriveIndex !== undefined ? { animationDelay: `${Math.min(arriveIndex, 7) * 70}ms` } : undefined
  const seenMark = isSeen ? (
    <span className={`seen-mark${seenBefore ? '' : ' just-seen'}`}>{Icon.check}{t('feed.seen')}</span>
  ) : (
    <span className="new-dot" role="img" aria-label={t('feed.new')} />
  )
  // One quiet label per card: the angle for news (good news · progress · solution), otherwise the type.
  const tag = angle && item.type !== 'video' && item.type !== 'picture' ? <span className={`angle angle-${angle}`}>{t(`angles.${angle}`)}</span> : <TypeTag type={item.type} />
  const top = <span className="card-top">{tag}{seenMark}</span>
  const byline = (
    <span className="byline">
      <SourceIcon name={item.sourceName} host={sourceSite(item)} />
      <span className="byline-text">{item.sourceName} · {timeAgo(item.date, lang)}</span>
    </span>
  )

  if (item.type === 'video') {
    const length = videoLength(item)
    return (
      <button data-item={item.id} className={`card video-card ${isSeen ? 'is-seen' : ''}${arriveCls}`} style={arriveStyle} onClick={open}>
        <Picture src={item.image} className="thumb">
          <span className="play">{Icon.play}</span>
          {length ? <span className="duration">{length}</span> : null}
        </Picture>
        <span className="video-text">
          {top}
          <span className="title" lang={textLang}>{item.title}</span>
          {byline}
        </span>
      </button>
    )
  }

  if (item.type === 'picture') {
    return (
      <button data-item={item.id} className={`card picture-card ${isSeen ? 'is-seen' : ''}${arriveCls}`} style={arriveStyle} onClick={open}>
        <Picture src={item.image} title={item.title} className="picture" />
        <span className="picture-text">
          {top}
          <span className="title" lang={textLang}>{item.title}</span>
          {byline}
        </span>
      </button>
    )
  }

  return (
    <button data-item={item.id} className={`card text-card ${isSeen ? 'is-seen' : ''}${arriveCls}`} style={arriveStyle} onClick={open}>
      {top}
      <span className="title" lang={textLang}>{item.title}</span>
      {item.summary ? <span className="summary" lang={textLang}>{item.summary}</span> : null}
      {byline}
    </button>
  )
}
