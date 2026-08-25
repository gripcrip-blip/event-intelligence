# Event Intelligence — Product Architecture

**Version:** 0.1 (architecture phase)  
**Date:** 2026-08-25  
**Status:** Approved for phased implementation after doc review  
**Working title:** Event Intelligence / Sports Events Calendar

---

## 1. Product vision

Build a **global Event Intelligence Database** for sports: aggregate schedules from multiple sources, normalize into canonical entities, deduplicate, track changes, and expose the result through:

1. **Public SEO layer** — free calendars and entity pages that earn organic traffic.
2. **B2B data layer** — filters, export, API, alerts, commercial licensing (phased).

This is **not** a live-score app and **not** an SEO doorway farm. It is a **data product** whose primary assets are correctness, freshness, provenance, and clean structure.

**Positioning statement:**

> Messy multi-source sports schedules → clean canonical events → continuously updated → searchable → exportable → API-ready.

---

## 2. Target audience

| Segment | Need | Monetization |
| --- | --- | --- |
| Consumers (Google search) | “When / where is X?” calendars | Ads, affiliate (light) |
| Sports media / content teams | Research calendars, embeddable lists | Pro / Business |
| Affiliates | Event lists + ticket/bookmaker links | Affiliate + Pro |
| Bookmakers / trading ops | Change monitoring, fixtures | Business / Enterprise |
| Marketing agencies | City/country event planning | Pro / Business |
| Product/data teams | Structured feed / API | Business / Enterprise |

---

## 3. User personas

1. **Alex (fan)** — searches “F1 calendar 2027”, wants a clean month view and event pages.
2. **Maya (editor)** — needs verified dates, last-updated stamps, source links for articles.
3. **Omar (affiliate)** — exports CSV of boxing/MMA events by country for landing pages.
4. **Elena (ops, sportsbook)** — wants alerts when a fixture is postponed/rescheduled.
5. **Chris (admin)** — merges duplicates, reviews low-confidence matches, monitors sync health.

---

## 4. Use cases

- Browse upcoming events by sport / country / city / month.
- Open a canonical event page with status, venue, competition, provenance, change history.
- Search across events, competitions, places.
- Filter with URL-addressable query params (non-indexed faceted URLs).
- Export filtered datasets (CSV/XLSX) for Pro+.
- Admin: sync providers, resolve duplicates, edit/verify events.
- Future: API pull, webhooks, saved searches, alerts.

---

## 5. Core features (product)

- Multi-provider ingestion via `EventProvider` abstraction
- Validation → normalization → entity matching → dedup → canonical upsert
- Event change detection + history
- Data quality scoring + verification flags
- Public SEO pages with indexability thresholds
- Search (Postgres FTS on MVP)
- Filters + list/calendar/month views
- Auth (accounts for Pro features)
- Admin panel
- Export jobs (CSV/XLSX)
- Observability (provider/queue/DB health)
- Feature-flagged B2B API scaffold

---

## 6. Recommended technical stack (MVP-simple)

| Layer | Choice | Why |
| --- | --- | --- |
| App | **Next.js 15 (App Router) + TypeScript + React + Tailwind** | SSR/ISR for SEO, one codebase, fast iteration |
| API | **Route Handlers + Server Actions** in Next.js | Avoid second backend until workers need isolation |
| ORM | **Prisma** | Strong schema docs, migrations, good DX for MVP |
| DB | **PostgreSQL 16** | Relational model + FTS (`tsvector`) |
| Cache / queues | **Redis + BullMQ** | Sync, exports, retries, rate limits |
| Auth | **Auth.js (NextAuth v5)** | Self-hosted, cheap, roles (user/admin), no Clerk seat tax on MVP |
| Export | `csv-stringify` + `exceljs` | CSV + proper XLSX |
| Hosting app | **Vercel** | Next.js SSR/ISR/CDN |
| Hosting workers/DB | **Railway** (or Hetzner later) | Long-running BullMQ workers + Postgres + Redis |
| Observability | Structured logs + Sentry + simple admin health | Enough for MVP |
| Search | Postgres FTS | Defer Meilisearch until query quality fails |

**Why not Clerk/Supabase Auth on MVP:** Auth.js keeps cost near zero and data in our DB. Revisit Clerk if we need polished org SSO before Series A sales.

**Why not separate Nest/Fastify backend on day 1:** Extra deploy/complexity. Split workers first; split HTTP API only when Next route limits hurt.

---

## 7. High-level architecture

```
┌──────────────────────────────┐
│  Public Next.js (Vercel)     │
│  SEO pages + app UI + admin  │
│  /api/v1 (feature-flagged)   │
└──────────────┬───────────────┘
               │ Prisma
┌──────────────▼───────────────┐
│  PostgreSQL                  │
│  canonical + provenance     │
└──────────────▲───────────────┘
               │
┌──────────────┴───────────────┐
│  Workers (Railway)           │
│  BullMQ: ingest, dedupe,     │
│  changes, export, SEO audit  │
└──────────────▲───────────────┘
               │ EventProvider
┌──────────────┴───────────────┐
│  Providers                   │
│  football-data, TheSportsDB, │
│  Jolpica F1, Wikidata,       │
│  Manual/Official ingest      │
└──────────────────────────────┘
```

