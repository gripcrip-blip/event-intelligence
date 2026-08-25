import Link from "next/link";
import { EventTable, PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import { getPublicHomeData } from "@/lib/public/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { upcoming, sports, totalUpcoming } = await getPublicHomeData();

  return (
    <div className="pub-shell">
      <PublicHeader />
      <main className="pub-main">
        <section className="pub-hero">
          <h1>Event Intelligence</h1>
          <p>
            Clean, continuously updated sports &amp; esports calendars — normalized schedules with
            provenance, not a live-score feed.
          </p>
          <p className="pub-hero-meta">
            {totalUpcoming} upcoming events in the database · Europe &amp; global esports coverage
            growing
          </p>
          <div className="pub-cta-row">
            <Link className="pub-btn" href="/events">
              Browse upcoming events
            </Link>
            <Link className="pub-btn pub-btn-ghost" href="/sports">
              Sports &amp; esports
            </Link>
          </div>
        </section>

        <section className="pub-section">
          <h2>Popular esports</h2>
          <div className="pub-sport-grid">
            {sports.map((sport) => (
              <Link key={sport.id} href={`/sports/${sport.slug}`} className="pub-sport-card">
                <strong>{sport.name}</strong>
                <span>{sport._count.events} upcoming</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pub-section">
          <h2>Upcoming events</h2>
          <EventTable events={upcoming} />
          <p style={{ marginTop: "1rem" }}>
            <Link href="/events">View full calendar →</Link>
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
