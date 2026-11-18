import { APP_VERSION } from './changelog'
import type { Lang } from './types'

export const SITE = 'https://myspace.victoriza.com'
const REPO = 'https://github.com/victoriza/myspace'

/**
 * Share through the phone's own share sheet (WhatsApp, Messages, mail…).
 * Without one (most desktops), copy the link instead.
 */
export async function shareLink(data: { title: string; text?: string; url: string }): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'shared' // closed the sheet: nothing to say
    }
  }
  try {
    await navigator.clipboard.writeText(data.url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

/** The landing page in the person's language (it has its own preview image and text). */
export const landingUrl = (lang: Lang) => (lang === 'es' ? `${SITE}/` : `${SITE}/${lang}/`)

/** A new GitHub issue with the message already started (no forms, no server). */
export function issueUrl(title: string, body: string, lang: Lang, screen: string): string {
  const footer = `\n\n---\nSpace Feed ${APP_VERSION} · ${lang} · ${screen}`
  return `${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body + footer)}`
}
