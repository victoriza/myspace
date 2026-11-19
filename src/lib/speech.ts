import type { Lang } from './types'

/**
 * Listening, with the phone's own voice (Web Speech API): no server, no cost, works offline.
 * Kept generic so "listen to today's feed" can reuse it: a list of parts (paragraphs),
 * each read sentence by sentence (long utterances get cut off in some browsers).
 *
 * Limits (shown to people where it matters): it stops when the screen locks or you switch apps,
 * there are no lock-screen controls, the voice depends on the phone, and it must start from a tap.
 */

export const speechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'

const BCP47: Record<Lang, string> = { es: 'es-ES', en: 'en-GB', ca: 'ca-ES' }

/** Split a paragraph into sentences (Intl.Segmenter where the browser has it). */
export function sentences(text: string, lang: Lang): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: 'sentence' }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter
  let parts: string[]
  if (Seg) parts = [...new Seg(BCP47[lang], { granularity: 'sentence' }).segment(clean)].map((s) => s.segment.trim())
  else parts = clean.match(/[^.!?…]+[.!?…]+["»”')\]]*|[^.!?…]+$/g)?.map((s) => s.trim()) ?? [clean]
  // Very long sentences (lists, no full stops) are split at commas/semicolons so nothing gets cut off.
  return parts.filter(Boolean).flatMap((s) => (s.length <= 260 ? [s] : s.split(/(?<=[,;:])\s+/).reduce<string[]>((acc, bit) => {
    const last = acc[acc.length - 1]
    if (last && last.length + bit.length < 220) acc[acc.length - 1] = `${last} ${bit}`
    else acc.push(bit)
    return acc
  }, [])))
}

export interface VoiceChoice {
  voice: SpeechSynthesisVoice | null
  /** The language actually spoken (Catalan falls back to Spanish when the phone has no Catalan voice). */
  lang: Lang
  fallback: boolean
}

/** The best installed voice for a language: on-device and "natural/enhanced" ones first. */
export function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): VoiceChoice {
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0
    const tag = v.lang.toLowerCase().replace('_', '-')
    if (tag === BCP47[lang].toLowerCase()) s += 4
    if (/natural|enhanced|premium|neural|google/i.test(v.name)) s += 3
    if (v.localService) s += 1
    if (v.default) s += 1
    return s
  }
  const of = (l: Lang) => voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(l)).sort((a, b) => score(b) - score(a))
  const own = of(lang)
  if (own.length) return { voice: own[0], lang, fallback: false }
  if (lang === 'ca') {
    const es = of('es')
    if (es.length) return { voice: es[0], lang: 'es', fallback: true }
  }
  return { voice: null, lang, fallback: false }
}

/** Voices arrive late on some phones: wait for them (briefly). */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([])
  const now = speechSynthesis.getVoices()
  if (now.length) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices())
    speechSynthesis.addEventListener?.('voiceschanged', done, { once: true })
    setTimeout(done, 1500)
  })
}

export const RATES = [0.8, 0.9, 1, 1.2]
const RATE_KEY = 'sf.listen.v1'
export const loadRate = (): number => {
  try {
    const r = Number(localStorage.getItem(RATE_KEY))
    return RATES.includes(r) ? r : 0.9
  } catch {
    return 0.9
  }
}
export const saveRate = (r: number) => {
  try {
    localStorage.setItem(RATE_KEY, String(r))
  } catch {
    /* private mode */
  }
}

/** Keeps the screen on while speaking (speech stops when the phone locks). */
class ScreenAwake {
  private lock: { release: () => Promise<void> } | null = null
  async on() {
    try {
      const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock
      if (wl && !this.lock) this.lock = await wl.request('screen')
    } catch {
      /* not allowed: fine */
    }
  }
  off() {
    void this.lock?.release().catch(() => {})
    this.lock = null
  }
}

export interface SpeakerState {
  status: 'idle' | 'playing' | 'paused' | 'ended'
  part: number
  parts: number
}

/**
 * Reads parts (paragraphs) in order, sentence by sentence.
 * "Pause" cancels and remembers the sentence (pause() is unreliable on Android), "play" starts that sentence again.
 */
export class Speaker {
  private sentencesOf: string[][]
  private part = 0
  private sentence = 0
  private status: SpeakerState['status'] = 'idle'
  private token = 0
  private awake = new ScreenAwake()
  private listeners = new Set<(s: SpeakerState) => void>()
  rate: number
  voice: VoiceChoice

  constructor(parts: string[], voice: VoiceChoice, rate = loadRate()) {
    this.voice = voice
    this.rate = rate
    this.sentencesOf = parts.map((p) => sentences(p, voice.lang))
  }

  get state(): SpeakerState {
    return { status: this.status, part: this.part, parts: this.sentencesOf.length }
  }
  subscribe(fn: (s: SpeakerState) => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  private emit() {
    const s = this.state
    this.listeners.forEach((l) => l(s))
  }

  play() {
    if (this.status === 'ended') {
      this.part = 0
      this.sentence = 0
    }
    this.status = 'playing'
    void this.awake.on()
    this.emit()
    this.speakCurrent()
  }

  pause() {
    if (this.status !== 'playing') return
    this.status = 'paused'
    this.token++
    speechSynthesis.cancel()
    this.awake.off()
    this.emit()
  }

  toggle() {
    if (this.status === 'playing') this.pause()
    else this.play()
  }

  /** Jump to a paragraph (keeps playing if it was playing). */
  goTo(part: number) {
    this.part = Math.max(0, Math.min(part, this.sentencesOf.length - 1))
    this.sentence = 0
    if (this.status === 'playing') {
      this.token++
      speechSynthesis.cancel()
      this.speakCurrent()
    } else {
      if (this.status === 'ended') this.status = 'paused'
      this.emit()
    }
    this.emit()
  }

  setRate(rate: number) {
    this.rate = rate
    saveRate(rate)
    if (this.status === 'playing') {
      this.token++
      speechSynthesis.cancel()
      this.speakCurrent()
    }
    this.emit()
  }

  stop() {
    this.token++
    this.status = 'idle'
    this.part = 0
    this.sentence = 0
    if (speechSupported()) speechSynthesis.cancel()
    this.awake.off()
    this.emit()
  }

  private speakCurrent() {
    // Skip empty paragraphs.
    while (this.part < this.sentencesOf.length && !this.sentencesOf[this.part][this.sentence]) {
      this.part++
      this.sentence = 0
    }
    if (this.part >= this.sentencesOf.length) {
      this.status = 'ended'
      this.part = this.sentencesOf.length - 1
      this.awake.off()
      this.emit()
      return
    }
    const token = ++this.token
    const u = new SpeechSynthesisUtterance(this.sentencesOf[this.part][this.sentence])
    if (this.voice.voice) u.voice = this.voice.voice
    u.lang = BCP47[this.voice.lang]
    u.rate = this.rate
    const next = () => {
      if (token !== this.token || this.status !== 'playing') return
      this.sentence++
      if (this.sentence >= this.sentencesOf[this.part].length) {
        this.part++
        this.sentence = 0
        this.emit()
      }
      this.speakCurrent()
    }
    u.onend = next
    u.onerror = (e) => {
      // "interrupted"/"canceled" come from our own cancel(); anything else: move on rather than get stuck.
      const err = (e as SpeechSynthesisErrorEvent).error
      if (err === 'interrupted' || err === 'canceled') return
      next()
    }
    speechSynthesis.speak(u)
  }
}
