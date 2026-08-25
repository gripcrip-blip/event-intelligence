import { prisma } from "@/lib/db";
import type { EventStatus, Prisma } from "@prisma/client";

const publicEventInclude = {
  sport: true,
  competition: true,
  participants: {
    include: { participant: true },
    orderBy: { sortOrder: "asc" as const },
  },
  sourceLinks: {
    include: { sourceProvider: true },
    take: 2,
  },
} satisfies Prisma.EventInclude;

export async function getPublicHomeData() {
  const now = new Date();
  const [upcoming, sports, totalUpcoming] = await Promise.all([
    prisma.event.findMany({
      where: {
        deletedAt: null,
        startDatetime: { gte: now },
        exposeAsConfirmed: true,
        status: { notIn: ["CANCELLED"] },
      },
      orderBy: { startDatetime: "asc" },
      take: 12,
      include: publicEventInclude,
    }),
    prisma.sport.findMany({
      where: { isActive: true, category: "ESPORTS" },
      orderBy: { name: "asc" },
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
    }),
    prisma.event.count({
      where: {
        deletedAt: null,
        startDatetime: { gte: now },
        status: { notIn: ["CANCELLED"] },
      },
    }),
  ]);

  return { upcoming, sports, totalUpcoming };
}

export type PublicEventFilters = {
  q?: string;
  sport?: string;
  status?: EventStatus | "";
  page?: number;
  pageSize?: number;
};

export async function listPublicEvents(filters: PublicEventFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, filters.pageSize ?? 30));
  const now = new Date();

  const where: Prisma.EventWhereInput = {
    deletedAt: null,
    startDatetime: { gte: now },
    status: { notIn: ["CANCELLED"] },
  };

  if (filters.sport) where.sport = { slug: filters.sport };
  if (filters.status) where.status = filters.status;
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { canonicalName: { contains: q, mode: "insensitive" } },
      { competition: { name: { contains: q, mode: "insensitive" } } },
      {
        participants: {
          some: { participant: { name: { contains: q, mode: "insensitive" } } },
        },
      },
    ];
  }

  const [total, events, sports] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startDatetime: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: publicEventInclude,
    }),
    prisma.sport.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    events,
    sports,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPublicEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, deletedAt: null },
    include: {
      sport: true,
      competition: true,
      participants: {
        include: { participant: true },
        orderBy: { sortOrder: "asc" },
      },
      sourceLinks: {
        include: { sourceProvider: true },
        orderBy: { lastSeenAt: "desc" },
      },
    },
  });
}

export async function getPublicSportPage(sportSlug: string) {
  const sport = await prisma.sport.findUnique({ where: { slug: sportSlug } });
  if (!sport) return null;

  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      sportId: sport.id,
      startDatetime: { gte: now },
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: { startDatetime: "asc" },
    take: 50,
    include: publicEventInclude,
  });

  return { sport, events };
}
