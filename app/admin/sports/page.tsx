import Link from "next/link";
import { listAdminSports } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminSportsPage() {
  const sports = await listAdminSports();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Sports</h1>
          <p>Taxonomy including esports titles.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Active</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            {sports.map((sport) => (
              <tr key={sport.id}>
                <td>{sport.name}</td>
                <td>
                  <code>{sport.slug}</code>
                </td>
                <td>{sport.category}</td>
                <td>{sport.isActive ? "yes" : "no"}</td>
                <td>
                  <Link href={`/admin/events?sport=${sport.slug}`}>{sport._count.events}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
