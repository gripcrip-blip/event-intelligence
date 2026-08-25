# Competitor Analysis

**Date:** 2026-08-25  
**Scope:** Sports calendars, live-score platforms, sports data APIs, event intelligence.  
**Rule:** Do not copy design or content; use for gap analysis only.

---

## 1. Competitive landscape map

| Archetype | Examples | Primary strength | Weak vs our thesis |
| --- | --- | --- | --- |
| Live scores / fixtures UX | Sofascore, Flashscore | Coverage + speed + apps | Weak export/B2B calendar intelligence; scraping ecosystem |
| Media editorial calendars | ESPN, FourFourTwo, BBC | Authority SEO | Not a normalized multi-source DB; limited export/API |
| Official properties | UEFA, F1, UFC, ATP | Source of truth | Single-sport / single-org |
| Sports data APIs | Sportmonks, API-Sports, SportsDataIO, Sportradar, Opta | Machine feeds | Expensive / restricted redistribution; little public SEO layer |
| Event intelligence | PredictHQ | Demand features, multi-category | Enterprise pricing; not sports-fan SEO calendar |
| Ticketing discovery | Ticketmaster | Inventory + tickets | Not federation-complete; ToS blocks data resale |
| Community DBs | TheSportsDB, Wikipedia/Wikidata | Open-ish access | Quality/SLA limits; resale limits |

---

## 2. Competitor dossiers

### Sofascore

| Dimension | Assessment |
| --- | --- |
| What they do | Live scores, fixtures, stats, player ratings across many sports |
| SEO structure | Sport/league/team/match URLs; strong internationalization |
| Strengths | Mobile apps, coverage breadth, engagement |
| Weaknesses | Not positioned as clean exportable event intelligence; change provenance not a product story |
| Data sources | Proprietary collection / partnerships (not open) |
| Monetization | Ads, premium, B2B odds/widgets historically |
| B2B features | Limited public self-serve calendar export |
| Missing vs us | Canonical cross-source dedupe product + licensed export narrative |

### Flashscore (Arena / Flashscore network)

| Dimension | Assessment |
| --- | --- |
| What they do | Fixtures, live scores, results |
| SEO structure | Deep league/fixture trees |
| Strengths | SEO footprint for “fixtures” queries; speed |
| Weaknesses | UX oriented to scores not intelligence; thin differentiation for exporters |
| Data sources | Closed |
| Monetization | Ads, media network |
| B2B | Not primary public story |
| Missing vs us | Transparent last-updated change log + CSV/API for SMBs |

### ESPN (calendars & schedules)

| Dimension | Assessment |
| --- | --- |
| What they do | Editorial sports calendars, league schedules, UFC schedule pages |
| SEO structure | Story hubs + schedule tools; massive domain authority |
| Strengths | Ranks for “sports calendar YEAR”, trust |
| Weaknesses | Editorial maintenance; not a developer data product |
| Data sources | Rights deals + newsroom |
| Monetization | Ads, subscriptions (Disney bundle), media |
| B2B | Enterprise media, not SMB export |
| Missing vs us | Multi-source normalization + self-serve export |

### Formula1.com / UFC.com / UEFA.com (officials)

| Dimension | Assessment |
| --- | --- |
| What they do | Official calendars and event pages |
| SEO | Own brand queries |
| Strengths | Authoritative dates |
| Weaknesses | Single ecosystem; no cross-sport DB |
| Monetization | Tickets, media, partnerships |
| Missing vs us | Aggregation across sports/countries |

### Sportmonks

| Dimension | Assessment |
| --- | --- |
| What they do | Affordable sports data APIs (football-heavy) |
| SEO | Developer marketing, not consumer calendars |
| Strengths | DX, pricing transparency, storage allowed in-product |
| Weaknesses | Resale of raw data restricted; no consumer SEO layer |
| Monetization | Subscriptions |
| B2B | Core business |
| Missing vs us | Public SEO acquisition engine; cross-sport event intelligence UX |

### API-Sports / API-Football

| Dimension | Assessment |
| --- | --- |
| What they do | Broad cheap sports APIs |
| Strengths | Price, coverage |
| Weaknesses | Terms push responsibility for commercial publishing rights to customer |
| Monetization | Plans via own dashboard / RapidAPI |
| Missing vs us | Trust/licensing clarity + SEO product |

### Sportradar / Stats Perform (Opta)

| Dimension | Assessment |
| --- | --- |
| What they do | Enterprise sports data & betting infrastructure |
| Strengths | Accuracy, latency, rights, global sales |
| Weaknesses | Cost, sales friction; overkill for calendar SEO startups |
| Monetization | Enterprise contracts |
| Missing vs us | Self-serve mid-market + public layer (they don’t need it) |

### SportsDataIO

| Dimension | Assessment |
| --- | --- |
| What they do | US-strong + global sports APIs |
| Strengths | Commercial clarity when contracted |
| Weaknesses | Discovery Lab non-redistributable; sales-led |
| Missing vs us | Europe-first multi-sport SEO calendar |

### PredictHQ

| Dimension | Assessment |
| --- | --- |
| What they do | Real-world event intelligence for demand forecasting |
| Strengths | Ranking/impact features, multi-category, enterprise API |
| Weaknesses | Price; not a free sports calendar for fans |
| Monetization | Subscriptions / enterprise |
| B2B | Core |
| Missing vs us | Transparent sports-native UX + Google SEO free tier |
| Note | Closest **category analogy** for “event intelligence”, different buyer (forecasting vs sports calendar) |

### Ticketmaster Discovery

| Dimension | Assessment |
| --- | --- |
| What they do | On-sale event discovery + ticketing |
| Strengths | Transactional intent |
| Weaknesses | Incomplete sports federation coverage; API ToS hostile to data resale |
| Monetization | Ticket take rate |
| Missing vs us | Full schedule intelligence beyond onsale |

### TheSportsDB

| Dimension | Assessment |
| --- | --- |
| What they do | Community sports DB + API |
| Strengths | Multi-sport, affordable |
| Weaknesses | Quality variance; no API resale |
| Monetization | Premium tiers |
| Missing vs us | Rigorous dedupe/change product + SEO system |

### Wikipedia / Wikidata

| Dimension | Assessment |
| --- | --- |
| What they do | Human-curated encyclopedic lists & structured data |
| Strengths | SEO; open licenses (WD CC0) |
| Weaknesses | Update lag; not an API product UX |
| Missing vs us | Continuous sync, export, alerts, admin QA |

---

## 3. Strategic gaps we can own

1. **Cross-sport canonical calendar** with provenance and change history visible to humans.
2. **Honest licensing** — separate display vs redistributable datasets.
3. **SMB export** (CSV/XLSX) without enterprise procurement.
4. **SEO pages that stay indexable only when dense** — opposite of doorway farms.
5. **Mid-market API** later — between TheSportsDB and Sportradar.

---

## 4. Positioning statement

> We are the clean, continuously updated, multi-source sports **event intelligence** database: searchable on the web, exportable for teams, API-ready for businesses — without pretending we own league rights we don’t.

---

## 5. Anti-goals

- Do not try to beat Sofascore at live in-play UX in MVP.
- Do not claim “official” partnership without contracts.
- Do not compete with PredictHQ on demand ML features until Phase 4+.
