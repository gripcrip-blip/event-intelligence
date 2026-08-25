import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/admin/queries";
import { formatUtc, statusBadgeClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of the event database and provider health.</p>
        </div>
        <Link className="btn" href="/admin/events">
          Browse events
        </Link>
      </div>

      <div className="notice">
        Read-only admin for now. Sync via <code>npm run sync:pandascore</code>.
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total events</div>
          <div className="value">{stats.totalEvents}</div>
        </div>
        <div className="stat-card">
          <div className="label">Added today (UTC)</div>
          <div className="value">{stats.eventsAddedToday}</div>
        </div>
        <div className="stat-card">
          <div className="label">Updated today (UTC)</div>
          <div className="value">{stats.eventsUpdatedToday}</div>
        </div>
        <div className="stat-card">
          <div className="label">Cancelled</div>
          <div className="value">{stats.cancelledCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Postponed</div>
          <div className="value">{stats.postponedCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Providers</div>
          <div className="value">{stats.providers.length}</div>
        </div>
      </div>

      <div className="section">
        <h2>Events by sport</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Sport</th>
                <th>Slug</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.bySport.map((row) => (
                <tr key={row.sport?.id ?? "unknown"}>
                  <td>{row.sport?.name ?? "Unknown"}</td>
                  <td>
                    <code>{row.sport?.slug ?? "—"}</code>
                  </td>
                  <td>
                    <Link href={`/admin/events?sport=${row.sport?.slug ?? ""}`}>{row.count}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Events by status</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.byStatus.map((row) => (
                <tr key={row.status}>
                  <td>
                    <span className={statusBadgeClass(row.status)}>{row.status}</span>
                  </td>
                  <td>
                    <Link href={`/admin/events?status=${row.status}`}>{row.count}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Source providers</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Health</th>
                <th>Last sync</th>
                <th>Redistribution</th>
              </tr>
            </thead>
            <tbody>
              {stats.providers.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href="/admin/sources">{p.name}</Link>
                    <div className="muted">
                      <code>{p.key}</code>
                    </div>
                  </td>
                  <td>
                    <span className={statusBadgeClass(p.healthStatus)}>{p.healthStatus}</span>
                  </td>
                  <td>{formatUtc(p.lastSyncAt)}</td>
                  <td>{p.redistributionAllowed ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Recent sync runs</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Started</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Fetched</th>
                <th>Upserted</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSyncs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    No sync runs yet.
                  </td>
                </tr>
              ) : (
                stats.recentSyncs.map((run) => (
                  <tr key={run.id}>
                    <td>{formatUtc(run.startedAt)}</td>
                    <td>{run.sourceProvider.name}</td>
                    <td>
                      <span className={statusBadgeClass(run.status)}>{run.status}</span>
                    </td>
                    <td>{run.fetchedCount}</td>
                    <td>{run.upsertedCount}</td>
                    <td>{run.errorCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
