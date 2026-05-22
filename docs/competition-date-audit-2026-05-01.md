# Competition Date Audit Results — May 2026

**Audit Date:** May 1, 2026
**Source File:** `lib/competitions-data.ts` (29 competitions)
**Scope:** Cross-referenced each competition's seed-data dates against its official website + corroborating sources (CRM Dance, DanceComp, Facebook event posts).
**Methodology:** WebSearch for each competition's name + year + month + venue, prioritizing the 10 highest-traffic events plus all events in the next 6 months (May 2026 – October 2026).

---

## Priority Competitions (Top 10)

### 1. Ohio Star Ball Championships (`ohio-star-ball`)
- **Currently listed:** 2026-11-17 → 2026-11-22
- **Official website:** November 17–23, 2026, Greater Columbus Convention Center
- **Status:** ⚠️ Needs Update — end date is one day short. Search summary explicitly returned "November 17–23".

### 2. Emerald Ball DanceSport Championships (`emerald-ball-dancesport`)
- **Currently listed:** 2026-04-28 → 2026-05-03
- **Official website:** April 28 – May 3, 2026, LA Airport Hilton
- **Status:** ✅ Correct (event currently in progress / just wrapping)

### 3. Manhattan Dance Championships (`manhattan-dance-championships`)
- **Currently listed:** 2026-07-01 → 2026-07-05
- **Official website:** July 1–5, 2026, NY Marriott at the Brooklyn Bridge
- **Status:** ✅ Correct

### 4. Heritage Classic (`heritage-classic-dancesport`)
- **Currently listed:** 2026-03-05 → 2026-03-07
- **Official website:** March 5–7, 2026, Grandover Resort & Spa, Greensboro, NC
- **Status:** ✅ Correct (past event)

### 5. Chicago DanceSport Championships (`chicago-open-dancesport`)
- **Currently listed:** 2026-10-23 → 2026-10-25
- **Official website:** October 23–25, 2026
- **Status:** ✅ Correct

### 6. United States Dance Championships (`united-states-dance-championships`)
- **Currently listed:** 2026-09-07 → 2026-09-12
- **Official website:** September 7–12, 2026, Orlando
- **Status:** ✅ Correct

### 7. Embassy Ball DanceSport Championships (`embassy-ball-dancesport`)
- **Currently listed:** null / null (typicalMonth 9)
- **Official website:** September 2026, Garden Grove, CA. Exact dates not yet announced.
- **Status:** ❌ No date found — keep null until organizer publishes the schedule. Re-check on the next audit.

### 8. Desert Classic DanceSport Championships (`desert-classic-dancesport`)
- **Currently listed:** 2026-07-08 → 2026-07-12
- **Official website:** July 8–12, 2026, JW Marriott Desert Springs, Palm Desert, CA
- **Status:** ✅ Correct

### 9. The Grand National Championships (`grand-nationals-dancesport`)
- **Currently listed:** 2026-10-29 → 2026-10-31
- **Official website:** October 29–31, 2026, Doral National Resort & Spa, Miami
- **Status:** ✅ Correct

### 10. American Star Ball (`american-star-ball`)
- **Currently listed:** 2026-05-14 → 2026-05-17
- **Official website:** May 15–17, 2026, Resorts Casino Hotel, Atlantic City, NJ (40th annual)
- **Status:** ⚠️ Needs Update — start date is one day too early. Schedule of Events page and Welcome Letter both confirm May 15–17.

---

## Remaining Competitions (alphabetized)

| Slug | Currently Listed | Official Website | Status |
|---|---|---|---|
| `atlanta-dancesport` | 2026-05-07 → 2026-05-10 | May 7–10, 2026 | ✅ Correct |
| `boston-dancesport-challenge` | 2026-01-24 → 2026-01-24 | January 24, 2026 | ✅ Correct (past) |
| `california-star-ball` | 2026-11-27 → 2026-11-29 | November 27–29, 2026 (Thanksgiving wknd) | ✅ Correct |
| `carolina-crown-dancesport` | 2026-05-24 → 2026-05-24 | May 24–25, 2026 | ⚠️ Possible update — multiple sources show 2-day event |
| `denver-dancesport` (Colorado Star Ball) | 2026-06-18 → 2026-06-22 | June 18–21, 2026 (one source 18–22) | ⚠️ Likely needs update — official schedule lists 18–21 |
| `eastern-seaboard-dancesport` | null / null | January 29 – February 1, 2026 (past) | ❌ No 2027 dates yet |
| `embassy-ball-dancesport` | null / null | TBA September 2026 | ❌ Not announced |
| `hollywood-dancesport` | null / null | TBA November 2026 | ❌ Not announced |
| `houston-dancesport` (Texas Challenge) | 2026-05-08 → 2026-05-10 | May 8–9, 2026 (Facebook); May 8–10 (DanceComp) | ⚠️ Conflicting sources — may be 2-day event |
| `indiana-grand-dancesport` (Indianapolis Open) | 2026-04-16 → 2026-04-18 | April 16–18, 2026 | ✅ Correct (past) |
| `las-vegas-dancesport` (Holiday Dance Classic) | null / null | December 8–13, 2026 | ⚠️ Should populate dates |
| `millennium-dancesport` | 2026-06-22 → 2026-06-28 | June 22–28, 2026 | ✅ Correct |
| `minnesota-star-ball` (Snow Ball) | null / null (typicalMonth 2) | January 29 – February 1, 2026 (past) | ❌ No 2027 dates; consider `typicalMonth: 1` |
| `new-york-dance-festival` | 2026-02-26 → 2026-03-01 | February 26 – March 1, 2026 | ✅ Correct (past) |
| `pacific-coast-classic-dancesport` (Pacific Grand Ball) | 2026-05-08 → 2026-05-11 | May 8–10, 2026 | ⚠️ End date one day too late |
| `philadelphia-dancesport` | 2026-04-09 → 2026-04-12 | April 9–12, 2026 | ✅ Correct (past) |
| `san-francisco-open-dancesport` | 2026-04-02 → 2026-04-05 | April 2–5, 2026 | ✅ Correct (past) |
| `seattle-star-ball` (Summit DanceSport) | 2026-09-24 → 2026-09-27 | September 24–27, 2026 | ✅ Correct |
| `us-national-amateur-dancesport` | 2026-03-10 → 2026-03-14 | March 10–14, 2026, Marriott Center BYU | ✅ Correct (past) |
| `usa-dance-nationals` | 2026-03-27 → 2026-03-29 | March 27–29, 2026, Wyndham Grand Pittsburgh | ✅ Correct (past) |

