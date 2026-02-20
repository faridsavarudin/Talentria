import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProctorEventType, ProctorSeverity } from "@prisma/client";
import { z } from "zod";

const MAX_EVENTS_PER_INVITATION = 100;

const ProctorEventSchema = z.object({
  eventType: z.nativeEnum(ProctorEventType),
  severity: z.nativeEnum(ProctorSeverity),
  itemIndex: z.number().int().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/inventory/invite/[token]/proctor
 *
 * Public endpoint (no session auth) — the candidate authenticates via the
 * invite token present in the URL. Records a single proctor event.
 *
 * Rate-limited to MAX_EVENTS_PER_INVITATION events per invitation to prevent
 * log flooding.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Look up invitation by token
  const invitation = await prisma.inventoryInvitation.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      status: true,
      _count: { select: { proctorEvents: true } },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  // Only log events while the test is active (pending or in_progress)
  if (invitation.status === "completed" || invitation.status === "expired") {
    return NextResponse.json(
      { error: "Invitation is no longer active" },
      { status: 409 }
    );
  }

  // Rate limit: reject if too many events already recorded
  if (invitation._count.proctorEvents >= MAX_EVENTS_PER_INVITATION) {
    return NextResponse.json(
      { error: "Proctor event limit reached for this invitation" },
      { status: 429 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ProctorEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { eventType, severity, itemIndex, metadata } = parsed.data;

  await prisma.proctorEvent.create({
    data: {
      invitationId: invitation.id,
      eventType,
      severity,
      itemIndex: itemIndex ?? null,
      ...(metadata !== undefined && { metadata: metadata as Record<string, string | number | boolean | null> }),
    },
  });

  return NextResponse.json({ ok: true });
}
