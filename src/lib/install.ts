import { useEffect, useState } from 'react'

/**
 * "Put it on your home screen?" — asked once, on the evening you finish your first day.
 * Never again after "No, thanks", after installing, or after that first day has passed.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const KEY = 'sf.install.v1'
let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

export function initInstall() {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    listeners.forEach((l) => l())
  })
  window.addEventListener('appinstalled', () => {
    save({ state: 'done' })
    deferred = null
    listeners.forEach((l) => l())
  })
}

type Saved = { state: 'shown'; day: string } | { state: 'done' }
function load(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}
function save(v: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* private mode */
  }
}

const standalone = () =>
  typeof matchMedia !== 'undefined' && (matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true)
const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

/** Whether to show the install card today (`day` = today's feed day). */
export function useInstallOffer(day: string | undefined) {
  const [, bump] = useState(0)
  useEffect(() => {
    const l = () => bump((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  const saved = load()
  const canPrompt = !!deferred
  const ios = isIos()
  let show = !!day && !standalone() && (canPrompt || ios)
  if (saved?.state === 'done') show = false
  if (saved?.state === 'shown' && saved.day !== day) show = false
  if (show && day && !saved) save({ state: 'shown', day })

  return {
    show,
    canPrompt,
    ios,
    install: async () => {
      if (!deferred) return
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') save({ state: 'done' })
      deferred = null
      bump((n) => n + 1)
    },
    dismiss: () => {
      save({ state: 'done' })
      bump((n) => n + 1)
    },
  }
}
