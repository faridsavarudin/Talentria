import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  transcript: string;
  questionIndex: number;
  sessionId: string;
  totalQuestions: number;
  conversationHistory: ConversationTurn[];
};

// POST /api/ai-interview/[token]/message
// Sends the candidate's transcribed answer to Claude and receives the next
// interviewer question (or a closing statement if finished).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = (await request.json()) as RequestBody;
    const { transcript, questionIndex, sessionId, totalQuestions, conversationHistory } = body;

    if (!sessionId || transcript === undefined || questionIndex === undefined) {
      return NextResponse.json(
        { error: "sessionId, transcript, and questionIndex are required" },
        { status: 400 }
      );
    }

    // Verify the session exists and belongs to this token
    const session = await prisma.aIInterviewSession.findFirst({
      where: { id: sessionId, inviteToken: token },
      select: { id: true, status: true, totalQuestions: true, organizationId: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Session already completed" },
        { status: 409 }
      );
    }

    const effectiveTotalQuestions = totalQuestions ?? session.totalQuestions;
    const nextQuestionIndex = questionIndex + 1;
    const isLastQuestion = nextQuestionIndex >= effectiveTotalQuestions;

    const systemPrompt = `You are an expert AI interviewer conducting a professional job interview.
You ask behavioral and situational questions in a conversational, encouraging tone.
Keep questions concise (2-3 sentences max).
After each answer, briefly acknowledge it (1 sentence) then ask the next question.
You have ${effectiveTotalQuestions} questions to cover total. The candidate just answered question ${questionIndex + 1} of ${effectiveTotalQuestions}.
${isLastQuestion ? "This was the last answer. Thank the candidate warmly and let them know the interview is complete." : `Ask question number ${nextQuestionIndex + 1} of ${effectiveTotalQuestions} now.`}
Do NOT score yet - just conduct the interview naturally.
Return ONLY the spoken text (what you would say aloud to the candidate). No JSON, no markdown.`;

    // Build message history for Claude
    const messages: Anthropic.MessageParam[] = conversationHistory
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    // Append this answer
    if (transcript.trim()) {
      messages.push({ role: "user", content: transcript });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const nextMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Update session progress in DB
    await prisma.aIInterviewSession.update({
      where: { id: sessionId },
      data: {
        currentQuestion: nextQuestionIndex,
        status: session.status === "pending" ? "in_progress" : session.status,
        startedAt: session.status === "pending" ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      nextMessage,
      isLastQuestion,
      questionIndex: nextQuestionIndex,
    });
  } catch (error) {
    console.error("Error processing AI interview message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
