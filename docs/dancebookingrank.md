# Dance Booking Rank pages — keep these (added 2026-09-29, moved into the site layout the same day)

These are live, published pages. Please keep them whenever you edit, regenerate
or reset files in this repo.

| URL | What it is |
|---|---|
| `/dancebookingrank/<city>-<st>` (e.g. `/dancebookingrank/fort-worth-tx`) | The city's ranked list of dance studios |
| `/dancebookingrank/<city>-<st>/seo-details` | The full SEO / AI-visibility report behind it |

## How they're built (don't remove)

- `content/dancebookingrank/<city>-<st>.json` — one generated file per city: titles,
  hero text, schema, and the two body fragments. **Generated from audit data — don't
  hand-edit; changes are lost on the next refresh.**
- `lib/dancebookingrank.ts` — types, the list of published cities (one import + one
  entry per city) and `getDbrCity()`.
- `app/dancebookingrank/[city]/page.tsx` and `app/dancebookingrank/[city]/seo-details/page.tsx`
  — the two routes; metadata, canonical URLs, static params.
- `components/DanceBookingRank.tsx` — the shared page shell (site hero + breadcrumb,
  body, browse CTA, footer), rendered inside the root layout so the normal SiteNav shows.
- `lib/dancebookingrank-styles.ts` — styles for the fragments, all scoped under `.dbr`.
- `app/sitemap.ts` — `danceBookingRankEntries`, built from the list.

## Where they come from

Don's `dance-market-report` skill, run from his Smoak laptop Cowork session: a
SiteTradeIn site audit of every dance/ballroom studio in a city plus live ChatGPT,
Perplexity and Google AI checks. Expect roughly one new city at a time, as commits
titled `dancebookingrank: <city>` that only add `content/dancebookingrank/<city>-<st>.json`
and one import + list entry in `lib/dancebookingrank.ts`. Pull before you push.

## Things that would wipe them

- Resetting to an older tree, or restoring an older `app/sitemap.ts` over the current one.
  `git_push.bat` does exactly this for `app/sitemap.ts` (backs it up, `git reset --hard
  origin/main`, copies the old file back) — rebase instead, or re-add
  `danceBookingRankEntries` afterwards.
- Deleting "unused-looking" files: `content/`, `components/DanceBookingRank.tsx` or
  `lib/dancebookingrank*.ts`.
- A catch-all route or redirect that claims `/dancebookingrank/...`.
- Re-adding the old static setup (`public/dancebookingrank/` files or the
  `/dancebookingrank/...` rewrites in `next.config.ts`, both removed on 2026-09-29).
  Rewrites run before dynamic routes, so they would send these URLs to files that
  no longer exist and the pages would 404.

## What the pages depend on

The fragments link to each studio's `/studios/<slug>` listing page, the city page
(`/studios/city/<city>`) and use the site chrome from the root layout. If you
rename or remove studio or city URLs, tell Don so the city pages can be regenerated.
They don't call WordPress at request time, so a WP outage doesn't affect them.

Questions: log them on KITT under `bdd-directory`.
