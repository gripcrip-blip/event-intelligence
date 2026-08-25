import { z } from "zod";

/** Maps our sport slug → PandaScore API path prefix */
export const PANDASCORE_GAME_CONFIG = [
  {
    sportSlug: "league-of-legends",
    videogameSlug: "league-of-legends",
    apiPrefix: "lol",
    name: "League of Legends",
  },
  {
    sportSlug: "dota-2",
    videogameSlug: "dota-2",
    apiPrefix: "dota-2",
    name: "Dota 2",
  },
  {
    sportSlug: "counter-strike-2",
    videogameSlug: "cs-go",
    apiPrefix: "csgo",
    name: "Counter-Strike 2",
  },
  {
    sportSlug: "valorant",
    videogameSlug: "valorant",
    apiPrefix: "valorant",
    name: "Valorant",
  },
  {
    sportSlug: "mobile-legends",
    videogameSlug: "mlbb",
    apiPrefix: "mlbb",
    name: "Mobile Legends",
  },
  {
    sportSlug: "honor-of-kings",
    videogameSlug: "kog",
    apiPrefix: "kog",
    name: "Honor of Kings",
  },
] as const;

export type PandaScoreGameConfig = (typeof PANDASCORE_GAME_CONFIG)[number];

export const PANDASCORE_SUPPORTED_SPORT_SLUGS = PANDASCORE_GAME_CONFIG.map((g) => g.sportSlug);

const opponentSchema = z.object({
  type: z.string().optional(),
  opponent: z
    .object({
      id: z.number(),
      name: z.string(),
      slug: z.string().optional(),
    })
    .optional(),
});

const leagueSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
  })
  .optional();

const serieSchema = z
  .object({
    id: z.number().optional(),
    full_name: z.string().optional(),
    name: z.string().optional(),
  })
  .optional();

const tournamentSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    league: leagueSchema,
    serie: serieSchema,
  })
  .optional();

const videogameSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
  })
  .optional();

export const pandaScoreMatchSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
  status: z.string().optional(),
  scheduled_at: z.string().nullable().optional(),
  begin_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  original_scheduled_at: z.string().nullable().optional(),
  number_of_games: z.number().nullable().optional(),
  match_type: z.string().optional(),
  videogame: videogameSchema,
  tournament: tournamentSchema,
  opponents: z.array(opponentSchema).optional(),
  league: leagueSchema,
  serie: serieSchema,
  official_stream_url: z.string().nullable().optional(),
  live_url: z.string().nullable().optional(),
});

export type PandaScoreMatch = z.infer<typeof pandaScoreMatchSchema>;

export const pandaScoreMatchListSchema = z.array(pandaScoreMatchSchema);

export interface PandaScoreListMeta {
  pagination?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface PandaScoreClientOptions {
  baseUrl: string;
  token: string;
  perPage?: number;
  maxPages?: number;
}
