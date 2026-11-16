import type { Lang, Source } from './types'

/**
 * Suggested sources shown on first open and in "Browse suggested".
 * Editorial line: positive and constructive news, science, culture — no politics, no gossip,
 * no sensationalism. Keep this list in sync with `suggested-sources.md` in the project.
 */
export const SUGGESTED_SOURCES: Source[] = [
  // Good news & solutions
  { id: 'positive-news', name: 'Positive News', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.positive.news/feed/', defaultOn: true },
  { id: 'reasons-cheerful', name: 'Reasons to be Cheerful', lang: 'en', type: 'news', kind: 'rss', url: 'https://reasonstobecheerful.world/feed', defaultOn: true },
  { id: 'optimist-daily', name: 'The Optimist Daily', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.optimistdaily.com/feed' },
  { id: 'fix-the-news', name: 'Fix The News', lang: 'en', type: 'newsletter', kind: 'rss', url: 'https://substack.fixthenews.com/feed' },
  { id: 'noticias-positivas', name: 'Noticias Positivas', lang: 'es', type: 'newsletter', kind: 'rss', url: 'https://noticiaspositivas.substack.com/feed', defaultOn: true },
  { id: 'owid', name: 'Our World in Data', lang: 'en', type: 'news', kind: 'rss', url: 'https://ourworldindata.org/atom-data-insights.xml', defaultOn: true },
  { id: 'en-positivo', name: 'En Positivo', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.enpositivo.com/feed/', defaultOn: true },
  { id: 'hay-luz', name: 'Hay luz al final del túnel', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.hayluzalfinaldeltunel.com/feed/' },
  { id: 'ethic', name: 'Ethic', lang: 'es', type: 'news', kind: 'rss', url: 'https://ethic.es/feed/', defaultOn: true },
  { id: 'conversation-es', name: 'The Conversation España', lang: 'es', type: 'news', kind: 'rss', url: 'https://theconversation.com/articles.atom?language=es' },

  // Science & nature
  { id: 'metode', name: 'Revista Mètode', lang: 'ca', type: 'news', kind: 'rss', url: 'https://metode.cat/feed/', defaultOnFor: ['ca'] },
  { id: 'ciencia-oberta', name: 'Ciència Oberta', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.cienciaoberta.cat/feed/', defaultOnFor: ['ca'] },
  { id: 'quanta-physics', name: 'Quanta · Physics', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/physics/feed/', defaultOn: true },
  { id: 'quanta-biology', name: 'Quanta · Biology', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/biology/feed/' },
  { id: 'nasa-apod', name: 'NASA APOD', lang: 'en', type: 'picture', kind: 'rss', url: 'https://apod.nasa.gov/apod.rss', defaultOn: true },
  { id: 'wikipedia-potd', name: 'Wikipedia', lang: 'es', type: 'picture', kind: 'wikipedia', defaultOn: true },

  // Tech & design
  { id: 'smashing', name: 'Smashing Magazine', lang: 'en', type: 'tech', kind: 'rss', url: 'https://www.smashingmagazine.com/feed/' },
  { id: 'hn', name: 'Hacker News', lang: 'en', type: 'tech', kind: 'hn' },

  // Culture
  { id: 'marginalian', name: 'The Marginalian', lang: 'en', type: 'newsletter', kind: 'rss', url: 'https://www.themarginalian.org/feed/' },

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

export function defaultEnabledSources(lang?: Lang): string[] {
  return SUGGESTED_SOURCES.filter((s) => s.defaultOn || (lang && s.defaultOnFor?.includes(lang))).map((s) => s.id)
}

export function allSources(custom: Source[]): Source[] {
  return [...SUGGESTED_SOURCES, ...custom]
}
