import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PipelineStage } from "@prisma/client";

// PATCH /api/candidates/[id]/stage — update pipeline stage (Kanban drag-and-drop)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { stage } = (await req.json()) as { stage: string };

    if (!stage || !Object.values(PipelineStage).includes(stage as PipelineStage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: { pipelineStage: stage as PipelineStage, lastActivityAt: new Date() },
      select: { id: true, name: true, pipelineStage: true, lastActivityAt: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}
