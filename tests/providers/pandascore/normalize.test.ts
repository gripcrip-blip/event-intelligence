import { describe, expect, it } from "vitest";
import { normalizePandaScoreMatch } from "@/providers/pandascore/normalize";
import { PANDASCORE_GAME_CONFIG } from "@/providers/pandascore/types";
import { createPandaScoreProvider } from "@/providers/pandascore/pandascore-provider";

const lolGame = PANDASCORE_GAME_CONFIG.find((g) => g.sportSlug === "league-of-legends")!;

describe("normalizePandaScoreMatch", () => {
  it("maps teams, datetime, competition and status", () => {
    const draft = normalizePandaScoreMatch(
      {
        id: 12345,
        name: "Semifinal: T1 vs Gen.G",
        status: "not_started",
        scheduled_at: "2026-09-15T10:00:00Z",
        number_of_games: 5,
        videogame: { slug: "league-of-legends", name: "LoL" },
        tournament: {
          name: "Playoffs",
          league: { name: "LCK", slug: "lck" },
          serie: { full_name: "LCK 2026 Summer" },
        },
        opponents: [
          { type: "Team", opponent: { id: 1, name: "T1", slug: "t1" } },
          { type: "Team", opponent: { id: 2, name: "Gen.G", slug: "gen-g" } },
        ],
      },
      lolGame,
    );

    expect(draft.sportSlug).toBe("league-of-legends");
    expect(draft.sourceEventId).toBe("12345");
    expect(draft.status).toBe("CONFIRMED");
    expect(draft.participants).toHaveLength(2);
    expect(draft.participants[0]?.name).toBe("T1");
    expect(draft.competitionName).toContain("LCK");
    expect(draft.licenseTier).toBe("PROVIDER_DISPLAY_ONLY");
    expect(draft.dataQualityScore).toBeGreaterThanOrEqual(70);
  });

  it("uses begin_at fallback when scheduled_at missing", () => {
    const draft = normalizePandaScoreMatch(
      {
        id: 99,
        status: "finished",
        begin_at: "2026-08-01T18:30:00Z",
        videogame: { slug: "valorant" },
        opponents: [],
      },
      PANDASCORE_GAME_CONFIG.find((g) => g.sportSlug === "valorant")!,
    );

    expect(draft.status).toBe("COMPLETED");
    expect(draft.startDatetime.toISOString()).toBe("2026-08-01T18:30:00.000Z");
  });
});

describe("PandaScoreProvider.validate", () => {
  it("rejects unsupported sport slug", () => {
    const provider = createPandaScoreProvider();
    const result = provider.validate({
      sourceEventId: "1",
      sportSlug: "unknown-game",
      canonicalName: "Test",
      slug: "test-1",
      kind: "MATCH",
      status: "CONFIRMED",
      startDatetime: new Date(),
      timezone: "UTC",
      participants: [],
      dataQualityScore: 80,
      licenseTier: "PROVIDER_DISPLAY_ONLY",
      rawPayloadHash: "abc",
    });
    expect(result.ok).toBe(false);
  });
});
