import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type TranscriptEntry = {
  role: "user" | "assistant";
  content: string;
  questionIndex?: number;
};

type RequestBody = {
  sessionId: string;
  transcript: TranscriptEntry[];
  startedAt?: string;
};

type AIEvaluation = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: "advance" | "hold" | "reject";
};

// POST /api/ai-interview/[token]/complete
// Evaluates the full conversation with Claude and persists results.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = (await request.json()) as RequestBody;
    const { sessionId, transcript, startedAt } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await prisma.aIInterviewSession.findFirst({
      where: { id: sessionId, inviteToken: token },
      select: { id: true, status: true, totalQuestions: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Build a readable conversation for Claude to evaluate
    const conversationText = transcript
      .map((t) => `${t.role === "assistant" ? "Interviewer" : "Candidate"}: ${t.content}`)
      .join("\n\n");

    const evaluationPrompt = `You are an expert hiring assessment professional. Evaluate the following job interview transcript and return ONLY valid JSON with no markdown or preamble.

Interview Transcript:
${conversationText}

Return JSON with exactly this shape:
{
  "overallScore": <integer 1-5>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement area 1>", "<improvement area 2>"],
  "recommendation": "<advance|hold|reject>"
}

Score guide: 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent.`;

    const evalResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: evaluationPrompt }],
    });

    const rawText =
      evalResponse.content[0].type === "text" ? evalResponse.content[0].text : "{}";

    let aiEvaluation: AIEvaluation;
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      aiEvaluation = JSON.parse(cleaned) as AIEvaluation;
    } catch {
      aiEvaluation = {
        overallScore: 3,
        summary: "Evaluation could not be parsed.",
        strengths: [],
        improvements: [],
        recommendation: "hold",
      };
    }

    // Calculate duration
    const completedAt = new Date();
    let durationSeconds: number | undefined;
    if (startedAt) {
      durationSeconds = Math.round(
        (completedAt.getTime() - new Date(startedAt).getTime()) / 1000
      );
    }

    // Persist to DB
    await prisma.aIInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        transcript: transcript,
        aiEvaluation: aiEvaluation,
        completedAt,
        durationSeconds,
      },
    });

    return NextResponse.json({
      evaluation: aiEvaluation,
      durationSeconds,
    });
  } catch (error) {
    console.error("Error completing AI interview:", error);
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}
