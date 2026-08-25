# Monetization

---

## 1. Dual-layer model

### Public SEO layer (acquisition)

- Free calendars and entity pages
- Light display ads (not intrusive)
- Affiliate links (tickets / selected partners) where disclosure + compliance allow
- CTA to Pro/Business on high-intent pages (export, API waitlist)

### B2B data layer (revenue)

- Paid tools on top of canonical DB
- Strictly gated by **data license_tier** (no selling what we can’t license)

---

## 2. Plans

| Plan | Price (initial target) | Includes |
| --- | --- | --- |
| **Free** | $0 | Public calendar, basic filters, search, limited results |
| **Pro** | ~$29–49/mo (estimate) | Advanced filters, CSV/XLSX export quotas, saved searches, email alerts (Phase 2) |
| **Business** | ~$199–499/mo (estimate) | API access, higher export caps, webhooks, commercial use license for **eligible** dataset, support |
| **Enterprise** | Custom | Custom feed, SLA, dedicated limits, redistribution terms, SSO |

Prices are **go-to-market estimates**, not committed billing yet (MVP may ship export behind flag without Stripe).

---

## 3. What each plan may legally receive

| Plan | Data scope |
| --- | --- |
| Free (web) | Display-licensed + curated events |
| Pro export | Prefer `FIRST_PARTY_CURATED` + redistribution-allowed providers |
| Business API | Contractually eligible rows only; license field in API response |
| Enterprise | Negotiated source packages (e.g. Sportmonks redistribution addendum) |

---

## 4. Public site monetization rules

- Max 1 ad unit above fold on directory pages; none or minimal on event pages early (trust > RPM)
- Affiliate: `ticket_url` only via approved networks; always `rel` appropriately; disclose
- No gambling ads in restricted jurisdictions without compliance review
- Never obscure last-updated / source attribution with ads

---

## 5. Billing (Phase 3)

- Stripe Customer Portal
- Seatless plans first (workspace = user)
- Metered API overage optional
- Annual discount ~20%

---

## 6. Unit economics notes

- Gross margin high on curated/Wikidata/football-data display
- Margin collapses if reselling enterprise upstream without markup discipline
- SEO CAC can be near-zero but slow; content quality > page count

---

## 7. Packaging hooks in product

- Soft paywall on export button
- API keys page for Business
- “Commercial use” checkbox + ToS acceptance on Business checkout
- Admin flag `user.plan`
