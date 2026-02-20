# Synchronous AI Video Interview — Complete Specification
## AssInt Platform · Authored Feb 2026

---

## 0. Architecture Overview

The synchronous AI interview is a real-time, turn-based conversation between the candidate (camera + microphone) and Claude acting as interviewer (TTS voice + transcript). It is architecturally separate from the AsyncInterview (pre-recorded one-way video). The key distinction:

| Dimension | Async Video | Sync AI Interview |
|---|---|---|
| Interaction model | One-way monologue per question | Back-and-forth conversation |
| AI role | Post-hoc scorer | Real-time interviewer + post-hoc scorer |
| Conversation memory | None | Full message history in Claude context |
| TTS | None | Required (AI speaks questions aloud) |
| STT | OpenAI Whisper (batch) | Web Speech API (streaming) or Whisper (chunked) |
| Auth gate | invitationToken | invitationToken (same pattern) |
| Scoring pipeline | VideoResponse.aiSuggestedScore | AIInterviewSession → Evaluation (mapped) |

---

## 1. Schema Additions Required

The schema already references `AIInterviewSession` on `Organization` and `Assessment` but the model is not defined. Add the following to `prisma/schema.prisma`:

```prisma
// ============================================
// SYNCHRONOUS AI INTERVIEW
// ============================================

enum AIInterviewStatus {
  INVITED      // Token sent, candidate has not started
  IN_PROGRESS  // Active conversation underway
  COMPLETED    // Conversation concluded
  ABANDONED    // Candidate left mid-session
  EXPIRED      // Token expired before use
}

model AIInterviewSession {
  id                  String            @id @default(cuid())
  assessmentId        String
  organizationId      String
  createdById         String
  candidateId         String?           // null until candidate identified
  invitationToken     String            @unique @default(cuid())
  candidateEmail      String
  candidateName       String?
  status              AIInterviewStatus @default(INVITED)

  // Configuration (copied from assessment at send-time, immutable after send)
  jobTitle            String
  competencySnapshot  Json              // Array of { id, name, description } — frozen at send time
  questionSnapshot    Json              // Array of { id, content, type, competencyId, rubricLevels }

  // Session runtime data
  conversationHistory Json              @default("[]")  // Claude message array
  turnCount           Int               @default(0)
  durationSeconds     Int?              // Total wall-clock time of interview
  transcriptText      String?           @db.Text        // Full flattened transcript

  // Scoring outputs
  aiScores            Json?             // { questionId: { score, confidence, rationale, starAnalysis } }
  aiOverallScore      Float?
  aiSummary           String?           @db.Text
  humanReviewedAt     DateTime?
  humanReviewerId     String?

  // Quality metrics
  qualityMetrics      Json?             // { answerLengths, starCoverage, wpm, followUpCount, insufficientFlags }

  // Practice demo flag
  isPracticeDemo      Boolean           @default(false)

  tokenExpiresAt      DateTime
  startedAt           DateTime?
  completedAt         DateTime?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  assessment   Assessment    @relation(fields: [assessmentId], references: [id])
  organization Organization  @relation(fields: [organizationId], references: [id])
  createdBy    User          @relation("AISessionCreator", fields: [createdById], references: [id])
  humanReviewer User?        @relation("AISessionReviewer", fields: [humanReviewerId], references: [id])
  // sibling Interview record created on COMPLETED for analytics pipeline
  siblingInterview  Interview?  @relation(fields: [siblingInterviewId], references: [id])
  siblingInterviewId String?   @unique

  @@index([organizationId])
  @@index([assessmentId])
  @@index([invitationToken])
  @@index([candidateEmail])
}
```

Add the reverse relations to User:
```prisma
// In User model add:
aiInterviewsCreated    AIInterviewSession[] @relation("AISessionCreator")
aiInterviewsReviewed   AIInterviewSession[] @relation("AISessionReviewer")
```

Add the sibling Interview relation to Interview:
```prisma
// In Interview model add:
aiSession AIInterviewSession?
```

### System Evaluator User

Create a seeded system user at org-bootstrap time:
```
email: system-ai@{orgId}.internal
role: EVALUATOR
name: "AI Interviewer"
```
This user's ID is stored in an env var `SYSTEM_AI_EVALUATOR_ID` and is what appears in `Evaluation.evaluatorId` when AI scores are written. This keeps ICC calculations honest — the AI is treated as one rater among humans, enabling human-vs-AI agreement analysis.

---

## 2. Practice Demo Session

### 2.1 Demo Route Architecture

- Route: `/demo` (public, no auth, no DB writes)
- Separate from `/interview/[token]/*` (authenticated candidate flow)
- Uses the same frontend component but receives `isPracticeDemo: true`
- Calls `/api/ai-interview/demo/chat` (stateless, no session persistence)
- TTS: browser `window.speechSynthesis` (no API cost for demo)
- STT: Web Speech API `SpeechRecognition` (browser-native, no cost)

### 2.2 Practice Demo System Prompt

