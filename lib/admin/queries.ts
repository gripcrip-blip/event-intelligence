import { prisma } from "@/lib/db";
import type { EventStatus, Prisma } from "@prisma/client";

export async function getAdminDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [
    totalEvents,
    eventsAddedToday,
    eventsUpdatedToday,
    cancelledCount,
    postponedCount,
    bySport,
    byStatus,
    providers,
    recentSyncs,
  ] = await Promise.all([
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.event.count({
      where: { deletedAt: null, createdAt: { gte: startOfToday } },
    }),
    prisma.event.count({
      where: { deletedAt: null, updatedAt: { gte: startOfToday } },
    }),
    prisma.event.count({ where: { deletedAt: null, status: "CANCELLED" } }),
    prisma.event.count({ where: { deletedAt: null, status: "POSTPONED" } }),
    prisma.event.groupBy({
      by: ["sportId"],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { _count: { sportId: "desc" } },
    }),
    prisma.event.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.sourceProvider.findMany({ orderBy: { name: "asc" } }),
    prisma.providerSyncRun.findMany({
      take: 8,
      orderBy: { startedAt: "desc" },
      include: { sourceProvider: true },
    }),
  ]);

  const sports = await prisma.sport.findMany({
    where: { id: { in: bySport.map((row) => row.sportId) } },
  });
  const sportMap = new Map(sports.map((s) => [s.id, s]));

  return {
    totalEvents,
    eventsAddedToday,
    eventsUpdatedToday,
    cancelledCount,
    postponedCount,
    bySport: bySport.map((row) => ({
      sport: sportMap.get(row.sportId),
      count: row._count._all,
    })),
    byStatus: byStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
    providers,
    recentSyncs,
  };
}

export type AdminEventFilters = {
  q?: string;
  sport?: string;
  status?: EventStatus | "";
  page?: number;
  pageSize?: number;
};

export async function listAdminEvents(filters: AdminEventFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, filters.pageSize ?? 40));
  const where: Prisma.EventWhereInput = { deletedAt: null };

  if (filters.sport) {
    where.sport = { slug: filters.sport };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { canonicalName: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { competition: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, events, sports] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { startDatetime: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sport: true,
        competition: true,
        participants: {
          include: { participant: true },
          orderBy: { sortOrder: "asc" },
        },
        sourceLinks: {
          include: { sourceProvider: true },
          take: 3,
        },
      },
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

export async function getAdminEventById(id: string) {
  return prisma.event.findFirst({
    where: { id, deletedAt: null },
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

export async function getAdminSources() {
  const [providers, syncRuns] = await Promise.all([
    prisma.sourceProvider.findMany({ orderBy: { name: "asc" } }),
    prisma.providerSyncRun.findMany({
      take: 30,
      orderBy: { startedAt: "desc" },
      include: { sourceProvider: true },
    }),
  ]);

  return { providers, syncRuns };
}

export async function listAdminSports() {
  return prisma.sport.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { events: true } },
    },
  });
}
