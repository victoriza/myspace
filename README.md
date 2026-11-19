# Space Feed

A calm daily feed — good news, science, culture and calm videos, then it **ends**.
No politics, no gossip, no sensationalism. Spanish, English and Catalan.

Installable web app (PWA): React + Vite + TypeScript, deployed on Vercel.

## How it works

- **Everything runs on the phone**: your sources, the calm and politics filters, picking the daily feed,
  what you've seen, your settings (stored in the browser, never on a server).
- **One tiny server function**, `api/relay.ts`, fetches RSS/Atom feeds for the app (browsers block most
  sites from being read directly). No keys, no database. It always answers as plain text and refuses
  private/internal addresses.
- **No API keys, no logins.** YouTube videos come from each channel's public RSS feed.

### How today's feed is built (`src/lib/feed.ts`)

1. **Collect** the latest items of every source you follow (cached 30 min).
2. **Keep only new** items (recent and not seen before).
3. **Filter**: content types you turned off, politics, drama/clickbait (calm filter), blocked words and channels, Shorts.
4. **Pick** your daily amount (10/20/30), newest first, max 3 per source.
5. **Order**: newest first, never two videos in a row. When everything is seen → "Done for today".

The feed day starts at 07:00 (`openHour` in settings).

## Sources

All suggested sources live in one file: **[`src/lib/sources.ts`](src/lib/sources.ts)** (about 60: news, newsletters, pictures and YouTube channels).
Each entry has its name, language, type, interest (`topic`), angle (good news / progress / solution), feed URL,
home page (`site`, used to find the feed again if the URL breaks), YouTube channel, whether it starts on, and how often it posts.
The one-line description shown when choosing sources is in **[`src/lib/sourceInfo.ts`](src/lib/sourceInfo.ts)** (ES / EN / CA).

Interests (14, in two groups) are in [`src/lib/types.ts`](src/lib/types.ts) (`INTEREST_GROUPS`).
The bar for a new source: calm, evidence-based, a few posts a day at most, and it doesn't end up mostly in "Hidden today".

## Tests

- `npm test` — unit tests (Vitest): feed picking, filters, parsing, sky contrast every 15 minutes, speech helpers.
- `npm run test:e2e` — browser tests (Playwright, phone size, mocked feeds): the home screen in **light and dark mode** at 7:30, 11:00, 15:00, 19:40 and 22:30. Text on the sky is checked by real pixel contrast (WCAG AA), cards and every other screen with axe. First time: `npx playwright install chromium`.

## Project layout

```
api/relay.ts            Vercel function: RSS relay
src/lib/sources.ts      Suggested sources (edit this list)
src/lib/sourceInfo.ts   One-line description per source (ES/EN/CA)
src/lib/filters.ts      Calm + politics filters, ES/EN/CA word lists
src/lib/feed.ts         The 5-step feed pipeline
src/lib/parse.ts        RSS/Atom/YouTube parsing, feed discovery
src/lib/fetchers.ts     Fetching sources (relay, Wikipedia, Hacker News), "Add your own"
src/i18n/{es,en,ca}.ts  All app text
src/screens/            One file per screen
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 — the relay also runs in dev mode
npm test           # filters, feed pipeline and parsing tests
npm run build      # production build in dist/
```

## Deploy on Vercel

1. Push this folder to your GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. It detects Vite automatically; no settings needed.
3. **Settings → Domains → Add** your subdomain (e.g. `feed.yourdomain.com`) and create the CNAME record
   Vercel shows at your DNS provider. HTTPS is automatic.
4. On Android: open the site in Chrome → menu ⋮ → **Install app**.

## Before launch

- Check these feeds on the first deploy (marked ⚠️ in the sources doc): Fix The News, En Positivo,
  Hay luz al final del túnel, and the YouTube handles (`@kurzgesagt_es`, `@3blue1brown`, `@curiosamente`, `@QuantumFracture`).
  The Sources screen shows "Not responding" for any feed that fails.
- Add Catalan sources to `src/lib/sources.ts`.

## Later

Daily email digest (Vercel cron), AI one-line summaries, push reminders after Instagram/TikTok,
YouTube topic search (server key), Google sign-in. See the plan in the project.