```
You are Alex, a warm and professional AI interviewer conducting a practice interview session for a job applicant. This is a PRACTICE session — the candidate is trying out the interview experience before a real interview.

Your goals for this session:
1. Make the candidate feel at ease and build confidence
2. Ask 4 questions covering different skill areas
3. Ask one follow-up if an answer is very brief or missing key elements
4. After the final question, invite the candidate to ask you anything about the process
5. Provide brief encouraging feedback at the very end (2-3 sentences, not a score)

PRACTICE QUESTIONS (ask in this order):
Q1 [Communication]: "Can you walk me through a time when you had to explain something complicated to someone who wasn't familiar with the topic? What was the situation and how did it go?"

Q2 [Problem-Solving]: "Tell me about a problem you encountered that didn't have an obvious solution. How did you approach figuring it out?"

Q3 [Adaptability]: "Describe a situation where your plans changed unexpectedly and you had to adjust quickly. What did you do?"

Q4 [Motivation]: "What kind of work energizes you most, and can you give me an example of a time you were doing exactly that kind of work?"

CONVERSATION RULES:
- Ask only ONE question at a time
- After Q4, say: "Thank you so much — those were all my questions. Do you have any questions for me about what an AI interview is like, or about the process in general?"
- Keep your transitions between questions natural: "Great, thank you for sharing that." / "I appreciate you walking me through that." / "That's really helpful context."
- If an answer is fewer than 40 words OR missing both Action and Result elements, ask ONE follow-up: "Could you tell me a bit more about what specifically you did and what the outcome was?"
- Never ask more than one follow-up per question
- Never evaluate or score during the conversation
- Closing feedback (after candidate questions): Give 2-3 sentences of genuine, specific encouragement based on what they actually said. Do not give scores or rankings.

TONE: Warm, curious, genuinely interested. Never robotic. Never repeat the question word-for-word in your follow-up.
```

### 2.3 Practice Demo Questions — Full Design

#### Q1: Communication (Behavioral)
**Question text:** "Can you walk me through a time when you had to explain something complicated to someone who wasn't familiar with the topic? What was the situation and how did it go?"

**Target competency:** Communication — clarity, audience adaptation, structure

**Follow-up trigger:** Answer lacks description of HOW they explained it (no analogy, no method, no technique mentioned)
**Follow-up text:** "How did you decide on the approach you used to make it clear for them?"

**Ideal answer characteristics (for AI reference scoring):**
- Names a specific situation and audience
- Describes a deliberate technique (analogy, visual, chunking, etc.)
- Mentions checking for understanding or the other person's reaction
- States a clear outcome (person understood, problem solved, project moved forward)

**Level anchors for demo scoring:**
- 1: Vague or no example; "I just explained it simply"
- 2: Example given but no technique described; outcome unclear
- 3: Clear example, some technique described, positive outcome mentioned
- 4: Specific technique, evidence of audience tailoring, outcome confirmed
- 5: Demonstrates sophistication (e.g., checked comprehension, iterated, used multiple methods)

---

#### Q2: Problem-Solving (Behavioral)
**Question text:** "Tell me about a problem you encountered that didn't have an obvious solution. How did you approach figuring it out?"

**Target competency:** Analytical thinking — ambiguity tolerance, systematic reasoning, resourcefulness

**Follow-up trigger:** Answer describes the problem well but skips the reasoning process (jumps from problem to solution)
**Follow-up text:** "Walk me through the specific steps you took to work out what to do — what did you consider or try?"

**Ideal answer characteristics:**
- Describes a genuinely ambiguous or novel problem (not a routine task)
- Explains a thinking process: research, hypothesis testing, seeking input, breaking into parts
- Acknowledges uncertainty or false starts
- States what worked and why

**Level anchors:**
- 1: Describes a simple problem or no reasoning process
- 2: Identifies a real problem but solution was given to them or was obvious
- 3: Shows a process, found a workable solution
- 4: Demonstrates systematic thinking, shows awareness of alternatives considered
- 5: Shows iterative reasoning, explicitly managed uncertainty, outcome reflects quality of their process

---

#### Q3: Adaptability (Behavioral)
**Question text:** "Describe a situation where your plans changed unexpectedly and you had to adjust quickly. What did you do?"

**Target competency:** Adaptability — flexibility, composure under change, recovery speed

**Follow-up trigger:** Candidate describes the change but not their internal management of it (what they did, not just what happened)
**Follow-up text:** "What did you have to let go of or reprioritize specifically, and how did you decide what to focus on first?"

**Ideal answer characteristics:**
- Describes a real disruption with meaningful stakes
- Shows active adjustment behavior (not just "went with the flow")
- Mentions decision-making under pressure
- Positive outcome or learning acknowledged

**Level anchors:**
- 1: Situation is minor or response is passive ("I just accepted it")
- 2: Shows awareness of disruption but limited agency in response
- 3: Took concrete action, redirected effort, outcome acceptable
- 4: Shows prioritization logic, minimal disruption to outcome
- 5: Led others through change, demonstrates metacognitive awareness of own adaptability

---

#### Q4: Motivation / Values (Behavioral)
**Question text:** "What kind of work energizes you most, and can you give me an example of a time you were doing exactly that kind of work?"

