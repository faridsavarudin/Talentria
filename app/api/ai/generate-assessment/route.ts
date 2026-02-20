import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const AI_MODEL = "openai/seed-2-0-mini-260215";

const SYSTEM_PROMPT = `You are a senior Industrial-Organizational (I/O) psychologist with 20 years of experience designing structured behavioral interview assessments. You specialize in Behaviorally Anchored Rating Scales (BARS) methodology and evidence-based competency frameworks.

Your role is to create rigorous, unbiased, and legally defensible interview assessments. Follow these principles:
- Use inclusive, bias-free language (avoid gendered pronouns, age-related terms, cultural assumptions)
- Ground all competencies in observable, job-relevant behaviors
- Write BARS rubric levels that describe actual behaviors, not personality traits
- Use STAR (Situation, Task, Action, Result) format for behavioral questions
- Ensure questions are open-ended and cannot be answered with "yes" or "no"
- Calibrate rubric descriptions so level 3 represents fully competent performance

Always respond with valid JSON only. No markdown, no preamble, no explanation — pure JSON.`;

function buildUserPrompt(
  jobTitle: string,
  jobDescription: string,
  department?: string,
  competencies?: string[]
): string {
  const competencyHint =
    competencies && competencies.length > 0
      ? `\nFocus on these competencies: ${competencies.join(", ")}.`
      : "\nIdentify the most critical 3-5 competencies for this role.";

  return `Create a structured behavioral interview assessment for the following role:

Job Title: ${jobTitle}
${department ? `Department: ${department}` : ""}

Job Description:
${jobDescription}
${competencyHint}

Return a JSON object with this exact structure:
{
  "competencies": [
    {
      "name": "string",
      "description": "string (1-2 sentences describing what this competency means for this role)",
      "questions": [
        {
          "content": "string (full question text, starting with 'Tell me about a time...' or 'Describe a situation where...')",
          "type": "BEHAVIORAL" | "SITUATIONAL" | "TECHNICAL",
          "rubricLevels": [
            {
              "level": 1,
              "label": "Far Below Expectations",
              "description": "string (2-3 sentences describing behavior at this level)",
              "behavioralAnchors": ["string", "string", "string"] (3 specific observable behaviors)
            },
            {
              "level": 2,
              "label": "Below Expectations",
              "description": "string",
              "behavioralAnchors": ["string", "string", "string"]
            },
            {
              "level": 3,
              "label": "Meets Expectations",
              "description": "string",
              "behavioralAnchors": ["string", "string", "string"]
            },
            {
              "level": 4,
              "label": "Exceeds Expectations",
              "description": "string",
              "behavioralAnchors": ["string", "string", "string"]
            },
            {
              "level": 5,
              "label": "Exceptional",
              "description": "string",
              "behavioralAnchors": ["string", "string", "string"]
            }
          ]
        }
      ]
    }
  ]
}

Generate 3-5 competencies with 2-3 questions each. Every question MUST have all 5 rubric levels.`;
}

export async function POST(request: Request) {
  try {
    // Validate API key is configured
    if (!process.env.AI_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured. Please add AI_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL ?? "https://openrouter.ai/api/v1",
    });

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    // Check and deduct credits first (auto-create subscription for new orgs)
    let subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { organizationId, plan: "FREE", aiCredits: 50 },
      });
    }

    const credits = subscription.aiCredits;
    if (credits < 1) {
      return NextResponse.json(
        { error: "Insufficient AI credits. Please upgrade your plan.", aiCredits: 0 },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { jobTitle, jobDescription, department, competencies } = body as {
      jobTitle: string;
      jobDescription: string;
      department?: string;
      competencies?: string[];
    };

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "jobTitle and jobDescription are required" },
        { status: 400 }
      );
    }

    // Deduct credit before streaming
    await prisma.subscription.update({
      where: { organizationId },
      data: { aiCredits: { decrement: 1 } },
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const aiStream = await openai.chat.completions.create({
            model: AI_MODEL,
            max_tokens: 8192,
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: buildUserPrompt(
                  jobTitle,
                  jobDescription,
                  department,
                  competencies
                ),
              },
            ],
          });

          for await (const chunk of aiStream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
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
    console.error("Error generating assessment:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment" },
      { status: 500 }
    );
  }
}
