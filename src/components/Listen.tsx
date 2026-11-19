import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { loadRate, loadVoices, pickVoice, RATES, Speaker, speechSupported, type SpeakerState } from '../lib/speech'
import type { Lang } from '../lib/types'

const svg = (d: React.ReactNode, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const I = {
  phones: svg(<><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></>),
  play: svg(<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />, 22),
  pause: svg(<><rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" /></>, 22),
  prev: svg(<><path d="M18 6v12l-9-6z" fill="currentColor" stroke="none" /><path d="M6 6v12" /></>),
  next: svg(<><path d="M6 6v12l9-6z" fill="currentColor" stroke="none" /><path d="M18 6v12" /></>),
  close: svg(<path d="M6 6l12 12M18 6 6 18" />),
}

/** Text blocks of the article in reading order (innermost paragraphs, headings, list items). */
function blocksOf(root: HTMLElement): HTMLElement[] {
  const all = [...root.querySelectorAll<HTMLElement>('p, h2, h3, h4, li, blockquote')].filter((el) => el.textContent?.trim())
  const leaves = all.filter((el) => !all.some((other) => other !== el && el.contains(other)))
  return leaves.length ? leaves : [root]
}

const shortVoiceName = (name: string) => name.replace(/^(Microsoft|Google|Apple)\s+/i, '').split(/\s[-–(]|\(/)[0].trim() || name

/**
 * "Escuchar · 4 min" under the title, and a quiet player docked above "Siguiente".
 * The phone reads the title and then the article, paragraph by paragraph, highlighting the one it's on.
 */
export function Listen({ contentRef, titleRef, lang, words }: { contentRef: RefObject<HTMLElement | null>; titleRef: RefObject<HTMLElement | null>; lang: Lang; words: number }) {
  const { t, i18n } = useTranslation()
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [state, setState] = useState<SpeakerState | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [bottom, setBottom] = useState(96)
  const targets = useRef<HTMLElement[]>([])
  const supported = speechSupported()

  // Voices arrive late on some phones: load them before the first tap (the tap must start speech right away on iPhone).
  useEffect(() => {
    if (supported) void loadVoices().then(setVoices)
  }, [supported])

  // Stop when leaving the article; pause when the app goes to the background (the phone stops it anyway).
  useEffect(() => () => speaker?.stop(), [speaker])
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && speaker?.pause()
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [speaker])

  // While the player is open the article gets extra room at the bottom (so the last lines are never under it).
  useEffect(() => {
    if (!speaker) return
    document.body.classList.add('listening')
    return () => document.body.classList.remove('listening')
  }, [speaker])

  // Sit just above the "Siguiente" bar, whatever its height.
  useEffect(() => {
    if (!speaker) return
    const bar = document.querySelector<HTMLElement>('.next-bar')
    if (!bar) return
    const ro = new ResizeObserver(() => setBottom(bar.offsetHeight + 4))
    ro.observe(bar)
    return () => ro.disconnect()
  }, [speaker])

  // Highlight the paragraph being read and keep it in view.
  useEffect(() => {
    targets.current.forEach((el) => el.classList.remove('speaking'))
    if (!state || state.status === 'idle') return
    const el = targets.current[state.part]
    if (!el) return
    el.classList.add('speaking')
    const r = el.getBoundingClientRect()
    if (state.status === 'playing' && (r.top < 60 || r.bottom > window.innerHeight - bottom - 140)) {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: window.scrollY + r.top - 90, behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [state, bottom])
  useEffect(() => () => targets.current.forEach((el) => el.classList.remove('speaking')), [])

  if (!supported) return null

  const start = () => {
    const root = contentRef.current
    if (!root) return
    const blocks = blocksOf(root)
    targets.current = [titleRef.current, ...blocks].filter((el): el is HTMLElement => !!el)
    const texts = targets.current.map((el) => el.textContent ?? '')
    const choice = pickVoice(voices.length ? voices : speechSynthesis.getVoices(), lang)
    const sp = new Speaker(texts, choice)
    sp.subscribe(setState)
    setSpeaker(sp)
    sp.play()
  }
  const close = () => {
    speaker?.stop()
    setSpeaker(null)
    setState(null)
  }

  const minutes = Math.max(1, Math.round(words / (165 * loadRate())))
  if (!speaker || !state || state.status === 'idle') {
    return (
      <button className="listen-pill" onClick={start}>
        {I.phones}
        {t('listen.start', { count: minutes })}
      </button>
    )
  }

  const v = speaker.voice
  const rateText = `${speaker.rate.toLocaleString(i18n.language)}×`
  const nextRate = RATES[(RATES.indexOf(speaker.rate) + 1) % RATES.length]
  const label =
    state.status === 'ended' ? t('listen.ended') : state.part === 0 ? t('listen.titleLine') : t('listen.paraOf', { n: state.part, total: state.parts - 1 })
  const voiceLine = v.fallback
    ? t('listen.fallbackCa')
    : v.voice
      ? t('listen.voice', { name: shortVoiceName(v.voice.name), lang: t(`langs.${v.lang}`) })
      : t('listen.defaultVoice')
  const progress = state.status === 'ended' ? 1 : state.parts > 1 ? state.part / (state.parts - 1) : 0

  return (
    <>
      <span className="listen-pill-space" aria-hidden="true" />
      {createPortal(
      <section className="listen-player" aria-label={t('listen.player')} style={{ bottom }}>
        <div className="listen-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
        <div className="listen-top">
          <span className="listen-label">
            <strong>{label}</strong>
            <span>{voiceLine}</span>
          </span>
          <button className="listen-speed" aria-label={t('listen.speed', { rate: rateText })} onClick={() => speaker.setRate(nextRate)}>{rateText}</button>
          <button className="listen-icon" aria-label={t('listen.stop')} onClick={close}>{I.close}</button>
        </div>
        <div className="listen-controls">
          <button className="listen-icon" aria-label={t('listen.prev')} disabled={state.part === 0} onClick={() => speaker.goTo(state.part - 1)}>{I.prev}</button>
          <button className="listen-main" aria-label={state.status === 'playing' ? t('listen.pause') : t('listen.play')} onClick={() => speaker.toggle()}>
            {state.status === 'playing' ? I.pause : I.play}
          </button>
          <button className="listen-icon" aria-label={t('listen.next')} disabled={state.part >= state.parts - 1} onClick={() => speaker.goTo(state.part + 1)}>{I.next}</button>
        </div>
        <p className="listen-hint">{t('listen.screenOn')}</p>
      </section>,
      document.body,
      )}
    </>
  )
}
