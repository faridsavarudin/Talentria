/**
 * Bias Detection Analytics
 *
 * Implements the 4/5ths (80%) Rule (Uniform Guidelines on Employee Selection Procedures)
 * for adverse impact analysis. Also computes evaluator leniency/strictness bias.
 */

export interface DemographicGroup {
  group: string;       // e.g. "Male", "Female", "White", "Black"
  category: string;   // e.g. "gender", "ethnicity", "ageGroup"
  passCount: number;
  totalCount: number;
  passRate: number;    // 0.0 - 1.0
}

export interface AdverseImpactResult {
  referenceGroup: DemographicGroup;     // highest pass rate group (comparison baseline)
  groups: Array<DemographicGroup & {
    impactRatio: number;                // passRate / referenceGroup.passRate
    adverseImpact: boolean;             // impactRatio < 0.8 (4/5ths rule)
    significance: "flagged" | "ok" | "insufficient_data";
  }>;
  category: string;
}

/**
 * 4/5ths rule adverse impact analysis for a demographic category
 */
export function analyzeAdverseImpact(groups: DemographicGroup[]): AdverseImpactResult | null {
  const category = groups[0]?.category;
  if (!category || groups.length < 2) return null;

  // Filter groups with sufficient sample size (≥5)
  const validGroups = groups.filter((g) => g.totalCount >= 5);
  if (validGroups.length < 2) return null;

  // Reference group = highest pass rate
  const referenceGroup = validGroups.reduce((best, g) =>
    g.passRate > best.passRate ? g : best
  );

  const results = validGroups.map((g) => {
    const impactRatio = referenceGroup.passRate > 0
      ? g.passRate / referenceGroup.passRate
      : 1;

    return {
      ...g,
      impactRatio: Math.round(impactRatio * 1000) / 1000,
      adverseImpact: impactRatio < 0.8 && g.group !== referenceGroup.group,
      significance: (g.totalCount < 5
        ? "insufficient_data"
        : impactRatio < 0.8 && g.group !== referenceGroup.group ? "flagged" : "ok"
      ) as "flagged" | "ok" | "insufficient_data",
    };
  });

  return { referenceGroup, groups: results, category };
}

export interface EvaluatorBiasResult {
  evaluatorId: string;
  evaluatorName: string;
  meanScore: number;
  orgMeanScore: number;
  deviation: number;       // mean - orgMean
  biasDirection: "lenient" | "strict" | "neutral";
  evaluationCount: number;
}

/**
 * Calculate per-evaluator leniency/strictness bias
 * Flagged if deviation > 0.5 SD from org mean
 */
export function analyzeEvaluatorBias(
  evaluations: Array<{
    evaluatorId: string;
    evaluatorName: string;
    score: number;
  }>
): EvaluatorBiasResult[] {
  if (evaluations.length === 0) return [];

  const orgMean = evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length;

  // Group by evaluator
  const byEvaluator = new Map<string, { name: string; scores: number[] }>();
  for (const ev of evaluations) {
    if (!byEvaluator.has(ev.evaluatorId)) {
      byEvaluator.set(ev.evaluatorId, { name: ev.evaluatorName, scores: [] });
    }
    byEvaluator.get(ev.evaluatorId)!.scores.push(ev.score);
  }

  // Org std dev
  const variance = evaluations.reduce((s, e) => s + (e.score - orgMean) ** 2, 0) / evaluations.length;
  const orgStdDev = Math.sqrt(variance);
  const threshold = orgStdDev > 0 ? orgStdDev * 0.5 : 0.5;

  return Array.from(byEvaluator.entries()).map(([evaluatorId, { name, scores }]) => {
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const deviation = meanScore - orgMean;

    return {
      evaluatorId,
      evaluatorName: name,
      meanScore: Math.round(meanScore * 100) / 100,
      orgMeanScore: Math.round(orgMean * 100) / 100,
      deviation: Math.round(deviation * 100) / 100,
      biasDirection:
        deviation > threshold ? "lenient"
        : deviation < -threshold ? "strict"
        : "neutral",
      evaluationCount: scores.length,
    };
  });
}
