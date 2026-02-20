import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public route — no session required; uses invite token
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.inventoryInvitation.findUnique({
    where: { inviteToken: token },
    include: {
      battery: {
        include: {
          tests: { orderBy: { order: "asc" } },
        },
      },
      results: {
        select: { testType: true, completedAt: true },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.status === "expired") {
    return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt) < new Date()
  ) {
    await prisma.inventoryInvitation.update({
      where: { id: invitation.id },
      data: { status: "expired" },
    });
    return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
  }

  return NextResponse.json({
    id: invitation.id,
    status: invitation.status,
    candidateName: invitation.candidateName,
    candidateEmail: invitation.candidateEmail,
    battery: {
      id: invitation.battery.id,
      title: invitation.battery.title,
      description: invitation.battery.description,
      tests: invitation.battery.tests,
    },
    completedTests: invitation.results.map((r) => r.testType),
  });
}
