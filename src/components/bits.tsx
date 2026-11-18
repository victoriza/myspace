import { useEffect, useState, type CSSProperties } from 'react'
import { sourceMeta } from '../lib/sources'
import type { FeedItem } from '../lib/types'
import { hostOf } from './ui'

/** Same name → same soft colour, for the letter shown when a site has no icon. */
function hue(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

/** Website of the source behind an item (for its icon). */
export function sourceSite(item: Pick<FeedItem, 'sourceId' | 'link'>): string | undefined {
  const s = sourceMeta(item.sourceId)
  if (s?.kind === 'youtube') return 'youtube.com'
  if (s?.kind === 'hn') return 'news.ycombinator.com'
  if (s?.kind === 'wikipedia') return 'wikipedia.org'
  const url = s?.site || s?.url || item.link
  return url ? hostOf(url) : undefined
}

/** The site's own small icon (16 px), or a soft letter if it has none. Decorative: the name is always next to it. */
export function SourceIcon({ name, host, size = 16 }: { name: string; host?: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const letter = name.replace(/^(the|la|el|les|els)\s+/i, '').charAt(0).toUpperCase() || '·'
  const style = { '--h': hue(name), width: size, height: size } as CSSProperties
  if (!host || failed) {
    return (
      <span className="src-icon letter" style={style} aria-hidden="true">
        {letter}
      </span>
    )
  }
  return (
    <img
      className="src-icon"
      src={`https://${host}/favicon.ico`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        // Some sites answer with a 1×1 pixel: treat it as "no icon".
        if ((e.currentTarget as HTMLImageElement).naturalWidth < 8) setFailed(true)
      }}
    />
  )
}

/**
 * A picture that never shows a grey block: a soft sun-coloured frame while it loads,
 * a gentle fade-in when it arrives, and a small sun over the waves if it can't load.
 */
export function Picture({ src, title, className = '', children }: { src?: string; title?: string; className?: string; children?: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'fail'>(src ? 'loading' : 'fail')
  return (
    <span className={`frame ${state} ${className}`}>
      {src && state !== 'fail' ? (
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={() => setState('ok')} onError={() => setState('fail')} />
      ) : null}
      {state === 'fail' && title ? (
        <span className="frame-mark" aria-hidden="true">
          <svg width="64" height="30" viewBox="0 0 64 30"><circle cx="32" cy="16" r="9" fill="#fff" fillOpacity=".75" /><rect x="0" y="17" width="64" height="13" fill="transparent" /><path d="M4 20c4.7-3.5 9.3 3.5 14 0s9.3 3.5 14 0 9.3 3.5 14 0 9.3 3.5 14 0" stroke="#fff" strokeOpacity=".8" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
        </span>
      ) : null}
      {children}
    </span>
  )
}

/** "13:02" (or "1:02:05"); falls back to "12 min" when only the minutes are known. */
export function videoLength(item: Pick<FeedItem, 'seconds' | 'minutes'>): string | null {
  const s = item.seconds
  if (s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = String(s % 60).padStart(2, '0')
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
  }
  return item.minutes ? `${item.minutes} min` : null
}

/** Whether the phone has a connection right now. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}
