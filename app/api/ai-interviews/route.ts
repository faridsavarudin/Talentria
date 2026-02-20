import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET /api/ai-interviews — list all AI interview sessions for the recruiter's org
export async function GET() {
  const authResult = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!authResult.ok) return authResult.response;

  const { user } = authResult;

  const sessions = await prisma.aIInterviewSession.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      status: true,
      totalQuestions: true,
      currentQuestion: true,
      aiEvaluation: true,
      inviteToken: true,
      startedAt: true,
      completedAt: true,
      durationSeconds: true,
      createdAt: true,
      assessment: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions);
}

// POST /api/ai-interviews — create a new AI interview session (recruiter-initiated)
export async function POST(request: Request) {
  const authResult = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!authResult.ok) return authResult.response;

  const { user } = authResult;

  try {
    const body = (await request.json()) as {
      candidateEmail?: string;
      candidateName?: string;
      assessmentId?: string;
      totalQuestions?: number;
    };

    const session = await prisma.aIInterviewSession.create({
      data: {
        organizationId: user.organizationId,
        assessmentId: body.assessmentId ?? null,
        candidateEmail: body.candidateEmail ?? null,
        candidateName: body.candidateName ?? null,
        totalQuestions: body.totalQuestions ?? 4,
        status: "pending",
        transcript: [],
      },
      select: {
        id: true,
        inviteToken: true,
        totalQuestions: true,
        status: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating AI interview session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
