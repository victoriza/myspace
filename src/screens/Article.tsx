import DOMPurify from 'dompurify'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { hostOf, Icon, TypeTag } from '../components/ui'
import { ShareButton, SourceIcon, sourceSite } from '../components/bits'
import { firstSentence } from '../lib/parse'
import { readingMinutes, timeAgo } from '../lib/time'
import { NextBar } from '../components/NextBar'
import { RemoveSource } from '../components/RemoveSource'
import { back, go } from '../router'
import { useApp } from '../state'
import { itemLang } from '../lib/sources'

const SIZES = [16, 18, 21]

export function Article({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const { itemById, markSeen } = useApp()
  const item = itemById(id)
  const [size, setSize] = useState(1)

  useEffect(() => {
    if (item) markSeen(item.id)
  }, [item, markSeen])

  const html = useMemo(() => {
    if (!item?.content) return ''
    const clean = DOMPurify.sanitize(item.content, {
      ALLOWED_TAGS: ['p', 'br', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'b', 'i', 'a', 'img', 'figure', 'figcaption'],
      ALLOWED_ATTR: ['href', 'src', 'alt'],
    })
    // Open links outside the app.
    return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
  }, [item])

  if (!item) {
    return (
      <div className="screen center-screen">
        <button className="btn-primary" onClick={() => go()}>{t('nav.feed')}</button>
      </div>
    )
  }

  const site = hostOf(item.link)
  const text = html ? html.replace(/<[^>]+>/g, ' ') : ''
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const minutes = readingMinutes(html ? text : item.summary)
  // "In short" only helps on longer articles; on short ones (or summary-only feeds) it would repeat the text.
  const showInShort = !!item.summary && item.type !== 'picture' && words >= 250

  const textLang = itemLang(item.sourceId, i18n.language as 'es')
  return (
    <div className="screen reader">
      {words >= 400 ? <ReadProgress /> : null}
      <header className="reader-header">
        <button className="icon-btn" aria-label={t('nav.back')} onClick={back}>{Icon.back}</button>
        <button className="icon-btn aa" aria-label={t('article.textSize')} onClick={() => setSize((s) => (s + 1) % SIZES.length)}>Aa</button>
      </header>

      <main className="reader-body">
        {item.image && item.type === 'picture' ? <img className="reader-picture" src={item.image} alt="" /> : null}
        <span className="meta reader-meta">
          <TypeTag type={item.type} />
          <SourceIcon name={item.sourceName} host={sourceSite(item)} />
          <span className="muted">
            {item.sourceName} · {timeAgo(item.date, i18n.language as 'es')}
            {html ? ` · ${t('article.minRead', { count: minutes })}` : ''}
          </span>
        </span>
        <h1 className="reader-title" lang={textLang}>{item.title}</h1>
        {item.author ? <p className="muted small">{item.author}</p> : null}

        {showInShort ? (
          <div className="in-short">
            <span className="in-short-label">{t('article.inShort')}</span>
            <span lang={textLang}>{firstSentence(item.summary)}</span>
          </div>
        ) : null}

        {html ? (
          <div className="reader-content" lang={textLang} style={{ fontSize: SIZES[size] }} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="stack-tight">
            {item.summary ? <p className="reader-content" lang={textLang} style={{ fontSize: SIZES[size] }}>{item.summary}</p> : null}
            {item.type !== 'picture' ? <p className="muted small">{t('article.summaryOnly')}</p> : null}
          </div>
        )}

        <div className="reader-end" aria-hidden="true">
          <svg width="56" height="22" viewBox="0 0 56 22"><circle cx="28" cy="12" r="6" fill="#E9B949" /><rect x="0" y="12" width="56" height="10" fill="var(--paper)" /><path d="M6 15c4-3 8 3 12 0s8 3 12 0 8 3 12 0 8 3 8 1" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </div>

        <a className="btn-outline wide" href={item.link} target="_blank" rel="noopener noreferrer">
          {t('article.readOn', { site })} {Icon.external}
        </a>
        <ShareButton title={item.title} text={`${item.title} · ${t('share.via')}`} url={item.link} />

        <RemoveSource item={item} />
      </main>

      <NextBar currentId={item.id} />
    </div>
  )
}

/** A thin sun-coloured line at the top that fills as you read. Decorative (screen readers have their own position). */
function ReadProgress() {
  const bar = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div className="read-progress" aria-hidden="true">
      <span ref={bar} />
    </div>
  )
}
