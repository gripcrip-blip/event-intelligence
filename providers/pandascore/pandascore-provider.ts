import type {
  EsportsProvider,
  FetchParams,
  NormalizedEventDraft,
  ProviderFetchResult,
  ProviderLicense,
  ValidationResult,
} from "@/providers/types";
import { getEnv, requirePandaScoreToken } from "@/lib/env";
import { createPandaScoreClient } from "./client";
import { normalizePandaScoreMatchSafe } from "./normalize";
import {
  PANDASCORE_GAME_CONFIG,
  PANDASCORE_SUPPORTED_SPORT_SLUGS,
  pandaScoreMatchSchema,
} from "./types";

const PANDASCORE_LICENSE: ProviderLicense = {
  commercialDisplayAllowed: true,
  storageAllowed: true,
  redistributionAllowed: false,
  attributionRequired: true,
  attributionText: "Data provided by PandaScore (https://www.pandascore.co)",
  termsUrl: "https://www.pandascore.co/terms-and-condition",
  licenseNotes:
    "Fixtures plan — non-betting use. Do not resell raw feed. Summaries/display in product OK.",
  defaultLicenseTier: "PROVIDER_DISPLAY_ONLY",
};

export class PandaScoreProvider implements EsportsProvider {
  readonly key = "pandascore_fixtures";
  readonly name = "PandaScore Fixtures";
  readonly license = PANDASCORE_LICENSE;
  readonly supportedSportSlugs = PANDASCORE_SUPPORTED_SPORT_SLUGS;

  private getClient() {
    const env = getEnv();
    return createPandaScoreClient({
      baseUrl: env.PANDASCORE_API_BASE_URL,
      token: requirePandaScoreToken(),
      perPage: env.PANDASCORE_SYNC_PER_PAGE,
      maxPages: env.PANDASCORE_SYNC_MAX_PAGES,
    });
  }

  async verifyConnection(): Promise<void> {
    await this.getClient().verifyToken();
  }

  async fetchUpcoming(params: FetchParams = {}): Promise<ProviderFetchResult> {
    const client = this.getClient();
    const sportSlugs = params.sportSlugs?.length ? params.sportSlugs : undefined;
    const bySport = await client.fetchAllUpcomingMatches(sportSlugs);

    const drafts: NormalizedEventDraft[] = [];
    const errors: string[] = [];
    let fetchedCount = 0;

    for (const game of PANDASCORE_GAME_CONFIG) {
      if (sportSlugs && !sportSlugs.includes(game.sportSlug)) continue;

      const matches = bySport.get(game.sportSlug) ?? [];
      fetchedCount += matches.length;

      for (const raw of matches) {
        try {
          const draft = this.normalize(raw, game);
          const validation = this.validate(draft);
          if (validation.ok) {
            drafts.push(draft);
          } else {
            errors.push(
              `${game.sportSlug}/${draft.sourceEventId}: ${validation.issues.map((i) => i.message).join("; ")}`,
            );
          }
        } catch (err) {
          errors.push(
            `${game.sportSlug}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    return {
      drafts,
      fetchedCount,
      errors,
      meta: { games: PANDASCORE_GAME_CONFIG.map((g) => g.sportSlug) },
    };
  }

  normalize(raw: unknown, fallbackGame?: (typeof PANDASCORE_GAME_CONFIG)[number]): NormalizedEventDraft {
    const parsed = pandaScoreMatchSchema.parse(raw);
    const draft = normalizePandaScoreMatchSafe(parsed, fallbackGame);
    if (!draft) {
      throw new Error(`Unsupported videogame for PandaScore match ${parsed.id}`);
    }
    return draft;
  }

  validate(draft: NormalizedEventDraft): ValidationResult {
    const issues: ValidationResult["issues"] = [];

    if (!draft.sourceEventId) issues.push({ field: "sourceEventId", message: "required" });
    if (!draft.sportSlug) issues.push({ field: "sportSlug", message: "required" });
    if (!draft.canonicalName) issues.push({ field: "canonicalName", message: "required" });
    if (!draft.startDatetime || Number.isNaN(draft.startDatetime.getTime())) {
      issues.push({ field: "startDatetime", message: "invalid or missing" });
    }
    if (!(this.supportedSportSlugs as readonly string[]).includes(draft.sportSlug)) {
      issues.push({ field: "sportSlug", message: `unsupported esport: ${draft.sportSlug}` });
    }

    return { ok: issues.length === 0, issues };
  }
}

export function createPandaScoreProvider(): PandaScoreProvider {
  return new PandaScoreProvider();
}
