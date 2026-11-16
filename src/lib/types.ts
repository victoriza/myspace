export type Lang = 'es' | 'en' | 'ca'

/** The kinds of content a person can turn on or off in Customize. */
export type ContentType = 'news' | 'video' | 'newsletter' | 'tech' | 'picture'

export const CONTENT_TYPES: ContentType[] = ['news', 'video', 'newsletter', 'tech', 'picture']

/** What a source mostly covers — used to keep each day balanced across subjects. */
export type Topic = 'science' | 'planet' | 'tech' | 'progress' | 'society' | 'culture' | 'nature' | 'solutions'

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
  shortcuts: { instagram: boolean; tiktok: boolean }
  /** Suggested sources the person has already been offered — new suggestions that are on by default get switched on once. */
  knownSources: string[]
  /** Hour of the day when tomorrow's feed opens. */
  openHour: number
}
