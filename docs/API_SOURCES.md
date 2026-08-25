# API Sources & Provider Research

**Date:** 2026-08-25 (updated: esports research)  
**Purpose:** Real provider landscape for Event Intelligence, with **commercial / redistribution honesty**.  
**Rule:** Existence of an API ≠ right to store, display, or resell data.

---

## 1. Licensing principles for this product

| Use case | Requirement |
| --- | --- |
| Public SEO display | Source must allow **storage + public display** (or we use first-party curated facts + official links) |
| **Commercial summaries on our site** (normalized events, no raw feed) | Allowed only if provider permits **building a product** on top of data; **not** the same as raw resale |
| Pro CSV export (end-user download) | Prefer redistribution-allowed **or** first-party curated; otherwise export only fields we own |
| B2B API / commercial redistribution | **Written redistribution license** required for third-party provider data |
| Logos / photos / long editorial | Separate IP; default **do not use** |
| Scraping Sofascore/Flashscore/ESPN HTML | **Forbidden** (ToS + legal risk) |
| Unofficial ESPN JSON endpoints | **Unsuitable** for production / commercial |

Every provider is registered in DB with boolean license flags (see `DATABASE_SCHEMA.md`).

### 1.1 Ваш кейс: сводки без продажи raw data

Вы **не продаёте raw feed** — строите **нормализованные event summaries** (календарь, карточки событий, SEO-страницы). Юридически это ближе к «commercial application / display», а не к «resell database as-is».

**Разрешено при правильном источнике:**

- Хранить в PostgreSQL нормализованные поля (дата, команды, турнир, venue, status)
- Показывать на коммерческом сайте с ads / Pro-планом
- Экспортировать **свои** canonical summaries (если license tier позволяет)

**Запрещено даже без raw resale:**

- Отдавать клиентам JSON «как из PandaScore/Riot 1:1»
- Использовать источники с явным **non-commercial only** (GRID Open Access, Liquipedia free tier для monetized сайта)
- Скрейпить HLTV / Flashscore / lolesports без явного разрешения
- Betting/odds продукты на PandaScore free tier

---

## 2. Free sources — commercial summaries allowed (research summary)

**Legend:**  
🟢 = подходит для бесплатного MVP с коммерческим сайтом (сводки)  
🟡 = условно (attribution, Production key, non-betting, verify ToS)  
🔴 = не подходит для коммерческого продукта

| Source | Free? | Commercial summaries | API / parsing | Store in DB | Notes |
| --- | --- | --- | --- | --- | --- |
| **Wikidata (CC0)** | 🟢 Yes | 🟢 Yes | SPARQL / WB API | 🟢 Yes | Facts + entities; incomplete schedules |
| **Manual / Official pages** | 🟢 Yes | 🟢 Yes | Human verify + optional polite fetch | 🟢 Yes | Best legal base; link to official_url |
| **PandaScore Fixtures (free)** | 🟢 Yes | 🟡 Yes* | REST API | 🟡 Yes* | *Non-betting only; no raw resale; attribution recommended |
| **Riot Developer API** | 🟢 Yes | 🟡 Yes | REST (LoL, Valorant, TFT…) | 🟡 Yes | Production Key + Approved/Acknowledged for monetization |
| **football-data.org** | 🟢 Yes | 🟡 Yes | REST | 🟡 Yes | Attribution required |
| **TheSportsDB (paid ~$9–20)** | Partial | 🟡 Yes | REST | 🟡 Yes | Cheap; no API resale |
| **OpenDota API** | 🟢 Yes | 🟡 Unclear | REST | 🟡 Caution | Match-centric; esports calendar weak; confirm ToS for commercial |
| **Jolpica F1** | 🟢 Yes | 🟡 Caution | REST | 🟡 Caution | Verify TERMS; not official FOM |
| **Americano Sports venues** | 🟢 Yes | 🟢 Yes (CC-BY 4.0) | REST | 🟢 Yes | Venues only, US sports |
| **Riot LoL Esports persisted API** | 🟢 De facto public | 🔴 Risky | Unofficial JSON | 🔴 Avoid commercial | Public key in wild; **not** same as Developer Portal license |
| **Liquipedia (LPDB / MediaWiki)** | Partial | 🔴 No (monetized) | API / parse | 🔴 No | Free only non-commercial OSS; commercial = Enterprise |
| **GRID Open Access** | 🟢 Yes | 🔴 No | API | 🔴 No | Explicitly **non-commercial** |
| **HLTV / CS scrapers** | N/A | 🔴 No | Scrape | 🔴 No | ToS violation |
| **Wargaming Public API** | 🟢 Yes | 🔴 No | REST | 🔴 No | User/game data **not for commercial**; WoT esports league dead |
| **Steam Web API** | 🟢 Yes | 🔴 No / personal | REST | 🔴 No | Not for tournament calendar product |
| **OpenDota premium** | Pay-per-call | 🟡 Caution | REST | 🟡 Caution | Cheap but commercial terms unclear |

