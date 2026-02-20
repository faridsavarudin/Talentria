import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InventoryTestType } from "@prisma/client";
import { z } from "zod";

const ResponseItemSchema = z.object({
  itemId: z.string(),
  value: z.union([z.number(), z.string()]),
});

const SubmitSchema = z.object({
  testType: z.nativeEnum(InventoryTestType),
  responses: z.array(ResponseItemSchema).min(1),
  durationSeconds: z.number().optional(),
});

// ── Score calculators per test type ──────────────────────────────────────────

type ResponseItem = { itemId: string; value: number | string };

/**
 * RIASEC: items are prefixed with R_, I_, A_, S_, E_, C_
 * Sum numeric values grouped by prefix → { R, I, A, S, E, C }
 */
function calcRiasec(responses: ResponseItem[]): Record<string, number> {
  const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const { itemId, value } of responses) {
    const prefix = itemId.split("_")[0]?.toUpperCase();
    if (prefix && prefix in scores && typeof value === "number") {
      scores[prefix] += value;
    }
  }
  return scores;
}

/**
 * COGNITIVE: items prefixed with correct answer in itemId like "cog_1_A"
 * Sum correct responses → { correct, total, percentile }
 */
function calcCognitive(responses: ResponseItem[]): Record<string, number> {
  let correct = 0;
  for (const { itemId, value } of responses) {
    const parts = itemId.split("_");
    const correctAnswer = parts[parts.length - 1];
    if (value === correctAnswer || String(value) === correctAnswer) correct++;
  }
  const total = responses.length;
  const percentile = Math.round((correct / Math.max(total, 1)) * 100);
  return { correct, total, percentile };
}

/**
 * VRA (Verbal Reasoning + Abstract): items tagged vra_verbal_ or vra_abstract_
 * Sum by sub-dimension
 */
function calcVra(responses: ResponseItem[]): Record<string, number> {
  const scores: Record<string, number> = { verbal: 0, abstract: 0 };
  for (const { itemId, value } of responses) {
    if (typeof value !== "number") continue;
    if (itemId.includes("verbal")) scores.verbal += value;
    else if (itemId.includes("abstract")) scores.abstract += value;
  }
  scores.total = scores.verbal + scores.abstract;
  return scores;
}

/**
 * ANALYTICAL_REASONING: items prefixed with ar_
 * Sum correct answers → { correct, total }
 */
function calcAnalytical(responses: ResponseItem[]): Record<string, number> {
  let correct = 0;
  for (const { itemId, value } of responses) {
    const parts = itemId.split("_");
    const correctAnswer = parts[parts.length - 1];
    if (String(value) === correctAnswer) correct++;
  }
  return { correct, total: responses.length };
}

/**
 * CREATIVE_THINKING: items prefixed with ct_fluency_, ct_flexibility_, ct_originality_, ct_elaboration_
 * Sum by dimension
 */
function calcCreativeThinking(responses: ResponseItem[]): Record<string, number> {
  const scores: Record<string, number> = {
    fluency: 0,
    flexibility: 0,
    originality: 0,
    elaboration: 0,
  };
  for (const { itemId, value } of responses) {
    if (typeof value !== "number") continue;
    if (itemId.includes("fluency")) scores.fluency += value;
    else if (itemId.includes("flexibility")) scores.flexibility += value;
    else if (itemId.includes("originality")) scores.originality += value;
    else if (itemId.includes("elaboration")) scores.elaboration += value;
  }
  scores.total = scores.fluency + scores.flexibility + scores.originality + scores.elaboration;
  return scores;
}

/**
 * BIG_FIVE: items prefixed with bf_O_, bf_C_, bf_E_, bf_A_, bf_N_
 * Sum per trait → { O, C, E, A, N }
 */
function calcBigFive(responses: ResponseItem[]): Record<string, number> {
  const scores: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  for (const { itemId, value } of responses) {
    if (typeof value !== "number") continue;
    const parts = itemId.split("_");
    // e.g. bf_O_1 → trait = O
    const trait = parts[1]?.toUpperCase();
    if (trait && trait in scores) scores[trait] += value;
  }
  return scores;
}

function calculateRawScores(
  testType: InventoryTestType,
  responses: ResponseItem[]
): Record<string, number> {
  switch (testType) {
    case "RIASEC":
      return calcRiasec(responses);
    case "COGNITIVE":
      return calcCognitive(responses);
    case "VRA":
      return calcVra(responses);
    case "ANALYTICAL_REASONING":
      return calcAnalytical(responses);
    case "CREATIVE_THINKING":
      return calcCreativeThinking(responses);
    case "BIG_FIVE":
      return calcBigFive(responses);
    default:
      return {};
  }
}

