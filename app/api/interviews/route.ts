import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { interviewCreateSchema } from "@/lib/validations/interview";
import type { InterviewStatus } from "@prisma/client";

// GET /api/interviews - List interviews with candidate + assessment info
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as InterviewStatus | null;
    const candidateId = searchParams.get("candidateId");
    const assessmentId = searchParams.get("assessmentId");

    const interviews = await prisma.interview.findMany({
      where: {
        assessment: { organizationId },
        ...(status && { status }),
        ...(candidateId && { candidateId }),
        ...(assessmentId && { assessmentId }),
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        candidate: {
          select: { id: true, name: true, email: true, pipelineStage: true },
        },
        assessment: {
          select: { id: true, title: true, jobTitle: true },
        },
        panels: {
          include: {
            evaluator: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        _count: {
          select: { evaluations: true },
        },
      },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

// POST /api/interviews - Schedule an interview
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    const body = await request.json();
    const parsed = interviewCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assessmentId, candidateId, scheduledAt, panelMembers } =
      parsed.data;

    // Verify assessment belongs to org
    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, organizationId, status: "ACTIVE" },
    });
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or not active" },
        { status: 404 }
      );
    }

    // Verify candidate belongs to org
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, organizationId },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Verify all evaluators belong to org
    const evaluatorIds = panelMembers.map((p) => p.evaluatorId);
    const evaluators = await prisma.user.findMany({
      where: { id: { in: evaluatorIds }, organizationId },
      select: { id: true },
    });
    if (evaluators.length !== evaluatorIds.length) {
      return NextResponse.json(
        { error: "One or more evaluators not found in your organization" },
        { status: 404 }
      );
    }

    // Create interview + panels + update candidate in a transaction
    const interview = await prisma.$transaction(async (tx) => {
      const created = await tx.interview.create({
        data: {
          assessmentId,
          candidateId,
          scheduledAt: new Date(scheduledAt),
          status: "SCHEDULED",
          panels: {
            create: panelMembers.map((p) => ({
              evaluatorId: p.evaluatorId,
              role: p.role,
            })),
          },
        },
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          assessment: { select: { id: true, title: true } },
          panels: {
            include: {
              evaluator: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      await tx.candidate.update({
        where: { id: candidateId },
        data: {
          pipelineStage: "INTERVIEW",
          lastActivityAt: new Date(),
        },
      });

      return created;
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}
