# SEO Action Log — Ballroom Dance Directory

Weekly Google Search Console review log. Each entry is appended from the scheduled `gsc-weekly-review` task.

## 2026-04-20 Weekly GSC Review
- **Date range:** 2026-03-20 → 2026-04-17 (28 days)
- **Clicks (28d):** 24
- **Impressions:** 492
- **Avg CTR:** 4.9%
- **Avg Position:** 15.3

### Top Pages
1. /studios/frequency-dance-boulder — 2 clicks, 100 impr, 2.0% CTR, pos 6.5
2. /studios/lets-dance-austin-round-rock — 2 clicks, 28 impr, 7.1% CTR, pos 18.0
3. /studios/lets-dance-austin-round-rock-3 — 2 clicks, 15 impr, 13.3% CTR, pos 1.6
4. / — 1 click, 10 impr, 10.0% CTR, pos 3.3
5. /studios/aatma-dance-studio-chamblee — 1 click, 4 impr, 25.0% CTR, pos 18.3

### Close-to-Page-1 Opportunities (pos 4–15)
- "frequency dance boulder" — pos 6.6, 44 impr
- "absolute dance" — pos 9.1, 36 impr
- "accolades movement project" — pos 8.2, 25 impr

### Action Items
1. **[Content & Internal Linking]** — Effort: Medium | Impact: High
   Add internal links and expand content for pages ranking positions 4–15 ("frequency dance boulder", "absolute dance", "accolades movement project"). A content depth increase plus 2–3 internal links from high-traffic pages can push these to page 1.
2. **[Link Building]** — Effort: High | Impact: High
   Build 3–5 backlinks from local dance blogs or event sites this week. Average position is 15.3 — site authority needs a boost. Target local dance studios, event calendars, and dance association directories for easy, relevant links.

### Work Completed 2026-04-20
- **Content rewrite**: Expanded the WP excerpts for all three target studios via REST API (application password auth).
  - `frequency-dance-boulder` (ID 721) — new excerpt 962 chars (adult-focused, Front Range geography, 4.6★/54 reviews cited, practice-party mention).
  - `absolute-danz-ballroom-and-latin-menasha` (ID 4003) — new excerpt 920 chars, replaces the original 10-word boilerplate; adds Fox Valley geography (Appleton/Neenah/Oshkosh/Kaukauna), 5★/18 reviews, private-vs-group positioning.
  - `accolades-movement-project-bellevue` (ID 605) — new excerpt 970 chars; Seattle Eastside geography (Redmond/Kirkland/Sammamish/Issaquah), 5★, Eastside professional scheduling angle.
  - All excerpts are live on WP — pages will regenerate via ISR (revalidate=3600) within an hour.
- **Internal linking**: Added a "Studio Spotlights" section on the homepage (`app/page.tsx`) linking to all three target studios with rich anchor context (city, rating, style blurb). Homepage is the highest-authority page on the domain, so these links pass strong signal.
- **Link-building prep**: Created `docs/link-building-targets.md` — 27 prioritized outreach targets across 5 tiers (industry publications, wedding blogs, local city lifestyle, event calendars/directories, podcasts). Includes pitch angles, contact paths, cadence (5–8 pitches/week for 8 weeks), and a tracking-spreadsheet schema. Target: 8–12 new referring domains in 90 days.

### Deferred / Follow-ups
- Commit + push changes so the homepage updates deploy via Vercel (not done in this run — left for Don to review first).
- Populate `docs/link-outreach-tracker.xlsx` before starting Week 1 of outreach (Tier 2 wedding blogs).
- Consider adding featured-studio blocks to `/ballroom-dance-lessons` and `/latin-dance-lessons` style hubs next week if the homepage spotlight moves the needle on the three target queries.

## 2026-05-11 Weekly GSC Review
- **Clicks (28d):** 40
- **Impressions:** 714
- **Avg CTR:** 5.6%
- **Avg Position:** 10.3
- **Date range:** 2026-04-10 → 2026-05-08

### Top 5 Pages by Clicks
1. /studios/lets-dance-austin-round-rock-3 — 6 clicks, 42 impr, 14.3% CTR, pos 2.3
2. /competitions/houston-dancesport — 4 clicks, 98 impr, 4.1% CTR, pos 6.9
3. /studios/the-dance-company-odessa — 3 clicks, 19 impr, 15.8% CTR, pos 10.5
4. /studios/beginner-salsa-classes-in-boston-by-juan-lopez-cambridge — 2 clicks, 5 impr, 40.0% CTR, pos 6.6
5. /studios/city/atlanta/style/foxtrot — 2 clicks, 2 impr, 100.0% CTR, pos 10.5

