import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/assessments/[id]/publish - Publish assessment
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

    // Verify ownership and check if assessment is ready
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        organizationId: (session.user as Record<string, unknown>).organizationId as string,
      },
      include: {
        competencies: {
          include: {
            questions: {
              include: {
                rubricLevels: true,
              },
            },
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

    // Validation checks
    const errors: string[] = [];

    if (assessment.competencies.length === 0) {
      errors.push("Assessment must have at least one competency");
    }

    const totalQuestions = assessment.competencies.reduce(
      (sum, comp) => sum + comp.questions.length,
      0
    );

    if (totalQuestions === 0) {
      errors.push("Assessment must have at least one question");
    }

    // Check if all questions have rubric levels
    for (const competency of assessment.competencies) {
      for (const question of competency.questions) {
        if (question.rubricLevels.length === 0) {
          errors.push(
            `Question "${question.content.substring(0, 50)}..." is missing rubric levels`
          );
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Assessment is not ready to publish", details: errors },
        { status: 400 }
      );
    }

    // Publish assessment
    const updated = await prisma.assessment.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({
      message: "Assessment published successfully",
      assessment: updated,
    });
  } catch (error) {
    console.error("Error publishing assessment:", error);
    return NextResponse.json(
      { error: "Failed to publish assessment" },
      { status: 500 }
    );
  }
}
