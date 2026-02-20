import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const SEVERITY: Record<string, "critical" | "warning" | "info"> = {
  tab_switch: "info",       // escalates based on count (handled below)
  fullscreen_exit: "warning",
  no_face_detected: "warning",
  multiple_faces: "critical",
  copy_paste_attempt: "critical",
  time_limit_exceeded: "info",
  window_blur: "info",
  devtools_open: "critical",
};

// GET /api/async-interviews/[id]/proctors
// Returns aggregated proctor report for an async interview
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const asyncInterview = await prisma.asyncInterview.findFirst({
      where: { id, organizationId: user.organizationId },
      select: { id: true },
    });

    if (!asyncInterview) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const logs = await prisma.proctorLog.findMany({
      where: { inviteId: { in: await getInviteIds(id) } },
      orderBy: { occurredAt: "asc" },
    });

    // Group by eventType
    const byType = new Map<string, typeof logs>();
    for (const log of logs) {
      const key = log.eventType;
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key)!.push(log);
    }

    const events = Array.from(byType.entries()).map(([eventType, entries]) => {
      let severity = SEVERITY[eventType] ?? "info";

      // Tab switch: escalate to warning if > 3 times
      if (eventType === "tab_switch" && entries.length > 3) {
        severity = "warning";
      }

      return {
        eventType,
        severity,
        count: entries.length,
        firstOccurrence: entries[0].occurredAt,
        lastOccurrence: entries[entries.length - 1].occurredAt,
      };
    });

    const critical = events.filter((e) => e.severity === "critical").reduce((s, e) => s + e.count, 0);
    const warning = events.filter((e) => e.severity === "warning").reduce((s, e) => s + e.count, 0);
    const info = events.filter((e) => e.severity === "info").reduce((s, e) => s + e.count, 0);

    const overallRiskLevel: "low" | "medium" | "high" =
      critical > 0 ? "high" : warning >= 3 || info >= 5 ? "medium" : "low";

    return NextResponse.json({
      totalEvents: logs.length,
      overallRiskLevel,
      severityBreakdown: { critical, warning, info },
      events: events.sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
      }),
    });
  } catch (err) {
    console.error("proctors GET error:", err);
    return NextResponse.json({ error: "Failed to load proctor report" }, { status: 500 });
  }
}

async function getInviteIds(asyncInterviewId: string): Promise<string[]> {
  const invites = await prisma.candidateInvite.findMany({
    where: { asyncInterviewId },
    select: { id: true },
  });
  return invites.map((i) => i.id);
}
