# Dance Booking Rank pages — keep these (added 2026-09-29)

These are live, published pages. Please keep them whenever you edit, regenerate
or reset files in this repo.

| URL | File |
|---|---|
| `/dancebookingrank/<city>-<st>` (e.g. `/dancebookingrank/fort-worth-tx`) | `public/dancebookingrank/<city>-<st>/index.html` — the city's ranked list of dance studios |
| `/dancebookingrank/<city>-<st>/seo-details` | `public/dancebookingrank/<city>-<st>/seo-details.html` — the full SEO / AI-visibility report behind it |

## What makes them work (don't remove)

- `public/dancebookingrank/**` — one folder per city, two static HTML files each.
  They are complete, self-contained pages (inline CSS, no React, no WordPress).
- `next.config.ts` → `rewrites()`: the two `/dancebookingrank/...` rules that map
  the clean URLs to those files.
- `lib/dancebookingrank.ts` — the list of published cities.
- `app/sitemap.ts` — `danceBookingRankEntries`, built from that list.

## Where they come from

Don's `dance-market-report` skill, run from his Smoak laptop Cowork session:
a SiteTradeIn site audit of every dance/ballroom studio in a city plus live
ChatGPT, Perplexity and Google AI checks, then two pages built from the same data.
Expect roughly one new city at a time, as commits titled `dancebookingrank: <city>`
that only add a new `public/dancebookingrank/<city>-<st>/` folder and one line in
`lib/dancebookingrank.ts`. Pull before you push.

## Things that would wipe them

- Resetting to an older tree, or restoring an older `app/sitemap.ts` / `next.config.ts`
  over the current one. `git_push.bat` does exactly this for `app/sitemap.ts`
  (backs it up, `git reset --hard origin/main`, copies the old file back) — rebase
  instead, or re-add `danceBookingRankEntries` afterwards.
- Adding an `app/dancebookingrank/...` route or a catch-all that claims these paths.
- A cleanup that deletes "unknown" files from `public/`.

## What the pages depend on

They link to `/logo.png`, `/studios`, `/studios/city/<city>`, `/blog` and each studio's
`/studios/<slug>` listing page. If you rename or remove any of those, tell Don so the
city pages can be regenerated. They do not call WordPress, so a WP outage doesn't affect them.

Questions: log them on KITT under `bdd-directory`.
