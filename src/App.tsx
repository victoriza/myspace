import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadSocial, saveSocial } from './lib/storage'
import { go, useRoute } from './router'
import { AddSource } from './screens/AddSource'
import { Article } from './screens/Article'
import { Customize } from './screens/Customize'
import { Done } from './screens/Done'
import { Feed } from './screens/Feed'
import { Filters } from './screens/Filters'
import { Loading } from './screens/Loading'
import { More } from './screens/More'
import { OpenSocial } from './screens/OpenSocial'
import { Sources } from './screens/Sources'
import { Suggested } from './screens/Suggested'
import { Video } from './screens/Video'
import { Why } from './screens/Why'
import { useApp } from './state'

const SPLASH_MIN_MS = 1800

export default function App() {
  const route = useRoute()
  const { t } = useTranslation()
  const { settings, refresh, loading, today, seen } = useApp()
  const [splash, setSplash] = useState(true)
  const [welcome, setWelcome] = useState<string | null>(null)

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

  // Back from Instagram/TikTok, or a new day: check the time limit and refresh.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const s = loadSocial()
      if (s) {
        const minutes = Math.round((Date.now() - s.openedAt) / 60000)
        if (Date.now() - s.openedAt > 10_000) saveSocial(null)
        if (s.limitMin > 0 && minutes >= s.limitMin) {
          setWelcome(t('feed.welcomeBack', { min: minutes, app: s.app === 'instagram' ? 'Instagram' : 'TikTok' }))
        }
      }
      if (settings.onboarded) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh, settings.onboarded, t])

  if (splash || (loading && !today)) return <Loading />

  const [page, arg] = route
  switch (page) {
    case 'why':
      return <Why />
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
    case 'open':
      return <OpenSocial app={arg === 'tiktok' ? 'tiktok' : 'instagram'} />
    default:
      return settings.onboarded ? <Feed welcome={welcome} /> : <Why />
  }
}
