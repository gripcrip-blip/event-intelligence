#!/usr/bin/env tsx
import "dotenv/config";
import { createPandaScoreProvider } from "@/providers/pandascore/pandascore-provider";
import { getEsportsProvider } from "@/providers/esports";
import { upsertNormalizedEvents, recordProviderSyncRun } from "@/services/sync/upsert-events";
import { SyncRunStatus } from "@prisma/client";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const verifyOnly = args.includes("--verify");
  const sportArg = args.find((a) => a.startsWith("--sport="));
  const sportSlugs = sportArg ? sportArg.replace("--sport=", "").split(",") : undefined;

  const provider = getEsportsProvider("pandascore_fixtures");

  console.log(`[pandascore] Provider: ${provider.name} (${provider.key})`);
  console.log(`[pandascore] Supported: ${provider.supportedSportSlugs.join(", ")}`);

  if (verifyOnly) {
    const ps = createPandaScoreProvider();
    await ps.verifyConnection();
    console.log("[pandascore] Token OK — API reachable");
    return;
  }

  const result = await provider.fetchUpcoming({ sportSlugs });
  console.log(`[pandascore] Fetched ${result.fetchedCount} raw matches`);
  console.log(`[pandascore] Normalized ${result.drafts.length} events`);

  if (result.errors.length) {
    console.warn(`[pandascore] Normalization warnings (${result.errors.length}):`);
    result.errors.slice(0, 10).forEach((e) => console.warn(`  - ${e}`));
  }

  if (dryRun) {
    console.log("[pandascore] Dry run — sample events:");
    result.drafts.slice(0, 5).forEach((d) => {
      console.log(
        `  • ${d.startDatetime.toISOString()} | ${d.sportSlug} | ${d.canonicalName}`,
      );
    });
    return;
  }

  const upsert = await upsertNormalizedEvents({
    providerKey: provider.key,
    drafts: result.drafts,
  });

  console.log(`[pandascore] Upserted ${upsert.upsertedCount}, skipped ${upsert.skippedCount}`);

  const totalErrors = result.errors.length + upsert.errors.length;
  const status: SyncRunStatus =
    totalErrors === 0
      ? SyncRunStatus.SUCCESS
      : upsert.upsertedCount > 0
        ? SyncRunStatus.PARTIAL
        : SyncRunStatus.FAILED;

  await recordProviderSyncRun({
    providerKey: provider.key,
    fetchedCount: result.fetchedCount,
    upsertedCount: upsert.upsertedCount,
    errorCount: totalErrors,
    status,
    meta: { sportSlugs: sportSlugs ?? "all" },
  });

  if (upsert.errors.length) {
    console.warn("[pandascore] Upsert errors:");
    upsert.errors.slice(0, 10).forEach((e) => console.warn(`  - ${e}`));
  }

  if (status === SyncRunStatus.FAILED) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[pandascore] Sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
