import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { interviewUpdateSchema } from "@/lib/validations/interview";

// GET /api/interviews/[id] - Full interview details with evaluation scores
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;
    const { id } = await params;

    const interview = await prisma.interview.findFirst({
      where: { id, assessment: { organizationId } },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            pipelineStage: true,
            resumeUrl: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            jobTitle: true,
            department: true,
          },
        },
        panels: {
          include: {
            evaluator: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        evaluations: {
          include: {
            evaluator: { select: { id: true, name: true } },
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                order: true,
                competency: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: [{ questionId: "asc" }, { createdAt: "asc" }],
        },
        _count: {
          select: { evaluations: true, panels: true },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

// PATCH /api/interviews/[id] - Update status or recommendation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;
    const { id } = await params;

    const existing = await prisma.interview.findFirst({
      where: { id, assessment: { organizationId } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = interviewUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // If marking as completed, set completedAt
    if (parsed.data.status === "COMPLETED" && !existing.completedAt) {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        assessment: { select: { id: true, title: true } },
        panels: {
          include: {
            evaluator: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 }
    );
  }
}
