import type { Strictness } from './types'

/**
 * Calm filter + politics filter.
 * Everything runs on the phone. Matching ignores case and accents, and respects word boundaries.
 */

// Words and phrases that signal drama, gossip ("salseo") or clickbait — ES / EN / CA.
export const CLICKBAIT: string[] = [
  // English
  "you won't believe", 'you wont believe', 'shocking', 'shocked', 'exposed', 'exposing', 'destroyed', 'destroys',
  'gone wrong', 'drama', 'feud', 'beef', 'meltdown', 'slams', 'slammed', 'cancelled', 'canceled', 'scandal',
  'insane', 'crazy', 'reacts', 'reacting', 'reaction', 'prank', 'the truth about', 'not clickbait', 'breaking',
  'omg', 'wtf', 'rant', 'callout', 'called out', 'responds to', 'humiliated', 'worst ever', 'gone viral', 'leaked',
  'caught on camera', 'must watch', 'what happened next', 'unbelievable', 'clapback', 'roasted', 'controversy',
  'controversial', 'lawsuit', 'snapped', 'gossip',
  // Spanish
  'polemica', 'escandalo', 'brutal', 'zasca', 'humilla', 'humillado', 'destroza', 'destrozado', 'no vas a creer',
  'no creeras', 'la verdad sobre', 'funa', 'funado', 'reaccion', 'reacciono', 'salseo', 'bronca', 'pelea', 'traicion',
  'impactante', 'ultima hora', 'expuesto', 'se acabo', 'lo que paso', 'indignante', 'vergonzoso', 'estalla',
  'cotilleo', 'filtrado', 'carga contra', 'arremete',
  // Catalan
  'polemica', 'escandol', 'increible', 'brutal', 'no et creuras', 'la veritat sobre', 'baralla', 'traicio', 'impactant',
  "ultima hora", 'indignant', 'vergonyos', 'esclata', 'xafarderia', 'xafarderies', 'carrega contra',
]

// Science hype / overclaiming — ES / EN / CA. Strong phrases score like clickbait (2),
// softer signals score 1, so "miracle cure… in mice" adds up and gets dropped.
export const HYPE_STRONG: string[] = [
  'miracle', 'miracle cure', 'changes everything', 'will change the world', 'game changer', 'game-changer', 'revolutionary',
  'cure for all', 'scientists stunned', 'scientists baffled',
  'milagro', 'milagroso', 'milagrosa', 'cura milagrosa', 'cura definitiva', 'lo cambia todo', 'cambia todo', 'cambiara el mundo',
  'revolucionario', 'revolucionaria', 'cientificos atonitos',
  'miracle', 'miraculos', 'cura definitiva', 'ho canvia tot', 'canviara el mon', 'revolucionari', 'revolucionaria',
]
export const HYPE_SOFT: string[] = [
  'in mice', 'in rats', 'cure', 'cures', 'breakthrough', 'groundbreaking', 'historic',
  'en ratones', 'en ratas', 'cura', 'curar', 'historico', 'sin precedentes',
  'en ratolins', 'en rates', 'guarir', 'historic', 'sense precedents',
]
// Pseudoscience — always hidden (the feed is "optimism with evidence").
export const PSEUDO: string[] = ['horoscope', 'astrology', 'horoscopo', 'astrologia', 'horoscop', 'tarot', 'homeopathy', 'homeopatia']

// Politics vocabulary — ES / EN / CA (matched case- and accent-insensitively).
export const POLITICS: string[] = [
  // Spanish
  'politica', 'politico', 'politicos', 'gobierno', 'congreso', 'senado', 'parlamento', 'elecciones', 'electoral',
  'campana electoral', 'ministro', 'ministra', 'presidente del gobierno', 'oposicion', 'moncloa', 'diputado',
  'diputada', 'diputados', 'votacion', 'investidura', 'mocion de censura', 'alcalde', 'alcaldesa', 'partido politico',
  // English
  'politics', 'political', 'politician', 'government', 'parliament', 'senate', 'senator', 'congress', 'congressman',
  'election', 'elections', 'campaign trail', 'prime minister', 'white house', 'republicans', 'democrats', 'trump',
  'biden', 'brexit',
  // Catalan
  'politic', 'politics', 'govern', 'parlament', 'eleccions', 'electoral', 'conseller', 'consellera', 'diputat',
  'diputada', 'generalitat', 'president de la generalitat', 'alcaldessa', 'oposicio',
]

// Party names and acronyms — matched case-sensitively so ordinary words ("sumar", "podemos") don't trigger.
export const PARTIES: string[] = ['PP', 'PSOE', 'Vox', 'VOX', 'Sumar', 'Podemos', 'Junts', 'ERC', 'PNV', 'Bildu', 'EH Bildu', 'CUP', 'Comuns', 'PSC', 'BNG']
// Party names that are also common verbs: ignore them at the very start of a sentence.
const AMBIGUOUS_PARTIES = new Set(['Sumar', 'Podemos'])