**Target competency:** Self-awareness — motivation fit, engagement, intrinsic drivers

**Follow-up trigger:** Candidate gives a generic answer ("I like working with people") without a concrete example
**Follow-up text:** "Can you tell me about a specific time recently when you felt that energy at work? What were you doing?"

**Ideal answer characteristics:**
- Articulates a specific type of work (not just a vague theme)
- Provides a concrete example with observable behavior
- Connects the energy to the work itself (not external rewards)
- Shows self-awareness about what sustains them

**Level anchors:**
- 1: Generic answer with no example or self-awareness
- 2: Theme identified but example is thin or externally motivated
- 3: Clear theme + relevant example + connection between the two
- 4: Articulates WHY that work energizes them (intrinsic motivation visible)
- 5: Example richly described, demonstrates genuine self-knowledge and intentionality about career direction

---

### 2.4 Practice Demo Opening Statement (AI speaks first)

```
"Hi there — welcome! I'm Alex, your AI practice interviewer.

This is a safe space to try out what an AI interview feels like before you do a real one. We'll go through four questions covering different areas — communication, problem-solving, adaptability, and motivation. There are no right or wrong answers here; I'm just here to help you get comfortable with the format.

Just speak naturally, like you would in a real interview. Take your time. I'll ask a follow-up if I want to hear more, and at the end you'll get a chance to ask me anything.

Ready? Let's start with the first question."
```

### 2.5 Practice Demo Closing Statement (AI speaks after candidate finishes questions)

```
"Thank you so much — it was genuinely great getting to know you a little through those answers.

[Insert 2-3 sentences of specific, encouraging feedback based on what they actually said — reference at least one thing they shared.]

In a real AI interview, everything you say is transcribed, analyzed, and scored against the job's competency rubric by the AI — and then a hiring team reviews those scores. But the conversation format is exactly like what you just experienced.

Good luck in your interviews. You've got this."
```

---

## 3. Production AI Interviewer — Full Prompt Architecture

### 3.1 System Prompt Template (Production)

All variables in `{UPPER_SNAKE}` are injected server-side before the conversation starts. This prompt is sent as the `system` parameter in every Claude API call.

```
You are Morgan, a professional AI interviewer conducting a behavioral interview on behalf of {ORGANIZATION_NAME}. You are warm, professional, and genuinely curious about the candidate's experience.

## Role Context
- Position: {JOB_TITLE}
- Department: {DEPARTMENT}
- Interviewing: {CANDIDATE_NAME}
- Today's date: {INTERVIEW_DATE}

## Your Interview Mission
You will conduct a structured behavioral interview lasting approximately {ESTIMATED_DURATION_MINUTES} minutes ({QUESTION_COUNT} questions). Your job is to gather sufficient behavioral evidence to score the candidate against {ORGANIZATION_NAME}'s competency rubric. You are NOT to evaluate during the conversation. Evaluation happens after the interview.

## Competencies to Assess
{COMPETENCY_LIST}
Format: Each competency is "Name: description — [list of behavioral indicators]"

## Question Bank (ask in this order)
{QUESTION_BANK}
Format:
Q{N} [Competency: {COMPETENCY_NAME}] [{QUESTION_TYPE}]
"{QUESTION_TEXT}"
Follow-up if needed: "{SUGGESTED_FOLLOW_UP}"

## Interview Rules — MUST FOLLOW
1. Ask exactly ONE question at a time. Never ask two questions in one turn.
2. Work through the question bank IN ORDER. Do not skip questions.
3. Follow-up protocol: Ask ONE follow-up if the answer is < 60 words OR is missing Action AND Result elements. Never ask more than one follow-up per question.
4. After the last question: Say "Thank you — those are all the questions I have for you today. Before we wrap up, do you have any questions for me?" Then answer any candidate questions naturally. Then close the interview.
5. Do not mention scores, rubrics, STAR format, or any evaluation criteria during the conversation.
6. Do not provide feedback or tell candidates if their answers were good or bad during the interview.
7. If a candidate goes significantly off-topic, acknowledge briefly and redirect: "I appreciate that context — let me make sure we cover [next question]."
8. Manage time: if a candidate gives very long answers (> 3 minutes estimated), you may say "Thank you — I want to make sure we have time for all the questions, so let's move on."
9. Closing: After candidate questions, say the closing statement and then output the special token [INTERVIEW_COMPLETE] on a new line.

## Transition Phrases (rotate, do not repeat)
- "Thank you for sharing that."
- "I appreciate you walking me through that."
- "That's really helpful context."
- "Got it, thank you."
- "I appreciate that."

## Tone
Professional, warm, unhurried. You are genuinely interested in the candidate. Never robotic. Never use filler phrases like "Great answer!" or "Excellent!"

## Boundaries
- Never discuss compensation, benefits, or offer details.
- If asked about interview outcomes: "I'm not able to share that — the hiring team reviews everything after and will be in touch."
- If candidate is distressed: acknowledge, offer a brief pause, continue.
- If candidate asks if you are AI: confirm honestly — "Yes, I'm an AI interviewer. Everything you share is reviewed by the human hiring team."
```

