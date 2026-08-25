import Link from "next/link";
import type { EventStatus } from "@prisma/client";
import { EventTable, PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import { listPublicEvents } from "@/lib/public/queries";

export const dynamic = "force-dynamic";

const STATUSES: EventStatus[] = [
  "CONFIRMED",
  "TENTATIVE",
  "POSTPONED",
  "RESCHEDULED",
  "COMPLETED",
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = param(sp, "q");
  const sport = param(sp, "sport");
  const status = param(sp, "status") as EventStatus | "";
  const page = Number(param(sp, "page") || "1") || 1;

  const data = await listPublicEvents({
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
    return qs ? `/events?${qs}` : "/events";
  }

  return (
    <div className="pub-shell">
      <PublicHeader />
      <main className="pub-main">
        <section className="pub-hero">
          <h1>Upcoming events</h1>
          <p>
            {data.total} matching events · page {data.page}/{data.totalPages}
          </p>
        </section>

        <form className="pub-filters" method="get" action="/events">
          <label>
            Search
            <input type="search" name="q" defaultValue={q} placeholder="team, event, competition" />
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
          <Link href="/events" className="pub-btn pub-btn-ghost">
            Reset
          </Link>
        </form>

        <EventTable events={data.events} />

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
      </main>
      <PublicFooter />
    </div>
  );
}
