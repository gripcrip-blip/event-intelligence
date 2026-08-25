# Roadmap

---

## 1. 90-day roadmap (from architecture approval)

### Days 1–14 — Foundation

- Initialize Next.js + Prisma + Postgres + Auth.js
- Implement schema from `DATABASE_SCHEMA.md`
- Seed 30–50 realistic events
- Health endpoint + CI (lint/typecheck/test)
- Create GitHub repo remote and push

### Days 15–35 — Data pipeline

- `EventProvider` interface + Manual + football-data.org + TheSportsDB + Jolpica
- BullMQ workers: sync, dedupe, changes
- Admin: sources health, events CRUD, duplicate queue
- Data quality score v1

### Days 36–60 — Public SEO product

- Core pages + SSR/ISR
- Search (FTS) + filters (noindex facets)
- Event change UI (“Date changed”)
- Sitemap/robots/JSON-LD
- SEO audit job + thresholds

### Days 61–75 — Export & accounts

- Auth for Pro stub
- CSV/XLSX export jobs + signed URLs
- Rate limits / quotas

### Days 76–90 — Hardening

- Tests (unit/integration/e2e smoke)
- Observability dashboards in admin
- Feature-flag scaffold for `/api/v1`
- Soft launch Europe MVP sports
- Legal pass on attributions + ToS/Privacy

---

## 2. Phase 2 — Expansion

- More sports: Basketball, Golf, Cycling, Athletics
- More countries beyond Europe
- User accounts polish
- Saved searches
- Email alerts on `EventChange`
- City pages expansion with thresholds

---

## 3. Phase 3 — B2B commercialization

- Stripe billing
- Public API v1 (eligible license rows)
- Webhooks
- Usage tracking / plans
- Negotiate Sportmonks (or equivalent) redistribution
- Sales-assisted Business onboarding

---

## 4. Phase 4 — Beyond sports

- Festivals, concerts, conferences, expos
- Same canonical event model
- PredictHQ-style demand fields only if differentiated & licensed

---

## 5. Phase 5 — AI assistance (validated)

- Entity matching / duplicate suggestions
- Classification of subcategory
- Extraction from semi-structured official PDFs
- Anomaly / trend detection
- **Never** invent dates; AI proposals require source confirmation + validation gates
- **Never** mass-generate SEO articles

---

## 6. First 10 implementation tasks

1. Scaffold Next.js app + Tailwind + ESLint + Prettier + Vitest/Playwright
2. Add Prisma schema matching `DATABASE_SCHEMA.md` + migrate
3. Write seed script (30–50 events, multi-sport, multi-status)
4. Implement `EventProvider` types + ManualProvider
5. Integrate football-data.org provider (read-only sync job)
6. Build normalization + dedupe services with unit tests
7. Stand up Redis + BullMQ worker process
8. Ship public event list + event detail SSR pages
9. Ship admin auth + duplicate review queue
10. Add sitemap generation + SEO indexability thresholds

---

## 7. Definition of MVP done

- Daily automatic sync for ≥2 live providers + manual path
- Canonical events with provenance + last updated
- Dedup review queue works
- Indexable sport/country/competition/event pages pass quality checks
- CSV/XLSX export for authenticated user
- Admin can see provider health and failed jobs
- Docs updated to match shipped reality
- No known license violations in default export set
