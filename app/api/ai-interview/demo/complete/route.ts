import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type TranscriptEntry = {
  role: "user" | "assistant";
  content: string;
  questionIndex?: number;
};

type AIEvaluation = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: "advance" | "hold" | "reject";
};

// POST /api/ai-interview/demo/complete
// Evaluates a demo (no-DB) interview transcript.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      transcript: TranscriptEntry[];
    };

    const { transcript } = body;

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const conversationText = transcript
      .map((t) => `${t.role === "assistant" ? "Interviewer" : "Candidate"}: ${t.content}`)
      .join("\n\n");

    const evaluationPrompt = `You are an expert hiring assessment professional. Evaluate the following practice interview transcript and return ONLY valid JSON with no markdown or preamble.

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
      const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      aiEvaluation = JSON.parse(cleaned) as AIEvaluation;
    } catch {
      aiEvaluation = {
        overallScore: 3,
        summary: "Practice session completed. Keep practicing to improve your interview skills.",
        strengths: ["Completed the practice interview", "Engaged with all questions"],
        improvements: ["Provide more specific examples", "Structure answers with the STAR method"],
        recommendation: "advance",
      };
    }

    return NextResponse.json({ evaluation: aiEvaluation });
  } catch (error) {
    console.error("Error evaluating demo interview:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview" },
      { status: 500 }
    );
  }
}
