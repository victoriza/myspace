import { useEffect, useState } from 'react'
import type { FeedItem } from './lib/types'

/** Tiny hash router: '#/article/abc' → ['article', 'abc']. Works offline and with the back button. */
export function useRoute(): string[] {
  const parse = () => (window.location.hash.replace(/^#\/?/, '') || '').split('/').map(decodeURIComponent).filter(Boolean)
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function go(...parts: string[]) {
  window.location.hash = '/' + parts.map(encodeURIComponent).join('/')
}

export function back() {
  if (window.history.length > 1) window.history.back()
  else go()
}

/** Opens an item in the reader or the player. With replace, Back still returns to the feed. */
export function openItem(item: FeedItem, replace = false) {
  const hash = '#/' + (item.type === 'video' && item.videoId ? 'video' : 'article') + '/' + encodeURIComponent(item.id)
  if (replace) window.location.replace(hash)
  else window.location.hash = hash
}

export function goReplace(...parts: string[]) {
  window.location.replace('#/' + parts.map(encodeURIComponent).join('/'))
}
