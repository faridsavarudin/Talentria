/**
 * Inter-Rater Reliability (ICC) Calculator
 *
 * Implements ICC(2,1) — Two-way mixed effects, single measures, absolute agreement.
 * This is appropriate when: each candidate is rated by a random subset of evaluators
 * drawn from a larger population of evaluators, and we care about absolute agreement.
 *
 * Formula:
 *   ICC = (MSr - MSe) / (MSr + (k-1)*MSe + k*(MSc - MSe)/n)
 *
 * Where:
 *   MSr = mean squares for rows (subjects/candidates)
 *   MSc = mean squares for columns (raters/evaluators)
 *   MSe = mean squares for error
 *   n   = number of subjects
 *   k   = number of raters
 */

export interface RatingMatrix {
  // subjectId -> { ratorId -> score }
  [subjectId: string]: { [ratorId: string]: number };
}

export interface IccResult {
  icc: number;           // ICC coefficient 0-1
  f: number;             // F statistic
  df1: number;           // degrees of freedom (between subjects)
  df2: number;           // degrees of freedom (error)
  ci95Lower: number;     // 95% confidence interval lower bound
  ci95Upper: number;     // 95% confidence interval upper bound
  n: number;             // number of subjects
  k: number;             // number of raters
  interpretation: "poor" | "fair" | "moderate" | "good" | "excellent";
}

export function interpretIcc(icc: number): IccResult["interpretation"] {
  if (icc < 0.4) return "poor";
  if (icc < 0.6) return "fair";
  if (icc < 0.75) return "moderate";
  if (icc < 0.9) return "good";
  return "excellent";
}

export function calculateIcc(matrix: RatingMatrix): IccResult | null {
  const subjects = Object.keys(matrix);
  const n = subjects.length;

  if (n < 2) return null;

  // Get all rater IDs and number of raters per subject
  const raterSets = subjects.map((s) => new Set(Object.keys(matrix[s])));
  const allRaters = Array.from(new Set(raterSets.flatMap((s) => Array.from(s))));
  const k = allRaters.length;

  if (k < 2) return null;

  // Fill matrix with NaN for missing ratings
  const ratings: number[][] = subjects.map((s) =>
    allRaters.map((r) => (matrix[s][r] !== undefined ? matrix[s][r] : NaN))
  );

  // Calculate row means (subject means)
  const rowMeans = ratings.map((row) => {
    const valid = row.filter((v) => !isNaN(v));
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : NaN;
  });

  // Calculate column means (rater means)
  const colMeans = allRaters.map((_, ci) => {
    const valid = ratings.map((row) => row[ci]).filter((v) => !isNaN(v));
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : NaN;
  });

  // Grand mean
  const allScores = ratings.flat().filter((v) => !isNaN(v));
  if (allScores.length === 0) return null;
  const grandMean = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  // Sum of Squares for Between Subjects (SSr)
  const SSr = colMeans.length * rowMeans.reduce((sum, rm) => sum + (rm - grandMean) ** 2, 0);

  // Sum of Squares for Between Raters (SSc)
  const SSc = rowMeans.length * colMeans.reduce((sum, cm) => sum + (cm - grandMean) ** 2, 0);

  // Total Sum of Squares (SSt)
  let SSt = 0;
  ratings.forEach((row) => {
    row.forEach((v) => {
      if (!isNaN(v)) SSt += (v - grandMean) ** 2;
    });
  });

  // Error Sum of Squares
  const SSe = SSt - SSr - SSc;

  // Degrees of freedom
  const dfr = n - 1;
  const dfc = k - 1;
  const dfe = dfr * dfc;

  if (dfe === 0) return null;

  // Mean Squares
  const MSr = SSr / dfr;
  const MSc = SSc / dfc;
  const MSe = SSe / dfe;

  // ICC(2,1) — two-way mixed, absolute agreement, single measures
  const icc = (MSr - MSe) / (MSr + (k - 1) * MSe + (k / n) * (MSc - MSe));
  const clampedIcc = Math.max(0, Math.min(1, icc));

  // F statistic for significance
  const f = MSr / MSe;

  // Approximate 95% CI using the F distribution approach
  // (simplified Shrout & Fleiss CI)
  const alpha = 0.05;
  const FL = f / (1 + k * clampedIcc / (1 - clampedIcc)); // simplified
  const FU = f * (1 + k * clampedIcc / (1 - clampedIcc));

  const ci95Lower = Math.max(0, (FL - 1) / (FL + k - 1));
  const ci95Upper = Math.min(1, (FU - 1) / (FU + k - 1));

  // Use alpha to avoid unused variable lint warning
  void alpha;

  return {
    icc: Math.round(clampedIcc * 1000) / 1000,
    f: Math.round(f * 100) / 100,
    df1: dfr,
    df2: dfe,
    ci95Lower: Math.round(ci95Lower * 1000) / 1000,
    ci95Upper: Math.round(ci95Upper * 1000) / 1000,
    n,
    k,
    interpretation: interpretIcc(clampedIcc),
  };
}

/**
 * Build a RatingMatrix from evaluations data
 */
export function buildRatingMatrix(
  evaluations: Array<{ interviewId: string; evaluatorId: string; score: number }>
): RatingMatrix {
  const matrix: RatingMatrix = {};
  for (const ev of evaluations) {
    if (!matrix[ev.interviewId]) matrix[ev.interviewId] = {};
    matrix[ev.interviewId][ev.evaluatorId] = ev.score;
  }
  return matrix;
}
