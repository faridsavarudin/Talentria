import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OverviewCards } from "./_components/OverviewCards";
import { IccReliabilityChart } from "./_components/IccReliabilityChart";
import { HiringFunnelChart } from "./_components/HiringFunnelChart";
import { PipelineDistributionChart } from "./_components/PipelineDistributionChart";

export const metadata = {
  title: "Analytics | AssInt",
};

// Stage display config shared between charts
const STAGE_CONFIG = [
  { stage: "APPLIED",    label: "Applied",    fill: "#94a3b8" },
  { stage: "SCREENING",  label: "Screening",  fill: "#60a5fa" },
  { stage: "ASSESSMENT", label: "Assessment", fill: "#a78bfa" },
  { stage: "INTERVIEW",  label: "Interview",  fill: "#fbbf24" },
  { stage: "OFFER",      label: "Offer",      fill: "#fb923c" },
  { stage: "HIRED",      label: "Hired",      fill: "#4ade80" },
  { stage: "REJECTED",   label: "Rejected",   fill: "#f87171" },
  { stage: "WITHDRAWN",  label: "Withdrawn",  fill: "#cbd5e1" },
];

export default async function AnalyticsPage() {
  const user = await requireAuth();
  const orgId = user.organizationId;

  const [
    totalCandidates,
    totalInterviews,
    avgReliability,
    biasAlertCount,
    reliabilityScores,
    candidateStageCounts,
  ] = await Promise.all([
    // Total candidates (non-rejected, non-withdrawn)
    prisma.candidate.count({
      where: { organizationId: orgId },
    }),

    // Total interviews
    prisma.interview.count({
      where: { assessment: { organizationId: orgId } },
    }),

    // Avg ICC
    prisma.reliabilityScore.aggregate({
      where: { assessment: { organizationId: orgId } },
      _avg: { icc: true },
    }),

    // Bias alerts = assessments with at least one bias report
    prisma.assessment.count({
      where: {
        organizationId: orgId,
        biasReports: { some: {} },
      },
    }),

    // Per-evaluator reliability scores (latest per evaluator)
    prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { evaluations: true } },
        reliabilityScores: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
          select: { icc: true },
        },
      },
    }),

    // Candidate counts grouped by stage
    prisma.candidate.groupBy({
      by: ["pipelineStage"],
      where: { organizationId: orgId },
      _count: { id: true },
    }),
  ]);

  // ── Evaluator ICC chart data ─────────────────────────────────────────────────
  const iccData = reliabilityScores
    .filter((u) => u.reliabilityScores.length > 0)
    .map((u) => ({
      name: u.name ?? u.email ?? "Unknown",
      icc: u.reliabilityScores[0].icc,
      evaluations: u._count.evaluations,
    }))
    .sort((a, b) => b.icc - a.icc);

  // ── Pipeline stage counts ────────────────────────────────────────────────────
  const stageCountMap: Record<string, number> = {};
  for (const row of candidateStageCounts) {
    stageCountMap[row.pipelineStage] = row._count.id;
  }

  // ── Funnel data (active stages only — no rejected/withdrawn) ─────────────────
  const FUNNEL_STAGES = ["APPLIED", "SCREENING", "ASSESSMENT", "INTERVIEW", "OFFER", "HIRED"];

  const funnelData = FUNNEL_STAGES.map((stage, index) => {
    const count = stageCountMap[stage] ?? 0;
    const prevCount = index > 0 ? (stageCountMap[FUNNEL_STAGES[index - 1]] ?? 0) : null;
    const conversionRate =
      prevCount != null && prevCount > 0
        ? (count / prevCount) * 100
        : null;

    const config = STAGE_CONFIG.find((s) => s.stage === stage)!;

    return {
      stage,
      label: config.label,
      count,
      conversionRate,
    };
  });

  // ── Pie chart data ────────────────────────────────────────────────────────────
  const pieData = STAGE_CONFIG.map((config) => ({
    stage: config.stage,
    label: config.label,
    count: stageCountMap[config.stage] ?? 0,
    fill: config.fill,
  }));

  const avgIcc = avgReliability._avg.icc;

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reliability metrics, hiring funnel analysis, and pipeline insights.
        </p>
      </div>

      {/* Section 1: Overview cards */}
      <section>
        <OverviewCards
          totalCandidates={totalCandidates}
          totalInterviews={totalInterviews}
          avgIcc={avgIcc}
          biasAlerts={biasAlertCount}
        />
      </section>

      {/* Section 2: ICC chart + Pipeline distribution */}
      <section className="grid gap-6 lg:grid-cols-2">
        <IccReliabilityChart data={iccData} />
        <PipelineDistributionChart data={pieData} />
      </section>

      {/* Section 3: Hiring funnel */}
      <section>
        <HiringFunnelChart data={funnelData} />
      </section>
    </div>
  );
}
