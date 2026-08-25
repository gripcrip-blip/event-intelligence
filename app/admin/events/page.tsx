import Link from "next/link";
import type { EventStatus } from "@prisma/client";
import { listAdminEvents } from "@/lib/admin/queries";
import { formatShortUtc, statusBadgeClass } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUSES: EventStatus[] = [
  "CONFIRMED",
  "TENTATIVE",
  "POSTPONED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function AdminEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = param(sp, "q");
  const sport = param(sp, "sport");
  const status = param(sp, "status") as EventStatus | "";
  const page = Number(param(sp, "page") || "1") || 1;

  const data = await listAdminEvents({
    q,
    sport,
    status: STATUSES.includes(status as EventStatus) ? (status as EventStatus) : "",
    page,
  });

  function hrefFor(nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sport) params.set("sport", sport);
    if (status) params.set("status", status);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/events?${qs}` : "/admin/events";
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Events</h1>
          <p>
            {data.total} matching · page {data.page}/{data.totalPages}
          </p>
        </div>
      </div>

      <form className="filters" method="get" action="/admin/events">
        <label>
          Search
          <input type="search" name="q" defaultValue={q} placeholder="name, slug, competition" />
        </label>
        <label>
          Sport
          <select name="sport" defaultValue={sport}>
            <option value="">All</option>
            {data.sports.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Filter</button>
        <Link className="btn btn-ghost" href="/admin/events">
          Reset
        </Link>
      </form>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Start (UTC)</th>
              <th>Event</th>
              <th>Sport</th>
              <th>Competition</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Quality</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.events.length === 0 ? (
              <tr>
                <td colSpan={8} className="muted">
                  No events found.
                </td>
              </tr>
            ) : (
              data.events.map((event) => {
                const teams = event.participants
                  .map((p) => p.participant.name)
                  .join(" vs ");
                const source = event.sourceLinks[0]?.sourceProvider.key ?? "—";
                return (
                  <tr key={event.id}>
                    <td>{formatShortUtc(event.startDatetime)}</td>
                    <td className="wrap">
                      <Link className="row-link" href={`/admin/events/${event.id}`}>
                        {event.canonicalName}
                      </Link>
                    </td>
                    <td>{event.sport.name}</td>
                    <td className="wrap muted">{event.competition?.name ?? "—"}</td>
                    <td className="wrap muted">{teams || "—"}</td>
                    <td>
                      <span className={statusBadgeClass(event.status)}>{event.status}</span>
                    </td>
                    <td>{event.dataQualityScore}</td>
                    <td>
                      <code>{source}</code>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {data.page > 1 ? <Link href={hrefFor(data.page - 1)}>← Prev</Link> : <span>← Prev</span>}
        <span>
          Page {data.page} of {data.totalPages}
        </span>
        {data.page < data.totalPages ? (
          <Link href={hrefFor(data.page + 1)}>Next →</Link>
        ) : (
          <span>Next →</span>
        )}
      </div>
    </>
  );
}
