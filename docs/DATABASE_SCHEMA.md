# Database Schema

**ORM:** Prisma  
**DB:** PostgreSQL 16  
**Charset/collation:** UTF-8 / `en_US.utf8`  
**IDs:** UUID (`gen_random_uuid()`) unless noted

This document is the logical schema for MVP+. Prisma models will mirror these tables.

---

## 1. Entity overview

```
Sport
Country → City → Venue
Organizer
Competition → Season → (optional) TournamentStage
Event ←→ Participant (M:N via EventParticipant)
Event ←→ EventSourceLink → SourceProvider
Event → EventChange
Event → EventAlias
DuplicateCandidate (Event A ↔ Event B)
User → ApiKey → ApiUsage
SavedFilter / ExportJob / AlertRule (post-MVP stubs)
SeoPageRegistry
```

---

## 2. Taxonomy & geo

### `sports`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| slug | text unique | `football`, `formula-1` |
| name | text | |
| category | text | team / individual / combat / motorsport |
| is_active | boolean | MVP sports flagged |
| created_at / updated_at | timestamptz | |

### `countries`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| code | char(2) unique | ISO 3166-1 alpha-2 |
| slug | text unique | `netherlands` |
| name | text | |
| continent | text | `europe` etc. |
| is_mvp_region | boolean | Europe-first |

### `cities`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| country_id | uuid FK | |
| slug | text | unique per country |
| name | text | |
| normalized_name | text | for matching |
| lat / lng | numeric nullable | |
| unique(country_id, slug) | | |

### `venues`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| city_id | uuid FK nullable | |
| country_id | uuid FK | |
| slug | text | |
| name | text | |
| normalized_name | text | |
| capacity | int nullable | |
| official_url | text nullable | |
| unique(country_id, normalized_name) soft via index | | |

### `organizers`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| slug | text unique | |
| name | text | |
| type | enum | FEDERATION / PROMOTER / LEAGUE / OTHER |
| official_url | text nullable | |
| country_id | uuid nullable | |

---

## 3. Competition hierarchy

### `competitions`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| sport_id | uuid FK | |
| slug | text unique | `uefa-champions-league` |
| name | text | canonical |
| short_name | text nullable | `UCL` |
| organizer_id | uuid nullable | |
| country_id | uuid nullable | null = international |
| level | text nullable | club / national / grand_slam |
| official_url | text nullable | |
| is_recurring | boolean default true | |
| created_at / updated_at | timestamptz | |

### `competition_aliases`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| competition_id | uuid FK | |
| alias | text | |
| normalized_alias | text | unique globally preferred |

### `seasons`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| competition_id | uuid FK | |
| name | text | `2026/27` or `2027` |
| year_start | int | |
| year_end | int | |
| start_date / end_date | date nullable | |
| unique(competition_id, name) | | |

### `tournament_stages` (optional hierarchy)

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| season_id | uuid FK | |
| parent_stage_id | uuid nullable | |
| slug | text | |
| name | text | `Group Stage`, `Final`, `Race Weekend` |
| stage_type | enum | ROUND / GROUP / FINAL / WEEKEND / OTHER |
| sort_order | int | |

Use stages when one “event container” has structured sub-parts. For MVP, many sports can hang events directly on `season_id` / `competition_id`.

---

## 4. Participants

### `participants`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| sport_id | uuid FK | |
| slug | text | |
| name | text | |
| normalized_name | text | |
| type | enum | TEAM / PERSON / STABLE / OTHER |
| country_id | uuid nullable | |
| external_refs jsonb | | optional provider IDs |

### `event_participants`

| Column | Type | Notes |
| --- | --- | --- |
| event_id | uuid FK | |
| participant_id | uuid FK | |
| role | text | home / away / fighter / driver / field |
| seed | int nullable | |
| result_position | int nullable | post-MVP |
| PK (event_id, participant_id, role) | | |

---

## 5. Canonical events

### Enum `event_status`

`CONFIRMED | TENTATIVE | POSTPONED | RESCHEDULED | CANCELLED | COMPLETED`

### Enum `event_kind`

`MATCH | TOURNAMENT | RACE_WEEKEND | FIGHT_CARD | MULTI_DAY | OTHER`

