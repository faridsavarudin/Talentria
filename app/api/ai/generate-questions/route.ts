import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a senior Industrial-Organizational (I/O) psychologist specializing in Behaviorally Anchored Rating Scales (BARS) methodology.

Generate structured behavioral interview questions for a specific competency. Use inclusive, bias-free language. Always respond with valid JSON only — no markdown, no preamble.`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    // Check and deduct credits
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    const credits = subscription?.aiCredits ?? 0;
    if (credits < 1) {
      return NextResponse.json(
        { error: "Insufficient AI credits. Please upgrade your plan.", aiCredits: 0 },
        { status: 402 }
      );
    }

    const body = await request.json();
    const {
      assessmentId,
      competencyId,
      competencyName,
      jobDescription,
      count = 2,
    } = body as {
      assessmentId: string;
      competencyId: string;
      competencyName: string;
      jobDescription: string;
      count?: number;
    };

    if (!assessmentId || !competencyId || !competencyName || !jobDescription) {
      return NextResponse.json(
        { error: "assessmentId, competencyId, competencyName, and jobDescription are required" },
        { status: 400 }
      );
    }

    // Verify assessment belongs to org
    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, organizationId },
      select: { id: true, jobTitle: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Deduct credit
    await prisma.subscription.update({
      where: { organizationId },
      data: { aiCredits: { decrement: 1 } },
    });

    const userPrompt = `Generate ${count} behavioral interview questions for the competency "${competencyName}" for a ${assessment.jobTitle} role.

Job Description context:
${jobDescription}

Return a JSON array with this exact structure:
[
  {
    "content": "string (full question text)",
    "type": "BEHAVIORAL" | "SITUATIONAL" | "TECHNICAL",
    "rubricLevels": [
      {
        "level": 1,
        "label": "Far Below Expectations",
        "description": "string",
        "behavioralAnchors": ["string", "string", "string"]
      },
      { "level": 2, "label": "Below Expectations", "description": "string", "behavioralAnchors": ["string", "string", "string"] },
      { "level": 3, "label": "Meets Expectations", "description": "string", "behavioralAnchors": ["string", "string", "string"] },
      { "level": 4, "label": "Exceeds Expectations", "description": "string", "behavioralAnchors": ["string", "string", "string"] },
      { "level": 5, "label": "Exceptional", "description": "string", "behavioralAnchors": ["string", "string", "string"] }
    ]
  }
]

Every question MUST have all 5 rubric levels. Use inclusive, bias-free language.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }

          controller.close();
        } catch (err) {
          // Refund credit on AI error
          await prisma.subscription.update({
            where: { organizationId },
            data: { aiCredits: { increment: 1 } },
          }).catch(() => {});
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