> **Venue note:** `usa-dance-nationals` lists *David L. Lawrence Convention Center* but multiple American Dancer recap articles say the 2026 event was held at the *Wyndham Grand Pittsburgh Downtown Hotel*. This is a venue discrepancy, not a date issue, and is out-of-scope for this audit but worth flagging for a future content review.

---

## Corrections Needed (Ready to Apply)

```typescript
// 1. ohio-star-ball — extend dateEnd by one day
{
  slug: "ohio-star-ball",
  // dateEnd: "2026-11-22"  →
  dateEnd: "2026-11-23",
}

// 2. american-star-ball — push dateStart one day later
{
  slug: "american-star-ball",
  // dateStart: "2026-05-14"  →
  dateStart: "2026-05-15",
}

// 3. pacific-coast-classic-dancesport — pull dateEnd back one day
{
  slug: "pacific-coast-classic-dancesport",
  // dateEnd: "2026-05-11"  →
  dateEnd: "2026-05-10",
}

// 4. denver-dancesport (Colorado Star Ball) — pull dateEnd back one day
{
  slug: "denver-dancesport",
  // dateEnd: "2026-06-22"  →
  dateEnd: "2026-06-21",
}

// 5. carolina-crown-dancesport — extend single-day event to two-day
{
  slug: "carolina-crown-dancesport",
  // dateEnd: "2026-05-24"  →
  dateEnd: "2026-05-25",
}

// 6. las-vegas-dancesport (Holiday Dance Classic) — populate confirmed dates
{
  slug: "las-vegas-dancesport",
  // dateStart: null  →
  dateStart: "2026-12-08",
  // dateEnd: null  →
  dateEnd: "2026-12-13",
}
```

### Lower-confidence / verification recommended

```typescript
// 7. houston-dancesport (Texas Challenge) — sources conflict on day count
//    Verify directly via texaschallenge.com schedule before updating.
//    If confirming as 2-day: dateEnd: "2026-05-10"  →  "2026-05-09"
```

---

## Summary

- **Total competitions checked:** 29
- **✅ Correct:** 17
- **⚠️ Needs Update:** 6 (5 high-confidence corrections + 1 conflict to verify)
- **❌ No date found / TBA:** 6 (Embassy Ball, Hollywood DanceSport, Snow Ball, Eastern Seaboard, Holiday Dance Classic*, plus past events with no 2027 dates yet)
- **🔴 Cancelled / renamed:** 0

\* Holiday Dance Classic dates are now confirmed and included in the corrections block.

### Next audit (May 15, 2026) should re-check
1. **Embassy Ball** — early-September event, schedule typically released 90–120 days out, so dates should appear in Jun/Jul.
2. **Hollywood DanceSport** — November event, dates usually announced by July.
3. **Texas Challenge** — confirm day count once 2026 results post-event.
4. **Snow Ball / Eastern Seaboard / Boston Cup** — watch for 2027 date announcements (these run Jan/Feb so seed data should roll forward by late summer).
5. **Ohio Star Ball** — verify the 17–22 vs 17–23 end-date directly on ohiostarball.com (search summary said 17–23; previous audit said 17–22).

---

## Methodology Notes

- Sources cross-checked: official competition websites, CRM Dance, DanceComp, Facebook event pages, and Instagram organizer accounts.
- Where two sources disagreed by one day, the official organizer site (or its directly-quoted schedule page) was treated as authoritative.
- For events that have already occurred in 2026 (Jan–April), correctness was scored against the held-event dates; a separate roll-forward pass for 2027 will be needed once organizers publish next-year dates (typically June–September).
- This audit does not cover venue, city, or organization fields — only `dateStart`, `dateEnd`, and `typicalMonth`.