### `events`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| canonical_name | text | |
| slug | text unique | |
| sport_id | uuid FK | |
| subcategory | text nullable | e.g. ATP 1000 |
| kind | event_kind | |
| competition_id | uuid FK nullable | |
| season_id | uuid FK nullable | |
| stage_id | uuid FK nullable | |
| start_datetime | timestamptz | UTC store |
| end_datetime | timestamptz nullable | |
| timezone | text | IANA, e.g. `Europe/London` |
| status | event_status | |
| country_id | uuid nullable | |
| city_id | uuid nullable | |
| venue_id | uuid nullable | |
| organizer_id | uuid nullable | |
| official_url | text nullable | |
| ticket_url | text nullable | only if licensed/affiliate-ok |
| is_multi_day | boolean | |
| is_recurring_instance | boolean | instance of series |
| recurrence_key | text nullable | links yearly editions |
| verified | boolean default false | admin mark |
| data_quality_score | int | 0–100 |
| expose_as_confirmed | boolean | derived/guard |
| last_source_update_at | timestamptz | |
| created_at / updated_at | timestamptz | |
| deleted_at | timestamptz nullable | soft delete |
| search_vector | tsvector | generated/maintained |

**Do not** store copyrighted long-form editorial from sources. Store structured facts + links.

### `event_aliases`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| event_id | uuid FK | |
| alias | text | |
| normalized_alias | text | |
| source | text nullable | |

### `event_changes`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| event_id | uuid FK | |
| change_type | enum | DATE_CHANGED, TIME_CHANGED, VENUE_CHANGED, LOCATION_CHANGED, STATUS_CHANGED, PARTICIPANTS_CHANGED, NAME_CHANGED |
| field_name | text | |
| old_value | jsonb | |
| new_value | jsonb | |
| source_provider_id | uuid nullable | |
| detected_at | timestamptz | |
| confidence | numeric | |

### `event_source_links`

Provenance of each observation:

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| event_id | uuid FK | |
| source_provider_id | uuid FK | |
| source_event_id | text | |
| source_url | text nullable | |
| raw_payload_hash | text | for change detection |
| raw_snapshot_id | uuid nullable | pointer to cold storage |
| last_seen_at | timestamptz | |
| match_confidence | numeric | when linked via fuzzy |
| unique(source_provider_id, source_event_id) | | |

---

## 6. Providers & quality

### `source_providers`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| key | text unique | `football_data_org` |
| name | text | |
| reliability_score | int 0–100 | |
| commercial_display_allowed | boolean | |
| storage_allowed | boolean | |
| redistribution_allowed | boolean | **gate for B2B** |
| attribution_required | boolean | |
| attribution_text | text nullable | |
| terms_url | text nullable | |
| license_notes | text | |
| is_active | boolean | |
| rate_limit_per_min | int | |
| last_sync_at | timestamptz nullable | |
| next_sync_at | timestamptz nullable | |
| last_error | text nullable | |
| health_status | enum | HEALTHY / DEGRADED / DOWN |

### `provider_sync_runs`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| source_provider_id | uuid FK | |
| started_at / finished_at | timestamptz | |
| status | enum | SUCCESS / PARTIAL / FAILED |
| fetched_count | int | |
| upserted_count | int | |
| error_count | int | |
| meta | jsonb | |

### `raw_source_snapshots` (optional MVP-light)

Store compressed JSON in object storage; DB keeps hash + URI. Useful for audits.

### Data quality formula (v1)

```
score =
  0.30 * source_reliability
+ 0.20 * completeness (required fields present)
+ 0.20 * freshness (hours since last_source_update)
+ 0.15 * verified_bonus
+ 0.15 * match_confidence_avg
```

| Score | Label | Policy |
| --- | --- | --- |
| 90–100 | High | Default public |
| 70–89 | Good | Public |
| 50–69 | Needs verification | Show with caveat / admin priority |
| <50 | Low | Do not expose as Confirmed; may noindex |

---

## 7. Deduplication

### `duplicate_candidates`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| event_a_id | uuid FK | |
| event_b_id | uuid FK | |
| similarity_score | numeric | |
| features | jsonb | which signals matched |
| status | enum | OPEN / MERGED / REJECTED |
| reviewed_by | uuid nullable | |
| reviewed_at | timestamptz nullable | |
| unique(least(a,b), greatest(a,b)) | | |

Merge operation: keep canonical winner, re-point source links, move aliases, write `EventChange` + audit log.

---

## 8. Users, auth, plans

### `users`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| email | citext unique | |
| name | text nullable | |
| role | enum | USER / PRO / BUSINESS / ADMIN |
| plan | enum | FREE / PRO / BUSINESS / ENTERPRISE |
| email_verified | timestamptz nullable | |
| created_at / updated_at | timestamptz | |

Auth.js tables: `accounts`, `sessions`, `verification_tokens` (standard).

