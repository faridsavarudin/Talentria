import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

// GET /api/async-interviews — list for current org
export async function GET() {
  try {
    const user = await requireAuth();
    const interviews = await prisma.asyncInterview.findMany({
      where: { organizationId: user.organizationId },
      include: {
        assessment: { select: { title: true } },
        invitations: { select: { id: true, completedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(interviews);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/async-interviews — create new async interview and send invites
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const {
      title,
      assessmentId,
      instructions,
      timeLimitSeconds = 180,
      retakesAllowed = 1,
      deadlineAt,
      candidateEmails = [],
    } = body as {
      title: string;
      assessmentId: string;
      instructions?: string | null;
      timeLimitSeconds?: number;
      retakesAllowed?: number;
      deadlineAt?: string | null;
      candidateEmails?: string[];
    };

    if (!title || !assessmentId) {
      return NextResponse.json({ error: "title and assessmentId required" }, { status: 400 });
    }

    // Verify assessment belongs to this org
    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, organizationId: user.organizationId },
    });
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const expiresAt = deadlineAt ? new Date(deadlineAt) : addDays(new Date(), 7);

    const interview = await prisma.asyncInterview.create({
      data: {
        title,
        assessmentId,
        organizationId: user.organizationId,
        createdById: user.id,
        instructions: instructions ?? null,
        timeLimitSeconds,
        retakesAllowed,
        deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
        status: candidateEmails.length > 0 ? "SENT" : "DRAFT",
        invitations: {
          create: candidateEmails.map((email: string) => ({
            email: email.toLowerCase().trim(),
            expiresAt,
          })),
        },
      },
    });

    return NextResponse.json({ id: interview.id, invitesSent: candidateEmails.length }, { status: 201 });
  } catch (err) {
    console.error("async-interviews POST error:", err);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
