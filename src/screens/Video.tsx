import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/ui'
import { ShareButton, SourceIcon, videoLength } from '../components/bits'
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

  const textLang = itemLang(item.sourceId, i18n.language as 'es')
  const length = videoLength(item)
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
      <main className="stack pad video-main">
        <h1 className="video-title" lang={textLang}>{item.title}</h1>
        <div className="channel-row">
          <SourceIcon name={item.sourceName} size={36} />
          <span className="channel-text">
            <strong>{item.sourceName}</strong>
            <span className="muted small">{[t('video.channel'), length, timeAgo(item.date, i18n.language as 'es')].filter(Boolean).join(' · ')}</span>
          </span>
          <span className="watched-status">{Icon.check} {t('video.watched')}</span>
        </div>
        {item.summary ? <p className="video-desc clamp-3" lang={textLang}>{item.summary}</p> : null}

        <a className="btn-outline" href={item.link} target="_blank" rel="noopener noreferrer">{t('video.open')} {Icon.external}</a>
        <ShareButton title={item.title} text={`${item.title} · ${t('share.via')}`} url={item.link} />

        <p className="muted small">{t('video.noAutoplay')}</p>
        <RemoveSource item={item} />
      </main>
      <NextBar currentId={item.id} />
    </div>
  )
}