---

## 8. MVP scope

**Sports:** Football, Tennis, MMA, Boxing, Formula 1  
**Esports:** League of Legends, Dota 2, CS2, Valorant, Mobile Legends, KOG (Honor of Kings); AOV + World of Tanks via manual curation  
**Esports data (free MVP):** PandaScore Fixtures + Manual Official + Wikidata; Riot Developer after Production approval  
**Geography:** Europe-first (+ major F1/UFC venues worldwide when present in sources)  
**Horizon:** next 12–24 months where sources provide dates  

**In MVP:**

- Schema + Prisma + seed (30–50 events)
- `EventProvider` + ≥2 real providers + manual provider
- Sync workers (retry, backoff, rate limit, DLQ, idempotency)
- Normalization + dedup + review queue
- Public: `/`, `/events`, `/events/[slug]`, sport/country/month/competition pages
- Search + filters (URL params; faceted URLs noindex)
- CSV/XLSX export (auth, quota)
- Admin dashboard (events, sources, duplicates, changes)
- SEO basics: metadata, canonical, sitemap, robots, breadcrumbs, Event/SportsEvent JSON-LD when complete
- Auth.js email magic link or credentials for admin + Pro stub
- `.env.example`, docs, tests for normalize/dedupe/date/status

**Out of MVP:** billing, webhooks, alerts UI, full B2B API commercialization, basketball/golf/cycling/athletics depth, Elasticsearch, AI-generated articles, doorway pages.

---

## 9. Post-MVP

See `ROADMAP.md`. Short version: more sports/regions → accounts/alerts → billing + API → non-sport events → AI-assisted matching (validated).

---

## 10. Monetization summary

See `MONETIZATION.md`. Dual layer: ads/affiliate on public SEO; Free/Pro/Business/Enterprise for data tools. **Critical:** B2B redistribution only for datasets we have redistribution rights for (`license_tier` on source records).

---

## 11. SEO strategy summary

See `SEO_ARCHITECTURE.md` + `SEO_KEYWORD_RESEARCH.md`. Index only pages that pass **minimum content thresholds**. Separate SEO landings from user filter URLs. No AI garbage content.

---

## 12. Data architecture

### Pipeline

```
Source payload
  → validate (zod)
  → normalize (names, dates TZ, country codes, sport taxonomy)
  → map entities (sport, competition, venue, city, country, participants)
  → match existing (source IDs → hard keys → fuzzy)
  → deduplicate (confidence score)
  → upsert canonical Event + EventSourceLink
  → detectChanges → EventChange
  → recompute data_quality_score
  → enqueue SEO indexability recheck
```

### Entity separation

- **Competition** — recurring series (UEFA Champions League, UFC)
- **Season** — competition × year window
- **Tournament / Stage** — optional hierarchical container (Finals, GP weekend)
- **Event** — canonical schedulable unit (match, fight card, race weekend, tournament)
- **Match** — optional child for multi-match cards (UFC card bouts) — Phase 2 if needed
- **Venue / Organizer / Participant** — shared entities
- **Country / City** — geo entities with slugs

### Deduplication

Hard match if same `(provider, source_event_id)` or high-confidence composite key:

`normalized_name + start_date(±1d) + venue_id|city + competition_id + sport`

Fuzzy: trigram / Levenshtein on names + participant overlap.

| Confidence | Action |
| --- | --- |
| ≥ 0.99 | Auto-merge |
| ≥ 0.90 | Auto-merge + audit log |
| ≥ 0.75 | Manual review queue |
| < 0.75 | Keep separate / link as related |

### Status model

`CONFIRMED | TENTATIVE | POSTPONED | RESCHEDULED | CANCELLED | COMPLETED`

Any date/time/venue/status/name/participant change → `EventChange`.

### Licensing model (first-class)

Every `SourceProvider` and `EventSourceLink` stores:

- `commercial_display_allowed`
- `storage_allowed`
- `redistribution_allowed`
- `attribution_required`
- `attribution_text`
- `terms_url`
- `license_notes`

**B2B export/API may only include events whose effective license allows redistribution** (or our own curated facts after legal review).

---

## 13. API architecture (future-ready)

```
GET /api/v1/events
GET /api/v1/events/:id
GET /api/v1/competitions
GET /api/v1/sports
GET /api/v1/countries
GET /api/v1/venues
```

Auth: API keys (`ApiKey`), plans (`ApiPlan`), usage (`ApiUsage`), rate limits. MVP: feature flag `B2B_API_ENABLED=false`.

---

## 14. Database architecture

See `DATABASE_SCHEMA.md`. Postgres + Prisma. Indexes on datetime/sport/geo/status/slug/source uniqueness. Soft deletes for admin recovery.

---

## 15. Security

