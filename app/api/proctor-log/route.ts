import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/proctor-log — log a proctoring event (public, no auth)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inviteId, eventType, eventData } = body;

    if (!inviteId || !eventType) {
      return NextResponse.json({ error: "inviteId and eventType required" }, { status: 400 });
    }

    // Verify invite exists
    const invite = await prisma.candidateInvite.findUnique({
      where: { id: inviteId },
      select: { id: true, completedAt: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    await prisma.proctorLog.create({
      data: {
        inviteId,
        eventType,
        eventData: eventData ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
