import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/invite/[token] — validate token and return interview info (public, no auth)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.candidateInvite.findUnique({
    where: { token },
    include: {
      asyncInterview: {
        include: {
          assessment: {
            include: {
              questions: {
                include: { rubricLevels: { orderBy: { level: "asc" } } },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
      responses: { select: { questionId: true, status: true } },
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This interview link has expired" }, { status: 410 });
  }

  if (invite.completedAt) {
    return NextResponse.json({ error: "You have already submitted this interview" }, { status: 409 });
  }

  // Mark as opened if first visit
  if (!invite.openedAt) {
    await prisma.candidateInvite.update({
      where: { id: invite.id },
      data: { openedAt: new Date() },
    });
  }

  // Return safe public data (no sensitive org info)
  return NextResponse.json({
    inviteId: invite.id,
    email: invite.email,
    interviewTitle: invite.asyncInterview.title,
    instructions: invite.asyncInterview.instructions,
    timeLimitSeconds: invite.asyncInterview.timeLimitSeconds,
    retakesAllowed: invite.asyncInterview.retakesAllowed,
    deadlineAt: invite.asyncInterview.deadlineAt,
    questions: invite.asyncInterview.assessment.questions.map((q) => ({
      id: q.id,
      content: q.content,
      type: q.type,
    })),
    completedQuestions: invite.responses
      .filter((r) => r.status === "SUBMITTED")
      .map((r) => r.questionId),
  });
}
