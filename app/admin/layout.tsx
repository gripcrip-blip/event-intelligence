import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/sports", label: "Sports" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Event Intelligence
          <span>Admin · MVP</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="muted" style={{ fontSize: "0.75rem", marginTop: "auto" }}>
          Auth not enabled yet. Local/dev use only.
        </p>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
