export type Lang = 'es' | 'en' | 'ca'

/** The kinds of content a person can turn on or off in Customize. */
export type ContentType = 'news' | 'video' | 'newsletter' | 'tech' | 'picture'

export const CONTENT_TYPES: ContentType[] = ['news', 'video', 'newsletter', 'tech', 'picture']

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
  /** Added by the user (not from the suggested list). */
  custom?: boolean
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
  isShort?: boolean
}

export type Strictness = 'relaxed' | 'balanced' | 'strict'

export interface Settings {
  lang: Lang
  onboarded: boolean
  types: Record<ContentType, boolean>
  perDay: 10 | 20 | 30
  strictness: Strictness
  hidePolitics: boolean
  skipShorts: boolean
  blockWords: string[]
  blockedChannels: string[]
  /** Ids of sources the person follows. */
  enabledSources: string[]
  customSources: Source[]
  shortcuts: { instagram: boolean; tiktok: boolean }
  /** Hour of the day when tomorrow's feed opens. */
  openHour: number
}