export function normalize(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .toLowerCase()
}

const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function wordRx(phrase: string, flags = 'u'): RegExp {
  return new RegExp('(^|[^\\p{L}\\p{N}])' + escapeRx(phrase) + '(?=$|[^\\p{L}\\p{N}])', flags)
}

const CLICKBAIT_RX = [...new Set(CLICKBAIT.map(normalize))].map((p) => [p, wordRx(p)] as const)
const HYPE_STRONG_RX = [...new Set(HYPE_STRONG.map(normalize))].map((p) => [p, wordRx(p)] as const)
const HYPE_SOFT_RX = [...new Set(HYPE_SOFT.map(normalize))].map((p) => [p, wordRx(p)] as const)
const PSEUDO_RX = [...new Set(PSEUDO.map(normalize))].map((p) => [p, wordRx(p)] as const)
const POLITICS_RX = [...new Set(POLITICS.map(normalize))].map((p) => [p, wordRx(p)] as const)
const PARTY_RX = PARTIES.map((p) => [p, new RegExp('(^|[^\\p{L}\\p{N}])' + escapeRx(p) + '(?=$|[^\\p{L}\\p{N}])', 'gu')] as const)

const ALARM_EMOJI = /[\u{1F631}\u{1F92F}\u{1F621}\u{1F92C}\u{1F525}\u{1F534}\u{1F6A8}\u{2757}\u{203C}\u{26A0}\u{1F480}\u{1F633}\u{1F62D}]/gu
const ANY_EMOJI = /\p{Extended_Pictographic}/gu

export interface ScoreResult {
  score: number
  reasons: string[]
  blocked: boolean
}

/** Scores a title (and optional summary) for sensationalism. Higher = more dramatic. */
export function scoreText(title: string, summary = '', blockWords: string[] = []): ScoreResult {
  const reasons: string[] = []
  let score = 0
  const nt = normalize(title)
  const ns = normalize(summary.slice(0, 400))

  for (const w of blockWords) {
    const word = normalize(w.trim())
    if (!word) continue
    const rx = wordRx(word)
    if (rx.test(nt) || rx.test(ns)) return { score: 99, reasons: ['blocked: ' + w.trim()], blocked: true }
  }

  for (const [p, rx] of PSEUDO_RX) {
    if (rx.test(nt)) return { score: 99, reasons: ['pseudoscience: ' + p], blocked: true }
  }

  for (const [p, rx] of HYPE_STRONG_RX) {
    if (rx.test(nt)) {
      score += 2
      reasons.push('hype: ' + p)
    }
  }
  for (const [p, rx] of HYPE_SOFT_RX) {
    if (rx.test(nt)) {
      score += 1
      reasons.push('hype: ' + p)
    }
  }

  for (const [p, rx] of CLICKBAIT_RX) {
    if (rx.test(nt)) {
      score += 2
      reasons.push(p)
    }
  }

  const words = title.match(/\p{L}{3,}/gu) || []
  const caps = words.filter((w) => w === w.toUpperCase() && w !== w.toLowerCase())
  if (words.length >= 3 && caps.length / words.length >= 0.4) {
    score += 2
    reasons.push('ALL CAPS')
  } else if (caps.length >= 2) {
    score += 1
    reasons.push('caps words')
  }

  const bangs = (title.match(/[!¡]/g) || []).length
  if (/[!?¡¿]{2,}/.test(title) || bangs >= 2) {
    score += 1
    reasons.push('!!!')
  }

  if ((title.match(ALARM_EMOJI) || []).length >= 1) {
    score += 1
    reasons.push('alarm emoji')
  }
  if ((title.match(ANY_EMOJI) || []).length >= 3) {
    score += 1
    reasons.push('emoji spam')
  }
  if (/(\.\.\.|…)\s*$/.test(title)) {
    score += 1
    reasons.push('cliffhanger')
  }
  return { score, reasons, blocked: false }
}

export function threshold(s: Strictness): number {
  return s === 'strict' ? 2 : s === 'relaxed' ? 4 : 3
}

export function isCalm(title: string, summary: string, strictness: Strictness, blockWords: string[] = []): boolean {
  const r = scoreText(title, summary, blockWords)
  return !r.blocked && r.score < threshold(strictness)
}

/** True if the text is about politics (parties, elections, governments…). */
export function isPolitical(title: string, summary = ''): boolean {
  const nt = normalize(title)
  const ns = normalize(summary.slice(0, 400))
  for (const [, rx] of POLITICS_RX) {
    if (rx.test(nt) || rx.test(ns)) return true
  }
  const raw = title + ' \n ' + summary.slice(0, 400)
  for (const [p, rx] of PARTY_RX) {
    rx.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = rx.exec(raw))) {
      const start = m.index + m[1].length
      if (AMBIGUOUS_PARTIES.has(p)) {
        const before = raw.slice(0, start).trimEnd()
        if (before === '' || /[.!?¡¿:\n]$/.test(before)) continue
      }
      return true
    }
  }
  return false
}
