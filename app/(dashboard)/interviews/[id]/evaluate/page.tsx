import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EvaluationInterface } from "@/components/interviews/evaluation-interface";

type PageParams = Promise<{ id: string }>;

export default async function EvaluatePage({ params }: { params: PageParams }) {
  const user = await requireAuth();
  const { id: interviewId } = await params;

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, assessment: { organizationId: user.organizationId } },
    include: {
      candidate: { select: { id: true, name: true } },
      assessment: {
        select: {
          id: true,
          title: true,
          questions: {
            orderBy: { order: "asc" },
            include: {
              competency: { select: { id: true, name: true } },
              rubricLevels: { orderBy: { level: "asc" } },
            },
          },
        },
      },
      panels: { select: { evaluatorId: true, role: true } },
      evaluations: {
        where: { evaluatorId: user.id },
        select: { questionId: true, score: true, notes: true },
      },
    },
  });

  if (!interview) notFound();

  // Must be on the panel
  const isOnPanel = interview.panels.some((p) => p.evaluatorId === user.id);
  if (!isOnPanel && user.role !== "ADMIN") {
    redirect(`/interviews/${interviewId}`);
  }

  // Cannot evaluate a cancelled or completed interview
  if (interview.status === "CANCELLED" || interview.status === "COMPLETED") {
    redirect(`/interviews/${interviewId}`);
  }

  // Build existing evaluations map
  const existingEvals = Object.fromEntries(
    interview.evaluations.map((e) => [
      e.questionId,
      { score: e.score, notes: e.notes ?? "" },
    ])
  );

  return (
    <EvaluationInterface
      interviewId={interviewId}
      candidateName={interview.candidate.name}
      assessmentTitle={interview.assessment.title}
      questions={interview.assessment.questions}
      existingEvals={existingEvals}
    />
  );
}
