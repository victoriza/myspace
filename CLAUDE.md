# Agent notes — Space Feed

## Working agreement (from Victor)
- **Propose first, implement after approval.** For any change to the app (features, UI, sources, filters), describe the proposal (what, where it appears, how it behaves, trade-offs) and wait for a go-ahead before writing code. Questions and evaluations: answer only, no changes.
- Once approved: implement, run tests + build, check on mobile sizes (360×740, 390×844, 412×915), commit and push to `main`.
- Keep the project docs (`claude/space-feed-plan.md`, `claude/suggested-sources.md`) in sync with the code.

## Product principles
- A calm, finite daily feed: it ends ("done for today").
- Informed optimism: positive and constructive news with evidence. No politics, no gossip ("salseo"), no sensationalism, no hype.
- Languages: Spanish (default), English, Catalan. Every string goes in `src/i18n/{es,en,ca}.ts`.
- Everything runs on the phone: no API keys, no logins. The only server piece is `api/relay.ts` (CORS relay).
- Subtle UI: small, quiet controls; nothing that pushes the person to stay longer.
- Accessible: landmarks on every screen (header / main / nav), screen changes set the tab title and focus the h1, foreign-language titles carry `lang`, 44 px touch targets, text over the sky picked for WCAG AA contrast (tested every 15 min of the day), layouts wrap at 200% text. Check with axe before releasing.
- Cosy motion: slow, soft, play-once animations (sun and waves language); nothing loops for attention; everything respects "reduce motion".

## Code map
- `src/lib/feed.ts` — daily pipeline: filter (incl. `MIN_WORDS` = 50: news/newsletter/tech items need 50 words of showable text, else hidden as "Muy corto") → pick (time budget, reserve ≥2 pictures and 1–2 videos, per-source/topic caps) → order; also the "Hidden today" list.
- `src/lib/filters.ts` — calm filter (clickbait, hype, game guides, pseudoscience) and politics filter.
- `src/lib/sources.ts` — suggested sources with topic, angle and how often they post; 14 Interests in two groups (`INTEREST_GROUPS` in types.ts) switch topics and their sources (`topicsOff`, `interestPatch`; only Progreso, Soluciones, Planeta, Sociedad, Naturaleza, Ciencia, Espacio start on). `src/lib/sourceInfo.ts` — one line per source in ES/EN/CA (a test checks every source has one).
- `src/lib/parse.ts` — feed parsing; `summaryText` cleans card summaries (drops a leading byline "BY …"/"Por …" and the WordPress "The post … appeared first on …" footer).
- `src/lib/fetchers.ts` — fetching through the relay, feed discovery, YouTube video lengths. YouTube uses the channel's videos-only playlist (`UULF…`, no Shorts) with the channel feed as fallback; suggested channels store their channel ID where verified. A source that fails keeps showing its last good items.
- `api/relay.ts` — same-origin only, rate-limited per IP, 3 MB cap, no private hosts.
- `src/state.tsx` — app state and refresh (offline: builds the day from the cache; cache keeps `okAt` for the Fuentes health line); `src/screens/` — screens (onboarding = Why → Suggested with interests first, then sources; Changelog = Novedades; More = "En tu móvil" (install, YouTube tip) · "Sobre Space Feed" (Why, Rules, Novedades, Quién lo hace = About.tsx) · "Tus datos"; "Añadir una fuente" lives in Personalizar).
- `src/lib/daytime.ts` + `src/components/Cosy.tsx` — time-of-day greeting, living logo, warm palette (`<html data-daypart>`), mini loader, and `Preparing`: the play-once "preparing your feed" scene shown on the Feed after feed-shaping settings change (`feedChanged` in state; `updateSettings(..., { silent: true })` skips it). Evening theme: `<html data-theme="night">` from the same clock as the sky's dark ground (≈20:23–6:36) or the phone's dark mode; set before first paint in index.html. All screens use the CSS variables, so new UI must too.
- `src/components/bits.tsx` — SourceIcon (site favicon or soft letter), Picture (sun-gradient frame, fade-in), video length, `useOnline`, `ShareButton`. `src/lib/share.ts` — share sheet with copy-link fallback, landing URL per language, prefilled GitHub issue links (Quién lo hace → Escríbeme). "Terminar por hoy" at the end of the feed saves the closed day (`sf.closed.v1`); the app opens on Done for the rest of that day. `src/lib/install.ts` — the one-time install card.
- `src/lib/speech.ts` + `src/components/Listen.tsx` — listening with the phone's own voice (Web Speech API): `Speaker` reads parts sentence by sentence (pause = cancel + resume at the sentence), picks the best installed voice for the item's language (Catalan → Spanish fallback, said in the player), rate 0.8–1.2 saved in `sf.listen.v1`, keeps the screen awake while speaking. Reader: "Escuchar · N min" under the title, player portalled to `<body>` above Siguiente (the page transition breaks `position: fixed` inside it), paragraph highlight (`.speaking`). `FeedListen` (v0.12) = "Escuchar el feed de hoy" under the status line: a briefing of the unseen items in the current chip filter — intro in the app language ("Una buena noticia, de Positive News."), title + first sentence in the item's language (parts are `Segment[]` with their own `lang`), videos announced not played, outro "Eso es todo por hoy". An item heard to the end (`onPartDone`) is marked seen; the current card gets `.is-listening` (gold ring + "Escuchando"); player portalled above the bottom nav. Limits: stops when the screen locks / app is backgrounded, no lock-screen controls, must start from a tap.
- Fonts are self-hosted (@fontsource-variable: Inter, Space Grotesk, Source Serif 4); Latin files are precached for offline. Card titles and the reader use the serif.
- `src/lib/sky.ts` + `src/components/Sky.tsx` — the home sky: four looks (dawn, day, sunset, night) blended by the hour, sun arc / moon / stars / clouds, waves on the horizon (measured under the chips in `Feed.tsx`), light text and dark page at night.
- `seo/landing.ts` — build-time landing pages for Google and link previews (`/`, `/en/`, `/ca/` at https://myspace.victoriza.com): titles, descriptions, hreflang, canonical, Open Graph image (`public/og-image.png`), JSON-LD; `public/robots.txt`, `public/sitemap.xml`. Opening `/en/` or `/ca/` starts the app in that language.
- `src/lib/update.ts` + `src/components/Updates.tsx` — new-version notice (service worker in "prompt" mode) and the one-time "What's new" card.
- Tests: `npm test` (Vitest). Build: `npm run build`.

## Releasing a version
1. Bump `version` in `package.json`.
2. Add an entry at the top of `CHANGELOG` in `src/lib/changelog.ts` (2–3 short lines in ES/EN/CA). Its version is what About shows.
3. Push. People see "Nueva versión disponible · Actualizar" on the feed, then the "Novedades" card once.
