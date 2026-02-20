import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ai-interview/[token]
// Returns session details for the candidate page to load.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const session = await prisma.aIInterviewSession.findUnique({
      where: { inviteToken: token },
      select: {
        id: true,
        inviteToken: true,
        status: true,
        totalQuestions: true,
        currentQuestion: true,
        candidateName: true,
        // candidateEmail and transcript are omitted — public endpoint, no auth
        startedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching AI interview session:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}
