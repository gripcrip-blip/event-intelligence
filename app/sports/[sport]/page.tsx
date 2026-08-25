import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventTable, PublicFooter, PublicHeader } from "@/components/public/PublicChrome";
import { getPublicSportPage } from "@/lib/public/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  const data = await getPublicSportPage(slug);
  if (!data) return { title: "Sport not found" };
  return {
    title: `${data.sport.name} calendar | Event Intelligence`,
    description: `Upcoming ${data.sport.name} events`,
  };
}

export default async function PublicSportPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const data = await getPublicSportPage(slug);
  if (!data) notFound();

  return (
    <div className="pub-shell">
      <PublicHeader />
      <main className="pub-main">
        <p className="pub-muted">
          <Link href="/sports">← All sports</Link>
        </p>
        <section className="pub-hero">
          <h1>{data.sport.name}</h1>
          <p>
            Upcoming calendar · {data.events.length} events shown
            {data.events.length >= 50 ? " (capped at 50)" : ""}
          </p>
        </section>
        <EventTable events={data.events} />
        <p style={{ marginTop: "1rem" }}>
          <Link href={`/events?sport=${data.sport.slug}`}>Open in events filter →</Link>
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
