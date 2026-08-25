import { getAdminSources } from "@/lib/admin/queries";
import { formatUtc, statusBadgeClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const { providers, syncRuns } = await getAdminSources();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Sources</h1>
          <p>Provider license flags, health and sync history.</p>
        </div>
      </div>

      <div className="section">
        <h2>Providers</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Health</th>
                <th>Active</th>
                <th>Display</th>
                <th>Store</th>
                <th>Redistribute</th>
                <th>Last sync</th>
                <th>Last error</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="muted">
                      <code>{p.key}</code>
                    </div>
                    {p.attributionRequired && p.attributionText ? (
                      <div className="muted" style={{ maxWidth: 280, whiteSpace: "normal" }}>
                        {p.attributionText}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <span className={statusBadgeClass(p.healthStatus)}>{p.healthStatus}</span>
                  </td>
                  <td>{p.isActive ? "yes" : "no"}</td>
                  <td>{p.commercialDisplayAllowed ? "yes" : "no"}</td>
                  <td>{p.storageAllowed ? "yes" : "no"}</td>
                  <td>{p.redistributionAllowed ? "yes" : "no"}</td>
                  <td>{formatUtc(p.lastSyncAt)}</td>
                  <td className="wrap muted">{p.lastError ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Sync runs</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Started</th>
                <th>Finished</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Fetched</th>
                <th>Upserted</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {syncRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">
                    No sync runs recorded.
                  </td>
                </tr>
              ) : (
                syncRuns.map((run) => (
                  <tr key={run.id}>
                    <td>{formatUtc(run.startedAt)}</td>
                    <td>{formatUtc(run.finishedAt)}</td>
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
