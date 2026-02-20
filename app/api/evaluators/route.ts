import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/evaluators - List all evaluators and recruiters in the org
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    const evaluators = await prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ["EVALUATOR", "RECRUITER", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        calibrationLevel: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(evaluators);
  } catch (error) {
    console.error("Error fetching evaluators:", error);
    return NextResponse.json(
      { error: "Failed to fetch evaluators" },
      { status: 500 }
    );
  }
}