### 3.2 Variable Injection Map

| Template Variable | Source in DB | Notes |
|---|---|---|
| `{ORGANIZATION_NAME}` | `Organization.name` | |
| `{JOB_TITLE}` | `Assessment.jobTitle` | |
| `{DEPARTMENT}` | `Assessment.department` | |
| `{CANDIDATE_NAME}` | `AIInterviewSession.candidateName` or email prefix | |
| `{INTERVIEW_DATE}` | Server-side `new Date().toLocaleDateString()` | |
| `{ESTIMATED_DURATION_MINUTES}` | `questionCount * 4` (4 min avg per question) | |
| `{QUESTION_COUNT}` | `AIInterviewSession.questionSnapshot.length` | |
| `{COMPETENCY_LIST}` | Built from `AIInterviewSession.competencySnapshot` | Formatted string |
| `{QUESTION_BANK}` | Built from `AIInterviewSession.questionSnapshot` | Formatted string with follow-ups from rubric |

### 3.3 Competency List Formatting Function

```typescript
function formatCompetencyList(competencies: CompetencySnapshot[]): string {
  return competencies
    .map((c, i) => `${i + 1}. ${c.name}: ${c.description}`)
    .join("\n");
}
```

### 3.4 Question Bank Formatting Function

```typescript
function formatQuestionBank(questions: QuestionSnapshot[]): string {
  return questions
    .map((q, i) => {
      // Extract follow-up from rubric level 3 behavioral anchors as suggested probes
      const followUp = deriveFollowUp(q);
      return [
        `Q${i + 1} [Competency: ${q.competencyName}] [${q.type}]`,
        `"${q.content}"`,
        `Follow-up if needed: "${followUp}"`,
      ].join("\n");
    })
    .join("\n\n");
}

function deriveFollowUp(q: QuestionSnapshot): string {
  // Priority 1: Use question-specific follow-up if stored (future field)
  // Priority 2: Generic follow-up based on question type
  const genericFollowUps: Record<string, string> = {
    BEHAVIORAL: "Can you tell me more about specifically what you did and what the outcome was?",
    SITUATIONAL: "Walk me through exactly how you would handle that step by step.",
    TECHNICAL: "Can you give me a concrete example of when you applied that approach?",
  };
  return genericFollowUps[q.type] ?? "Could you tell me a bit more about that?";
}
```

### 3.5 Conversation History Array Structure

The `conversationHistory` stored in `AIInterviewSession.conversationHistory` is the exact array passed to Claude's `messages` parameter. Each turn is persisted immediately after it is generated so session recovery is possible.

```typescript
type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

// Initial state (before interview starts):
conversationHistory = [];

// After AI sends opening:
conversationHistory = [
  { role: "assistant", content: "Hi {CANDIDATE_NAME}, I'm Morgan..." }
];

// After candidate first response:
conversationHistory = [
  { role: "assistant", content: "Hi {CANDIDATE_NAME}..." },
  { role: "user", content: "[STT transcription of candidate speech]" },
];

// Pattern continues alternating. Claude always responds to the FULL history.
// The system prompt is sent separately, NOT included in the history array.
```

**Session recovery:** If the WebSocket/connection drops, the frontend re-fetches `GET /api/ai-interview/[sessionId]/state` which returns the current `conversationHistory`. The AI picks up from where it left off. No context is lost.

### 3.6 API Route Design for Chat Turns

```
POST /api/ai-interview/[sessionId]/turn
Body: { transcription: string }
Auth: invitationToken (query param or header)

Process:
1. Load AIInterviewSession, verify status = IN_PROGRESS, verify token
2. Append { role: "user", content: transcription } to conversationHistory
3. Build system prompt from questionSnapshot + competencySnapshot
4. Call Claude API:
   - model: "claude-sonnet-4-6"
   - system: buildSystemPrompt(session)
   - messages: session.conversationHistory
   - max_tokens: 400  // AI turns should be concise
   - stream: true (for real-time TTS)
5. Detect [INTERVIEW_COMPLETE] token in response
6. Append { role: "assistant", content: aiResponse } to history
7. Persist updated conversationHistory + turnCount
8. If [INTERVIEW_COMPLETE]: trigger post-interview scoring pipeline
9. Stream AI response back to client for TTS synthesis

Response: StreamingText (for real-time TTS)
```

**Token budget:** 400 max_tokens for AI response is intentional. Interviewers should be concise. Increase to 600 only for the closing turn.

---

## 4. Follow-up Question Detection Rules

### 4.1 Heuristic Engine (run on each candidate turn)