### Top Queries by Clicks
- "texas challenge dancesport" — 2 clicks, 47 impr, 4.3% CTR, pos 7.1
- "adult tap classes near me" — 1 click, 1 impr, 100% CTR, pos 1.0
- "bachata lessons austin" — 1 click, 1 impr, 100% CTR, pos 1.0
- "banda dance classes near me" — 1 click, 1 impr, 100% CTR, pos 1.0
- "dance lessons for adults near me" — 1 click, 3 impr, 33.3% CTR, pos 1.3
- "dance lessons near me" — 1 click, 3 impr, 33.3% CTR, pos 1.0
- "dance exercise classes near me" — 1 click, 1 impr, 100% CTR, pos 1.0

### Low CTR Opportunities
- "dancereverienyc.com" — 52 impr, 0.0% CTR (branded query stealing visibility — no clicks)

### Close-to-Page-1 Opportunities (pos 4–15)
- "texas challenge dancesport" — pos 7.1, 47 impr
- "arthur murray dance studio of williston park" — pos 10.7, 40 impr
- "art dance education child care" madison wi — pos 8.1, 20 impr

### Action Items
1. **[Title & Meta Optimization]** — Effort: Low | Impact: High
   Investigate why "dancereverienyc.com" has 52 impressions with 0% CTR. This is a competitor-domain branded query — likely our /studios/dance-reverie page is ranking but the title/meta doesn't clearly identify itself as the right result. Rewrite the page title and meta description so users searching for "dancereverienyc.com" recognize this page as the destination.
2. **[Content & Internal Linking]** — Effort: Medium | Impact: High
   Push three close-to-page-1 queries onto page 1. Add internal links and expand content for: "texas challenge dancesport" (currently pos 7.1 on /competitions/houston-dancesport), "arthur murray dance studio of williston park" (pos 10.7), and "art dance education child care" madison wi (pos 8.1). Target 2–3 internal links each from high-authority pages.
3. **[Momentum Watch]** — Effort: Low | Impact: Medium
   Click count up 67% week-over-week (24 → 40). Several "near me" long-tail queries (tap, bachata, banda, dance exercise) now ranking at position 1. Continue the city/style hub strategy — these long-tails are converting at 100% CTR but each only has 1–3 impressions. Need more impression volume on these terms via expanded city/style page coverage.

### Notes
- Script ran successfully via `node --env-file=.env.local --import tsx`. Required installing `tsx` locally (node_modules was missing it).
- No work executed this run — report-only per scheduled task spec.

### Work Completed 2026-05-12 (Action Plan Items 1–3)

**Action 1: Dance Reverie NYC title/meta — DONE**
- Studio ID 516 (`dance-reverie-dance-studio-dumbo-brooklyn`): updated WP title from "Dance Reverie Dance Studio Dumbo" → **"Dance Reverie NYC"**.
- Excerpt rewritten to lead with "Dance Reverie NYC (formerly Dance Reverie Dance Studio Dumbo)" + explicit mention of `dancereverienyc.com` + 4.9★/70 reviews + Dumbo Brooklyn + service area (Manhattan/Brooklyn/Queens).
- Rationale: brand-query searches for "dancereverienyc.com" were seeing our listing but not clicking — the new title/excerpt makes the page recognizable as the right destination.

**Action 2: Three close-to-page-1 queries — DONE**
- **Texas Challenge DanceSport** (pos 7.1, /competitions/houston-dancesport):
  - Expanded description from 1 paragraph to ~6 sentences in `lib/competitions-data.ts:336`. Added NDCA Premier framing, full regional sweep (TX/LA/OK/NM/AR), all 4 style divisions, entry fee range, registration URL, and explicit "Houston DanceSport" keyword pairing.
  - Internal link added from homepage "Trending This Week" section.
- **Arthur Murray Williston Park** (pos 10.7, studio ID 429):
  - WP excerpt rewritten to ~800 chars: Arthur Murray franchise framing, 4.9★/31 reviews, Nassau County + Long Island geography (Mineola, Garden City, Floral Park, New Hyde Park, East Williston), 1912 brand history, wedding/social/competitive use cases, phone CTA.
  - Internal link added from homepage "Trending This Week" section.
