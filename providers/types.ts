import type { EventStatus, LicenseTier } from "@prisma/client";

export interface ProviderLicense {
  commercialDisplayAllowed: boolean;
  storageAllowed: boolean;
  redistributionAllowed: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  termsUrl?: string;
  licenseNotes?: string;
  defaultLicenseTier: LicenseTier;
}

export interface NormalizedParticipantDraft {
  externalId: string;
  name: string;
  slug: string;
  role: "HOME" | "AWAY" | "OPPONENT" | "FIGHTER" | "DRIVER" | "FIELD";
  sortOrder: number;
}

export interface NormalizedEventDraft {
  sourceEventId: string;
  sourceUrl?: string;
  sportSlug: string;
  canonicalName: string;
  slug: string;
  kind: "MATCH" | "TOURNAMENT" | "RACE_WEEKEND" | "FIGHT_CARD" | "MULTI_DAY" | "OTHER";
  status: EventStatus;
  startDatetime: Date;
  endDatetime?: Date;
  timezone: string;
  countryCode?: string;
  cityName?: string;
  venueName?: string;
  competitionSlug?: string;
  competitionName?: string;
  officialUrl?: string;
  participants: NormalizedParticipantDraft[];
  dataQualityScore: number;
  licenseTier: LicenseTier;
  rawPayloadHash: string;
}

export interface FetchParams {
  sportSlugs?: string[];
  from?: Date;
  to?: Date;
  page?: number;
  perPage?: number;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface ProviderFetchResult {
  drafts: NormalizedEventDraft[];
  fetchedCount: number;
  errors: string[];
  meta?: Record<string, unknown>;
}

export interface EventProvider {
  readonly key: string;
  readonly name: string;
  readonly license: ProviderLicense;

  fetchUpcoming(params?: FetchParams): Promise<ProviderFetchResult>;
  normalize(raw: unknown): NormalizedEventDraft;
  validate(draft: NormalizedEventDraft): ValidationResult;
}

export interface EsportsProvider extends EventProvider {
  readonly supportedSportSlugs: readonly string[];
}
