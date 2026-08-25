import {
  PANDASCORE_GAME_CONFIG,
  type PandaScoreClientOptions,
  type PandaScoreGameConfig,
  type PandaScoreListMeta,
  pandaScoreMatchListSchema,
  type PandaScoreMatch,
} from "./types";

export class PandaScoreApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "PandaScoreApiError";
  }
}

export class PandaScoreClient {
  private readonly perPage: number;
  private readonly maxPages: number;

  constructor(private readonly options: PandaScoreClientOptions) {
    this.perPage = options.perPage ?? 50;
    this.maxPages = options.maxPages ?? 5;
  }

  async fetchUpcomingMatchesForGame(game: PandaScoreGameConfig): Promise<PandaScoreMatch[]> {
    const all: PandaScoreMatch[] = [];

    for (let page = 1; page <= this.maxPages; page += 1) {
      const { data, hasMore } = await this.fetchUpcomingPage(game, page);
      all.push(...data);
      if (!hasMore || data.length === 0) break;
    }

    return all;
  }

  /** Game-specific prefix first; fallback to global /matches/upcoming + videogame filter. */
  private async fetchUpcomingPage(
    game: PandaScoreGameConfig,
    page: number,
  ): Promise<{ data: PandaScoreMatch[]; hasMore: boolean }> {
    const prefixPath = `/${game.apiPrefix}/matches/upcoming`;
    try {
      return await this.getPaginated<PandaScoreMatch>(prefixPath, page);
    } catch (err) {
      if (!(err instanceof PandaScoreApiError) || err.status !== 404) throw err;
    }

    const filterPath = "/matches/upcoming";
    const extraQuery: Record<string, string> = {
      "filter[videogame]": game.videogameSlug,
    };
    return this.getPaginated<PandaScoreMatch>(filterPath, page, extraQuery);
  }

  async fetchAllUpcomingMatches(sportSlugs?: string[]): Promise<Map<string, PandaScoreMatch[]>> {
    const games = this.resolveGames(sportSlugs);
    const result = new Map<string, PandaScoreMatch[]>();

    for (const game of games) {
      const matches = await this.fetchUpcomingMatchesForGame(game);
      result.set(game.sportSlug, matches);
      await sleep(150);
    }

    return result;
  }

  async verifyToken(): Promise<{ ok: true; videogames: number }> {
    const url = this.buildUrl("/videogames", { "page[size]": "1" });
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      const body = await res.text();
      throw new PandaScoreApiError(
        `PandaScore token verification failed (${res.status})`,
        res.status,
        body,
      );
    }
    const json = (await res.json()) as unknown[];
    return { ok: true, videogames: Array.isArray(json) ? json.length : 0 };
  }

  private resolveGames(sportSlugs?: string[]): PandaScoreGameConfig[] {
    if (!sportSlugs?.length) return [...PANDASCORE_GAME_CONFIG];
    const set = new Set(sportSlugs);
    return PANDASCORE_GAME_CONFIG.filter((g) => set.has(g.sportSlug));
  }

  private async getPaginated<T>(
    path: string,
    page: number,
    extraQuery: Record<string, string> = {},
  ): Promise<{ data: T[]; hasMore: boolean; meta?: PandaScoreListMeta }> {
    const url = this.buildUrl(path, {
      page: String(page),
      per_page: String(this.perPage),
      ...extraQuery,
    });

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      await sleep(retryAfter ? Number(retryAfter) * 1000 : 2000);
      return this.getPaginated(path, page, extraQuery);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new PandaScoreApiError(`PandaScore ${path} failed (${res.status})`, res.status, body);
    }

    const raw = await res.json();
    const parsed = pandaScoreMatchListSchema.safeParse(raw);
    if (!parsed.success) {
      throw new PandaScoreApiError(
        `Invalid PandaScore response shape for ${path}: ${parsed.error.message}`,
        500,
      );
    }

    const data = parsed.data as unknown as T[];
    const remaining = res.headers.get("X-Rate-Limit-Remaining");
    const hasMore = data.length >= this.perPage;

    return {
      data,
      hasMore,
      meta: {
        pagination: {
          page,
          per_page: this.perPage,
          total: remaining ? Number(remaining) : undefined,
        },
      },
    };
  }

  private buildUrl(path: string, query: Record<string, string>): string {
    const url = new URL(path.replace(/^\//, ""), `${this.options.baseUrl.replace(/\/$/, "")}/`);
    url.searchParams.set("token", this.options.token);
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createPandaScoreClient(options: PandaScoreClientOptions): PandaScoreClient {
  return new PandaScoreClient(options);
}
