import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assessmentUpdateSchema } from "@/lib/validations/assessment";

// GET /api/assessments/[id] - Get single assessment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        organizationId: (session.user as Record<string, unknown>).organizationId as string,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        competencies: {
          include: {
            questions: {
              include: {
                rubricLevels: {
                  orderBy: {
                    level: "asc",
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            interviews: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// PATCH /api/assessments/[id] - Update assessment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = assessmentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.assessment.findFirst({
      where: {
        id,
        organizationId: (session.user as Record<string, unknown>).organizationId as string,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = await prisma.assessment.update({
      where: { id },
      data: parsed.data,
      include: {
        competencies: true,
        _count: {
          select: {
            questions: true,
            interviews: true,
          },
        },
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

// DELETE /api/assessments/[id] - Archive assessment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.assessment.findFirst({
      where: {
        id,
        organizationId: (session.user as Record<string, unknown>).organizationId as string,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Soft delete by archiving
    await prisma.assessment.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ message: "Assessment archived successfully" });
  } catch (error) {
    console.error("Error archiving assessment:", error);
    return NextResponse.json(
      { error: "Failed to archive assessment" },
      { status: 500 }
    );
  }
}
