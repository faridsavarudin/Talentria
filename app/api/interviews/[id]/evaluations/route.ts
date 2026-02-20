import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluationSubmitSchema } from "@/lib/validations/interview";

// POST /api/interviews/[id]/evaluations - Submit evaluations (array upsert)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evaluatorId = session.user.id as string;
    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;
    const { id: interviewId } = await params;

    // Verify interview exists and belongs to org
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, assessment: { organizationId } },
      include: {
        panels: { select: { evaluatorId: true } },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Verify evaluator is on the panel
    const isOnPanel = interview.panels.some(
      (p) => p.evaluatorId === evaluatorId
    );
    if (!isOnPanel) {
      return NextResponse.json(
        { error: "You are not a panel member for this interview" },
        { status: 403 }
      );
    }

    if (
      interview.status !== "SCHEDULED" &&
      interview.status !== "IN_PROGRESS"
    ) {
      return NextResponse.json(
        { error: "Evaluations can only be submitted for active interviews" },
        { status: 422 }
      );
    }

    const body = await request.json();
    const parsed = evaluationSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { evaluations } = parsed.data;

    // Verify all question IDs belong to this interview's assessment
    const assessmentQuestions = await prisma.question.findMany({
      where: { assessmentId: interview.assessmentId },
      select: { id: true },
    });
    const validQuestionIds = new Set(assessmentQuestions.map((q) => q.id));

    const invalidIds = evaluations.filter(
      (e) => !validQuestionIds.has(e.questionId)
    );
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "One or more question IDs are invalid for this interview" },
        { status: 400 }
      );
    }

    // Upsert all evaluations in a transaction
    const results = await prisma.$transaction(
      evaluations.map((ev) =>
        prisma.evaluation.upsert({
          where: {
            interviewId_evaluatorId_questionId: {
              interviewId,
              evaluatorId,
              questionId: ev.questionId,
            },
          },
          create: {
            interviewId,
            evaluatorId,
            questionId: ev.questionId,
            score: ev.score,
            notes: ev.notes ?? null,
          },
          update: {
            score: ev.score,
            notes: ev.notes ?? null,
          },
        })
      )
    );

    // Auto-transition interview to IN_PROGRESS on first submission
    if (interview.status === "SCHEDULED") {
      await prisma.interview.update({
        where: { id: interviewId },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Update candidate lastActivityAt
    await prisma.candidate.update({
      where: { id: interview.candidateId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({
      message: "Evaluations submitted successfully",
      count: results.length,
    });
  } catch (error) {
    console.error("Error submitting evaluations:", error);
    return NextResponse.json(
      { error: "Failed to submit evaluations" },
      { status: 500 }
    );
  }
}
