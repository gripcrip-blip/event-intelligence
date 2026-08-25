import {
  type EventStatus,
  type LicenseTier,
  type ParticipantRole,
  type Prisma,
  SyncRunStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type { NormalizedEventDraft } from "@/providers/types";

export interface UpsertEventsOptions {
  providerKey: string;
  drafts: NormalizedEventDraft[];
  dryRun?: boolean;
}

export interface UpsertEventsResult {
  upsertedCount: number;
  skippedCount: number;
  errors: string[];
}

export async function upsertNormalizedEvents(
  options: UpsertEventsOptions,
): Promise<UpsertEventsResult> {
  const provider = await prisma.sourceProvider.findUnique({
    where: { key: options.providerKey },
  });

  if (!provider) {
    throw new Error(`Source provider not found: ${options.providerKey}`);
  }

  let upsertedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const draft of options.drafts) {
    try {
      if (options.dryRun) {
        upsertedCount += 1;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const sport = await tx.sport.findUnique({ where: { slug: draft.sportSlug } });
        if (!sport) {
          throw new Error(`Sport not found: ${draft.sportSlug}`);
        }

        let competitionId: string | undefined;
        if (draft.competitionSlug && draft.competitionName) {
          const competition = await tx.competition.upsert({
            where: { slug: draft.competitionSlug },
            create: {
              slug: draft.competitionSlug,
              name: draft.competitionName,
              sportId: sport.id,
            },
            update: {
              name: draft.competitionName,
            },
          });
          competitionId = competition.id;
        }

        const existingLink = await tx.eventSourceLink.findUnique({
          where: {
            sourceProviderId_sourceEventId: {
              sourceProviderId: provider.id,
              sourceEventId: draft.sourceEventId,
            },
          },
          include: { event: true },
        });

        const eventData: Prisma.EventUncheckedCreateInput = {
          canonicalName: draft.canonicalName,
          slug: await ensureUniqueEventSlug(tx, draft.slug, existingLink?.eventId),
          sportId: sport.id,
          kind: draft.kind,
          competitionId,
          startDatetime: draft.startDatetime,
          endDatetime: draft.endDatetime,
          timezone: draft.timezone,
          status: draft.status as EventStatus,
          countryCode: draft.countryCode,
          cityName: draft.cityName,
          venueName: draft.venueName,
          officialUrl: draft.officialUrl,
          dataQualityScore: draft.dataQualityScore,
          licenseTier: draft.licenseTier as LicenseTier,
          exposeAsConfirmed: draft.dataQualityScore >= 50 && draft.status !== "TENTATIVE",
          lastSourceUpdateAt: new Date(),
        };

        let eventId: string;

        if (existingLink) {
          await tx.event.update({
            where: { id: existingLink.eventId },
            data: eventData,
          });
          eventId = existingLink.eventId;

          await tx.eventSourceLink.update({
            where: { id: existingLink.id },
            data: {
              sourceUrl: draft.sourceUrl,
              rawPayloadHash: draft.rawPayloadHash,
              lastSeenAt: new Date(),
              matchConfidence: 1,
            },
          });
        } else {
          const event = await tx.event.create({ data: eventData });
          eventId = event.id;

          await tx.eventSourceLink.create({
            data: {
              eventId,
              sourceProviderId: provider.id,
              sourceEventId: draft.sourceEventId,
              sourceUrl: draft.sourceUrl,
              rawPayloadHash: draft.rawPayloadHash,
              matchConfidence: 1,
            },
          });
        }

        await tx.eventParticipant.deleteMany({ where: { eventId } });

        for (const p of draft.participants) {
          const participant = await tx.participant.upsert({
            where: {
              sportId_slug: {
                sportId: sport.id,
                slug: p.slug,
              },
            },
            create: {
              sportId: sport.id,
              slug: p.slug,
              name: p.name,
              normalizedName: p.name.toLowerCase(),
              type: "TEAM",
              externalSourceId: p.externalId,
            },
            update: {
              name: p.name,
              normalizedName: p.name.toLowerCase(),
              externalSourceId: p.externalId,
            },
          });

          await tx.eventParticipant.create({
            data: {
              eventId,
              participantId: participant.id,
              role: p.role as ParticipantRole,
              sortOrder: p.sortOrder,
            },
          });
        }
      });

      upsertedCount += 1;
    } catch (err) {
      skippedCount += 1;
      errors.push(
        `${draft.sourceEventId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { upsertedCount, skippedCount, errors };
}

async function ensureUniqueEventSlug(
  tx: Prisma.TransactionClient,
  baseSlug: string,
  existingEventId?: string,
): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const found = await tx.event.findUnique({ where: { slug } });
    if (!found || found.id === existingEventId) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export async function recordProviderSyncRun(input: {
  providerKey: string;
  fetchedCount: number;
  upsertedCount: number;
  errorCount: number;
  status: SyncRunStatus;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const provider = await prisma.sourceProvider.findUnique({
    where: { key: input.providerKey },
  });
  if (!provider) return;

  await prisma.$transaction([
    prisma.providerSyncRun.create({
      data: {
        sourceProviderId: provider.id,
        status: input.status,
        fetchedCount: input.fetchedCount,
        upsertedCount: input.upsertedCount,
        errorCount: input.errorCount,
        finishedAt: new Date(),
        meta: input.meta as Prisma.InputJsonValue,
      },
    }),
    prisma.sourceProvider.update({
      where: { id: provider.id },
      data: {
        lastSyncAt: new Date(),
        lastError: input.errorCount > 0 ? `${input.errorCount} errors in last sync` : null,
        healthStatus: input.errorCount > 0 ? "DEGRADED" : "HEALTHY",
      },
    }),
  ]);
}
