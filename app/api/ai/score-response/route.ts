import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior I/O psychologist trained in Behaviorally Anchored Rating Scales (BARS).
Evaluate a candidate's interview response against a structured rubric and return a JSON object only — no markdown, no preamble.`;

// POST /api/ai/score-response
// Body: { responseId: string }
// Scores a video/text response using Claude against the question's rubric
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>).organizationId as string;

    const subscription = await prisma.subscription.findUnique({ where: { organizationId } });
    if ((subscription?.aiCredits ?? 0) < 1) {
      return NextResponse.json({ error: "Insufficient AI credits", aiCredits: 0 }, { status: 402 });
    }

    const { responseId } = (await request.json()) as { responseId: string };
    if (!responseId) {
      return NextResponse.json({ error: "responseId required" }, { status: 400 });
    }

    const response = await prisma.videoResponse.findUnique({
      where: { id: responseId },
      include: {
        question: { include: { rubricLevels: { orderBy: { level: "asc" } } } },
        invite: {
          include: { asyncInterview: { include: { organization: { select: { id: true } } } } },
        },
      },
    });

    if (!response) return NextResponse.json({ error: "Response not found" }, { status: 404 });

    // Org isolation check
    if (response.invite.asyncInterview.organization.id !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const transcription = response.transcription;
    if (!transcription) {
      return NextResponse.json(
        { error: "No transcription available. Add transcription text before AI scoring." },
        { status: 422 }
      );
    }

    // Deduct credit
    await prisma.subscription.update({
      where: { organizationId },
      data: { aiCredits: { decrement: 1 } },
    });

    const rubricText = response.question.rubricLevels
      .map(
        (r) =>
          `Level ${r.level} — ${r.label}: ${r.description}\nAnchors: ${(r.behavioralAnchors as string[]).join("; ")}`
      )
      .join("\n\n");

    const prompt = `## Interview Question
${response.question.content}

## Rubric (5-point scale)
${rubricText}

## Candidate's Response
${transcription}

## Task
Score this response on the 5-point rubric above and return:
{
  "score": <integer 1-5>,
  "confidence": <float 0.0-1.0>,
  "rationale": "<2-3 sentence explanation referencing specific rubric anchors>",
  "starAnalysis": {
    "situation": "<extracted situation or null>",
    "task": "<extracted task or null>",
    "action": "<extracted action or null>",
    "result": "<extracted result or null>"
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "developmentAreas": ["<area 1>"],
  "keywordsDetected": ["<keyword1>", "<keyword2>"]
}`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      const text = message.content[0].type === "text" ? message.content[0].text : "";
      const parsed = JSON.parse(text) as {
        score: number;
        confidence: number;
        rationale: string;
        starAnalysis: Record<string, string | null>;
        strengths: string[];
        developmentAreas: string[];
        keywordsDetected: string[];
      };

      // Clamp score to 1-5
      const score = Math.max(1, Math.min(5, Math.round(parsed.score)));

      const updated = await prisma.videoResponse.update({
        where: { id: responseId },
        data: {
          aiSuggestedScore: score,
          aiInsights: {
            confidence: parsed.confidence,
            rationale: parsed.rationale,
            starAnalysis: parsed.starAnalysis,
            strengths: parsed.strengths,
            developmentAreas: parsed.developmentAreas,
            keywordsDetected: parsed.keywordsDetected,
          },
        },
      });

      return NextResponse.json({ ok: true, score, insights: updated.aiInsights });
    } catch (aiErr) {
      // Refund credit on AI error
      await prisma.subscription
        .update({ where: { organizationId }, data: { aiCredits: { increment: 1 } } })
        .catch(() => {});
      throw aiErr;
    }
  } catch (error) {
    console.error("score-response error:", error);
    return NextResponse.json({ error: "AI scoring failed" }, { status: 500 });
  }
}
