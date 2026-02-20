import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { asyncInterviewScoreSchema } from "@/lib/validations/async-interview";

/**
 * POST /api/async-interviews/[id]/score
 *
 * Analytics Bridge: saves recruiter score to VideoResponse AND creates
 * a Candidate + Interview + Evaluation record so ICC/bias analytics work
 * automatically with no changes to existing analytics code.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = asyncInterviewScoreSchema.safeParse(await req.json());

    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const { questionId, score, notes } = body.data;

    // Load the async interview with the invite (to find the candidate email)
    const asyncInterview = await prisma.asyncInterview.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        invitations: {
          where: {
            responses: { some: { questionId } },
          },
          take: 1,
          include: { candidate: true },
        },
      },
    });

    if (!asyncInterview) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const invite = asyncInterview.invitations[0];
    if (!invite) {
      return NextResponse.json({ error: "No response found for this question" }, { status: 404 });
    }

    // Step 1: Find or create Candidate record for this email
    let candidate = invite.candidate;
    if (!candidate) {
      candidate = await prisma.candidate.upsert({
        where: {
          // Use the unique email + organizationId combo
          // Note: Candidate has unique(email, organizationId) implicitly via @index
          // Since no @unique constraint, use findFirst + create pattern
          id: "nonexistent", // force the create path
        },
        create: {
          name: invite.email.split("@")[0],
          email: invite.email,
          organizationId: user.organizationId,
        },
        update: {},
      }).catch(async () => {
        // Upsert by email within org
        const existing = await prisma.candidate.findFirst({
          where: { email: invite.email, organizationId: user.organizationId },
        });
        if (existing) return existing;
        return prisma.candidate.create({
          data: {
            name: invite.email.split("@")[0],
            email: invite.email,
            organizationId: user.organizationId,
          },
        });
      });

      // Link candidate to the invite
      await prisma.candidateInvite.update({
        where: { id: invite.id },
        data: { candidateId: candidate.id },
      });
    }

    // Step 2: Find or create Interview record (analytics bridge)
    let interview = await prisma.interview.findFirst({
      where: {
        candidateId: candidate.id,
        assessmentId: asyncInterview.assessmentId,
      },
    });

    if (!interview) {
      interview = await prisma.interview.create({
        data: {
          assessmentId: asyncInterview.assessmentId,
          candidateId: candidate.id,
          status: "COMPLETED",
          completedAt: invite.completedAt ?? new Date(),
          notes: `Auto-created from async interview: ${asyncInterview.title}`,
        },
      });
    }

    // Step 3: Write to VideoResponse
    await prisma.videoResponse.update({
      where: {
        inviteId_questionId: { inviteId: invite.id, questionId },
      },
      data: {
        evaluatorScore: score,
        evaluatorNotes: notes ?? null,
        status: "REVIEWED",
      },
    });

    // Step 4: Write to Evaluation (analytics bridge — makes ICC/bias work)
    await prisma.evaluation.upsert({
      where: {
        interviewId_evaluatorId_questionId: {
          interviewId: interview.id,
          evaluatorId: user.id,
          questionId,
        },
      },
      create: {
        interviewId: interview.id,
        evaluatorId: user.id,
        questionId,
        score,
        notes: notes ?? null,
      },
      update: { score, notes: notes ?? null },
    });

    return NextResponse.json({ ok: true, interviewId: interview.id });
  } catch (err) {
    console.error("async-interview score error:", err);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