function getBandLabel(testType: InventoryTestType, scores: Record<string, number>): string {
  switch (testType) {
    case "COGNITIVE": {
      const pct = scores.percentile ?? 0;
      if (pct >= 90) return "Superior";
      if (pct >= 75) return "Above Average";
      if (pct >= 50) return "Average";
      if (pct >= 25) return "Below Average";
      return "Low";
    }
    case "RIASEC": {
      const entries = Object.entries(scores).sort(([, a], [, b]) => b - a);
      return entries
        .slice(0, 3)
        .map(([k]) => k)
        .join("");
    }
    case "ANALYTICAL_REASONING": {
      const pct = Math.round(((scores.correct ?? 0) / Math.max(scores.total ?? 1, 1)) * 100);
      if (pct >= 80) return "High";
      if (pct >= 60) return "Above Average";
      if (pct >= 40) return "Average";
      return "Developing";
    }
    case "CREATIVE_THINKING": {
      const total = scores.total ?? 0;
      if (total >= 80) return "Highly Creative";
      if (total >= 60) return "Creative";
      if (total >= 40) return "Moderately Creative";
      return "Developing";
    }
    case "VRA": {
      const total = scores.total ?? 0;
      if (total >= 40) return "High";
      if (total >= 25) return "Above Average";
      if (total >= 15) return "Average";
      return "Developing";
    }
    case "BIG_FIVE":
      return "Completed";
    default:
      return "Completed";
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.inventoryInvitation.findUnique({
    where: { inviteToken: token },
    include: {
      battery: {
        include: { tests: true },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.status === "expired") {
    return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt) < new Date()
  ) {
    await prisma.inventoryInvitation.update({
      where: { id: invitation.id },
      data: { status: "expired" },
    });
    return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
  }

  if (invitation.status === "completed") {
    return NextResponse.json({ error: "Invitation already completed" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { testType, responses } = parsed.data;

  // Verify the test type is part of this battery
  const batteryTestTypes = invitation.battery.tests.map((t) => t.testType);
  if (!batteryTestTypes.includes(testType)) {
    return NextResponse.json(
      { error: "Test type not part of this battery" },
      { status: 400 }
    );
  }

  const rawScores = calculateRawScores(testType, responses);
  const bandLabel = getBandLabel(testType, rawScores);

  // Upsert result (idempotent if re-submitted)
  const result = await prisma.inventoryResult.upsert({
    where: {
      invitationId_testType: {
        invitationId: invitation.id,
        testType,
      },
    },
    update: {
      rawScores,
      bandLabel,
      completedAt: new Date(),
    },
    create: {
      invitationId: invitation.id,
      testType,
      rawScores,
      bandLabel,
      completedAt: new Date(),
    },
  });

  // Update invitation status: started if not yet, completed if all tests done
  const completedResults = await prisma.inventoryResult.count({
    where: { invitationId: invitation.id },
  });

  const allTestsCount = invitation.battery.tests.length;
  const allDone = completedResults >= allTestsCount;

  await prisma.inventoryInvitation.update({
    where: { id: invitation.id },
    data: {
      status: allDone ? "completed" : "in_progress",
      startedAt: invitation.startedAt ?? new Date(),
      completedAt: allDone ? new Date() : null,
    },
  });

  // ── Integrity scoring on completion ──────────────────────────────────────
  if (allDone) {
    // Count proctor events by severity
    const [violationCount, warningCount] = await Promise.all([
      prisma.proctorEvent.count({
        where: { invitationId: invitation.id, severity: "VIOLATION" },
      }),
      prisma.proctorEvent.count({
        where: { invitationId: invitation.id, severity: "WARNING" },
      }),
    ]);

    const rawIntegrityScore = 100 - violationCount * 20 - warningCount * 5;
    const integrityScore = Math.max(0, rawIntegrityScore);

    const integrityFlag =
      integrityScore >= 80
        ? "NO_CONCERNS"
        : integrityScore >= 50
          ? "REVIEW_RECOMMENDED"
          : "INTEGRITY_CONCERN";

    // Attach integrity fields to this final result (acts as the "summary" record)
    await prisma.inventoryResult.update({
      where: { id: result.id },
      data: { integrityScore, integrityFlag },
    });
  }

  return NextResponse.json({
    resultId: result.id,
    testType,
    rawScores,
    bandLabel,
    allCompleted: allDone,
  });
}
