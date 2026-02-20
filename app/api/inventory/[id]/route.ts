import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const battery = await prisma.inventoryBattery.findFirst({
    where: { id, organizationId: auth.user.organizationId },
    include: {
      tests: { orderBy: { order: "asc" } },
      createdBy: { select: { name: true, email: true } },
      invitations: {
        orderBy: { createdAt: "desc" },
        include: {
          results: {
            select: {
              testType: true,
              rawScores: true,
              scaledScores: true,
              bandLabel: true,
              aiSummary: true,
              completedAt: true,
            },
          },
        },
      },
    },
  });

  if (!battery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const total = battery.invitations.length;
  const started = battery.invitations.filter(
    (i) => i.status === "in_progress" || i.status === "completed"
  ).length;
  const completed = battery.invitations.filter(
    (i) => i.status === "completed"
  ).length;

  return NextResponse.json({ ...battery, stats: { total, started, completed } });
}
