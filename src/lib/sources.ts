import type { Lang, Source } from './types'

/**
 * Suggested sources shown on first open and in "Browse suggested".
 * Editorial line: positive and constructive news, science, culture — no politics, no gossip,
 * no sensationalism. Keep this list in sync with `suggested-sources.md` in the project.
 */
export const SUGGESTED_SOURCES: Source[] = [
  // Good news, progress & solutions
  { id: 'positive-news', name: 'Positive News', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.positive.news/feed/', topic: 'society', angle: 'good', defaultOn: true },
  { id: 'reasons-cheerful', name: 'Reasons to be Cheerful', lang: 'en', type: 'news', kind: 'rss', url: 'https://reasonstobecheerful.world/feed', topic: 'solutions', angle: 'solutions', defaultOn: true },
  { id: 'good-news-network', name: 'Good News Network', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.goodnewsnetwork.org/feed/', site: 'https://www.goodnewsnetwork.org/', topic: 'society', angle: 'good' },
  { id: 'optimist-daily', name: 'The Optimist Daily', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.optimistdaily.com/feed', topic: 'society', angle: 'good' },
  { id: 'fix-the-news', name: 'Fix The News', lang: 'en', type: 'newsletter', kind: 'rss', url: 'https://substack.fixthenews.com/feed', topic: 'progress', angle: 'progress', defaultOn: true },
  { id: 'noticias-positivas', name: 'Noticias Positivas', lang: 'es', type: 'newsletter', kind: 'rss', url: 'https://noticiaspositivas.substack.com/feed', topic: 'society', angle: 'good', defaultOn: true },
  { id: 'owid', name: 'Our World in Data', lang: 'en', type: 'news', kind: 'rss', url: 'https://ourworldindata.org/atom-data-insights.xml', topic: 'progress', angle: 'progress', defaultOn: true },
  { id: 'en-positivo', name: 'En Positivo', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.enpositivo.com/feed/', site: 'https://www.enpositivo.com/', topic: 'society', angle: 'good', defaultOn: true },
  { id: 'hay-luz', name: 'Hay luz al final del túnel', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.hayluzalfinaldeltunel.com/feed/', site: 'https://www.hayluzalfinaldeltunel.com/', topic: 'society', angle: 'good' },
  { id: 'ethic', name: 'Ethic', lang: 'es', type: 'news', kind: 'rss', url: 'https://ethic.es/feed/', topic: 'planet', angle: 'solutions', defaultOn: true },
  { id: 'conversation-es', name: 'The Conversation España', lang: 'es', type: 'news', kind: 'rss', url: 'https://theconversation.com/articles.atom?language=es', topic: 'science' },

  // Science & nature
  { id: 'sinc', name: 'Agencia SINC', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.agenciasinc.es/feed/Noticias', site: 'https://www.agenciasinc.es/', topic: 'science', defaultOnFor: ['es'] },
  { id: 'metode', name: 'Revista Mètode', lang: 'ca', type: 'news', kind: 'rss', url: 'https://metode.cat/feed/', site: 'https://metode.cat/', topic: 'science', defaultOnFor: ['ca'] },
  { id: 'ciencia-oberta', name: 'Ciència Oberta', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.cienciaoberta.cat/feed/', site: 'https://www.cienciaoberta.cat/', topic: 'science', defaultOnFor: ['ca'] },
  { id: 'ara-ciencia', name: 'Ara · Ciència', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.ara.cat/rss/category/section/1000024/', site: 'https://www.ara.cat/ciencia-tecnologia/', topic: 'science', defaultOnFor: ['ca'] },
  { id: 'quanta-physics', name: 'Quanta · Physics', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/physics/feed/', topic: 'science', defaultOn: true },
  { id: 'quanta-biology', name: 'Quanta · Biology', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/biology/feed/', topic: 'nature' },
  { id: 'nasa-apod', name: 'NASA APOD', lang: 'en', type: 'picture', kind: 'rss', url: 'https://apod.nasa.gov/apod.rss', defaultOn: true },
  { id: 'wikipedia-potd', name: 'Wikipedia', lang: 'es', type: 'picture', kind: 'wikipedia', defaultOn: true },

  // Tech & design
  { id: 'smashing', name: 'Smashing Magazine', lang: 'en', type: 'tech', kind: 'rss', url: 'https://www.smashingmagazine.com/feed/', topic: 'tech' },
  { id: 'hn', name: 'Hacker News', lang: 'en', type: 'tech', kind: 'hn', topic: 'tech' },

  // Culture
  { id: 'marginalian', name: 'The Marginalian', lang: 'en', type: 'newsletter', kind: 'rss', url: 'https://www.themarginalian.org/feed/', topic: 'culture' },

  // YouTube channels
  { id: 'yt-kurzgesagt', name: 'Kurzgesagt', lang: 'en', type: 'video', kind: 'youtube', channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', defaultOn: true },
  { id: 'yt-kurzgesagt-es', name: 'En Pocas Palabras', lang: 'es', type: 'video', kind: 'youtube', handle: '@kurzgesagt_es', defaultOn: true },
  { id: 'yt-3b1b', name: '3Blue1Brown', lang: 'en', type: 'video', kind: 'youtube', handle: '@3blue1brown' },
  { id: 'yt-curiosamente', name: 'CuriosaMente', lang: 'es', type: 'video', kind: 'youtube', handle: '@curiosamente', defaultOn: true },
  { id: 'yt-quantumfracture', name: 'QuantumFracture', lang: 'es', type: 'video', kind: 'youtube', handle: '@QuantumFracture' },
  { id: 'yt-cdeciencia', name: 'CdeCiencia', lang: 'es', type: 'video', kind: 'youtube', handle: '@CdeCiencia' },
  { id: 'yt-teded', name: 'TED-Ed', lang: 'en', type: 'video', kind: 'youtube', handle: '@TEDEd' },
  { id: 'yt-minutephysics', name: 'MinutePhysics', lang: 'en', type: 'video', kind: 'youtube', handle: '@minutephysics' },
]

/**
 * Suggested sources people were already offered in v0.1. Used once to switch on new defaults for existing users.
 * Fix The News is left out on purpose: it became on-by-default in v0.2, so it counts as new.
 */
export const V01_SOURCE_IDS = ['positive-news', 'reasons-cheerful', 'optimist-daily', 'noticias-positivas', 'owid', 'en-positivo', 'hay-luz', 'ethic', 'conversation-es', 'metode', 'ciencia-oberta', 'quanta-physics', 'quanta-biology', 'nasa-apod', 'wikipedia-potd', 'smashing', 'hn', 'marginalian', 'yt-kurzgesagt', 'yt-kurzgesagt-es', 'yt-3b1b', 'yt-curiosamente', 'yt-quantumfracture', 'yt-cdeciencia', 'yt-teded', 'yt-minutephysics']

const BY_ID = new Map(SUGGESTED_SOURCES.map((s) => [s.id, s]))
/** Topic and angle of a suggested source (custom sources have none). */
export const sourceMeta = (id: string): Source | undefined => BY_ID.get(id)

export function defaultEnabledSources(lang?: Lang): string[] {
  return SUGGESTED_SOURCES.filter((s) => s.defaultOn || (lang && s.defaultOnFor?.includes(lang))).map((s) => s.id)
}

export function allSources(custom: Source[]): Source[] {
  return [...SUGGESTED_SOURCES, ...custom]
}
