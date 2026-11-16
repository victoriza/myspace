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
- Cosy motion: slow, soft, play-once animations (sun and waves language); nothing loops for attention; everything respects "reduce motion".

## Code map
- `src/lib/feed.ts` — daily pipeline: filter → pick (time budget, ≥2 pictures, per-source/topic/video caps) → order; also the "Hidden today" list.
- `src/lib/filters.ts` — calm filter (clickbait, hype, game guides, pseudoscience) and politics filter.
- `src/lib/sources.ts` — suggested sources with topic and angle; Interests (Customize) switch topics and their sources (`topicsOff`; videogames start off).
- `src/lib/fetchers.ts` — fetching through the relay, feed discovery, YouTube video lengths.
- `api/relay.ts` — same-origin only, rate-limited per IP, 3 MB cap, no private hosts.
- `src/state.tsx` — app state and refresh; `src/screens/` — screens.
- `src/lib/daytime.ts` + `src/components/Cosy.tsx` — time-of-day greeting, living logo, warm palette (`<html data-daypart>`), mini loader.
- `src/lib/sky.ts` + `src/components/Sky.tsx` — the home sky: four looks (dawn, day, sunset, night) blended by the hour, sun arc / moon / stars / clouds, waves on the horizon (measured under the chips in `Feed.tsx`), light text and dark page at night.
- `src/lib/update.ts` + `src/components/Updates.tsx` — new-version notice (service worker in "prompt" mode) and the one-time "What's new" card.
- Tests: `npm test` (Vitest). Build: `npm run build`.

## Releasing a version
1. Bump `version` in `package.json`.
2. Add an entry at the top of `CHANGELOG` in `src/lib/changelog.ts` (2–3 short lines in ES/EN/CA). Its version is what About shows.
3. Push. People see "Nueva versión disponible · Actualizar" on the feed, then the "Novedades" card once.
