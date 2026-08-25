# SEO Keyword Research

**Date:** 2026-08-25  
**Method:** Qualitative SERP intent analysis + competitor presence.  
**Important:** No proprietary keyword tool was available in this environment. Rows marked **estimate** are directional priorities, **not** measured volumes.

---

## Legend

- **Intent:** I = informational, N = navigational, C = commercial
- **SERP difficulty:** Low / Medium / High (qualitative vs brand/authority sites)
- **Priority:** P0 (MVP), P1 (post-MVP), P2 (later)

---

## Keyword table

| Keyword | Intent | Country focus | Competition | SERP difficulty | Existing competitors (examples) | Potential landing page | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| football calendar 2027 | I | Global/EN | Medium–High | High | ESPN, FourFourTwo, Flashscore, league sites | `/sports/football/calendar/2027` | P0 |
| football events 2027 | I | Global/EN | Medium | High | ESPN calendars, media roundups | `/sports/football/calendar/2027` | P0 |
| sports events 2027 | I | Global/EN | Low–Med | High | ESPN “calendar of sport”, PredictHQ-ish media | `/` + year hub if dense | P1 |
| tennis tournaments 2027 | I | Global/EN | High | High | ATP/WTA official, ESPN, Tennis.com | `/sports/tennis/calendar/2027` | P0 |
| F1 calendar 2027 | N/I | Global/EN | High | High | Formula1.com, ESPN F1, Sky | `/sports/formula-1/calendar/2027` | P0 |
| Formula 1 calendar 2027 | N/I | Global/EN | High | High | Official F1, major media | `/sports/formula-1/calendar/2027` | P0 |
| UFC events 2027 | I/N | Global/EN | High | High | UFC.com, ESPN MMA schedule, Wikipedia list | `/sports/mma/calendar/2027` + UFC competition | P0 |
| boxing events 2027 | I | Global/EN | Medium | Medium–High | BoxRec, Sky Sports, ESPN | `/sports/boxing/calendar/2027` | P0 |
| sports events Europe 2027 | I | Europe | Medium | Medium | Media listicles, tourism boards | curated `/sports-events/europe/2027` **only if threshold** | P1 |
| sports events Netherlands 2027 | I | NL | Medium | Medium | Local tourism, Flashscore geo | `/countries/netherlands/events/2027` | P0 |
| Champions League calendar 2027 | N/I | Europe | High | High | UEFA.com, Flashscore, Sofascore | `/competitions/uefa-champions-league` | P0 |
| Premier League fixtures 2026/27 | N/I | UK | High | High | PremierLeague.com, ESPN, BBC | competition page + season | P0 |
| UFC London | I/N | UK | High | Medium–High | UFC, ESPN, ticket sites | event page(s) + city London MMA filter landing if dense | P1 |
| Wimbledon 2027 dates | N/I | UK | High | High | Official Wimbledon, BBC | event/competition page | P0 |
| MMA events UK 2027 | I | UK | Medium | Medium | ESPN, local promoters | `/countries/united-kingdom/events/2027` + sport facet SEO only if curated | P1 |
| football events September 2027 | I | Global | Medium | Medium | Flashscore date views | `/sports/football/2027-09` | P0 |
| Eredivisie calendar 2026/27 | N/I | NL | Medium | Medium | Official league, Flashscore | competition page | P0 |
| Grand Slam tennis calendar 2027 | I | Global | High | High | Official tours, ESPN | tennis calendar + majors list | P1 |

---

## SERP patterns observed (qualitative)

1. **Official sites win navigational queries** (F1, UFC, UEFA). Our angle: clean multi-source aggregation + export CTA, not “more official than official”.
2. **Live-score giants dominate fixtures** (Flashscore, Sofascore) with app-oriented UX — weak on **change history / export / B2B**.
3. **Editorial calendars** (ESPN month guides) rank for broad “sports calendar YEAR” — we need structured density + freshness timestamps.
4. **Wikipedia** ranks for lists (UFC events) — we differentiate with structured filters, updates, and provenance.

---

## Landing page → keyword mapping (MVP)

| Landing | Primary keywords |
| --- | --- |
| `/sports/football/calendar/2027` | football calendar 2027, football events 2027 |
| `/sports/tennis/calendar/2027` | tennis tournaments 2027 |
| `/sports/formula-1/calendar/2027` | F1 calendar 2027 |
| `/sports/mma/calendar/2027` | UFC events 2027, MMA events 2027 |
| `/sports/boxing/calendar/2027` | boxing events 2027 |
| `/countries/netherlands/events/2027` | sports events Netherlands 2027 |
| `/competitions/uefa-champions-league` | Champions League calendar / fixtures |
| `/events/[slug]` | long-tail event names |

---

## Content angle that can win (estimate)

For head terms vs ESPN/officials, short-term rank probability is **low**. Realistic MVP SEO wins:

- Long-tail: “boxing events Netherlands 2027”, “F1 sprint weekends 2027 dates”
- Freshness: pages that show **last updated** + **date changes**
- Structured data completeness
- Export CTA differentiation (not a ranking factor directly, but improves engagement)

Re-run research with Search Console + a keyword tool (Ahrefs/Semrush) in month 2 of traffic.

---

## Next research tasks (implementation phase)

1. Connect Google Search Console
2. Import seed queries above
3. Pull real impression data after indexation
4. Replace estimates with measured priority scores