```typescript
interface AnswerQualityCheck {
  wordCount: number;
  hasSituation: boolean;    // STAR: S
  hasTask: boolean;         // STAR: T
  hasAction: boolean;       // STAR: A
  hasResult: boolean;       // STAR: R
  needsFollowUp: boolean;
  insufficientFlag: boolean; // flag for analytics
  followUpReason: "too_short" | "missing_action_result" | "off_topic" | null;
}

function analyzeAnswer(transcription: string, questionType: QuestionType): AnswerQualityCheck {
  const words = transcription.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const text = transcription.toLowerCase();

  // STAR detection via keyword heuristics
  const situationSignals = ["when", "there was", "we were", "i was", "the situation", "at the time", "working at", "in my role"];
  const taskSignals = ["my job was", "i needed to", "i was responsible", "my goal", "i had to", "the task"];
  const actionSignals = ["i decided", "i started", "i worked", "i reached out", "i created", "i built", "i spoke", "i proposed", "i led", "i collaborated", "what i did", "my approach"];
  const resultSignals = ["as a result", "in the end", "ultimately", "the outcome", "we achieved", "it worked", "i learned", "we were able", "successfully", "the result was", "by the end"];

  const hasSituation = situationSignals.some(s => text.includes(s));
  const hasTask = taskSignals.some(s => text.includes(s));
  const hasAction = actionSignals.some(s => text.includes(s));
  const hasResult = resultSignals.some(s => text.includes(s));

  // Follow-up rules
  const tooShort = wordCount < 60;
  const missingCriticalElements = !hasAction && !hasResult; // Missing both = definitely needs follow-up

  // For behavioral questions, require Action OR Result at minimum
  const needsFollowUp = tooShort || missingCriticalElements;

  // Flag as insufficient only if extremely short (< 25 words) — will trigger re-prompt
  const insufficientFlag = wordCount < 25;

  return {
    wordCount,
    hasSituation,
    hasTask,
    hasAction,
    hasResult,
    needsFollowUp,
    insufficientFlag,
    followUpReason: insufficientFlag
      ? "too_short"
      : missingCriticalElements
      ? "missing_action_result"
      : tooShort
      ? "too_short"
      : null,
  };
}
```

### 4.2 Insufficient Response Re-Prompt

If `insufficientFlag = true` (< 25 words), before sending to Claude, inject a special instruction into the current turn:

```typescript
// Server-side, before appending candidate turn to history:
if (check.insufficientFlag) {
  // Add an invisible system note in the assistant's next instruction
  // by modifying the pending turn's content to trigger re-prompt behavior
  // Claude will see: [CANDIDATE RESPONSE TOO SHORT - RE-PROMPT]
  // This is passed as a system-level injection, not shown to candidate
}
```

Claude's system prompt already handles this via: "If an answer is < 60 words OR missing Action AND Result, ask ONE follow-up." The flag is purely for analytics logging.

### 4.3 Follow-up Quota Enforcement

```typescript
// Track per question whether follow-up has been used
interface QuestionState {
  questionIndex: number;
  followUpUsed: boolean;
  answerCount: number; // initial + follow-up
}

// Stored in AIInterviewSession.conversationHistory metadata (not in Claude context)
// Server enforces: even if Claude wants to ask another follow-up, server blocks it
// and instead instructs Claude to move to the next question
```

---

## 5. Post-Interview Scoring — Evaluation Prompt

### 5.1 Scoring Architecture

After `[INTERVIEW_COMPLETE]` is detected:

1. Extract per-question answer segments from `conversationHistory`
2. For each question, call the evaluation prompt (one call per question, parallel)
3. Write results to `AIInterviewSession.aiScores`
4. Create a sibling `Interview` record with status `COMPLETED`
5. Write one `Evaluation` record per question using the system AI evaluator ID
6. Optionally create `CandidateFeedback` record

### 5.2 Answer Extraction from Conversation History

```typescript
function extractAnswersFromHistory(
  history: ConversationTurn[],
  questions: QuestionSnapshot[]
): Record<string, string> {
  // Strategy: match assistant turns that contain question text,
  // then collect ALL subsequent user turns until next question or closing
  const answers: Record<string, string> = {};

  let currentQuestionId: string | null = null;
  let accumulatingAnswer = false;
  const answerParts: string[] = [];

  for (const turn of history) {
    if (turn.role === "assistant") {
      // Check if this turn introduces a new question
      const matchedQuestion = questions.find(q =>
        turn.content.includes(q.content.substring(0, 40))
      );

      if (matchedQuestion) {
        // Save accumulated answer for previous question
        if (currentQuestionId && answerParts.length > 0) {
          answers[currentQuestionId] = answerParts.join(" ").trim();
        }
        currentQuestionId = matchedQuestion.id;
        answerParts.length = 0;
        accumulatingAnswer = true;
      }
    } else if (turn.role === "user" && accumulatingAnswer) {
      answerParts.push(turn.content);
    }
  }

  // Save final question's answer
  if (currentQuestionId && answerParts.length > 0) {
    answers[currentQuestionId] = answerParts.join(" ").trim();
  }

  return answers;
}
```

### 5.3 Post-Interview Evaluation Prompt

This is the prompt sent to Claude (as a separate, independent call — no conversation history) for scoring each question after the interview ends. It is structurally identical to the existing `score-response` prompt but adapted for conversational transcripts.

