import type { Lang, Settings, Source, Topic } from './types'

/**
 * Suggested sources shown on first open and in "Browse suggested".
 * Editorial line: positive and constructive news, science, culture — no politics, no gossip,
 * no sensationalism. Keep this list in sync with `suggested-sources.md` in the project.
 */
export const SUGGESTED_SOURCES: Source[] = [
  // Progress, solutions & good news
  { id: 'positive-news', name: 'Positive News', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.positive.news/feed/', topic: 'society', angle: 'good', defaultOn: true, often: 'daily' },
  { id: 'reasons-cheerful', name: 'Reasons to be Cheerful', lang: 'en', type: 'news', kind: 'rss', url: 'https://reasonstobecheerful.world/feed', topic: 'solutions', angle: 'solutions', defaultOn: true, often: 'few' },
  { id: 'good-news-network', name: 'Good News Network', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.goodnewsnetwork.org/feed/', site: 'https://www.goodnewsnetwork.org/', topic: 'society', angle: 'good', often: 'daily' },
  { id: 'good-good-good', name: 'Good Good Good', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.goodgoodgood.co/articles/rss.xml', site: 'https://www.goodgoodgood.co/articles', topic: 'society', angle: 'good', often: 'daily' },
  { id: 'optimist-daily', name: 'The Optimist Daily', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.optimistdaily.com/feed', topic: 'society', angle: 'good', often: 'daily' },
  { id: 'fix-the-news', name: 'Fix The News', lang: 'en', type: 'newsletter', kind: 'rss', url: 'https://substack.fixthenews.com/feed', topic: 'progress', angle: 'progress', defaultOn: true, often: 'weekly' },
  { id: 'noticias-positivas', name: 'Noticias Positivas', lang: 'es', type: 'newsletter', kind: 'rss', url: 'https://noticiaspositivas.substack.com/feed', topic: 'society', angle: 'good', defaultOn: true, often: 'weekly' },
  { id: 'owid', name: 'Our World in Data', lang: 'en', type: 'news', kind: 'rss', url: 'https://ourworldindata.org/atom-data-insights.xml', topic: 'progress', angle: 'progress', defaultOn: true, often: 'daily' },
  { id: 'en-positivo', name: 'En Positivo', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.enpositivo.com/feed/', site: 'https://www.enpositivo.com/', topic: 'society', angle: 'good', defaultOn: true, often: 'daily' },
  { id: 'hay-luz', name: 'Hay luz al final del túnel', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.hayluzalfinaldeltunel.com/feed/', site: 'https://www.hayluzalfinaldeltunel.com/', topic: 'society', angle: 'good', often: 'daily' },
  { id: 'ethic', name: 'Ethic', lang: 'es', type: 'news', kind: 'rss', url: 'https://ethic.es/feed/', topic: 'planet', angle: 'solutions', defaultOn: true, often: 'daily' },
  { id: 'conversation-es', name: 'The Conversation España', lang: 'es', type: 'news', kind: 'rss', url: 'https://theconversation.com/articles.atom?language=es', topic: 'science', often: 'daily' },

  // Planet
  { id: 'anthropocene', name: 'Anthropocene Magazine', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.anthropocenemagazine.org/feed/', site: 'https://www.anthropocenemagazine.org/', topic: 'planet', angle: 'solutions', defaultOn: true, often: 'daily' },
  { id: 'ecoinventos', name: 'Ecoinventos', lang: 'es', type: 'news', kind: 'rss', url: 'https://ecoinventos.com/feed/', site: 'https://ecoinventos.com/', topic: 'planet', angle: 'solutions', often: 'daily' },
  // Clean-energy progress, but much of it is US policy (the politics filter drops part): never on by itself.
  { id: 'canary-media', name: 'Canary Media', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.canarymedia.com/rss', site: 'https://www.canarymedia.com/', topic: 'planet', angle: 'progress', often: 'daily' },

  // Nature & animals
  { id: 'quanta-biology', name: 'Quanta · Biology', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/biology/feed/', topic: 'nature', often: 'few' },
  { id: 'jane-goodall', name: 'Jane Goodall · Good for All News', lang: 'en', type: 'news', kind: 'rss', url: 'https://news.janegoodall.org/feed/', site: 'https://news.janegoodall.org/', topic: 'nature', angle: 'good', often: 'few' },
  { id: 'hakai', name: 'Hakai Magazine', lang: 'en', type: 'news', kind: 'rss', url: 'https://hakaimagazine.com/feed/', site: 'https://hakaimagazine.com/', topic: 'nature', often: 'few' },

  // Places
  { id: 'atlas-obscura', name: 'Atlas Obscura', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.atlasobscura.com/feeds/latest', site: 'https://www.atlasobscura.com/', topic: 'places', onWithTopic: true, often: 'daily' },

  // Science
  { id: 'sinc', name: 'Agencia SINC', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.agenciasinc.es/feed/Noticias', site: 'https://www.agenciasinc.es/', topic: 'science', defaultOnFor: ['es'], often: 'daily' },
  { id: 'naukas', name: 'Naukas', lang: 'es', type: 'news', kind: 'rss', url: 'https://naukas.com/feed/', site: 'https://naukas.com/', topic: 'science', defaultOnFor: ['es'], often: 'daily' },
  { id: 'cuaderno-cc', name: 'Cuaderno de Cultura Científica', lang: 'es', type: 'news', kind: 'rss', url: 'https://culturacientifica.com/feed/', site: 'https://culturacientifica.com/', topic: 'science', often: 'daily' },
  { id: 'metode', name: 'Revista Mètode', lang: 'ca', type: 'news', kind: 'rss', url: 'https://metode.cat/feed/', site: 'https://metode.cat/', topic: 'science', defaultOnFor: ['ca'], often: 'few' },
  { id: 'ciencia-oberta', name: 'Ciència Oberta', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.cienciaoberta.cat/feed/', site: 'https://www.cienciaoberta.cat/', topic: 'science', defaultOnFor: ['ca'], often: 'few' },
  { id: 'divulcat', name: 'Divulcat', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.enciclopedia.cat/divulcat/rss.xml', site: 'https://www.enciclopedia.cat/divulcat', topic: 'science', defaultOnFor: ['ca'], often: 'few' },
  { id: 'ara-ciencia', name: 'Ara · Ciència', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.ara.cat/rss/category/section/1000024/', site: 'https://www.ara.cat/ciencia-tecnologia/', topic: 'science', defaultOnFor: ['ca'], often: 'daily' },
  { id: 'quanta-physics', name: 'Quanta · Physics', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/physics/feed/', topic: 'science', defaultOn: true, often: 'few' },
  { id: 'quanta-math', name: 'Quanta · Mathematics', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.quantamagazine.org/mathematics/feed/', topic: 'science', often: 'few' },

  // Space
  { id: 'esa', name: 'ESA', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.esa.int/rssfeed/TopNews', site: 'https://www.esa.int/', topic: 'space', defaultOn: true, often: 'daily' },
  { id: 'universe-today', name: 'Universe Today', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.universetoday.com/feed/', site: 'https://www.universetoday.com/', topic: 'space', often: 'daily' },

  // Mind & wellbeing
  { id: 'greater-good', name: 'Greater Good', lang: 'en', type: 'news', kind: 'rss', url: 'https://greatergood.berkeley.edu/site/rss', site: 'https://greatergood.berkeley.edu/', topic: 'mind', onWithTopic: true, often: 'daily' },
  { id: 'psyche', name: 'Psyche', lang: 'en', type: 'news', kind: 'rss', url: 'https://psyche.co/feed', site: 'https://psyche.co/', topic: 'mind', onWithTopic: true, often: 'daily' },

  // History
  { id: 'public-domain-review', name: 'The Public Domain Review', lang: 'en', type: 'news', kind: 'rss', url: 'https://publicdomainreview.org/rss.xml', site: 'https://publicdomainreview.org/', topic: 'history', onWithTopic: true, often: 'weekly' },
  { id: 'smithsonian-history', name: 'Smithsonian · History', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.smithsonianmag.com/rss/history/', site: 'https://www.smithsonianmag.com/history/', topic: 'history', onWithTopic: true, often: 'daily' },
  { id: 'sapiens', name: 'Sàpiens', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.sapiens.cat/rss', site: 'https://www.sapiens.cat/', topic: 'history', onWithTopic: true, often: 'daily' },

  // Art & design
  { id: 'colossal', name: 'Colossal', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.thisiscolossal.com/feed/', site: 'https://www.thisiscolossal.com/', topic: 'art', onWithTopic: true, often: 'daily' },
  { id: 'dezeen', name: 'Dezeen', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.dezeen.com/feed/', site: 'https://www.dezeen.com/', topic: 'art', often: 'daily' },

  // Music
  { id: 'bandcamp-daily', name: 'Bandcamp Daily', lang: 'en', type: 'news', kind: 'rss', url: 'https://daily.bandcamp.com/feed', site: 'https://daily.bandcamp.com/', topic: 'music', onWithTopic: true, often: 'daily' },

  // Culture & ideas
  { id: 'marginalian', name: 'The Marginalian', lang: 'en', type: 'newsletter', kind: 'rss', url: 'https://www.themarginalian.org/feed/', topic: 'culture', onWithTopic: true, often: 'few' },
  { id: 'aeon', name: 'Aeon', lang: 'en', type: 'news', kind: 'rss', url: 'https://aeon.co/feed.rss', site: 'https://aeon.co/', topic: 'culture', often: 'daily' },
  { id: 'nuvol', name: 'Núvol', lang: 'ca', type: 'news', kind: 'rss', url: 'https://www.nuvol.com/feed', site: 'https://www.nuvol.com/', topic: 'culture', onWithTopic: true, often: 'daily' },

  // Pictures of the day
  { id: 'nasa-apod', name: 'NASA APOD', lang: 'en', type: 'picture', kind: 'rss', url: 'https://apod.nasa.gov/apod.rss', topic: 'space', defaultOn: true, often: 'daily' },
  { id: 'nasa-earth', name: 'NASA Earth Observatory', lang: 'en', type: 'picture', kind: 'rss', url: 'https://earthobservatory.nasa.gov/feeds/image-of-the-day.rss', site: 'https://earthobservatory.nasa.gov/', topic: 'planet', defaultOn: true, often: 'daily' },
  { id: 'wikipedia-potd', name: 'Wikipedia', lang: 'es', type: 'picture', kind: 'wikipedia', defaultOn: true, often: 'daily' },

  // Tech
  { id: 'smashing', name: 'Smashing Magazine', lang: 'en', type: 'tech', kind: 'rss', url: 'https://www.smashingmagazine.com/feed/', topic: 'tech', onWithTopic: true, often: 'daily' },
  { id: 'hn', name: 'Hacker News', lang: 'en', type: 'tech', kind: 'hn', topic: 'tech', onWithTopic: true, often: 'daily' },

  // YouTube channels
  { id: 'yt-kurzgesagt', name: 'Kurzgesagt', lang: 'en', type: 'video', kind: 'youtube', channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', topic: 'science', defaultOn: true, often: 'weekly' },
  { id: 'yt-kurzgesagt-es', name: 'En Pocas Palabras', lang: 'es', type: 'video', kind: 'youtube', handle: '@kurzgesagt_es', topic: 'science', defaultOn: true, often: 'weekly' },
  { id: 'yt-3b1b', name: '3Blue1Brown', lang: 'en', type: 'video', kind: 'youtube', channelId: 'UCYO_jab_esuFRV4b17AJtAw', topic: 'science', often: 'weekly' },
  { id: 'yt-curiosamente', name: 'CuriosaMente', lang: 'es', type: 'video', kind: 'youtube', channelId: 'UCX16cLWl6dCjlZMgUBxgGkA', topic: 'science', defaultOn: true, often: 'weekly' },
  { id: 'yt-quantumfracture', name: 'QuantumFracture', lang: 'es', type: 'video', kind: 'youtube', handle: '@QuantumFracture', topic: 'science', often: 'weekly' },
  { id: 'yt-cdeciencia', name: 'CdeCiencia', lang: 'es', type: 'video', kind: 'youtube', handle: '@CdeCiencia', topic: 'science', often: 'weekly' },
  { id: 'yt-dateunvoltio', name: 'Date un Voltio', lang: 'es', type: 'video', kind: 'youtube', handle: '@DateunVoltio', topic: 'science', often: 'weekly' },
  { id: 'yt-minutephysics', name: 'MinutePhysics', lang: 'en', type: 'video', kind: 'youtube', channelId: 'UCUHW94eEFW7hkUMVaZz4eDg', topic: 'science', often: 'weekly' },
  { id: 'yt-teded', name: 'TED-Ed', lang: 'en', type: 'video', kind: 'youtube', channelId: 'UCsooa4yRKGN_zEE8iknghZA', topic: 'culture', onWithTopic: true, often: 'few' },
  { id: 'yt-academiaplay', name: 'Academia Play', lang: 'es', type: 'video', kind: 'youtube', handle: '@AcademiaPlay', topic: 'history', onWithTopic: true, often: 'weekly' },
  { id: 'yt-altozano', name: 'Jaime Altozano', lang: 'es', type: 'video', kind: 'youtube', handle: '@JaimeAltozano', topic: 'music', onWithTopic: true, often: 'weekly' },
  // Videogames — off until "Videojuegos" is switched on in Interests. Craft and culture, not hype.
  { id: 'game-developer', name: 'Game Developer', lang: 'en', type: 'news', kind: 'rss', url: 'https://www.gamedeveloper.com/rss.xml', site: 'https://www.gamedeveloper.com/', topic: 'games', onWithTopic: true, often: 'daily' },
  { id: 'devuego', name: 'DeVuego', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.devuego.es/blog/feed/', site: 'https://www.devuego.es/blog/', topic: 'games', onWithTopic: true, often: 'few' },
  { id: 'anaitgames', name: 'AnaitGames', lang: 'es', type: 'news', kind: 'rss', url: 'https://www.anaitgames.com/feed', site: 'https://www.anaitgames.com/', topic: 'games', onWithTopic: true, often: 'daily' },
  { id: 'yt-gmtk', name: "Game Maker's Toolkit", lang: 'en', type: 'video', kind: 'youtube', channelId: 'UCqJ-Xo29CKyLTjn6z2XwYAw', topic: 'games', onWithTopic: true, often: 'weekly' },
  { id: 'yt-noclip', name: 'Noclip', lang: 'en', type: 'video', kind: 'youtube', handle: '@NoclipDocs', topic: 'games', onWithTopic: true, often: 'weekly' },
  { id: 'yt-dayoscript', name: 'Dayoscript', lang: 'es', type: 'video', kind: 'youtube', handle: '@Dayoscript', topic: 'games', onWithTopic: true, often: 'weekly' },
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

/** A source in this language can be read by someone using the app in `appLang` (English is for everyone; Catalan users read Spanish too). */
export const readableIn = (sourceLang: Lang, appLang: Lang) => sourceLang === 'en' || sourceLang === appLang || (appLang === 'ca' && sourceLang === 'es')

/** Suggested sources that come on when a topic is switched on (its default ones for this language). */
export function sourcesForTopic(topic: Topic, lang: Lang): string[] {
  return SUGGESTED_SOURCES.filter(
    (s) => s.topic === topic && (s.defaultOn || s.defaultOnFor?.includes(lang) || (s.onWithTopic && readableIn(s.lang, lang))),
  ).map((s) => s.id)
}

/** All suggested sources of a topic. */
export const allSourcesOfTopic = (topic: Topic): string[] => SUGGESTED_SOURCES.filter((s) => s.topic === topic).map((s) => s.id)

/** Interest a topic belongs to (since v0.10 every topic is its own interest). */
export const interestOf = (topic: Topic): Topic => topic

/** Topics covered by an interest. */
export const topicsOfInterest = (interest: Topic): Topic[] => [interest]

/** Settings change for switching an interest on or off: its suggested sources come and go with it. */
export function interestPatch(settings: Settings, interest: Topic): Pick<Settings, 'topicsOff' | 'enabledSources'> {
  const off = settings.topicsOff ?? []
  if (off.includes(interest)) {
    const add = sourcesForTopic(interest, settings.lang)
    return { topicsOff: off.filter((x) => x !== interest), enabledSources: [...new Set([...settings.enabledSources, ...add])] }
  }
  const remove = new Set(allSourcesOfTopic(interest))
  return { topicsOff: [...off, interest], enabledSources: settings.enabledSources.filter((id) => !remove.has(id)) }
}

/** Language of an item's text when it differs from the app's (so screen readers pronounce it right). */
export function itemLang(sourceId: string, appLang: Lang): Lang | undefined {
  const s = sourceMeta(sourceId)
  if (!s || s.kind === 'wikipedia' || s.lang === appLang) return undefined
  return s.lang
}
