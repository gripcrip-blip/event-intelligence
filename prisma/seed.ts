import "dotenv/config";
import { PrismaClient, SportCategory, ProviderHealthStatus } from "@prisma/client";

const prisma = new PrismaClient();

const ESPORTS_SPORTS = [
  { slug: "league-of-legends", name: "League of Legends" },
  { slug: "dota-2", name: "Dota 2" },
  { slug: "counter-strike-2", name: "Counter-Strike 2" },
  { slug: "valorant", name: "Valorant" },
  { slug: "mobile-legends", name: "Mobile Legends" },
  { slug: "honor-of-kings", name: "Honor of Kings" },
  { slug: "arena-of-valor", name: "Arena of Valor" },
  { slug: "world-of-tanks", name: "World of Tanks" },
] as const;

async function main() {
  for (const sport of ESPORTS_SPORTS) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      create: {
        slug: sport.slug,
        name: sport.name,
        category: SportCategory.ESPORTS,
        isActive: sport.slug !== "arena-of-valor" && sport.slug !== "world-of-tanks",
      },
      update: {
        name: sport.name,
        category: SportCategory.ESPORTS,
      },
    });
  }

  await prisma.sourceProvider.upsert({
    where: { key: "pandascore_fixtures" },
    create: {
      key: "pandascore_fixtures",
      name: "PandaScore Fixtures",
      reliabilityScore: 82,
      commercialDisplayAllowed: true,
      storageAllowed: true,
      redistributionAllowed: false,
      attributionRequired: true,
      attributionText: "Data provided by PandaScore (https://www.pandascore.co)",
      termsUrl: "https://www.pandascore.co/terms-and-condition",
      licenseNotes:
        "Free Fixtures plan. Non-betting commercial summaries OK; no raw data resale.",
      isActive: true,
      rateLimitPerMin: 16,
      healthStatus: ProviderHealthStatus.HEALTHY,
    },
    update: {
      name: "PandaScore Fixtures",
      isActive: true,
    },
  });

  console.log("Seeded esports sports + pandascore_fixtures provider");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