**Recommended free stack for commercial summaries (sports + esports):**

1. Wikidata + Manual Official (legal backbone)  
2. **PandaScore free Fixtures** (primary esports API — 13 titles, 1000 req/h)  
3. Riot Developer API where applicable (LoL/Valorant — after Production approval)  
4. football-data.org + TheSportsDB for traditional sports  

---

## 3. Recommended provider strategy (MVP)

### Tier A — Build on these first

1. **Manual / Official Calendar Provider** (first-party curation)  
   Human-verified schedules from official federation/league pages (F1 calendar announcements, UFC events page facts, ATP/WTA calendars, boxing sanctioning body dates). Store structured facts we verify; link to official URL. Best legal posture for B2B seed.

2. **Wikidata Query Service** (CC0)  
   Tournament/competition structure, venues, some dated events. Great for entity graphs; incomplete for live schedule changes. Attribution optional (CC0) but good practice to cite.

3. **football-data.org**  
   Strong Europe football fixtures. Free tier with attribution: *“Data provided by football-data.org”*. Good for **public display** MVP. Confirm redistribution before including in paid B2B dumps (treat as **display-oriented** until written OK).

4. **TheSportsDB (paid Small Business)**  
   Multi-sport events lookup. Terms allow apps/services with paid plan + attribution; **explicitly forbid reselling their API** without permission. Suitable for **internal enrichment / public display with attribution**, **not** for raw B2B resale.

5. **Jolpica F1 (Ergast-compatible)**  
   Community F1 schedule/results API. Useful for F1 calendar prototyping. Verify current TERMS.md before commercial redistribution; treat as **display/research** until clarified. Prefer official F1 calendar confirmation for canonical dates.

### Tier B — Paid product data (post-MVP / negotiate)

6. **Sportmonks** — Excellent DX; commercial use to build apps OK; **reselling raw data needs written approval**. Ideal partner conversation for Business tier redistribution addendum.

7. **API-Sports / API-Football** — Cheap fixtures; terms state they **do not grant a commercial publication license**; user must obtain rights from leagues/federations. Suitable only with eyes open: **high legal risk for public+B2B** unless you obtain rights. Mark carefully.

8. **SportsDataIO / Sportradar / Stats Perform (Opta)** — Enterprise grade; proper path for serious betting/B2B. Expensive; sales-led.

### Tier C — Unsuitable for B2B dataset core

9. **Ticketmaster Discovery API** — Event discovery OK under ToS for many consumer apps; **selling/leasing/sublicensing API or deriving revenue from providing the API/data** heavily restricted. Use only as **ticket deep-link affiliate** if program allows — **not** as redistributable schedule database.

10. **PredictHQ** — Competitor-ish event intelligence; expensive; not a free feed to resell.

11. **Unofficial ESPN endpoints / scrapers** — Unreliable + legally unsuitable.

---

## 4. Provider matrix (traditional sports)

Legend for **Recommended**:  
`Yes` = fit for our architecture with noted constraints · `Conditional` = OK with limits · `No` = do not use for core dataset

### football-data.org

| Field | Value |
| --- | --- |
| Source | football-data.org |
| Category | Football fixtures/scores |
| Countries | Strong Europe + selected global comps |
| Coverage | Free: ~12 top comps; paid tiers expand |
| API available? | Yes (REST v4) |
| Free tier? | Yes (forever for listed comps) |
| Paid? | Yes (€12–€199/mo tiers) |
| Rate limits | Free ~10 req/min (registered); lower for anon |
| Historical data? | Limited on free; more on paid |
| Future events? | Yes (fixtures/schedules) |
| Event updates? | Yes |
| Reliability | Good for indie/production hobby→SMB |
| Commercial usage allowed? | Display in apps common; attribution required |
| Attribution required? | Yes — “Data provided by football-data.org” |
| Terms/API restrictions | Fair-use rate limits; review full T&Cs before resale |
| **Recommended** | **Yes — MVP football public layer** |
| B2B redistributable? | **Conditional — ask owner before paid dumps** |