```typescript
const EVALUATION_SYSTEM_PROMPT = `You are a senior I/O psychologist trained in Behaviorally Anchored Rating Scales (BARS).
You are scoring a candidate's verbal response from a live AI interview against a structured rubric.
The response may be a composite of their initial answer and a follow-up. Evaluate the TOTALITY of what they said.
Return a JSON object only — no markdown, no preamble.`;

function buildEvaluationPrompt(
  question: QuestionSnapshot,
  candidateAnswer: string,
  qualityMetrics: AnswerQualityCheck
): string {
  const rubricText = question.rubricLevels
    .map(r => `Level ${r.level} — ${r.label}:\n${r.description}\nAnchors: ${r.behavioralAnchors.join("; ")}`)
    .join("\n\n");

  return `## Interview Question
${question.content}

## Rubric (1–5 scale)
${rubricText}

## Candidate's Full Response (from live interview)
${candidateAnswer}

## Answer Quality Context (for calibration)
- Word count: ${qualityMetrics.wordCount}
- STAR presence: Situation=${qualityMetrics.hasSituation}, Task=${qualityMetrics.hasTask}, Action=${qualityMetrics.hasAction}, Result=${qualityMetrics.hasResult}
- Follow-up was ${qualityMetrics.needsFollowUp ? "USED" : "NOT needed"}

## Scoring Task
Score the response on the 5-point BARS rubric and return:
{
  "score": <integer 1-5>,
  "confidence": <float 0.0-1.0>,
  "rationale": "<2-3 sentences citing specific rubric anchors and what the candidate actually said>",
  "starAnalysis": {
    "situation": "<extracted situation text or null>",
    "task": "<extracted task text or null>",
    "action": "<extracted action text or null>",
    "result": "<extracted result text or null>"
  },
  "strengths": ["<specific strength from their answer>"],
  "developmentAreas": ["<specific gap relative to rubric>"],
  "keywordsDetected": ["<competency-relevant keyword>"]
}

IMPORTANT: If the answer is very short or incomplete, score honestly — do not inflate scores for short answers. A 25-word answer with no Action or Result should score 1 or 2.`;
}
```

**Confidence calibration note:** `confidence` < 0.5 should be flagged in `qualityMetrics` and trigger human review routing.

### 5.4 Database Write After Scoring

```typescript
async function persistAIScores(
  session: AIInterviewSession,
  scores: Record<string, AIQuestionScore>
): Promise<void> {
  const overallScore =
    Object.values(scores).reduce((sum, s) => sum + s.score, 0) /
    Object.values(scores).length;

  // 1. Update AIInterviewSession
  await prisma.aIInterviewSession.update({
    where: { id: session.id },
    data: {
      aiScores: scores,
      aiOverallScore: overallScore,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // 2. Create sibling Interview record (for existing analytics pipeline)
  const interview = await prisma.interview.create({
    data: {
      assessmentId: session.assessmentId,
      candidateId: session.candidateId!, // must be resolved before scoring
      status: "COMPLETED",
      completedAt: new Date(),
      recommendation: overallScore >= 3.5 ? "Advance" : overallScore >= 2.5 ? "Consider" : "Do Not Advance",
      notes: `AI Interview — ${session.turnCount} turns, ${session.durationSeconds}s`,
    },
  });

  // Link sibling
  await prisma.aIInterviewSession.update({
    where: { id: session.id },
    data: { siblingInterviewId: interview.id },
  });

  // 3. Write Evaluation records (one per question, using system AI evaluator)
  const systemEvaluatorId = process.env.SYSTEM_AI_EVALUATOR_ID!;

  await prisma.$transaction([
    // Add AI evaluator to panel
    prisma.interviewPanel.create({
      data: {
        interviewId: interview.id,
        evaluatorId: systemEvaluatorId,
        role: "MEMBER",
      },
    }),
    // Write evaluations
    ...Object.entries(scores).map(([questionId, score]) =>
      prisma.evaluation.create({
        data: {
          interviewId: interview.id,
          evaluatorId: systemEvaluatorId,
          questionId,
          score: score.score,
          notes: JSON.stringify({
            rationale: score.rationale,
            confidence: score.confidence,
            starAnalysis: score.starAnalysis,
            source: "ai_sync_interview",
          }),
        },
      })
    ),
    // Write CandidateFeedback
    prisma.candidateFeedback.create({
      data: {
        interviewId: interview.id,
        candidateId: session.candidateId!,
        competencyScores: buildCompetencyScores(scores, session.questionSnapshot as QuestionSnapshot[]),
        overallScore,
        summary: session.aiSummary ?? "AI interview completed — pending human review",
      },
    }),
  ]);
}
```

---

## 6. Human Override of AI Scores

### 6.1 Override Architecture

Human reviewers see a "Review AI Interview" page at:
`/async-interviews/ai/[sessionId]/review`

The page shows:
- Full transcript (conversationHistory rendered as dialogue)
- Per-question AI score with rationale and confidence
- Override input: score selector (1–5) + notes field
- Override saves to `Evaluation` record (new row with `evaluatorId = humanReviewerId`)
- The AI score row (system evaluator) is NOT deleted — both rows coexist