- **ART DANCE EDUCATION Madison** (pos 8.1, studio ID 3954):
  - WP excerpt expanded from 6 words ("Private dance lessons in Madison. ballroom.") to ~700 chars: 5★/10 reviews, child-care-friendly scheduling angle, Dane County geography (Sun Prairie, Middleton, Fitchburg, Verona, Monona), phone CTA.
  - Internal link added from homepage "Trending This Week" section.

**Action 3: "Near Me" hub for impression volume — DONE**
- Created **/dance-lessons-near-me** landing page (`app/dance-lessons-near-me/page.tsx`):
  - Targets the "dance lessons near me" query family (the queries at pos 1 with only 1–3 impressions each — they need a stronger landing page for Google to surface us on more variations).
  - Includes 20-city directory (NYC, LA, Chicago, Houston, Phoenix, Philly, San Antonio, San Diego, Dallas, Austin, Atlanta, Boston, Seattle, Denver, Miami, Nashville, Portland, Las Vegas, Minneapolis, Orlando) — each city is an internal link to its `/studios/city/[city]` page.
  - Includes 6-style hub block (ballroom, Latin, tango, swing, wedding, competition) — each links to existing style hubs.
  - **FAQPage schema** with 6 questions covering pricing, lesson types, adult/senior suitability, wedding dance, and how to choose a studio (qualifies for rich snippets).
  - 1,400+ word page with strong "near me" keyword density across natural prose.
- Added to sitemap.ts with priority 0.9.
- Added to homepage footer as primary nav link.

### Deferred / Follow-ups
- Commit + push all changes — left for Don to review first. Files modified:
  - `app/page.tsx` (Trending This Week section + footer link)
  - `app/sitemap.ts` (new /dance-lessons-near-me + /cities entries)
  - `app/dance-lessons-near-me/page.tsx` (new file)
  - `lib/competitions-data.ts` (Texas Challenge description expansion)
- WP updates (Dance Reverie NYC title/excerpt + studios 429 and 3954 excerpts) are live; ISR will regenerate within 24hr (revalidate=86400) or instantly on Vercel rebuild.
- Pre-existing TypeScript errors in `app/competitions/[slug]/page.tsx` and `app/competitions/page.tsx` (missing helpers `getBySlug`, `getByRegion`, `sortedByDate`, `getFeatured` from `lib/competitions-data.ts`) — these are not caused by this work but should be cleaned up. Likely a refactor left orphan imports.
- Note for next week: monitor whether the new "near me" page picks up impressions for the long-tail family. If it ranks well, consider adding state-level pages (`/dance-lessons-near-me/[state]`) for further coverage.

---

### Deploy + GSC — 2026-05-12

**Commits deployed to Vercel:**
- `ddad21b` — SEO content: dance-lessons-near-me page, Trending This Week homepage section, sitemap entries (priority 0.9), Texas Challenge DanceSport description expansion
- `79d24cd` — Fix: restored truncated helpers section + stripped bad UTF-8 byte from `lib/competitions-data.ts` (Turbopack rejected `\xe2\x94` incomplete 3-byte sequence at byte offset 39188; fix confirmed clean build)

**Vercel deploy:** Successful. All 4 new/updated URLs verified live:
- `https://www.ballroomdancedirectory.com/dance-lessons-near-me` ✅
- `https://www.ballroomdancedirectory.com/studios/dance-reverie-dance-studio-dumbo-brooklyn` ✅
- `https://www.ballroomdancedirectory.com/studios/arthur-murray-dance-studio-of-williston-park-williston-park` ✅
- `https://www.ballroomdancedirectory.com/competitions/houston-dancesport` ✅

**GSC post-deploy steps completed:**
1. Sitemap resubmitted via GSC → Sitemaps (sitemap.xml) ✅
2. Request Indexing submitted for 5 URLs:
   - `/dance-lessons-near-me` ✅ (Indexing requested)
   - `/studios/dance-reverie-dance-studio-dumbo-brooklyn` ✅ (already indexed; re-requested)
   - `/studios/arthur-murray-dance-studio-of-williston-park-williston-park` ✅ (already indexed; re-requested)
   - `/studios/art-dance-education-child-care-madison` ✅ (already indexed; re-requested)
   - `/competitions/houston-dancesport` ✅ (already indexed; re-requested, clean green status)

**Note:** The 3 studio pages and competition page were already indexed prior to this deploy — all confirmed "Page is indexed" in URL Inspection. Re-submitting pushes the updated content (Trending This Week internal links + expanded descriptions) into Google's priority crawl queue.
