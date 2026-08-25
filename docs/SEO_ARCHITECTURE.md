# SEO Architecture

**Goal:** Organic Google traffic for real sports calendar intents — without doorway pages, thin AI content, or index bloat.

---

## 1. Search intent clusters

| Cluster | Intent | Example queries | Page type |
| --- | --- | --- | --- |
| Sport year calendar | Informational / navigational | football calendar 2027 | `/sports/{sport}/calendar/{year}` |
| Sport month | Informational | tennis September 2027 | `/sports/{sport}/{month}` or `/months/{y}/{m}` + sport link |
| Competition | Navigational | UEFA Champions League fixtures | `/competitions/{slug}` |
| Event | Navigational | UCL Final 2027 | `/events/{slug}` |
| Geo year | Informational | sports events Netherlands 2027 | `/countries/{country}/events/{year}` |
| Multi-sport year | Informational | sports events Europe 2027 | curated hub (only if dense) |
| Combat schedule | Informational | UFC events 2027 | sport calendar + competition |

Do **not** invent search volumes. See `SEO_KEYWORD_RESEARCH.md` for qualitative priority (estimates labeled as estimates).

---

## 2. URL architecture (indexable)

| Path | Purpose | Index rule |
| --- | --- | --- |
| `/` | Hub | index |
| `/events` | Browse default upcoming | index if rich; else thin → improve |
| `/events/[slug]` | Canonical event | index if quality ≥ threshold |
| `/sports` | Sport directory | index |
| `/sports/[sport]` | Sport hub | index |
| `/sports/[sport]/calendar/[year]` | Year calendar | index iff `event_count ≥ MIN` |
| `/sports/[sport]/[month]` | Month within sport | index iff threshold (month slug `2027-09` or `september` + year param canonicalized) |
| `/competitions` | Directory | index |
| `/competitions/[slug]` | Competition | index |
| `/countries` | Directory | index |
| `/countries/[country]` | Country hub | index |
| `/countries/[country]/events/[year]` | Country year | index iff threshold |
| `/cities` | Directory (top cities only) | index selective |
| `/cities/[city]` | City hub | index iff threshold |
| `/cities/[city]/events/[year]` | City year | index iff threshold |
| `/months/[year]/[month]` | Cross-sport month | index iff threshold |

**Canonical month format:** `/months/2027/09` (zero-padded). Sport-month may redirect/canonicalize to avoid duplicates.

### Non-indexable filter URLs

`/events?sport=football&country=de&status=CONFIRMED&from=...`

- `robots`: allow crawl of `/events` base
- meta `noindex,follow` on any page where `searchParams` contain facet combos beyond allowlist
- Allowlist example: none on `/events` (all query variants noindex) OR only `?page=`

**Never** generate `/sports/football/monday/2028/city-x` style URLs.

---

## 3. Programmable SEO + thresholds

Config (`seo.config.ts`):

```
MIN_EVENTS_SPORT_YEAR = 8
MIN_EVENTS_SPORT_MONTH = 5
MIN_EVENTS_COUNTRY_YEAR = 5
MIN_EVENTS_CITY_YEAR = 5
MIN_EVENTS_CROSS_MONTH = 8
MIN_INTERNAL_LINKS = 3
REQUIRE_UNIQUE_INTRO = true
```

Job `seo-audit`:

- Count qualifying public events (status not CANCELLED unless historical page)
- Check unique title/H1/intro template filled with real stats
- Check breadcrumbs + internal links
- Set `seo_pages.is_indexable` + `noindex_reason`
- Sitemap includes only indexable paths

If below threshold: render page for users with `noindex,follow` **or** return 404 for empty city years (prefer 404 for zero events; noindex for 1–threshold-1).

---

## 4. On-page template (landing)

Each indexable landing includes:

1. Unique `<title>` + meta description (templated, factual)
2. Single H1 matching intent
3. Short useful intro (2–5 sentences, **data-driven**, not AI essay)
4. Last updated timestamp
5. Event table/calendar (SSR)
6. Filters (client enhance; core list SSR)
7. Related competitions / countries / months
8. Source / methodology note
9. FAQ **only** if answers are factual and unique (e.g. “How many F1 races in 2027?” → count from DB)
10. JSON-LD only when required fields exist on page

---

## 5. Metadata rules

- Title pattern: `{Primary keyword} | {Brand}` (~50–60 chars)
- Description: include count, date range, geography when true
- `canonical` → preferred path (never filter URL)
- `hreflang` — skip until true localization
- Open Graph: title, description, absolute URL

---

## 6. Structured data (Schema.org)

Use only if visible on page:

| Type | When |
| --- | --- |
| `SportsEvent` / `Event` | Event page with name, startDate, location |
| `SportsOrganization` | Competition/organizer when present |
| `Place` | Venue/city with name |
| `BreadcrumbList` | All entity pages |
| `ItemList` | Calendar pages listing events (careful; keep consistent with visible list) |

Do **not** mark up missing endDate/location. Prefer `SportsEvent` for sports.

---

## 7. Internal linking

Automatic link graph:

- Event → competition, sport, country, city, month, related events (same competition / nearby date)
- Competition → sport, country, calendar year, upcoming events
- Country → sports present, top cities, upcoming
- Sport year → months with events, top competitions, countries

Breadcrumbs example:

`Home > Sports > Football > Calendar 2027 > Event`

---

## 8. Sitemap & robots

`/robots.txt`:

- Allow public SEO paths
- Disallow `/admin`, `/api/`, `/account`, export endpoints
- Disallow faceted query patterns if needed via carefully chosen rules (remember robots Disallow is coarse)

`/sitemap.xml` index:

- `sitemap-events.xml` (chunked)
- `sitemap-sports.xml`
- `sitemap-competitions.xml`
- `sitemap-geo.xml`
- `sitemap-months.xml`

Only `is_indexable=true`.

---

## 9. Pagination

- Prefer `?page=` with `rel=next/prev` or clean page paths `/events/page/2` **noindex** for page>1 if thin
- Year calendars: month anchors > endless pagination when possible

---

## 10. Faceted navigation policy

| Surface | Index |
| --- | --- |
| Curated SEO landings | index |
| User filter combinations | noindex |
| Sort-only params | noindex |
| Pagination deep pages | noindex after page 1 (configurable) |

---

## 11. Rendering & performance

- **SSR/ISR** for all SEO-critical HTML (event lists in initial HTML)
- ISR revalidate 1–6 hours; on-demand revalidate after sync affecting page
- Core Web Vitals: minimize CLS in tables; server-render dates
- CDN via Vercel

Client-side-only calendars are **forbidden** for primary content.

---

## 12. Content quality automation

Checklist job flags fail if missing:

- enough events
- unique title/H1
- intro with real aggregate numbers
- canonical
- breadcrumbs
- ≥ N internal links
- valid JSON-LD (if present)
- last updated visible

Failures → noindex + admin alert.

---

## 13. What we will not do

- AI-generated long articles at scale
- Doorway geo×sport×day permutations
- Duplicate month URLs with different slug styles
- Keyword stuffing
- Copying competitor editorial content

---

## 14. Measurement

- Search Console property day 1
- Track impressions for head terms in keyword doc
- Monitor indexed vs submitted ratio
- Manual review of top landings monthly