### TheSportsDB

| Field | Value |
| --- | --- |
| Source | TheSportsDB (TheDataDB Ltd) |
| Category | Multi-sport events, teams, venues |
| Countries | Global (varies by sport) |
| Coverage | Broad but uneven quality |
| API available? | Yes |
| Free tier? | Yes (limited RPM) |
| Paid? | Yes (~$9–$20/mo) |
| Rate limits | Free ~30 rpm; paid higher |
| Historical data? | Partial |
| Future events? | Yes |
| Event updates? | Yes |
| Reliability | Medium (community-influenced) |
| Commercial usage allowed? | Paid: apps/services within rate limits; **no reselling API** |
| Attribution required? | Yes for artwork/data mention on paid |
| Terms/API restrictions | No website scraping; no API resale without permission; trademark logos constraints |
| **Recommended** | **Conditional — enrichment + display, not B2B raw resale** |
| B2B redistributable? | **No (without written permission)** |

### API-Sports / API-Football

| Field | Value |
| --- | --- |
| Source | API-Sports (api-football.com / api-sports.io) |
| Category | Football (+ other sports via API-Sports) |
| Countries | Global leagues |
| Coverage | Very wide |
| API available? | Yes |
| Free tier? | Yes (100 req/day) |
| Paid? | Yes (from ~$19/mo) |
| Rate limits | Per plan daily caps |
| Historical data? | Yes (plan-dependent) |
| Future events? | Yes |
| Event updates? | Yes |
| Reliability | Good technical uptime; legal posture weak for publishers |
| Commercial usage allowed? | Provider states they **do not grant license** to publish; user must get rights from authorities |
| Attribution required? | Check dashboard/terms |
| Terms/API restrictions | League IP may apply; betting/media may need extra rights |
| **Recommended** | **Conditional / high caution** |
| B2B redistributable? | **Unsuitable without separate rights** |

### Sportmonks

| Field | Value |
| --- | --- |
| Source | Sportmonks B.V. |
| Category | Football (+ cricket, F1 modules) |
| Countries | Global |
| Coverage | 2200+ football leagues (plan-selected) |
| API available? | Yes |
| Free tier? | 14-day trial |
| Paid? | Yes (from ~€29/mo football plans) |
| Rate limits | Per plan hourly entity caps |
| Historical data? | Add-on / enterprise |
| Future events? | Yes |
| Event updates? | Yes (live-oriented) |
| Reliability | High |
| Commercial usage allowed? | **Yes to build monetized apps**; store in own DB allowed |
| Attribution required? | Welcome / recommended; not a substitute for logo rights |
| Terms/API restrictions | **No reselling raw data without written approval**; logos not licensed |
| **Recommended** | **Yes — product backend; negotiate redistribution for B2B feed** |
| B2B redistributable? | **Only with written approval** |

### Jolpica F1 (Ergast successor)

| Field | Value |
| --- | --- |
| Source | jolpica-f1 / api.jolpi.ca |
| Category | Formula 1 |
| Countries | Global calendar |
| Coverage | Seasons, races, results |
| API available? | Yes |
| Free tier? | Community/open |
| Paid? | N/A (donations/community) |
| Rate limits | Be polite; undocumented production SLA |
| Historical data? | Strong |
| Future events? | Season schedule yes |
| Event updates? | Community-maintained |
| Reliability | Medium (not official F1) |
| Commercial usage allowed? | Check live TERMS; treat cautiously |
| Attribution required? | Good practice |
| Terms/API restrictions | Not an official FOM feed; trademarks belong to rights holders |
| **Recommended** | **Conditional — MVP F1 prototyping + verify against official calendar** |
| B2B redistributable? | **Unsuitable as sole legal basis** |

### Ticketmaster Discovery API

