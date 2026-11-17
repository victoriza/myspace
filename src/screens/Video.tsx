import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, TypeTag } from '../components/ui'
import { timeAgo } from '../lib/time'
import { NextBar } from '../components/NextBar'
import { RemoveSource } from '../components/RemoveSource'
import { back, go } from '../router'
import { useApp } from '../state'
import { itemLang } from '../lib/sources'

export function Video({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const { itemById, markSeen } = useApp()
  const item = itemById(id)

  // Opening a video counts as seen in the feed; "Mark watched" is just explicit.
  useEffect(() => {
    if (item) markSeen(item.id)
  }, [item, markSeen])

  if (!item || !item.videoId) {
    return (
      <div className="screen center-screen">
        <button className="btn-primary" onClick={() => go()}>{t('nav.feed')}</button>
      </div>
    )
  }

  // youtube.com (not -nocookie) so a signed-in Premium account is recognized.
  const src = `https://www.youtube.com/embed/${encodeURIComponent(item.videoId)}?rel=0&modestbranding=1&playsinline=1&autoplay=1`

  return (
    <div className="screen video-screen">
      <header className="reader-header">
        <button className="icon-btn" aria-label={t('nav.back')} onClick={back}>{Icon.back}</button>
      </header>
      <div className="player">
        <iframe
          src={src}
          title={`YouTube: ${item.title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <main className="stack pad">
        <span className="meta">
          <TypeTag type="video" />
          <span className="muted">{item.sourceName} · {timeAgo(item.date, i18n.language as 'es')}</span>
        </span>
        <h1 className="video-title" lang={itemLang(item.sourceId, i18n.language as 'es')}>{item.title}</h1>
        {item.summary ? <p className="muted clamp-3">{item.summary}</p> : null}

        <div className="grid-2">
          <button className="btn-secondary on" disabled>{Icon.check} {t('video.watched')}</button>
          <a className="btn-secondary" href={item.link} target="_blank" rel="noopener noreferrer">{t('video.onYouTube')}</a>
        </div>

        <p className="muted small">{t('video.noAutoplay')}</p>
        <RemoveSource item={item} />
      </main>
      <NextBar currentId={item.id} />
    </div>
  )
}
