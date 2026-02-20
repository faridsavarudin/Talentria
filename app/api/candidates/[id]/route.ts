import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { candidateUpdateSchema } from "@/lib/validations/candidate";

// GET /api/candidates/[id] - Get single candidate with full interview history
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

    const candidate = await prisma.candidate.findFirst({
      where: { id, organizationId },
      include: {
        interviews: {
          orderBy: { createdAt: "desc" },
          include: {
            assessment: {
              select: { id: true, title: true, jobTitle: true },
            },
            panels: {
              include: {
                evaluator: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            _count: {
              select: { evaluations: true },
            },
          },
        },
        _count: {
          select: { interviews: true },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}

// PATCH /api/candidates/[id] - Update candidate
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

    const existing = await prisma.candidate.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = candidateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // If changing email, check uniqueness within org
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const emailConflict = await prisma.candidate.findFirst({
        where: { email: parsed.data.email, organizationId, NOT: { id } },
      });
      if (emailConflict) {
        return NextResponse.json(
          { error: "A candidate with this email already exists in your organization" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        ...parsed.data,
        resumeUrl: parsed.data.resumeUrl || null,
        lastActivityAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      { error: "Failed to update candidate" },
      { status: 500 }
    );
  }
}

// DELETE /api/candidates/[id] - Delete candidate
export async function DELETE(
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

    const candidate = await prisma.candidate.findFirst({
      where: { id, organizationId },
      include: {
        interviews: {
          where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
          select: { id: true },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (candidate.interviews.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete a candidate with in-progress or scheduled interviews. Cancel interviews first.",
        },
        { status: 422 }
      );
    }

    await prisma.candidate.delete({ where: { id } });

    return NextResponse.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    return NextResponse.json(
      { error: "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
