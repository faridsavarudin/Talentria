import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/invite/[token]/complete — mark interview as completed
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.candidateInvite.findUnique({
    where: { token },
    select: { id: true, completedAt: true, asyncInterviewId: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.completedAt) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  await prisma.candidateInvite.update({
    where: { id: invite.id },
    data: { completedAt: new Date() },
  });

  // Check if all invites for this async interview are done and update status
  const [totalInvites, completedInvites] = await Promise.all([
    prisma.candidateInvite.count({ where: { asyncInterviewId: invite.asyncInterviewId } }),
    prisma.candidateInvite.count({
      where: { asyncInterviewId: invite.asyncInterviewId, completedAt: { not: null } },
    }),
  ]);

  if (completedInvites === totalInvites) {
    await prisma.asyncInterview.update({
      where: { id: invite.asyncInterviewId },
      data: { status: "COMPLETED" },
    });
  }

  return NextResponse.json({ ok: true });
}
