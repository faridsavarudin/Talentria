import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assessmentCreateSchema } from "@/lib/validations/assessment";

// GET /api/assessments - List all assessments
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {
      organizationId: (session.user as Record<string, unknown>).organizationId as string,
      ...(status && { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { jobTitle: { contains: search } },
          { department: { contains: search } },
        ],
      }),
    };

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            interviews: true,
            competencies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST /api/assessments - Create new assessment
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = assessmentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, jobTitle, jobDescription, department, competencies = [] } = parsed.data;

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        jobTitle,
        jobDescription,
        department,
        status: "DRAFT",
        organizationId: (session.user as Record<string, unknown>).organizationId as string,
        createdById: session.user.id as string,
        competencies: {
          create: competencies.map((comp, index) => ({
            name: comp.name,
            description: comp.description,
          })),
        },
      },
      include: {
        competencies: true,
        questions: true,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
