import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="pub-header">
      <div className="pub-header-inner">
        <Link href="/" className="pub-logo">
          Event Intelligence
        </Link>
        <nav className="pub-nav">
          <Link href="/events">Events</Link>
          <Link href="/sports">Sports</Link>
          <Link href="/admin" className="pub-nav-muted">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer-inner">
        <p>
          Structured sports &amp; esports calendars. Data for display; sources attributed where
          required.
        </p>
        <p className="pub-footer-meta">
          <a href="https://www.pandascore.co" target="_blank" rel="noreferrer">
            Esports fixtures via PandaScore
          </a>
        </p>
      </div>
    </footer>
  );
}

type EventRow = {
  id: string;
  slug: string;
  canonicalName: string;
  startDatetime: Date;
  status: string;
  sport: { name: string; slug: string };
  competition: { name: string } | null;
  participants: Array<{
    participant: { name: string };
  }>;
};

export function EventTable({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return <p className="pub-empty">No upcoming events.</p>;
  }

  return (
    <div className="pub-table-wrap">
      <table className="pub-table">
        <thead>
          <tr>
            <th>Date (UTC)</th>
            <th>Event</th>
            <th>Sport</th>
            <th>Competition</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const teams = event.participants.map((p) => p.participant.name).join(" vs ");
            return (
              <tr key={event.id}>
                <td className="pub-mono">
                  {event.startDatetime.toISOString().slice(0, 16).replace("T", " ")}
                </td>
                <td>
                  <Link href={`/events/${event.slug}`} className="pub-event-link">
                    {event.canonicalName}
                  </Link>
                  {teams ? <div className="pub-sub">{teams}</div> : null}
                </td>
                <td>
                  <Link href={`/sports/${event.sport.slug}`}>{event.sport.name}</Link>
                </td>
                <td className="pub-muted">{event.competition?.name ?? "—"}</td>
                <td>
                  <span className={`pub-status pub-status-${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
