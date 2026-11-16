import { useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'

/**
 * New-version notice. The service worker downloads a new version in the background but doesn't
 * switch to it on its own (registerType 'prompt'), so nobody gets reloaded mid-article.
 * The feed shows "New version · Update"; otherwise it switches the next time the app is fully reopened.
 */
const CHECK_EVERY_MS = 60 * 60 * 1000

let available = false
let dismissed = false
let updateSW: ((reload?: boolean) => Promise<void>) | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function initUpdates() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      available = true
      emit()
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => {
        if (navigator.onLine) void registration.update()
      }, CHECK_EVERY_MS)
    },
  })
}

let snapshot = { available, dismissed }
function getSnapshot() {
  if (snapshot.available !== available || snapshot.dismissed !== dismissed) snapshot = { available, dismissed }
  return snapshot
}
function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useUpdate() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    available: s.available,
    showBar: s.available && !s.dismissed,
    apply: () => void updateSW?.(true),
    dismiss: () => {
      dismissed = true
      emit()
    },
  }
}
