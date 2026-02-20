# Phase 2 Technical Specification

## P2-1: Human Score Review UI

### Route: GET + PATCH `/api/ai-interviews/[id]/review`

**GET** — Returns session with AI evaluation breakdown ready for review UI.

Auth: ADMIN / RECRUITER (org-scoped)

Response:
```json
{
  "id": "...",
  "candidateName": "...",
  "transcript": [...],
  "aiEvaluation": {
    "overallScore": 4,
    "summary": "...",
    "strengths": [...],
    "improvements": [...],
    "recommendation": "advance"
  },
  "perQuestionScores": [
    {
      "questionIndex": 0,
      "question": "Tell me about a time...",
      "score": 4,
      "rationale": "...",
      "confidence": 0.87,
      "starAnalysis": { "situation": "...", "task": null, "action": "...", "result": "..." },
      "candidateAnswer": "Well, back when I worked at..."
    }
  ],
  "humanScores": []
}
```

**PATCH** — Saves human override scores.

Request:
```json
{
  "overrides": [
    { "questionIndex": 0, "score": 3, "notes": "Answer was vague on result" },
    { "questionIndex": 2, "score": 5, "notes": "Excellent STAR structure" }
  ]
}
```

Creates `Evaluation` rows with `evaluatorId = currentUser.id`. Does NOT update or delete the AI evaluator rows.

### Page: `app/(dashboard)/ai-interviews/[id]/review/page.tsx`

Layout (server component wrapper → client form):

```
[Back to Session Detail]

Review: Jane Smith — Senior Engineer Role

[Per-question accordion]
  Question 1: Tell me about a time...
    Candidate said: "Well, back when..."
    AI Score: ████░ 4/5 (confidence: 87%)
    Rationale: "The candidate demonstrated clear action..."
    STAR: S✓ T✗ A✓ R✓
    Your override: [1][2][3][4][5] dropdown
    Notes: [textarea]

[Save All Overrides] button → PATCH /api/ai-interviews/[id]/review
```

---

## P2-2: Analytics Bridge (AI Scores → Evaluation Table)

### Schema change — none required
The `Evaluation` model already has the right shape. The system AI evaluator is a regular User row.

### Seeding the System AI Evaluator

Run once per environment (or per deployment):

```ts
// prisma/seed-ai-evaluator.ts
await prisma.user.upsert({
  where: { email: "ai-interviewer@assint.internal" },
  create: {
    email: "ai-interviewer@assint.internal",
    name: "AI Interviewer",
    role: "EVALUATOR",
    organizationId: "GLOBAL_SYSTEM_ORG_ID", // or null if schema allows
  },
  update: {},
});
```

Store the resulting user ID in `process.env.SYSTEM_AI_EVALUATOR_ID`.

### Evaluation Row Creation

Add to `POST /api/ai-interview/[token]/complete/route.ts` after saving the session:

```ts
// After prisma.aIInterviewSession.update(...)

// Create a sibling Interview record for the analytics pipeline
const siblingInterview = await prisma.interview.create({
  data: {
    status: "COMPLETED",
    completedAt: new Date(),
    candidateId: session.candidateId ?? undefined,  // null for anonymous
    assessmentId: session.assessmentId ?? "DEMO_ASSESSMENT_ID",
    organizationId: session.organizationId ?? "DEMO_ORG_ID",
    createdById: process.env.SYSTEM_AI_EVALUATOR_ID!,
  },
});

// Add AI evaluator to the panel
await prisma.interviewPanel.create({
  data: {
    interviewId: siblingInterview.id,
    evaluatorId: process.env.SYSTEM_AI_EVALUATOR_ID!,
    role: "MEMBER",
  },
});

// Write one Evaluation row per question
// (requires perQuestionScores from evaluation prompt — see note below)
for (const [questionId, scoreData] of Object.entries(perQuestionScores)) {
  await prisma.evaluation.create({
    data: {
      interviewId: siblingInterview.id,
      questionId,
      evaluatorId: process.env.SYSTEM_AI_EVALUATOR_ID!,
      score: Math.max(1, Math.min(5, Math.round(scoreData.score))),
      notes: JSON.stringify({
        rationale: scoreData.rationale,
        confidence: scoreData.confidence,
        starAnalysis: scoreData.starAnalysis,
        source: "ai_sync_interview",
      }),
    },
  });
}
```

**Note:** The current evaluation prompt returns a single `overallScore`, not per-question scores. To write per-question Evaluation rows, the completion prompt must be updated to return `perQuestionScores: { [questionIndex]: { score, rationale, confidence } }`. This is a prompt change only — no schema change needed.

---

## P2-3: OpenAI TTS Route

