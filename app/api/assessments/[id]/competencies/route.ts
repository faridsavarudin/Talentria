import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addCompetencySchema } from "@/lib/validations/assessment";

// GET /api/assessments/[id]/competencies - Get all competencies
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

    const competencies = await prisma.competency.findMany({
      where: {
        assessmentId: id,
        assessment: {
          organizationId: (session.user as Record<string, unknown>).organizationId as string,
        },
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json(competencies);
  } catch (error) {
    console.error("Error fetching competencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch competencies" },
      { status: 500 }
    );
  }
}

// POST /api/assessments/[id]/competencies - Add competency
export async function POST(
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
    const parsed = addCompetencySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        organizationId: (session.user as Record<string, unknown>).organizationId as string,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const competency = await prisma.competency.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        assessmentId: id,
      },
    });

    return NextResponse.json(competency, { status: 201 });
  } catch (error) {
    console.error("Error creating competency:", error);
    return NextResponse.json(
      { error: "Failed to create competency" },
      { status: 500 }
    );
  }
}