### `api_plans`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| code | text unique | `business_default` |
| monthly_request_limit | int | |
| rate_limit_per_min | int | |
| allows_redistribution | boolean | contractual |
| price_cents | int nullable | |

### `api_keys`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid FK | |
| plan_id | uuid FK | |
| name | text | |
| key_prefix | text | `eik_live_` |
| key_hash | text | |
| is_active | boolean | |
| last_used_at | timestamptz | |
| created_at | timestamptz | |

### `api_usages`

| Column | Type | Notes |
| --- | --- | --- |
| id | bigserial | |
| api_key_id | uuid FK | |
| route | text | |
| status_code | int | |
| occurred_at | timestamptz | |
| units | int default 1 | |

Partition by month later if volume grows.

---

## 9. Product features

### `saved_filters` (Phase 2)

user_id, name, query jsonb, created_at

### `export_jobs`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid FK | |
| format | enum | CSV / XLSX |
| query | jsonb | |
| status | enum | QUEUED / RUNNING / READY / FAILED |
| row_count | int | |
| file_url | text nullable | signed |
| error | text nullable | |
| created_at / completed_at | timestamptz | |

### `alert_rules` (architecture stub)

user_id, name, query jsonb, channel (EMAIL/WEBHOOK), webhook_url, is_active

### `alert_deliveries` (stub)

rule_id, event_change_id, status, delivered_at

---

## 10. SEO registry

### `seo_pages`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| path | text unique | `/sports/football/calendar/2027` |
| page_type | enum | HOME / SPORT / SPORT_YEAR / MONTH / COUNTRY / CITY / COMPETITION / EVENT / CUSTOM |
| entity_ref | jsonb | ids |
| event_count | int | |
| is_indexable | boolean | |
| noindex_reason | text nullable | |
| last_audited_at | timestamptz | |
| title / h1 / intro | text | human or templated non-AI-spam |
| canonical_path | text | |

**Thresholds (config):** e.g. `MIN_EVENTS_SPORT_YEAR=8`, `MIN_EVENTS_MONTH=5`, `MIN_EVENTS_COUNTRY_YEAR=5`, `MIN_EVENTS_CITY_YEAR=5`. Below → `is_indexable=false`.

---

## 11. Indexes (MVP)

```sql
-- events
CREATE INDEX events_start_datetime_idx ON events (start_datetime);
CREATE INDEX events_sport_start_idx ON events (sport_id, start_datetime);
CREATE INDEX events_country_start_idx ON events (country_id, start_datetime);
CREATE INDEX events_city_start_idx ON events (city_id, start_datetime);
CREATE INDEX events_competition_start_idx ON events (competition_id, start_datetime);
CREATE INDEX events_status_idx ON events (status);
CREATE UNIQUE INDEX events_slug_uidx ON events (slug);
CREATE INDEX events_quality_idx ON events (data_quality_score);
CREATE INDEX events_search_idx ON events USING GIN (search_vector);

-- provenance
CREATE UNIQUE INDEX event_source_uidx ON event_source_links (source_provider_id, source_event_id);
CREATE INDEX event_source_event_idx ON event_source_links (event_id);

-- geo / taxonomy
CREATE UNIQUE INDEX cities_country_slug_uidx ON cities (country_id, slug);
CREATE INDEX venues_normalized_idx ON venues (country_id, normalized_name);

-- dedupe
CREATE INDEX duplicate_open_idx ON duplicate_candidates (status) WHERE status = 'OPEN';

-- changes
CREATE INDEX event_changes_event_detected_idx ON event_changes (event_id, detected_at DESC);
```

---

## 12. Normalization notes

- Store all timestamps in **UTC**; keep `timezone` for display.
- Country codes ISO; sports slugs fixed vocabulary.
- `normalized_*` fields: lowercase, strip punctuation, expand common abbreviations (UCL → uefa champions league) via dictionary table `normalization_dictionaries`.
- Recurring yearly finals: shared `recurrence_key` + distinct event rows per year.

---

## 13. Soft constraints / integrity

- Event without `start_datetime` cannot be `CONFIRMED` public.
- `expose_as_confirmed` false if score < 50 or status TENTATIVE without verification.
- B2B export query joins only providers with `redistribution_allowed=true` **or** events marked `license_tier='first_party_curated'`.

Add column on events:

| license_tier | enum | `FIRST_PARTY_CURATED \| PROVIDER_DISPLAY_ONLY \| PROVIDER_REDISTRIBUTABLE \| UNKNOWN` |

Computed from source links (most restrictive wins for commercial export).
