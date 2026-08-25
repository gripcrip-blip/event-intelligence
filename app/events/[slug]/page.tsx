import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import { formatUtc, statusBadgeClass } from "@/lib/format";
import { getPublicEventBySlug } from "@/lib/public/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.canonicalName} | Event Intelligence`,
    description: `${event.sport.name} · ${formatUtc(event.startDatetime)}`,
  };
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const attribution = event.sourceLinks
    .map((l) => l.sourceProvider.attributionText)
    .filter(Boolean)[0];

  return (
    <div className="pub-shell">
      <PublicHeader />
      <main className="pub-main">
        <p className="pub-muted" style={{ marginBottom: "0.5rem" }}>
          <Link href="/events">← Events</Link>
          {" · "}
          <Link href={`/sports/${event.sport.slug}`}>{event.sport.name}</Link>
        </p>
        <section className="pub-hero">
          <h1>{event.canonicalName}</h1>
          <p>
            <span className={statusBadgeClass(event.status)}>{event.status}</span>
            {" · "}
            Last updated {formatUtc(event.lastSourceUpdateAt ?? event.updatedAt)}
          </p>
        </section>

        <div className="pub-detail-grid">
          <div className="pub-detail-item">
            <div className="k">Start (UTC)</div>
            <div className="v">{formatUtc(event.startDatetime)}</div>
          </div>
          <div className="pub-detail-item">
            <div className="k">End (UTC)</div>
            <div className="v">{formatUtc(event.endDatetime)}</div>
          </div>
          <div className="pub-detail-item">
            <div className="k">Sport</div>
            <div className="v">
              <Link href={`/sports/${event.sport.slug}`}>{event.sport.name}</Link>
            </div>
          </div>
          <div className="pub-detail-item">
            <div className="k">Competition</div>
            <div className="v">{event.competition?.name ?? "—"}</div>
          </div>
          <div className="pub-detail-item">
            <div className="k">Timezone</div>
            <div className="v">{event.timezone}</div>
          </div>
          <div className="pub-detail-item">
            <div className="k">Data quality</div>
            <div className="v">{event.dataQualityScore}/100</div>
          </div>
        </div>

        <section className="pub-section">
          <h2>Participants</h2>
          {event.participants.length === 0 ? (
            <p className="pub-empty">TBD</p>
          ) : (
            <ul>
              {event.participants.map((row) => (
                <li key={`${row.participantId}-${row.role}`}>
                  <strong>{row.role}</strong>: {row.participant.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        {event.officialUrl ? (
          <p>
            Stream / official:{" "}
            <a href={event.officialUrl} target="_blank" rel="noreferrer">
              {event.officialUrl}
            </a>
          </p>
        ) : null}

        <div className="pub-attribution">
          {attribution ?? "Source attribution stored per provider."}
          {event.sourceLinks[0]?.sourceUrl ? (
            <>
              {" "}
              <a href={event.sourceLinks[0].sourceUrl} target="_blank" rel="noreferrer">
                Source record
              </a>
            </>
          ) : null}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