- Auth.js sessions (HttpOnly cookies)
- RBAC: `USER | PRO | BUSINESS | ADMIN`
- Admin routes server-side gated
- Zod validation on all inputs
- Prisma parameterized queries
- CSRF via Next.js Server Actions origin checks
- API keys hashed at rest (SHA-256 + pepper)
- Signed, short-TTL export download URLs (S3/R2 or local signed)
- Rate limit: IP + user + API key (Redis)
- No secrets in client bundles
- PII minimization (email only on accounts)

---

## 16. Scalability

MVP volumes are tiny (thousands of events). Scale path:

1. Read replicas / connection pooling (PgBouncer)
2. Redis cache for hot SEO pages
3. ISR + CDN for calendars
4. Shard workers by provider
5. Later: Meilisearch if FTS insufficient

---

## 17. Caching

- ISR for sport/country/month pages (revalidate 1–6h)
- Redis cache for expensive filter queries
- HTTP `Cache-Control` on public GETs
- Provider response cache with TTL + ETag when available
- Never serve stale **status-critical** fields longer than sync SLA without marking `last_updated`

---

## 18. Background jobs

BullMQ queues:

| Queue | Purpose |
| --- | --- |
| `provider-sync` | fetch→normalize→upsert |
| `dedupe` | candidate generation |
| `change-detect` | compare snapshots |
| `export` | CSV/XLSX generation |
| `seo-audit` | indexability thresholds |
| `alerts` (later) | email/webhook |

Policies: retries with exponential backoff, per-provider rate limiters, idempotency keys (`provider:job:window`), dead-letter queue, structured failure logs.

---

## 19. Monitoring

Admin + logs:

- Last successful sync per provider
- Failed imports count
- Queue depth / failed jobs
- Duplicate candidates open
- Low-confidence matches
- DB health / Redis ping
- Export job failures
- API usage (when enabled)

External: Sentry (errors), optional UptimeRobot on `/api/health`.

---

## 20. Deployment

| Component | Target |
| --- | --- |
| Next.js app | Vercel |
| Postgres | Railway (MVP) → managed Postgres later |
| Redis + workers | Railway |
| Object storage (exports) | Cloudflare R2 or S3 |
| DNS/CDN | Vercel + optional Cloudflare |

CI: GitHub Actions — lint, typecheck, unit tests, Prisma migrate (staging).

**GitHub:** Account `gripcrip-blip` is authenticated via `gh`. Repo can be created/pushed when you approve the first commit. Current local repo has **no commits yet**.

---

## 21. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Data licensing / redistribution bans | **Critical** | License flags; negotiate redistribution; curated official calendars for B2B |
| Thin SEO / doorway penalty | High | Content thresholds, noindex rules |
| Duplicate merges wrong | High | Confidence thresholds + human queue |
| Provider ToS change / shutdown | High | Multi-provider + manual fallback |
| Incorrect dates published | High | Quality score; don’t show low quality as Confirmed |
| Cost creep (API + hosting) | Medium | Europe MVP; cache; paid tiers only when needed |
| EU database rights / trademarks | Medium | Store facts; no logos without rights; legal review |
| Scraper temptation | High | **Forbidden** in product policy |

---

## 22. Approximate infrastructure cost (MVP monthly)

**Estimates** (USD, Aug 2026; exclude founder time):

| Item | Low | Typical |
| --- | --- | --- |
| Vercel Pro | $20 | $20–40 |
| Railway Postgres + Redis + worker | $15 | $25–50 |
| Domain + email | $2 | $5 |
| Sentry free/team | $0 | $0–26 |
| TheSportsDB Small Business | $20 | $20 |
| football-data.org Free | $0 | $0–12 |
| API-Football Pro (optional) | $0 | $19 |
| R2/S3 exports | $1 | $5 |
| **Total** | **~$60** | **~$90–180** |

Phase 3 commercial data redistribution licenses (Sportradar / SportsDataIO / Sportmonks redistribution addendum) are **orders of magnitude higher** (often $1k–$10k+/mo) — budget separately after product-market fit.

---

## 23. Future roadmap

See `ROADMAP.md` (90-day + Phases 2–5).

---

## 24. Differentiation

Competitors are strong at **live scores** (Sofascore/Flashscore) or **enterprise feeds** (Sportradar/Opta) or **demand intelligence** (PredictHQ). Gap we own:

- Cross-sport **canonical calendar** with provenance + change history
- SEO-friendly public access **without** thin pages
- Export-first UX for non-enterprise buyers
- Explicit licensing honesty (what can/can’t be resold)

---

## 25. UX principles

Clean data product: dense tables, clear dates/TZ, status badges, last updated, source attribution, excellent filters. No keyword stuffing, no popup spam, light ads on SEO pages.

---

## 26. Implementation gate

**Do not start full application coding until:**

1. Docs in `/docs` reviewed
2. Provider shortlist approved
3. Legal posture for public vs B2B clarified
4. MVP checklist accepted
5. GitHub repo created/pushed (optional but recommended)

Then follow staged implementation in `ROADMAP.md` §90-day.