### Route: `POST /api/ai-interview/[token]/speak`

Auth: Token (same pattern as message route)

Request:
```json
{ "text": "Thank you for sharing that. My next question is..." }
```

Response: Audio stream (`audio/mpeg`)

Implementation:
```ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request, { params }) {
  const { token } = await params;
  const { text } = await request.json();

  // Verify token
  const session = await prisma.aIInterviewSession.findUnique({
    where: { inviteToken: token },
    select: { id: true },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.length),
    },
  });
}
```

### Client-Side Upgrade

Replace `speakText()` in the candidate page:

```ts
async function speakText(text: string) {
  if (!process.env.NEXT_PUBLIC_USE_OPENAI_TTS) {
    // Fallback: Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    return;
  }

  const res = await fetch(`/api/ai-interview/${token}/speak`, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });

  const arrayBuffer = await res.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
  source.onended = () => { /* transition to candidate_thinking state */ };
}
```

---

## P2-4: Whisper STT Route

### Route: `POST /api/ai-interview/[token]/transcribe`

Auth: Token

Request: `multipart/form-data` with `audio` field (webm/wav/mp4 blob, max 25MB)

Response:
```json
{ "transcript": "The candidate's spoken words as text" }
```

Implementation:
```ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request, { params }) {
  const { token } = await params;
  const formData = await request.formData();
  const audio = formData.get("audio") as File;

  if (!audio) return NextResponse.json({ error: "No audio" }, { status: 400 });

  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
    language: "en",  // omit for auto-detection
  });

  return NextResponse.json({ transcript: transcription.text });
}
```

### Client-Side MediaRecorder Integration

```ts
// In candidate page, replace SpeechRecognition with:

const mediaRecorder = useRef<MediaRecorder | null>(null);
const audioChunks = useRef<Blob[]>([]);

function startRecording(stream: MediaStream) {
  audioChunks.current = [];
  const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
  recorder.onstop = async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    const form = new FormData();
    form.append("audio", blob, "answer.webm");
    const res = await fetch(`/api/ai-interview/${token}/transcribe`, {
      method: "POST",
      body: form,
    });
    const { transcript } = await res.json();
    setFinalTranscript(transcript);
  };
  mediaRecorder.current = recorder;
  recorder.start();
}

function stopRecording() {
  mediaRecorder.current?.stop();
}
```

---

## P2-5: Session Expiry

### Schema change

```prisma
// In AIInterviewSession model, add:
expiresAt DateTime @default(dbgenerated("NOW() + INTERVAL '7 days'"))
```

After schema change: `npx prisma db push && npx prisma generate`

### Expiry check on candidate fetch

In `GET /api/ai-interview/[token]/route.ts`, add after session lookup:

```ts
if (session.expiresAt && session.expiresAt < new Date() && session.status === "pending") {
  // Mark as expired (lazy expiry)
  await prisma.aIInterviewSession.update({
    where: { id: session.id },
    data: { status: "expired" },
  });
  return NextResponse.json({ error: "This interview link has expired." }, { status: 410 });
}
```

### Cleanup job (Vercel Cron)

Add to `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/expire-sessions", "schedule": "0 2 * * *" }]
}
```

Create `app/api/cron/expire-sessions/route.ts`:
```ts
export async function GET(request: Request) {
  // Verify Vercel cron secret
  if (request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await prisma.aIInterviewSession.updateMany({
    where: {
      status: "pending",
      expiresAt: { lt: new Date() },
    },
    data: { status: "expired" },
  });

  return NextResponse.json({ expired: result.count });
}
```

---

## P2-6: Credit System

### Schema option A — Simple counter on Organization

```prisma
// Add to Organization model:
aiCreditsUsed  Int @default(0)
aiCreditsLimit Int @default(1000)  // free tier limit
```

### Schema option B — Credit log table (preferred for billing)

```prisma
model CreditUsage {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  sessionId      String?
  action         String   // "ai_turn" | "ai_evaluation" | "tts" | "whisper"
  creditsUsed    Int      @default(1)
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])
  @@index([organizationId])
  @@index([createdAt])
}
```

### Deduction in message route

```ts
// After successful Claude response in POST .../message/route.ts:
if (session.organizationId) {
  await prisma.creditUsage.create({
    data: {
      organizationId: session.organizationId,
      sessionId: sessionId,
      action: "ai_turn",
      creditsUsed: 1,
    },
  });
}
```

### Usage display in settings

```ts
// In settings page server component:
const usageThisMonth = await prisma.creditUsage.aggregate({
  where: {
    organizationId: user.organizationId,
    createdAt: { gte: startOfMonth(new Date()) },
  },
  _sum: { creditsUsed: true },
});
```
