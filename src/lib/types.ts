export type Lang = 'es' | 'en' | 'ca'

/** The kinds of content a person can turn on or off in Customize. */
export type ContentType = 'news' | 'video' | 'newsletter' | 'tech' | 'picture'

export const CONTENT_TYPES: ContentType[] = ['news', 'video', 'newsletter', 'tech', 'picture']

/** What a source mostly covers — used to keep each day balanced across subjects. */
export type Topic =
  | 'science' | 'planet' | 'tech' | 'progress' | 'society' | 'culture' | 'nature' | 'solutions' | 'games'
  | 'space' | 'mind' | 'history' | 'art' | 'music' | 'places'

/** Interests, in two groups (shown in onboarding and Customize). Each interest is one topic. */
export const INTEREST_GROUPS: { id: 'world' | 'mind'; interests: Topic[] }[] = [
  { id: 'world', interests: ['progress', 'solutions', 'planet', 'society', 'nature', 'places'] },
  { id: 'mind', interests: ['science', 'space', 'mind', 'history', 'art', 'music', 'culture', 'tech', 'games'] },
]

/** Subjects a person can switch on/off in Customize → Interests. */
export const INTERESTS: Topic[] = INTEREST_GROUPS.flatMap((g) => g.interests)

/** Interests that start off for new people (they switch on what they like). */
export const DEFAULT_TOPICS_OFF: Topic[] = ['places', 'mind', 'history', 'art', 'music', 'culture', 'tech', 'games']

/** Interests that existed before v0.10 (used once to switch new interests off for existing people). */
export const V09_INTERESTS: Topic[] = ['science', 'planet', 'progress', 'society', 'solutions', 'culture', 'tech', 'games']

/**
 * The editorial angle of a source:
 * good = something good happened · progress = something is improving over time (with data) ·
 * solutions = someone found a fix that works.
 */
export type Angle = 'good' | 'progress' | 'solutions'

export type SourceKind = 'rss' | 'youtube' | 'wikipedia' | 'hn'

export interface Source {
  id: string
  name: string
  lang: Lang
  type: ContentType
  kind: SourceKind
  /** RSS/Atom URL (kind 'rss'). */
  url?: string
  /** YouTube channel id (UC…), if known. */
  channelId?: string
  /** YouTube handle (@name), resolved to a channel id on first use. */
  handle?: string
  /** On by default for new users. */
  defaultOn?: boolean
  /** On by default only for people using the app in these languages. */
  defaultOnFor?: Lang[]
  /** Added by the user (not from the suggested list). */
  custom?: boolean
  topic?: Topic
  angle?: Angle
  /** Home page — if the feed URL stops working, the app looks for the feed here. */
  site?: string
  /** Switched on when its topic is switched on in Interests (for topics that start off, like games). */
  onWithTopic?: boolean
  /** Roughly how often it posts. */
  often?: 'daily' | 'few' | 'weekly'
}

export interface FeedItem {
  id: string
  sourceId: string
  sourceName: string
  type: ContentType
  title: string
  link: string
  /** Published time, ms since epoch. */
  date: number
  /** Plain-text summary (short). */
  summary: string
  /** Full article HTML if the feed includes it (unsanitized — sanitize before rendering). */
  content?: string
  image?: string
  author?: string
  videoId?: string
  /** Length in minutes, when the source tells us (videos). */
  minutes?: number
  /** Words of text the feed sent for this item (full description or content, before the summary is cut). */
  words?: number
  /** Exact length in seconds (videos), when known. */
  seconds?: number
  isShort?: boolean
}

export type Strictness = 'relaxed' | 'balanced' | 'strict'

export interface Settings {
  lang: Lang
  onboarded: boolean
  types: Record<ContentType, boolean>
  /** Daily time budget in minutes; the feed is filled up to this estimated reading/watching time. */
  minutesPerDay: 10 | 20 | 30
  strictness: Strictness
  hidePolitics: boolean
  skipShorts: boolean
  blockWords: string[]
  blockedChannels: string[]
  /** Ids of sources the person follows. */
  enabledSources: string[]
  customSources: Source[]
  /** Interests switched off in Customize (their sources are off and their items are left out). */
  topicsOff: Topic[]
  /** Suggested sources the person has already been offered — new suggestions that are on by default get switched on once. */
  knownSources: string[]
  /** Interests the person has already been offered — new ones that start off are switched off once. */
  knownInterests?: Topic[]
  /** Hour of the day when tomorrow's feed opens. */
  openHour: number
}
