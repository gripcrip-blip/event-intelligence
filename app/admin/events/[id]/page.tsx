import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminEventById } from "@/lib/admin/queries";
import { formatUtc, statusBadgeClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getAdminEventById(id);
  if (!event) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="muted" style={{ marginBottom: "0.35rem" }}>
            <Link href="/admin/events">← Events</Link>
          </p>
          <h1>{event.canonicalName}</h1>
          <p>
            <code>{event.slug}</code>
          </p>
        </div>
        <span className={statusBadgeClass(event.status)}>{event.status}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="k">Sport</div>
          <div className="v">{event.sport.name}</div>
        </div>
        <div className="detail-item">
          <div className="k">Kind</div>
          <div className="v">{event.kind}</div>
        </div>
        <div className="detail-item">
          <div className="k">Start (UTC)</div>
          <div className="v">{formatUtc(event.startDatetime)}</div>
        </div>
        <div className="detail-item">
          <div className="k">End (UTC)</div>
          <div className="v">{formatUtc(event.endDatetime)}</div>
        </div>
        <div className="detail-item">
          <div className="k">Timezone</div>
          <div className="v">{event.timezone}</div>
        </div>
        <div className="detail-item">
          <div className="k">Competition</div>
          <div className="v">{event.competition?.name ?? "—"}</div>
        </div>
        <div className="detail-item">
          <div className="k">Quality score</div>
          <div className="v">{event.dataQualityScore}</div>
        </div>
        <div className="detail-item">
          <div className="k">License tier</div>
          <div className="v">{event.licenseTier}</div>
        </div>
        <div className="detail-item">
          <div className="k">Verified</div>
          <div className="v">{event.verified ? "yes" : "no"}</div>
        </div>
        <div className="detail-item">
          <div className="k">Last source update</div>
          <div className="v">{formatUtc(event.lastSourceUpdateAt)}</div>
        </div>
        <div className="detail-item">
          <div className="k">Created</div>
          <div className="v">{formatUtc(event.createdAt)}</div>
        </div>
        <div className="detail-item">
          <div className="k">Updated</div>
          <div className="v">{formatUtc(event.updatedAt)}</div>
        </div>
      </div>

      {event.officialUrl ? (
        <p>
          Official / stream:{" "}
          <a href={event.officialUrl} target="_blank" rel="noreferrer">
            {event.officialUrl}
          </a>
        </p>
      ) : null}

      <div className="section">
        <h2>Participants</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
                <th>Slug</th>
                <th>External ID</th>
              </tr>
            </thead>
            <tbody>
              {event.participants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No participants linked.
                  </td>
                </tr>
              ) : (
                event.participants.map((row) => (
                  <tr key={`${row.participantId}-${row.role}`}>
                    <td>{row.role}</td>
                    <td>{row.participant.name}</td>
                    <td>
                      <code>{row.participant.slug}</code>
                    </td>
                    <td>
                      <code>{row.participant.externalSourceId ?? "—"}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Source provenance</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Source event ID</th>
                <th>Confidence</th>
                <th>Last seen</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {event.sourceLinks.map((link) => (
                <tr key={link.id}>
                  <td>
                    {link.sourceProvider.name}
                    <div className="muted">
                      <code>{link.sourceProvider.key}</code>
                    </div>
                  </td>
                  <td>
                    <code>{link.sourceEventId}</code>
                  </td>
                  <td>{String(link.matchConfidence)}</td>
                  <td>{formatUtc(link.lastSeenAt)}</td>
                  <td className="wrap">
                    {link.sourceUrl ? (
                      <a href={link.sourceUrl} target="_blank" rel="noreferrer">
                        open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
