import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addQuestionSchema } from "@/lib/validations/assessment";

// GET /api/assessments/[id]/questions - Get all questions
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

    const questions = await prisma.question.findMany({
      where: {
        assessmentId: id,
        assessment: {
          organizationId: (session.user as Record<string, unknown>).organizationId as string,
        },
      },
      include: {
        competency: true,
        rubricLevels: {
          orderBy: {
            level: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/assessments/[id]/questions - Add question
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
    const parsed = addQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership and competency exists
    const competency = await prisma.competency.findFirst({
      where: {
        id: parsed.data.competencyId,
        assessmentId: id,
        assessment: {
          organizationId: (session.user as Record<string, unknown>).organizationId as string,
        },
      },
    });

    if (!competency) {
      return NextResponse.json(
        { error: "Competency not found" },
        { status: 404 }
      );
    }

    // Get the next order number
    const lastQuestion = await prisma.question.findFirst({
      where: { assessmentId: id },
      orderBy: { order: "desc" },
    });

    const order = parsed.data.order ?? (lastQuestion ? lastQuestion.order + 1 : 0);

    const question = await prisma.question.create({
      data: {
        content: parsed.data.content,
        type: parsed.data.type,
        competencyId: parsed.data.competencyId,
        assessmentId: id,
        order,
        rubricLevels: parsed.data.rubricLevels
          ? {
              create: parsed.data.rubricLevels.map((rubric) => ({
                level: rubric.level,
                label: rubric.label,
                description: rubric.description,
                behavioralAnchors: rubric.behavioralAnchors,
              })),
            }
          : undefined,
      },
      include: {
        rubricLevels: {
          orderBy: {
            level: "asc",
          },
        },
        competency: true,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
