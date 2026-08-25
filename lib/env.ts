import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PANDASCORE_API_TOKEN: z.string().min(1).optional(),
  PANDASCORE_API_BASE_URL: z.string().url().default("https://api.pandascore.co"),
  PANDASCORE_SYNC_PER_PAGE: z.coerce.number().int().min(1).max(100).default(50),
  PANDASCORE_SYNC_MAX_PAGES: z.coerce.number().int().min(1).max(50).default(5),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.NETLIFY_DB_URL ||
    process.env.NETLIFY_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED
  );
}

export function getEnv(): Env {
  if (!cached) {
    cached = envSchema.parse({
      ...process.env,
      DATABASE_URL: resolveDatabaseUrl(),
    });
  }
  return cached;
}

export function requirePandaScoreToken(): string {
  const token = getEnv().PANDASCORE_API_TOKEN;
  if (!token) {
    throw new Error(
      "PANDASCORE_API_TOKEN is missing. Register at https://app.pandascore.co/sign-up and add your token to .env — see docs/PANDASCORE_SETUP.md",
    );
  }
  return token;
}
