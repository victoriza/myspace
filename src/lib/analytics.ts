import type { BeforeSendEvent } from '@vercel/analytics/react'

/**
 * Vercel Web Analytics: an anonymous, cookie-free visit count.
 * Only the page path is sent (/, /en/, /ca/): everything after # (which article, which screen) is dropped,
 * and so is any query string.
 */
export const privatePath = (event: BeforeSendEvent): BeforeSendEvent => {
  const url = new URL(event.url)
  return { ...event, url: url.origin + url.pathname }
}