| Field | Value |
| --- | --- |
| Source | Ticketmaster |
| Category | Ticketing events (incl. some sports) |
| Countries | Markets where TM operates |
| Coverage | On-sale events, not full federation calendars |
| API available? | Yes |
| Free tier? | Developer keys with quotas |
| Paid? | Partner programs |
| Rate limits | Yes |
| Historical data? | Limited |
| Future events? | On-platform events |
| Event updates? | Yes |
| Reliability | High for TM inventory |
| Commercial usage allowed? | Restricted; cannot sell/sublicense API/data generally |
| Attribution required? | Brand guidelines apply |
| Terms/API restrictions | No deriving revenue from providing the API; Event Content owned by organizers/TM |
| **Recommended** | **No for core DB; Conditional for ticket links/affiliate only** |
| B2B redistributable? | **Unsuitable** |

### SportsDataIO

| Field | Value |
| --- | --- |
| Source | SportsDataIO |
| Category | Multi-sport schedules/scores/odds |
| Countries | Strong US + global packages |
| Coverage | Deep commercial |
| API available? | Yes |
| Free tier? | Trial / Discovery Lab (non-commercial redistribution) |
| Paid? | Sales-led commercial |
| Rate limits | Commercial unlimited-style plans exist |
| Historical data? | Vault add-on |
| Future events? | Yes |
| Event updates? | Yes |
| Reliability | High |
| Commercial usage allowed? | With commercial agreement |
| Attribution required? | Per contract |
| Terms/API restrictions | Discovery Lab **not** for commercial redistribution |
| **Recommended** | **Yes for Phase 3 enterprise path** |
| B2B redistributable? | **Yes only under contract** |

### Sportradar / Stats Perform (Opta)

| Field | Value |
| --- | --- |
| Source | Sportradar; Stats Perform |
| Category | Enterprise sports data / betting |
| Countries | Global |
| Coverage | Best-in-class |
| API available? | Yes (enterprise) |
| Free tier? | Limited trials |
| Paid? | High (custom) |
| Rate limits | Contractual |
| Historical data? | Yes |
| Future events? | Yes |
| Event updates? | Excellent |
| Reliability | Excellent |
| Commercial usage allowed? | Yes under license |
| Attribution required? | Often |
| Terms/API restrictions | Strict; audit rights common |
| **Recommended** | **Yes for Enterprise customers later** |
| B2B redistributable? | **Per contract (often sublicense limited)** |

### Wikidata

| Field | Value |
| --- | --- |
| Source | Wikidata |
| Category | Knowledge graph (sports entities/events) |
| Countries | Global |
| Coverage | Uneven; strong for notable tournaments |
| API available? | SPARQL + WB API |
| Free tier? | Yes |
| Paid? | No |
| Rate limits | Fair use |
| Historical data? | Yes |
| Future events? | Partial |
| Event updates? | Community lag |
| Reliability | Medium |
| Commercial usage allowed? | **CC0** for Wikidata — yes |
| Attribution required? | Not required by CC0; appreciated |
| Terms/API restrictions | Respect WMF fair-use; don’t hammer endpoint |
| **Recommended** | **Yes — entity backbone** |
| B2B redistributable? | **Yes for Wikidata-derived facts** |

### PredictHQ

| Field | Value |
| --- | --- |
| Source | PredictHQ |
| Category | Event intelligence / demand |
| Countries | Global |
| Coverage | Sports + concerts + more |
| API available? | Yes |
| Free tier? | Trial/limited |
| Paid? | Subscription / enterprise (expensive) |
| Rate limits | Per plan |
| Historical data? | Product-dependent |
| Future events? | Yes |
| Event updates? | Yes |
| Reliability | High |
| Commercial usage allowed? | Per subscription (derivative works messaging on marketing pages — still contract-bound) |
| Attribution required? | Per contract |
| Terms/API restrictions | Not a free commons; competitor overlap |
| **Recommended** | **No as dependency; study as competitor** |
| B2B redistributable? | **Only if contract allows (unlikely as wholesale)** |

### Open / official calendars (non-API)

| Source | Category | Notes | Recommended |
| --- | --- | --- | --- |
| Official F1 calendar pages / ICS sync | Formula 1 | Use for verification; respect ToS; prefer manual curated facts | Yes (curation) |
| UFC.com events | MMA | Official schedule facts; no unofficial scrape automation against ToS | Yes (curation) |
| ATP/WTA calendars | Tennis | Official PDFs/pages → curated ingest | Yes (curation) |
| World Athletics calendar | Athletics | Post-MVP | Later |
| UCI calendar | Cycling | Post-MVP | Later |
| BoxRec / Wikipedia lists | Boxing | Wikipedia text is CC BY-SA (share-alike); **facts** may be used carefully; don’t copy tables wholesale without compliance | Conditional |

