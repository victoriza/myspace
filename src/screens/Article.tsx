import DOMPurify from 'dompurify'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { hostOf, Icon, TypeTag } from '../components/ui'
import { firstSentence } from '../lib/parse'
import { readingMinutes, timeAgo } from '../lib/time'
import { NextBar } from '../components/NextBar'
import { RemoveSource } from '../components/RemoveSource'
import { back, go } from '../router'
import { useApp } from '../state'

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
  const minutes = readingMinutes(html ? html.replace(/<[^>]+>/g, ' ') : item.summary)

  return (
    <div className="screen reader">
      <header className="reader-header">
        <button className="icon-btn" aria-label={t('nav.back')} onClick={back}>{Icon.back}</button>
        <button className="icon-btn aa" aria-label={t('article.textSize')} onClick={() => setSize((s) => (s + 1) % SIZES.length)}>Aa</button>
      </header>

      <main className="reader-body">
        {item.image && item.type === 'picture' ? <img className="reader-picture" src={item.image} alt="" /> : null}
        <span className="meta">
          <TypeTag type={item.type} />
          <span className="muted">
            {item.sourceName} · {timeAgo(item.date, i18n.language as 'es')}
            {html ? ` · ${t('article.minRead', { count: minutes })}` : ''}
          </span>
        </span>
        <h1 className="reader-title">{item.title}</h1>
        {item.author ? <p className="muted small">{item.author}</p> : null}

        {item.summary && item.type !== 'picture' ? (
          <div className="in-short">
            <span className="in-short-label">{t('article.inShort')}</span>
            <span>{firstSentence(item.summary)}</span>
          </div>
        ) : null}

        {html ? (
          <div className="reader-content" style={{ fontSize: SIZES[size] }} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="stack-tight">
            {item.summary ? <p className="reader-content" style={{ fontSize: SIZES[size] }}>{item.summary}</p> : null}
            {item.type !== 'picture' ? <p className="muted small">{t('article.summaryOnly')}</p> : null}
          </div>
        )}

        <a className="btn-outline wide" href={item.link} target="_blank" rel="noopener noreferrer">
          {t('article.readOn', { site })} {Icon.external}
        </a>

        <RemoveSource item={item} />
      </main>

      <NextBar currentId={item.id} />
    </div>
  )
}
