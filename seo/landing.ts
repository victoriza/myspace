/**
 * Google-friendly landing pages, written at build time.
 *
 * The app itself is personal (feed, settings, articles live behind hash routes and are never indexed).
 * What search engines and link previews see is the first screen — why Space Feed exists — as real HTML,
 * in Spanish (/), English (/en/) and Catalan (/ca/), with titles, descriptions, language alternates,
 * a sharing image and structured data. React replaces it as soon as the app starts.
 */
import type { Plugin } from 'vite'
import { ca } from '../src/i18n/ca.ts'
import { en } from '../src/i18n/en.ts'
import { es } from '../src/i18n/es.ts'

export const SITE = 'https://myspace.victoriza.com'
const LINKEDIN = 'https://www.linkedin.com/in/victoriza/'
type Lang = 'es' | 'en' | 'ca'
const T = { es, en, ca }
const PATH: Record<Lang, string> = { es: '/', en: '/en/', ca: '/ca/' }
const LOCALE: Record<Lang, string> = { es: 'es_ES', en: 'en_GB', ca: 'ca_ES' }

const META: Record<Lang, { title: string; description: string; open: string; whatYouGet: string; items: string[] }> = {
  es: {
    title: 'Space Feed · Un feed tranquilo que se acaba',
    description: 'Buenas noticias, ciencia, imágenes y vídeos tranquilos en un feed diario que se termina. Sin política, sin salseo, sin anuncios. Gratis, en español, catalán e inglés.',
    open: 'Abrir Space Feed',
    whatYouGet: 'Qué encontrarás cada día',
    items: ['Buenas noticias, progreso y soluciones', 'Ciencia, imágenes del día y vídeos tranquilos', 'Unos 10, 20 o 30 minutos, y se acaba'],
  },
  en: {
    title: 'Space Feed · A calm feed that ends',
    description: 'Good news, science, pictures and calm videos in a daily feed that ends. No politics, no gossip, no ads. Free, in English, Spanish and Catalan.',
    open: 'Open Space Feed',
    whatYouGet: 'What you’ll find each day',
    items: ['Good news, progress and solutions', 'Science, pictures of the day and calm videos', 'About 10, 20 or 30 minutes, then it ends'],
  },
  ca: {
    title: 'Space Feed · Un feed tranquil que s’acaba',
    description: 'Bones notícies, ciència, imatges i vídeos tranquils en un feed diari que s’acaba. Sense política, sense xafarderies, sense anuncis. Gratis, en català, castellà i anglès.',
    open: 'Obre Space Feed',
    whatYouGet: 'Què hi trobaràs cada dia',
    items: ['Bones notícies, progrés i solucions', 'Ciència, imatges del dia i vídeos tranquils', 'Uns 10, 20 o 30 minuts, i s’acaba'],
  },
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function headFor(lang: Lang): string {
  const m = META[lang]
  const url = SITE + PATH[lang]
  const alternates = (Object.keys(PATH) as Lang[])
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${PATH[l]}" />`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${SITE}/" />`)
    .join('\n    ')
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Space Feed',
    url,
    description: m.description,
    applicationCategory: 'NewsApplication',
    operatingSystem: 'Any (web, Android, iPhone)',
    inLanguage: ['es', 'ca', 'en'],
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    image: `${SITE}/og-image.png`,
    author: { '@type': 'Person', name: 'Victor Suárez', url: LINKEDIN },
  }
  return `<title>${esc(m.title)}</title>
    <meta name="description" content="${esc(m.description)}" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Space Feed" />
    <meta property="og:title" content="${esc(m.title)}" />
    <meta property="og:description" content="${esc(m.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${LOCALE[lang]}" />
    <meta property="og:image" content="${SITE}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Space Feed: un sol que se pone sobre el mar" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(m.title)}" />
    <meta name="twitter:description" content="${esc(m.description)}" />
    <meta name="twitter:image" content="${SITE}/og-image.png" />
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
}

/** The first screen as plain HTML: what Google reads and what shows before the app starts. */
export function bodyFor(lang: Lang): string {
  const t = T[lang]
  const m = META[lang]
  const langs = (Object.keys(PATH) as Lang[])
    .map((l) => `<a href="${PATH[l]}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="page"' : ''}>${{ es: 'Español', ca: 'Català', en: 'English' }[l]}</a>`)
    .join(' · ')
  return `<div id="prerender" class="pre">
      <header class="pre-hero">
        <p class="pre-brand">Space Feed</p>
        <h1>${esc(t.why.title)}</h1>
        <p class="pre-intro">${esc(t.why.intro)}</p>
        <p><a class="pre-cta" href="${PATH[lang]}">${esc(m.open)}</a></p>
      </header>
      <main class="pre-main">
        <ul class="pre-list">
          ${t.why.principles.map(([title, body]) => `<li><strong>${esc(title)}</strong> ${esc(body)}</li>`).join('\n          ')}
        </ul>
        <h2>${esc(m.whatYouGet)}</h2>
        <ul class="pre-list">
          ${m.items.map((i) => `<li>${esc(i)}</li>`).join('\n          ')}
        </ul>
      </main>
      <footer class="pre-foot">
        <p>${esc(t.why.madeBy)} · <a href="${LINKEDIN}" rel="author">LinkedIn</a></p>
        <p>${langs}</p>
      </footer>
    </div>`
}

/** Fills the Spanish page, then writes /en/ and /ca/ copies of the built page. */
export function seoLanding(): Plugin {
  const fill = (html: string, lang: Lang) =>
    html
      .replace(/<html lang="[a-z]+">/, `<html lang="${lang}">`)
      .replace(/<!--seo-head-->[\s\S]*?<!--\/seo-head-->/, `<!--seo-head-->\n    ${headFor(lang)}\n    <!--/seo-head-->`)
      .replace(/<!--seo-body-->[\s\S]*?<!--\/seo-body-->/, `<!--seo-body-->${bodyFor(lang)}<!--/seo-body-->`)
  return {
    name: 'space-feed-seo',
    enforce: 'post',
    transformIndexHtml(html) {
      return fill(html, 'es')
    },
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') return
      const html = String(index.source)
      for (const lang of ['en', 'ca'] as const) {
        this.emitFile({ type: 'asset', fileName: `${lang}/index.html`, source: fill(html, lang) })
      }
    },
  }
}
