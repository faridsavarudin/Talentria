import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildRatingMatrix, calculateIcc } from "@/lib/analytics/icc";
import { analyzeEvaluatorBias } from "@/lib/analytics/bias";

// GET /api/analytics/summary
// Returns ICC history, evaluator bias scores, pipeline funnel for the org
export async function GET() {
  try {
    const user = await requireAuth();
    const orgId = user.organizationId;

    const [
      reliabilityScores,
      biasReports,
      evaluations,
      pipelineCounts,
      totalCandidates,
      totalInterviews,
      completedInterviews,
    ] = await Promise.all([
      // Latest ICC scores per assessment
      prisma.reliabilityScore.findMany({
        where: { assessment: { organizationId: orgId } },
        orderBy: { calculatedAt: "desc" },
        take: 20,
        include: { assessment: { select: { title: true } } },
      }),

      // Latest bias reports
      prisma.biasReport.findMany({
        where: { assessment: { organizationId: orgId } },
        orderBy: { generatedAt: "desc" },
        take: 5,
        include: { assessment: { select: { title: true } } },
      }),

      // All evaluations for bias analysis
      prisma.evaluation.findMany({
        where: { interview: { assessment: { organizationId: orgId } } },
        select: {
          evaluatorId: true,
          score: true,
          evaluator: { select: { name: true } },
        },
      }),

      // Pipeline stage distribution
      prisma.candidate.groupBy({
        by: ["pipelineStage"],
        where: { organizationId: orgId },
        _count: { id: true },
      }),

      prisma.candidate.count({ where: { organizationId: orgId } }),
      prisma.interview.count({ where: { assessment: { organizationId: orgId } } }),
      prisma.interview.count({
        where: { assessment: { organizationId: orgId }, status: "COMPLETED" },
      }),
    ]);

    // Compute live evaluator bias
    const evaluatorBias = analyzeEvaluatorBias(
      evaluations.map((e) => ({
        evaluatorId: e.evaluatorId,
        evaluatorName: e.evaluator.name ?? "Unknown",
        score: e.score,
      }))
    );

    // Compute org-wide ICC if we have data
    let orgIcc = null;
    if (evaluations.length >= 4) {
      const allEvals = await prisma.evaluation.findMany({
        where: { interview: { assessment: { organizationId: orgId } } },
        select: { interviewId: true, evaluatorId: true, score: true },
      });
      const matrix = buildRatingMatrix(allEvals);
      orgIcc = calculateIcc(matrix);
    }

    return NextResponse.json({
      orgIcc,
      reliabilityScores: reliabilityScores.map((r) => ({
        assessmentTitle: r.assessment.title,
        icc: r.icc,
        sampleSize: r.sampleSize,
        calculatedAt: r.calculatedAt,
        interpretation: r.icc < 0.4 ? "poor" : r.icc < 0.6 ? "fair" : r.icc < 0.75 ? "moderate" : r.icc < 0.9 ? "good" : "excellent",
      })),
      biasReports: biasReports.map((b) => ({
        assessmentTitle: b.assessment.title,
        reportData: b.reportData,
        generatedAt: b.generatedAt,
      })),
      evaluatorBias,
      pipeline: pipelineCounts.map((p) => ({
        stage: p.pipelineStage,
        count: p._count.id,
      })),
      totals: {
        candidates: totalCandidates,
        interviews: totalInterviews,
        completedInterviews,
      },
    });
  } catch (err) {
    console.error("analytics/summary error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
