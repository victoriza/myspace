import { useEffect, useState } from 'react'
import { go, useRoute } from './router'
import { About } from './screens/About'
import { AddSource } from './screens/AddSource'
import { Article } from './screens/Article'
import { Customize } from './screens/Customize'
import { Done } from './screens/Done'
import { Feed } from './screens/Feed'
import { Filters } from './screens/Filters'
import { Loading } from './screens/Loading'
import { trackDayPart } from './lib/daytime'
import { More } from './screens/More'
import { Sources } from './screens/Sources'
import { Suggested } from './screens/Suggested'
import { Video } from './screens/Video'
import { Why } from './screens/Why'
import { useApp } from './state'

const SPLASH_MIN_MS = 1800

export default function App() {
  const route = useRoute()
  const { settings, refresh, loading, today, seen } = useApp()
  useEffect(() => trackDayPart(), [])
  const [splash, setSplash] = useState(true)

  // First load: show the calm splash, fetch today's feed, then route.
  useEffect(() => {
    const started = Date.now()
    const done = () => setTimeout(() => setSplash(false), Math.max(0, SPLASH_MIN_MS - (Date.now() - started)))
    if (!settings.onboarded) {
      go('why')
      done()
      return
    }
    void refresh().then(done)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If everything is already seen today, open on the "closed until tomorrow" screen.
  useEffect(() => {
    if (splash || !today || route.length) return
    if (today.items.length && today.items.every((i) => seen[i.id])) go('done')
    // only right after the splash
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splash])

  // Back to the app (maybe a new day): refresh.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (settings.onboarded) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh, settings.onboarded])

  if (splash || (loading && !today)) return <Loading />

  const [page, arg] = route
  const content = (() => {
  switch (page) {
    case 'why':
      return <Why />
    case 'about':
      return <About />
    case 'suggested':
      return <Suggested />
    case 'article':
      return <Article id={arg} />
    case 'video':
      return <Video id={arg} />
    case 'done':
      return <Done />
    case 'customize':
      return <Customize />
    case 'filters':
      return <Filters />
    case 'sources':
      return <Sources />
    case 'add':
      return <AddSource />
    case 'more':
      return <More />
    default:
      return settings.onboarded ? <Feed /> : <Why />
  }
  })()
  // Soft page change: opening an item cross-fades with a small slide; other screens just fade.
  // (No transform on screens with the fixed bottom bar, so it doesn't jump.)
  const slide = page === 'article' || page === 'video'
  return (
    <div key={route.join('/') || 'feed'} ref={announceScreen} className={`page${slide ? ' page-slide' : ''}`}>
      {content}
    </div>
  )
}

/**
 * When the screen changes: name the browser tab after it and move focus to its heading,
 * so screen readers say where you are. (Not on the very first screen, to keep the normal start.)
 */
let firstScreen = true
function announceScreen(el: HTMLDivElement | null) {
  if (!el) return
  const heading = el.querySelector('h1')
  const name = heading?.textContent?.trim()
  document.title = name && name !== 'Space Feed' ? `${name} · Space Feed` : 'Space Feed'
  if (firstScreen) {
    firstScreen = false
    return
  }
  if (heading instanceof HTMLElement) {
    heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }
}