This means:
- ICC calculation includes BOTH AI and human scores — which surfaces human-AI agreement
- If a human overrides, the `humanReviewedAt` and `humanReviewerId` fields are set on the session
- For bias reports and candidate feedback, the HUMAN score takes precedence over AI score when both exist

### 6.2 Score Precedence Logic

```typescript
function resolveScore(
  evaluations: Evaluation[],
  systemEvaluatorId: string
): number {
  // Human evaluator scores take precedence
  const humanEval = evaluations.find(e => e.evaluatorId !== systemEvaluatorId);
  const aiEval = evaluations.find(e => e.evaluatorId === systemEvaluatorId);

  return humanEval?.score ?? aiEval?.score ?? 0;
}
```

### 6.3 ICC Integration

The AI evaluator participates in ICC calculation as a rater. This enables:
- "AI vs Human agreement" as a quality metric per assessment
- Detection of systematic AI bias (if AI consistently scores higher/lower than humans)
- Evidence base for calibration of the AI scoring prompt over time

In the existing `calculate-icc` route, no changes are needed — the AI evaluator's `Evaluation` rows are included automatically.

---

## 7. Quality Metrics System

### 7.1 Metrics Captured Per Session

All stored in `AIInterviewSession.qualityMetrics` (Json field):

```typescript
interface AIInterviewQualityMetrics {
  // Per-question metrics
  perQuestion: {
    [questionId: string]: {
      wordCount: number;
      speakingDurationSeconds: number;
      wordsPerMinute: number;        // wordCount / (speakingDurationSeconds / 60)
      starCoverage: {
        situation: boolean;
        task: boolean;
        action: boolean;
        result: boolean;
        completenessScore: number;   // 0-4 (count of present elements)
      };
      followUpTriggered: boolean;
      followUpReason: string | null;
      insufficientFlag: boolean;
      aiConfidence: number;          // from scoring step
    };
  };

  // Session-level aggregates
  totalWordCount: number;
  averageWPM: number;               // target range: 120-180 WPM
  averageAnswerLengthWords: number;
  averageStarCompleteness: number;  // 0-4
  followUpRate: number;             // 0.0-1.0
  insufficientResponseCount: number;
  totalTurns: number;
  durationSeconds: number;

  // Flags for review routing
  flaggedForReview: boolean;
  flagReasons: string[];            // ["low_confidence", "high_follow_up_rate", "short_answers"]
}
```

### 7.2 Review Routing Rules

Auto-route session to human review queue when ANY of:
- Any question AI confidence < 0.5
- Average WPM < 80 (transcript quality issue) or > 300 (STT error suspected)
- > 50% of questions triggered follow-ups (candidate may have struggled)
- Any question insufficientFlag = true AND follow-up also flagged
- Total session duration < 5 minutes (suspiciously short)
- AI overall score < 2.0 or > 4.8 (extreme scores warrant human verification)

```typescript
function shouldFlagForReview(metrics: AIInterviewQualityMetrics, scores: Record<string, AIQuestionScore>): {
  flagged: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (Object.values(scores).some(s => s.confidence < 0.5)) reasons.push("low_ai_confidence");
  if (metrics.averageWPM < 80) reasons.push("low_wpm_transcript_quality");
  if (metrics.averageWPM > 300) reasons.push("high_wpm_stt_error_suspected");
  if (metrics.followUpRate > 0.5) reasons.push("high_follow_up_rate");
  if (metrics.insufficientResponseCount > 0) reasons.push("insufficient_responses_present");
  if (metrics.durationSeconds < 300) reasons.push("session_too_short");

  const overallScore = Object.values(scores).reduce((s, q) => s + q.score, 0) / Object.values(scores).length;
  if (overallScore < 2.0) reasons.push("very_low_ai_score");
  if (overallScore > 4.8) reasons.push("suspiciously_high_score");

  return { flagged: reasons.length > 0, reasons };
}
```

### 7.3 WPM Measurement

WPM is estimated from STT chunked timestamps if available, or estimated as:

```typescript
function estimateWPM(wordCount: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.round((wordCount / durationSeconds) * 60);
}
// Normal conversational speech: 120-180 WPM
// Red flags: < 80 (very halting) or > 250 (STT artifact)
```

---

## 8. Frontend Architecture

### 8.1 Candidate-Facing Pages

| Route | Auth | Purpose |
|---|---|---|
| `/demo` | None | Practice demo (browser TTS/STT, no DB) |
| `/ai-interview/[token]` | invitationToken | Production AI interview |
| `/ai-interview/[token]/complete` | invitationToken | Completion screen |

Add `/demo` and `/ai-interview/[token]` to `publicRoutes` in `middleware.ts`.

### 8.2 Core React Component State Machine

```typescript
type AIInterviewStage =
  | "permission_check"   // requesting camera + mic
  | "intro"              // AI welcome + setup instructions
  | "listening"          // candidate is speaking (STT active)
  | "processing"         // AI is "thinking" (Claude API call in flight)
  | "speaking"           // TTS is playing AI response
  | "waiting_to_speak"   // AI finished, candidate can speak
  | "follow_up"          // AI asked follow-up, waiting for response
  | "wrap_up"            // Final candidate questions phase
  | "completed"          // Interview done
  | "error";             // Camera/mic/network error
```

