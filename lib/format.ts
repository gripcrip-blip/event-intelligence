export function formatUtc(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

export function formatShortUtc(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "healthy" || s === "success") return `badge badge-${s}`;
  if (s === "tentative" || s === "degraded" || s === "partial") return `badge badge-${s}`;
  if (s === "cancelled" || s === "down" || s === "failed") return `badge badge-${s}`;
  return `badge badge-info`;
}