---

## 5. Esports / Киберспорт — free sources & parsing map

**Scope:** League of Legends, Dota 2, Mobile Legends, CS2, Valorant, World of Tanks, KOG (Honor of Kings), AOV (Arena of Valor).

**Primary free API for 7/8 titles:** [PandaScore Fixtures plan](https://www.pandascore.co/pricing) — $0, 1000 req/h, endpoints `/matches/upcoming`, `/tournaments/upcoming`, game-specific prefixes.

**PandaScore videogame slugs:** `league-of-legends`, `dota-2`, `cs-go` (CS2), `valorant`, `mlbb`, `kog`, (+ `lol-wild-rift`, `ow`, `r6-siege`, etc.)

### 5.1 Master table — esports providers

| Source | Category | Games covered | API? | Free tier? | Commercial summaries | Parsing OK? | Raw resale | Recommended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **PandaScore** | Esports fixtures/stats | LoL, Dota2, CS2, Valorant, MLBB, KOG + 7 more | Yes REST | Yes (Fixtures) | 🟡 Non-betting product OK; no raw dump | Official API | Forbidden | **Yes — primary** |
| **Riot Developer API** | LoL, Valorant, TFT | LoL, Valorant | Yes REST | Yes | 🟡 With Production Key + approval | Official API | Notify Riot if charging for access | **Yes — LoL/Valorant supplement** |
| **Riot LoL Esports API** | LoL esports schedule | LoL pro only | Unofficial JSON | Public key exists | 🔴 Not licensed for commercial | Used by fan tools | Unknown | **No for production** |
| **OpenDota** | Dota 2 matches | Dota 2 | Yes REST | 3000/day free | 🟡 Unclear commercial | Official API | Unclear | **Secondary — pro matches** |
| **Wikidata** | Entities, some events | All | SPARQL | Yes CC0 | 🟢 Yes | SPARQL | N/A (CC0) | **Yes — enrichment** |
| **Liquipedia LPDB** | Esports wiki data | LoL, Dota2, CS, Valorant, MLBB, WoT, HoK/AoV | Yes (Enterprise mostly) | Non-commercial only | 🔴 Monetized site = Enterprise | MediaWiki parse rate-limited | CC-BY-SA content rules | **No free commercial** |
| **Manual Official** | Publisher/league pages | All | No | Yes | 🟢 Yes | Human curation | N/A | **Yes — always** |
| **GRID Open Access** | Official in-game data | CS2, Dota 2 | Yes | Yes | 🔴 **Non-commercial only** | API | No | **No** |
| **HLTV / csapi.de scrapers** | CS matches | CS2 | Unofficial | N/A | 🔴 No | Scrape | No | **Forbidden** |
| **Wargaming API** | WoT game stats | World of Tanks | Yes | Yes | 🔴 User data not commercial | API | No | **No for esports calendar** |
| **Moonton / Tencent** | MLBB, HoK, AoV | MLBB, KOG, AOV | No public API found | — | — | — | — | **Manual + PandaScore** |
| **Valve / Steam** | Dota2/CS in-client | Dota2, CS2 | Steam Web API | Yes | 🔴 Personal/non-commercial tone | API | No tournament calendar | **No** |
| **Toornament API** | Tournament platform | Any hosted on platform | Yes | Paid plans | Per contract | API | Per contract | Later (community events) |
| **Abios / LSports** | Enterprise esports | Major titles | Yes | No | Sales-led | API | Contract | Phase 3 enterprise |

### 5.2 Per-game recommended ingest (free → commercial summaries)

| Game | Free primary source | Free secondary | Parsing strategy | Full event fields | Commercial OK? |
| --- | --- | --- | --- | --- | --- |
| **League of Legends** | PandaScore `lol/*` | Riot Developer (match-v5, league-v4) + Manual lolesports.com verify | `GET /lol/matches/upcoming`, `/lol/tournaments/upcoming` | teams, tournament, BO, datetime, stream URLs (if in payload) | 🟡 PandaScore non-betting; Riot needs Production key for monetization |
| **Dota 2** | PandaScore `dota-2/*` | OpenDota `/proMatches` (enrichment) | Same PandaScore pattern | series, teams, event tier | 🟡 PandaScore; OpenDota verify commercial |
| **Mobile Legends (MLBB)** | PandaScore `mlbb/*` | Manual Garena / MPL pages | `/mlbb/tournaments/upcoming`, `/mlbb/matches/upcoming` | teams, tournament, region | 🟡 PandaScore; no Moonton public API |
| **Counter-Strike 2** | PandaScore `cs-go/*` (CS2 slug) | Manual HLTV link only (no scrape) | `/csgo/matches/upcoming` (check current slug in `/videogames`) | teams, event, stage | 🟡 PandaScore; **do not scrape HLTV** |
| **Valorant** | PandaScore `valorant/*` | Riot `val-match-v1` (match detail, not full calendar) | `/valorant/matches/upcoming` | teams, tournament, region | 🟡 Both; Riot Production for monetization |
| **World of Tanks** | Manual + Wikidata | Liquipedia WoT wiki (non-commercial only) | **No free esports API** — WGL league ended 2018; ingest community/official event announcements only | limited | 🟢 Manual facts only; 🔴 Wargaming API commercial ban |
| **KOG (Honor of Kings)** | PandaScore `kog/*` | Manual HoK/KPL official | `/kog/series/upcoming`, `/kog/matches/upcoming` | teams, series, CN/international | 🟡 PandaScore |
| **AOV (Arena of Valor)** | Manual + Liquipedia HoK wiki (display facts) | PandaScore **no separate AOV slug** — use KOG/HoK scene overlap | Curate APL, AWC, AIC from official/Garena; cross-link HoK wiki | teams, region, tournament | 🟢 Manual curation; 🟡 Liquipedia only if Enterprise or OSS non-commercial |

### 5.3 PandaScore — ключевые endpoints (fixtures, все на free plan)

```
GET /matches/upcoming?filter[videogame]={slug}
GET /tournaments/upcoming?filter[videogame]={slug}
GET /{game}/matches/upcoming          # e.g. /lol/, /dota-2/, /valorant/, /mlbb/, /kog/
GET /{game}/tournaments/upcoming
GET /leagues
GET /series/upcoming
```

**Rate limit:** 1000 requests/hour (free).  
**License highlights (Terms):**

- ✅ Build apps/websites on data; store in your DB for your product  
- ❌ Transfer **raw database as-is** to third parties for money  
- ❌ Betting / odds products on stats plans  
- ✅ Your case (event summaries, no raw resale) = **aligned**, but mark `license_tier=PROVIDER_DISPLAY_ONLY`

**Attribution:** Recommended — «Data provided by PandaScore» + link.

### 5.4 Riot Games — LoL & Valorant

| API | Use for | Commercial |
| --- | --- | --- |
| [developer.riotgames.com](https://developer.riotgames.com) | Match details, ranked, some tournament tools | Monetization allowed if product **Approved/Acknowledged** + valid Production Key |
| `esports-api.lolesports.com/persisted/gw` | LoL **pro schedule** (used by fan tools) | **Not** covered by Developer Portal terms — avoid as sole commercial source |

**Action:** Register app → prototype → apply for **Production Key** before public monetization.

### 5.5 Titles without free esports API

| Title | Reality | Recommendation |
| --- | --- | --- |
| **World of Tanks** | Wargaming.net League discontinued; API is player stats not esports | Track **in-game events** from official news/calendar pages manually; category `esports-wot` optional/low priority |
| **AOV** | No PandaScore slug; scene split from HoK/KOG | Manual ingest from Garena APL/AIC/AWC; entity link to `kog` where same org |
| **Moonton titles** | No public developer API found | PandaScore for MLBB schedules; rest manual |

### 5.6 Parsing policy (esports)

| Method | When | Commercial |
| --- | --- | --- |
| Official REST API (PandaScore, Riot) | Default | Per ToS above |
| Wikidata SPARQL | Entity IDs, some dated tournaments | CC0 — yes |
| Official HTML → structured facts (manual QA) | Garena, Riot esports news, Valve blog | Yes (facts + link) |
| Liquipedia MediaWiki API | Only non-commercial OSS OR Enterprise license | **Not** for monetized site on free tier |
| HLTV, Dotabuff, Gosugamers scrape | Never | Forbidden |

### 5.7 Esports MVP ingest stack (free, commercial summaries)

```
Priority 1: PandaScoreProvider (Fixtures) — LoL, Dota2, CS2, Valorant, MLBB, KOG
Priority 2: ManualOfficialProvider — AOV, WoT, major finals verification
Priority 3: WikidataEsportsProvider — competition/venue enrichment
Priority 4: RiotProvider (feature-flag) — LoL/Valorant detail after Production approval
Optional:   OpenDotaProvider — Dota2 match enrichment only
```

Register in DB:

```text
source_providers.key:
  pandascore_fixtures | riot_games | opendota | wikidata | manual_official_esports
```

---

## 6. Sport coverage plan (MVP + esports)

| Sport / Esport | Primary | Secondary | Notes |
| --- | --- | --- | --- |
| Football | football-data.org | TheSportsDB | Europe leagues + UCL |
| Tennis | Manual official calendars | TheSportsDB | ATP/WTA majors |
| MMA | Manual UFC | TheSportsDB | Card-level events |
| Boxing | Manual + Wikidata | TheSportsDB | Major cards |
| Formula 1 | Official + Jolpica verify | Sportmonks later | Race weekends |
| **LoL** | **PandaScore** | Riot Developer | Esports calendar MVP |
| **Dota 2** | **PandaScore** | OpenDota | |
| **CS2** | **PandaScore** | Manual | No HLTV scrape |
| **Valorant** | **PandaScore** | Riot val-* APIs | |
| **MLBB** | **PandaScore** | Manual Garena | |
| **KOG / HoK** | **PandaScore `kog`** | Manual Tencent/KPL | |
| **AOV** | **Manual** | Liquipedia Enterprise later | No free API slug |
| **World of Tanks** | **Manual** | Wikidata historical | No active pro API |

Basketball, Golf, Cycling, Athletics → Phase 2 (traditional sports).

---

## 7. `EventProvider` abstraction

```ts
// Conceptual interface (implementation later)
interface EventProvider {
  readonly key: string;
  readonly license: ProviderLicense;

  fetchUpcoming(params: FetchParams): Promise<RawProviderEvent[]>;
  normalize(raw: RawProviderEvent): NormalizedEventDraft;
  validate(draft: NormalizedEventDraft): ValidationResult;
  // upsert/dedupe/detectChanges live in shared pipeline services
}
```

Shared pipeline services (not per-provider):

- `validateDraft`
- `resolveEntities`
- `matchCanonicalEvent`
- `upsertEvent`
- `deduplicate`
- `detectChanges`
- `recomputeQuality`

Providers must never write to DB directly.

---

## 8. What we can legally store & give to clients (working policy)

**Until counsel reviews:**

1. **Public site** may show events from providers that allow display/storage, with attribution.
2. **Pro export** default = `FIRST_PARTY_CURATED` + Wikidata-derived + explicitly redistribution-allowed sources.
3. **Business API** ships only after at least one redistribution agreement **or** a purely curated dataset with documented provenance.
4. Never export raw third-party payloads / copyrighted descriptions.
5. Ticket URLs: affiliate programs only.

This policy is a **product constraint**, not optional engineering detail.

---

## 9. Cost snapshot (data APIs, MVP)

| Provider | Monthly estimate |
| --- | --- |
| football-data.org Free | $0 |
| TheSportsDB Small Business | ~$20 |
| Jolpica | $0 |
| Wikidata | $0 |
| **PandaScore Fixtures** | **$0** |
| **Riot Developer API** | **$0** |
| OpenDota (optional) | $0–few $/mo if high volume |
| Sportmonks (optional upgrade) | ~€29+ |
| API-Football (optional) | ~$19 |

---

## 10. Decision (updated)

**Traditional sports MVP:** Manual Official + Wikidata + football-data.org + TheSportsDB + Jolpica (F1 assist).

**Esports MVP (free, commercial summaries, no raw resale):**  
**PandaScore Fixtures** (LoL, Dota2, CS2, Valorant, MLBB, KOG) + **Manual** (AOV, WoT) + Wikidata enrichment + **Riot Production** when ready (LoL/Valorant).

**Do not use for commercial product:** GRID Open Access (non-commercial), Liquipedia free tier on monetized site, HLTV scrapers, Riot LoL Esports persisted API as sole legal basis, Wargaming API for commercial calendar.

**Do not** build B2B raw feed on Ticketmaster, scrapers, or API-Sports alone.  
**Negotiate** Sportmonks / PandaScore redistribution if you later sell **data API** (not just on-site summaries).
