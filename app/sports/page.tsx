import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PublicSportsPage() {
  const now = new Date();
  const sports = await prisma.sport.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          events: {
            where: {
              deletedAt: null,
              startDatetime: { gte: now },
              status: { notIn: ["CANCELLED"] },
            },
          },
        },
      },
    },
  });

  return (
    <div className="pub-shell">
      <PublicHeader />
      <main className="pub-main">
        <section className="pub-hero">
          <h1>Sports &amp; esports</h1>
          <p>Browse upcoming calendars by category.</p>
        </section>
        <div className="pub-sport-grid">
          {sports.map((sport) => (
            <Link key={sport.id} href={`/sports/${sport.slug}`} className="pub-sport-card">
              <strong>{sport.name}</strong>
              <span>
                {sport.category} · {sport._count.events} upcoming
              </span>
            </Link>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
