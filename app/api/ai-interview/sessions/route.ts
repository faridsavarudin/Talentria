import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/ai-interview/sessions
// Creates a new AIInterviewSession and returns the inviteToken.
// This endpoint is public so demo sessions (no org) and recruiter-created sessions
// can both be initiated.
export async function POST(request: Request) {
  // Rate limit: 10 sessions per IP per hour
  const ip = getClientIp(request);
  const rl = rateLimit(`ai-session:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json() as {
      organizationId?: string;
      assessmentId?: string;
      candidateEmail?: string;
      candidateName?: string;
      totalQuestions?: number;
    };

    const session = await prisma.aIInterviewSession.create({
      data: {
        organizationId: body.organizationId ?? null,
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

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating AI interview session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
