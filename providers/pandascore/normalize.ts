import type { NormalizedEventDraft } from "@/providers/types";
import {
  buildEventSlug,
  hashPayload,
  mapPandaScoreStatus,
  normalizeName,
  parseDate,
  slugify,
} from "@/lib/utils";
import {
  PANDASCORE_GAME_CONFIG,
  type PandaScoreGameConfig,
  type PandaScoreMatch,
} from "./types";

export function resolveGameConfigForMatch(match: PandaScoreMatch): PandaScoreGameConfig | undefined {
  const slug = match.videogame?.slug;
  if (slug) {
    return PANDASCORE_GAME_CONFIG.find((g) => g.videogameSlug === slug);
  }
  return undefined;
}

export function normalizePandaScoreMatch(
  match: PandaScoreMatch,
  game: PandaScoreGameConfig,
): NormalizedEventDraft {
  const opponents = (match.opponents ?? [])
    .map((o, index) => {
      const team = o.opponent;
      if (!team?.name) return null;
      return {
        externalId: String(team.id),
        name: team.name,
        slug: slugify(team.slug ?? team.name),
        role: index === 0 ? ("HOME" as const) : ("AWAY" as const),
        sortOrder: index,
      };
    })
    .filter(Boolean) as NormalizedEventDraft["participants"];

  const leagueName =
    match.tournament?.league?.name ?? match.league?.name ?? match.tournament?.serie?.full_name;
  const tournamentName = match.tournament?.name;
  const serieName = match.tournament?.serie?.full_name ?? match.serie?.full_name;

  const competitionName = [leagueName, serieName, tournamentName].filter(Boolean).join(" — ");
  const competitionSlug = slugify(
    match.tournament?.league?.slug ??
      match.tournament?.slug ??
      leagueName ??
      serieName ??
      "unknown-competition",
  );

  const teamLabel =
    opponents.length >= 2
      ? `${opponents[0]!.name} vs ${opponents[1]!.name}`
      : (match.name ?? `Match ${match.id}`);

  const bo = match.number_of_games ? `Bo${match.number_of_games}` : undefined;
  const canonicalName = match.name?.trim() || [teamLabel, bo].filter(Boolean).join(" · ");

  const startDatetime =
    parseDate(match.scheduled_at) ??
    parseDate(match.begin_at) ??
    parseDate(match.original_scheduled_at) ??
    new Date();

  const endDatetime = parseDate(match.end_at);
  const status = mapPandaScoreStatus(match.status);

  const sourceUrl = match.slug
    ? `https://www.pandascore.co/matches/${match.slug}/${match.id}`
    : `https://www.pandascore.co/matches/${match.id}`;

  const completeness =
    (opponents.length >= 2 ? 25 : 10) +
    (startDatetime ? 25 : 0) +
    (competitionName ? 20 : 5) +
    (match.status ? 15 : 0) +
    15;

  return {
    sourceEventId: String(match.id),
    sourceUrl,
    sportSlug: game.sportSlug,
    canonicalName,
    slug: buildEventSlug({
      sportSlug: game.sportSlug,
      sourceEventId: String(match.id),
      name: canonicalName,
    }),
    kind: "MATCH",
    status,
    startDatetime,
    endDatetime,
    timezone: "UTC",
    competitionSlug: competitionSlug || undefined,
    competitionName: competitionName || undefined,
    officialUrl: match.official_stream_url ?? match.live_url ?? sourceUrl,
    participants: opponents,
    dataQualityScore: Math.min(100, completeness),
    licenseTier: "PROVIDER_DISPLAY_ONLY",
    rawPayloadHash: hashPayload(match),
  };
}

export function normalizePandaScoreMatchSafe(
  match: PandaScoreMatch,
  fallbackGame?: PandaScoreGameConfig,
): NormalizedEventDraft | null {
  const game = resolveGameConfigForMatch(match) ?? fallbackGame;
  if (!game) return null;
  return normalizePandaScoreMatch(match, game);
}

export { normalizeName };
