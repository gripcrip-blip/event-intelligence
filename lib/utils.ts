import { createHash } from "node:crypto";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function hashPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function normalizeName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildEventSlug(parts: {
  sportSlug: string;
  sourceEventId: string;
  name?: string;
}): string {
  const base = parts.name ? slugify(parts.name) : "event";
  return slugify(`${parts.sportSlug}-${parts.sourceEventId}-${base}`).slice(0, 180);
}

export function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function mapPandaScoreStatus(status: string | undefined): import("@prisma/client").EventStatus {
  switch (status) {
    case "not_started":
    case "pre_match":
      return "CONFIRMED";
    case "running":
    case "live":
      return "CONFIRMED";
    case "finished":
      return "COMPLETED";
    case "postponed":
      return "POSTPONED";
    case "canceled":
    case "cancelled":
      return "CANCELLED";
    default:
      return "TENTATIVE";
  }
}