### 8.3 TTS Strategy (Production)

**Preferred:** Eleven Labs or OpenAI TTS API (server-side, streamed)
- Endpoint: `POST /api/ai-interview/[sessionId]/speak` — streams audio
- Voice: professional, neutral, warm
- AI response text → TTS audio → played in browser via Web Audio API

**Fallback:** Browser `window.speechSynthesis`
- No API cost, lower quality
- Use for demo only

**Implementation pattern:**
```typescript
async function speakAIResponse(text: string, sessionId: string): Promise<void> {
  const response = await fetch(`/api/ai-interview/${sessionId}/speak`, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await audio.play();
}
```

### 8.4 STT Strategy

**Preferred for demo:** Web Speech API (`SpeechRecognition`)
```typescript
const recognition = new window.SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = "en-US";
recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(r => r[0].transcript)
    .join("");
  setLiveTranscript(transcript);
};
```

**Production:** OpenAI Whisper (chunked during recording OR batch after stop)
- Record via MediaRecorder in 30-second chunks
- POST each chunk to `/api/ai-interview/[sessionId]/transcribe`
- Accumulate transcript server-side
- More accurate, language-agnostic, handles accents better

---

## 9. Bias Mitigation Considerations

1. **Name-blind first turn:** The system prompt includes candidate name ONLY for personalized greeting. Claude does NOT receive demographic signals (age, gender signals in name, etc.) in the evaluation prompt.

2. **Evaluation prompt isolation:** The evaluation prompt (Section 5.3) contains ONLY the question, rubric, and transcript. No candidate name, no metadata about who they are.

3. **BiasReport integration:** After all AI interviews for an assessment complete, run the existing `BiasReport` pipeline against the AI-written `Evaluation` rows. Flag if AI scores show demographic disparities (requires demographic data from candidates, opt-in).

4. **Language/accent accommodation:** If WPM flags suggest STT accuracy issues for a candidate, the session is auto-flagged for human review (Section 7.2). This prevents STT quality from disadvantaging non-native speakers.

5. **Confidence threshold:** Low-confidence AI scores (< 0.5) always route to human review. Human is the final decision-maker.

---

## 10. API Route Summary

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai-interview` | JWT (recruiter) | Create session + send invitation |
| GET | `/api/ai-interview/[sessionId]` | JWT (recruiter) | Get session details |
| GET | `/api/ai-interview/[sessionId]/state` | invitationToken | Get current conversation state (recovery) |
| POST | `/api/ai-interview/[sessionId]/turn` | invitationToken | Send candidate turn, get AI response |
| POST | `/api/ai-interview/[sessionId]/speak` | invitationToken | Stream TTS audio for AI text |
| POST | `/api/ai-interview/[sessionId]/transcribe` | invitationToken | Submit audio chunk for Whisper |
| POST | `/api/ai-interview/[sessionId]/complete` | invitationToken | Force-complete (timeout/abandon) |
| GET | `/api/ai-interview/[sessionId]/review` | JWT (evaluator) | Get session for human review |
| PATCH | `/api/ai-interview/[sessionId]/review` | JWT (evaluator) | Submit human override scores |
| POST | `/api/ai-interview/demo/chat` | None | Demo session turn (stateless) |

---

## 11. Credit Consumption Model

| Action | Credits |
|---|---|
| Per AI interviewer turn (Claude call) | 1 credit |
| Per question post-interview scoring | 1 credit |
| Per session TTS if using paid API | 1 credit per session |

A 5-question interview with 2 follow-ups = 7 interviewer turns + 5 scoring calls = 12 credits maximum.

The practice demo consumes 0 credits (no auth, no DB, browser TTS/STT).

---

## 12. Key Implementation Notes for Developer

1. **Do NOT use Claude's extended thinking for interviewer turns.** It adds latency that breaks the conversational feel. Use standard mode, stream=true.

2. **The [INTERVIEW_COMPLETE] sentinel token** must be detected server-side in the streaming response, not client-side. When detected: stop the stream early, trigger background scoring job, return `{ status: "complete" }` to client.

3. **Token limits in system prompt:** The formatted question bank + competency list can get large. For assessments with > 8 questions, truncate the question bank to only include the NEXT 2 unasked questions to keep context window usage manageable.

4. **Parallel scoring:** Fire all question scoring calls in `Promise.all()`. Do not await sequentially. Typical 5-question interview scores in < 5 seconds this way.

5. **The `conversationHistory` JSON field** is the single source of truth for session recovery. Persist it after EVERY turn before returning the response. If the server crashes between persist and response, the worst case is the candidate re-speaks their last answer.

6. **Demo mode detection:** `AIInterviewSession.isPracticeDemo = true` sessions skip all DB writes for Evaluation, Interview, and Candidate. They write only to `AIInterviewSession` for analytics on demo conversion rates.
```
