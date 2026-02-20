import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildRatingMatrix, calculateIcc } from "@/lib/analytics/icc";

// POST /api/analytics/calculate-icc
// Body: { assessmentId: string }
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { assessmentId } = (await req.json()) as { assessmentId: string };

    if (!assessmentId) {
      return NextResponse.json({ error: "assessmentId required" }, { status: 400 });
    }

    // Verify assessment belongs to org
    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, organizationId: user.organizationId },
    });
    if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Get all evaluations for this assessment
    const evaluations = await prisma.evaluation.findMany({
      where: { interview: { assessmentId } },
      select: { interviewId: true, evaluatorId: true, score: true },
    });

    if (evaluations.length < 4) {
      return NextResponse.json({
        error: "Need at least 2 evaluators × 2 interviews to calculate ICC",
        evaluationCount: evaluations.length,
      }, { status: 422 });
    }

    const matrix = buildRatingMatrix(evaluations);
    const result = calculateIcc(matrix);

    if (!result) {
      return NextResponse.json({ error: "Insufficient data structure for ICC calculation" }, { status: 422 });
    }

    const orgMean = evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length;
    const variance = evaluations.reduce((s, e) => s + (e.score - orgMean) ** 2, 0) / evaluations.length;
    const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;
    const meanScore = Math.round(orgMean * 100) / 100;

    // Find or create reliability score record
    const existing = await prisma.reliabilityScore.findFirst({
      where: { assessmentId, evaluatorId: user.id },
    });

    if (existing) {
      await prisma.reliabilityScore.update({
        where: { id: existing.id },
        data: { icc: result.icc, meanScore, stdDev, sampleSize: evaluations.length, calculatedAt: new Date() },
      });
    } else {
      await prisma.reliabilityScore.create({
        data: { assessmentId, evaluatorId: user.id, icc: result.icc, meanScore, stdDev, sampleSize: evaluations.length },
      });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("calculate-icc error:", err);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
