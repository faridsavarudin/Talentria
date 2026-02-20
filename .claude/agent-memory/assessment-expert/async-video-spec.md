# Async Video Interview System — Full Specification
# AssInt Platform · Feb 2026

## How This Fits the Existing Architecture

### What already exists (do NOT re-design)
- Interview model: scheduledAt, status (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED)
- Evaluation model: interviewId + evaluatorId + questionId + score (1-5) + notes
- Candidate model: name, email, phone, resumeUrl, pipelineStage
- Assessment → Question → RubricLevel (1-5, with behavioralAnchors Json)
- Auth: NextAuth JWT, organizationId on every session token
- Middleware: protects all /dashboard/* routes

### What we are ADDING (never overlap with existing)
New models: AsyncInterview, VideoResponse, ProctorLog, CandidateToken, ResumeAnalysis
New enum values: ASYNC_VIDEO, ASYNC_TEXT (extend QuestionType if needed)
New enum: AsyncInterviewStatus (distinct from InterviewStatus to avoid confusion)
New route group: /app/interview/[token]/* (public, no auth, token-only access)

---

## SECTION 1: Schema Additions

### 1.1 New Enums (add to prisma/schema.prisma)

```prisma
enum AsyncInterviewStatus {
  DRAFT          // recruiter still configuring
  SENT           // invitation sent, candidate hasn't opened
  OPENED         // candidate clicked link
  IN_PROGRESS    // candidate started recording
  SUBMITTED      // all questions answered and submitted
  EXPIRED        // deadline passed without submission
  REVIEWED       // recruiter has watched and scored
}

enum RetakePolicy {
  ZERO   // no retakes
  ONE
  TWO
  THREE
}

enum ProctorEventType {
  TAB_SWITCH
  FULLSCREEN_EXIT
  NO_FACE_DETECTED
  MULTIPLE_FACES
  COPY_PASTE_ATTEMPT
  TIME_LIMIT_EXCEEDED
  WINDOW_BLUR
  DEVTOOLS_OPEN
}

enum VideoResponseStatus {
  NOT_STARTED
  RECORDING
  RECORDED    // candidate has a take but hasn't submitted this question
  SUBMITTED
}
```

### 1.2 New Models (add to prisma/schema.prisma)

```prisma
model AsyncInterview {
  id                String               @id @default(cuid())
  assessmentId      String
  candidateId       String
  organizationId    String
  createdById       String
  status            AsyncInterviewStatus @default(DRAFT)

  // Recruiter configuration
  timeLimitSeconds  Int                  // per-question time limit, e.g. 120 = 2 min
  retakePolicy      RetakePolicy         @default(ONE)
  deadlineAt        DateTime             // candidate must submit before this
  thinkTimeSeconds  Int                  @default(30) // reading time before recording starts
  introMessage      String?              @db.Text  // shown to candidate on intro screen
  outroMessage      String?              @db.Text  // shown after submission

  // Invitation
  invitationToken   String               @unique @default(cuid())
  invitationSentAt  DateTime?
  invitationEmail   String               // email invitation was sent to

  // Candidate activity
  openedAt          DateTime?
  startedAt         DateTime?
  submittedAt       DateTime?
  lastActiveAt      DateTime?

  // Recruiter review
  reviewedById      String?
  reviewedAt        DateTime?
  recommendation    String?              // strong_advance / advance / hold / decline
  recruiterNotes    String?              @db.Text

  // AI analysis state
  aiAnalysisStatus  String?              @default("pending") // pending / processing / complete / failed
  aiAnalyzedAt      DateTime?

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  assessment        Assessment           @relation(fields: [assessmentId], references: [id])
  candidate         Candidate            @relation(fields: [candidateId], references: [id])
  organization      Organization         @relation(fields: [organizationId], references: [id])
  createdBy         User                 @relation("AsyncInterviewCreator", fields: [createdById], references: [id])
  reviewedBy        User?                @relation("AsyncInterviewReviewer", fields: [reviewedById], references: [id])
  videoResponses    VideoResponse[]
  proctorLogs       ProctorLog[]

  @@index([organizationId])
  @@index([assessmentId])
  @@index([candidateId])
  @@index([invitationToken])
  @@index([status])
  @@index([deadlineAt])
}

model VideoResponse {
  id                  String              @id @default(cuid())
  asyncInterviewId    String
  questionId          String
  candidateId         String

  status              VideoResponseStatus @default(NOT_STARTED)

  // Video storage
  videoUrl            String?             @db.Text  // Vercel Blob URL
  videoKey            String?             // storage key for deletion
  durationSeconds     Int?                // actual recorded length
  fileSizeBytes       BigInt?
  mimeType            String?             @default("video/webm")

  // Take management
  takeNumber          Int                 @default(1)
  retakesUsed         Int                 @default(0)

  // Transcript & AI
  transcript          String?             @db.Text
  transcriptStatus    String?             @default("pending") // pending / processing / complete / failed
  aiInsights          Json?
  // aiInsights shape: {
  //   suggestedScore: number (1-5),
  //   confidence: number (0-1),
  //   starFormat: { situation: bool, task: bool, action: bool, result: bool },
  //   keyPhrases: string[],
  //   sentimentLabel: "positive" | "neutral" | "negative",
  //   sentimentScore: number,
  //   speakingPacePWM: number,
  //   fillerWordCount: number,
  //   competencySignals: { competency: string, signal: string, strength: "strong"|"moderate"|"weak" }[],
  //   redFlags: string[],
  //   summary: string (2-3 sentences)
  // }

  // Recruiter scoring
  recruiterScore      Int?                // 1-5, overrides aiInsights.suggestedScore
  recruiterNotes      String?             @db.Text

  startedAt           DateTime?
  submittedAt         DateTime?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  asyncInterview      AsyncInterview      @relation(fields: [asyncInterviewId], references: [id], onDelete: Cascade)
  question            Question            @relation(fields: [questionId], references: [id])
  candidate           Candidate           @relation(fields: [candidateId], references: [id])

  @@unique([asyncInterviewId, questionId]) // one response per question per async interview
  @@index([asyncInterviewId])
  @@index([questionId])
  @@index([candidateId])
}

model ProctorLog {
  id               String           @id @default(cuid())
  asyncInterviewId String
  candidateId      String
  questionId       String?          // null = general session event
  eventType        ProctorEventType
  metadata         Json?
  // metadata shape varies by event:
  // TAB_SWITCH: { toUrl: string, count: number }
  // NO_FACE_DETECTED: { durationSeconds: number, frameTimestamp: string }
  // MULTIPLE_FACES: { faceCount: number }
  // TIME_LIMIT_EXCEEDED: { allowedSeconds: number, actualSeconds: number }
  occurredAt       DateTime         @default(now())

  asyncInterview   AsyncInterview   @relation(fields: [asyncInterviewId], references: [id], onDelete: Cascade)
  candidate        Candidate        @relation(fields: [candidateId], references: [id])

  @@index([asyncInterviewId])
  @@index([candidateId])
  @@index([eventType])
  @@index([asyncInterviewId, questionId])
}

model ResumeAnalysis {
  id               String    @id @default(cuid())
  candidateId      String    @unique // one analysis per candidate (update in place)
  rawText          String?   @db.Text
  extractedData    Json
  // extractedData shape:
  // {
  //   fullName: string,
  //   email: string,
  //   phone: string,
  //   location: string,
  //   totalYearsExperience: number,
  //   currentTitle: string,
  //   currentCompany: string,
  //   skills: string[],
  //   technicalSkills: string[],
  //   softSkills: string[],
  //   education: { degree: string, institution: string, year: number, field: string }[],
  //   experience: { title: string, company: string, startDate: string, endDate: string, bullets: string[] }[],
  //   certifications: string[],
  //   languages: string[],
  //   summary: string
  // }
  generatedQuestions Json?   // AI questions tailored to this resume, mapped to competencies
  analyzedAt       DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  candidate        Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@index([candidateId])
}
```

### 1.3 Schema Additions to Existing Models

Add to Candidate:
```prisma
  asyncInterviews  AsyncInterview[]
  videoResponses   VideoResponse[]
  proctorLogs      ProctorLog[]
  resumeAnalysis   ResumeAnalysis?
```

Add to Assessment:
```prisma
  asyncInterviews  AsyncInterview[]
```

Add to Organization:
```prisma
  asyncInterviews  AsyncInterview[]
```

Add to User:
```prisma
  asyncInterviewsCreated  AsyncInterview[] @relation("AsyncInterviewCreator")
  asyncInterviewsReviewed AsyncInterview[] @relation("AsyncInterviewReviewer")
```

Add to Question:
```prisma
  videoResponses   VideoResponse[]
```

---

## SECTION 2: API Routes

### 2.1 Recruiter-Side (all require session + organizationId check)

POST /api/async-interviews
  Body: { assessmentId, candidateId, timeLimitSeconds, retakePolicy, deadlineAt, thinkTimeSeconds, introMessage, outroMessage, invitationEmail }
  Action: Create AsyncInterview in DRAFT status, generate invitationToken

POST /api/async-interviews/[id]/send
  Action: Set status=SENT, invitationSentAt=now(), send email with token link

GET /api/async-interviews
  Query: ?status=&candidateId=&assessmentId=&page=
  Returns: list with candidate name, assessment title, status, video count, proctorLog summary

GET /api/async-interviews/[id]
  Returns: full async interview + videoResponses + proctorLogs + candidate + assessment

GET /api/async-interviews/[id]/proctors
  Returns: grouped proctorLog events with severity and counts

PATCH /api/async-interviews/[id]
  Body: { recommendation, recruiterNotes, status }

POST /api/async-interviews/[id]/score
  Body: { questionId, score, notes }
  Action: Upsert recruiterScore + recruiterNotes on VideoResponse
  Also upserts to existing Evaluation model (interviewId approach: create a linked Interview record if none exists)

POST /api/resume/analyze
  Body: { candidateId, resumeText } OR multipart with PDF
  Action: Call AI to extract data, save to ResumeAnalysis, return extractedData

POST /api/resume/[candidateId]/generate-questions
  Body: { assessmentId }
  Action: Use resumeAnalysis.extractedData + assessment competencies to generate tailored questions

### 2.2 Candidate-Side (NO session required, token-based)

GET /api/candidate/interview/[token]
  Auth: token lookup against AsyncInterview.invitationToken
  Returns: interview config (assessment title, org name, questions list, timeLimitSeconds, retakePolicy, deadline)
  Side effect: if status=SENT, update to OPENED + openedAt=now()

POST /api/candidate/interview/[token]/start
  Auth: token
  Side effect: status=IN_PROGRESS, startedAt=now()

GET /api/candidate/interview/[token]/upload-url
  Query: ?questionId=&mimeType=
  Auth: token
  Action: Generate a Vercel Blob presigned upload URL
  Returns: { uploadUrl, videoKey }

POST /api/candidate/interview/[token]/response
  Auth: token
  Body: { questionId, videoKey, videoUrl, durationSeconds, takeNumber }
  Action: Upsert VideoResponse, validate not past deadline, validate retakesUsed <= policy

POST /api/candidate/interview/[token]/submit
  Auth: token
  Action: Mark AsyncInterview status=SUBMITTED, submittedAt=now(), trigger AI transcription job

POST /api/candidate/interview/[token]/proctor
  Auth: token
  Body: { questionId?, eventType, metadata }
  Action: Create ProctorLog entry

### 2.3 AI Processing (internal, triggered by webhooks or background jobs)

POST /api/ai/transcribe (internal)
  Body: { videoResponseId }
  Action: Call speech-to-text (Whisper or Anthropic), save transcript

POST /api/ai/analyze-video (internal)
  Body: { videoResponseId }
  Action: Call AI with transcript + rubricLevels, save aiInsights, set aiAnalysisStatus=complete

---

## SECTION 3: Page Routes

### 3.1 Recruiter Dashboard Pages

/async-interviews
  List view: table of all async interviews, status badges, completion indicators

/async-interviews/new
  Step 1: Select assessment (dropdown of ACTIVE assessments)
  Step 2: Select or create candidate
  Step 3: Configure (time limit, retakes, deadline, messages)
  Step 4: Preview invite, choose send now or copy link

/async-interviews/[id]
  Review dashboard:
  - Header: candidate name, assessment, status, deadline countdown
  - Left panel: video player + transcript + AI insights overlay
  - Right panel: question list (click to jump to question's video)
  - Scoring panel: AI suggested score + override input + notes
  - Proctor report: collapsible section showing events chronologically

### 3.2 Candidate-Facing Pages (NO auth middleware, token-based)

Route group: /app/interview/[token]/ (separate from dashboard layout)

/interview/[token]
  Intro screen: company name, role, estimated time, deadline, instructions, device check

/interview/[token]/start
  Redirect guard: check deadline not passed, status check

/interview/[token]/question/[questionIndex]
  Recording interface: question text, timer, camera preview, record/stop/review/submit controls

/interview/[token]/complete
  Thank you screen + optional next steps message

---

## SECTION 4: Candidate Recording UX — Detailed Flow

### Screen 1: Intro
- Organization name (from Organization.name via assessment.organizationId)
- Role name (from Assessment.jobTitle)
- Number of questions (Assessment._count.questions)
- Time limit per question
- Total estimated time = (thinkTime + timeLimit) * questionCount
- Deadline countdown
- "Check your camera and microphone" device test button
- "I'm ready, begin" button

### Screen 2: Device Test (Modal or inline)
- Camera preview live
- Microphone level indicator
- "Camera works / Microphone works" confirmation checkboxes
- Proceed button

### Screen 3: Question Screen (repeat per question)
State machine:
  THINKING (countdown from thinkTimeSeconds, question visible, no recording)
  RECORDING (countdown from timeLimitSeconds, red dot indicator)
  REVIEWING (video playback, accept or retake)
  SUBMITTING (upload progress bar)
  SUBMITTED (green checkmark, move to next)

Controls:
  - "Start recording" (appears after think time)
  - "Stop recording" (during record state)
  - "Play back" / "Re-record" (during review state, if retakesUsed < policy)
  - "Use this take" → triggers upload + moves to next question

Auto-submit: if timeLimitSeconds reached, stop recording automatically

Progress indicator: "Question 2 of 5" breadcrumb

### Screen 4: Final Submission
- "Submit all responses" button (enabled only after all questions answered)
- Cannot undo after this
- On click: POST /api/candidate/interview/[token]/submit

### Screen 5: Thank You
- Thank you message (AsyncInterview.outroMessage or default)
- Submission timestamp
- No option to go back

---

## SECTION 5: Proctoring Implementation

### Client-Side Events to Detect

Tab switch / window blur:
  document.addEventListener('visibilitychange') — if hidden, log TAB_SWITCH
  window.addEventListener('blur') — log WINDOW_BLUR
  Count per question, count total

Fullscreen enforcement:
  On question start: request document.documentElement.requestFullscreen()
  If user exits (document.fullscreenElement === null during recording): log FULLSCREEN_EXIT
  Show warning modal: "Please return to fullscreen to continue"
  Auto-pauses recording while not in fullscreen

Face detection:
  Use browser MediaPipe FaceDetection or a lightweight WASM model
  Run every 3 seconds during recording
  No face detected for > 5s: log NO_FACE_DETECTED with durationSeconds
  Multiple faces: log MULTIPLE_FACES with faceCount

Copy-paste prevention:
  On text-format questions only (if QuestionType extended)
  document.addEventListener('copy') and 'paste' — prevent default + log COPY_PASTE_ATTEMPT

Time limit:
  Client-enforced: auto-stop at timeLimitSeconds
  Server-enforced: check VideoResponse.durationSeconds on submit

DevTools detection:
  Window size heuristic: if window.outerWidth - window.innerWidth > 160, log DEVTOOLS_OPEN

### Server-Side Proctor Report Aggregation

GET /api/async-interviews/[id]/proctors returns:
{
  totalEvents: number,
  severityBreakdown: { critical: number, warning: number, info: number },
  events: [
    {
      eventType: ProctorEventType,
      severity: "critical" | "warning" | "info",
      count: number,
      firstOccurrence: DateTime,
      lastOccurrence: DateTime,
      questionId: string | null,
      metadata: Json
    }
  ],
  overallRiskLevel: "low" | "medium" | "high"
}

Severity mapping:
  critical: MULTIPLE_FACES, DEVTOOLS_OPEN, COPY_PASTE_ATTEMPT
  warning: NO_FACE_DETECTED, FULLSCREEN_EXIT, TAB_SWITCH (> 3 times)
  info: WINDOW_BLUR, TAB_SWITCH (1-3 times), TIME_LIMIT_EXCEEDED

Risk level:
  high: any critical event
  medium: >= 3 warning events OR >= 5 info events
  low: otherwise

---

## SECTION 6: AI Video Analysis

### Pipeline (sequential, async job)

Step 1: Transcription
  Input: VideoResponse.videoUrl
  Tool: OpenAI Whisper API (audio/transcriptions endpoint)
    OR Anthropic Messages API with base64 encoded audio (less ideal for long clips)
  Output: plain text transcript
  Save to: VideoResponse.transcript, set transcriptStatus="complete"

Step 2: AI Insights Generation
  Input: transcript + question.content + rubricLevels (all 5 levels with behavioralAnchors)
  Model: claude-3-5-sonnet or gpt-4o (Anthropic SDK already in package.json)
  Prompt structure:
    System: "You are an expert IO psychologist evaluating interview responses against structured rubrics. Analyze the transcript and return a JSON object exactly matching the schema provided."
    User:
      Question: {question.content}
      Competency: {competency.name}
      Rubric:
        1 - {label}: {description} — indicators: {behavioralAnchors}
        2 - ...
        5 - ...
      Transcript: {VideoResponse.transcript}
      Respond with JSON: { suggestedScore, confidence, starFormat, keyPhrases, sentimentLabel, sentimentScore, speakingPacePWM, fillerWordCount, competencySignals, redFlags, summary }
  Parse response and save to: VideoResponse.aiInsights

Step 3: Interview-level aggregation
  After all VideoResponse records have aiInsights:
  Compute: per-competency average AI score, overall AI score
  Update AsyncInterview.aiAnalysisStatus="complete", aiAnalyzedAt=now()

### What the Recruiter Sees (Review UI)

Video player area:
  - Embedded video (HTML5 <video> tag with videoUrl)
  - Transcript panel (scrolls in sync with video via word-level timestamps if available)
  - AI insights sidebar:
    - "AI Suggested Score: 4/5" with confidence badge (e.g. "High confidence")
    - STAR format coverage: four colored chips (S / T / A / R), green=present, red=missing
    - Sentiment: label + score bar
    - Key phrases: pill tags
    - Competency signals: list with strength indicator
    - Red flags: warning section (only shown if redFlags.length > 0)
    - 2-3 sentence AI summary

Scoring panel (right column):
  - Question rubric (collapsed by default, expandable)
  - AI suggested score (pre-filled, editable 1-5 selector)
  - Notes textarea
  - "Save score" button → POST /api/async-interviews/[id]/score

---

## SECTION 7: Resume Analysis

### Resume Parser Flow

Input sources:
  A. Paste text: candidate or recruiter pastes raw text
  B. PDF upload: /api/resume/analyze accepts multipart/form-data
     Server extracts text using a PDF parser (pdf-parse package)
     Then sends text to AI

AI extraction prompt:
  System: "You are an expert resume parser. Extract structured data from this resume text. Return a JSON object exactly matching the schema."
  Schema (extractedData shape): see ResumeAnalysis.extractedData above
  Model: claude-3-5-sonnet

Save to: ResumeAnalysis.extractedData

### Resume-to-Questions Generation

Input: extractedData + assessment competencies
Prompt:
  System: "You are an expert IO psychologist. Generate tailored behavioral interview questions that probe the candidate's specific experience."
  User:
    Role: {assessment.jobTitle}
    Competencies: [{name, description}]
    Candidate background:
      Current title: {currentTitle} at {currentCompany}
      Skills: {skills}
      Key experience: {experience[0].bullets}
    For each competency, generate 1 tailored question that references their actual background.
    Return JSON: { competencyId: string, question: string, rationale: string }[]
Output: saved to ResumeAnalysis.generatedQuestions
UI: shown in /candidates/[id] as "AI-Tailored Questions" accordion, each with "Add to Assessment" button

### Candidate Profile Integration

In /candidates/[id], add new "Resume Analysis" section:
  - Parsed data card: skills pills, education timeline, experience list
  - AI-tailored questions accordion
  - "Re-analyze" button if resumeAnalysis exists
  - "Upload Resume" button → triggers parser flow

---

## SECTION 8: Token-Based Candidate Authentication

### CandidateToken concept
The invitationToken on AsyncInterview IS the authentication token.
No separate CandidateToken model is needed — the invitationToken is a unique CUID on AsyncInterview.
All candidate-facing API routes do:
  1. Extract token from URL params
  2. Lookup: prisma.asyncInterview.findUnique({ where: { invitationToken: token } })
  3. Check: deadlineAt > now(), status not SUBMITTED or EXPIRED
  4. Proceed with asyncInterviewId from the found record

Security rules:
  - Token is a cuid() — not guessable
  - Deadline enforcement: expired tokens return 410 Gone
  - After submission: token becomes read-only (can still load /complete screen)
  - Tokens are never stored in browser localStorage — they live in the URL only

Middleware update needed:
  Add /interview/* to publicRoutes in middleware.ts so it bypasses auth check

---

## SECTION 9: Connecting AsyncInterview Scores to Existing Evaluation Model

The existing Evaluation model (interviewId, evaluatorId, questionId, score) is tied to live interviews.
For async video scoring, use this strategy:

On AsyncInterview creation, also create a linked Interview record:
  Interview.assessmentId = asyncInterview.assessmentId
  Interview.candidateId = asyncInterview.candidateId
  Interview.status = SCHEDULED (will be updated to COMPLETED on submission)
  Store asyncInterviewId on Interview (add field: asyncInterviewId String? @unique)

When recruiter saves score on VideoResponse:
  POST /api/async-interviews/[id]/score also upserts Evaluation:
  { interviewId: asyncInterview.linkedInterviewId, evaluatorId: session.user.id, questionId, score, notes }

This allows:
  - Existing analytics (ICC, bias detection) to include async interview data without modification
  - Calibration system to remain unchanged
  - Feedback report generation to work for both interview types

---

## SECTION 10: Email Invitation

Invitation email content:
  Subject: "Your video interview for {assessment.jobTitle} at {organization.name}"
  Body:
    Hi {candidate.name},
    You've been invited to complete a video interview for the {assessment.jobTitle} position at {organization.name}.
    - {questionCount} questions
    - {timeLimitSeconds/60} minutes per question
    - Must be completed by {deadlineAt formatted}
    [Begin Interview] → https://app.assint.io/interview/{invitationToken}
    If you have technical difficulties, contact {recruiter email}.

Implementation: use Resend or Nodemailer (no email provider currently in codebase — choose Resend)
Add RESEND_API_KEY to env

---

## SECTION 11: Sidebar Navigation Additions

Add to sidebar (components/layout/sidebar.tsx):
  Current items: Dashboard, Assessments, Candidates, Interviews, Calibration, Evaluators, Analytics

Add:
  - "Video Interviews" → /async-interviews (icon: Video)

Note: Keep "Interviews" for live scheduled interviews, "Video Interviews" for async

---

## SECTION 12: Implementation Order (Priority)

P0 — Schema + migrations:
  1. Add enums to schema.prisma
  2. Add AsyncInterview, VideoResponse, ProctorLog, ResumeAnalysis models
  3. Add relation fields to existing models
  4. Run migration: npx prisma migrate dev --name async_video_interviews

P1 — Token auth + candidate flow:
  5. Update middleware.ts to allow /interview/*
  6. Create /app/interview/[token] route group with its own layout (no sidebar)
  7. Build candidate intro, device test, recording, and thank you screens
  8. Build candidate API routes (GET token, start, upload-url, response, submit, proctor)

P2 — Recruiter management:
  9. Build /async-interviews list page
  10. Build /async-interviews/new wizard (4 steps)
  11. Build /async-interviews/[id] review dashboard
  12. Build recruiter API routes

P3 — AI pipeline:
  13. Build transcription job (/api/ai/transcribe)
  14. Build analysis job (/api/ai/analyze-video)
  15. Connect aiInsights to review UI

P4 — Resume analysis:
  16. Build /api/resume/analyze
  17. Build /api/resume/[candidateId]/generate-questions
  18. Add "Resume Analysis" section to /candidates/[id]

P5 — Proctoring:
  19. Add client-side event listeners in recording component
  20. Build proctor log API
  21. Build proctor report UI on review dashboard

---

## SECTION 13: Key Technical Decisions

Video storage: Vercel Blob (already noted in PROJECT_PLAN.md as the choice)
  - Use server-side presigned upload URL pattern
  - Store blob URL in VideoResponse.videoUrl
  - Do NOT store video in PostgreSQL

Video recording: MediaRecorder API (browser native)
  - codec: video/webm;codecs=vp9,opus (supported in Chrome/Firefox)
  - Fallback: video/mp4 on Safari
  - Chunk recording: collect blobs in array, concatenate on stop

Face detection: MediaPipe Face Detection (WASM, runs in browser)
  - Load lazily on question start only
  - Runs at 1fps to avoid CPU overload

PDF parsing for resumes: pdf-parse npm package (server-side)

AI provider: Anthropic (already installed: @anthropic-ai/sdk ^0.77.0)
  - Use for both resume parsing and video insights
  - Use claude-3-5-sonnet-20241022 model

Transcription: OpenAI Whisper (need to add openai package)
  OR: Use Anthropic claude-3-5-sonnet with audio input (beta feature)
  Recommendation: Add openai package just for Whisper; keep Anthropic for analysis

Background jobs: For MVP, trigger AI processing synchronously after submit
  - POST /api/candidate/interview/[token]/submit triggers /api/ai/transcribe internally
  - For scale: use Vercel Queue or Inngest

---

## SECTION 14: Validation Schemas (add to lib/validations/)

File: lib/validations/async-interview.ts

asyncInterviewCreateSchema:
  assessmentId: string.min(1)
  candidateId: string.min(1)
  timeLimitSeconds: number.int.min(30).max(600) // 30s to 10min
  retakePolicy: enum([ZERO, ONE, TWO, THREE])
  deadlineAt: string.datetime() // must be future
  thinkTimeSeconds: number.int.min(0).max(120).default(30)
  introMessage: string.optional
  outroMessage: string.optional
  invitationEmail: string.email()

videoResponseSubmitSchema:
  questionId: string.min(1)
  videoKey: string.min(1)
  videoUrl: string.url()
  durationSeconds: number.int.min(1).max(700)
  takeNumber: number.int.min(1).max(4)

proctorEventSchema:
  questionId: string.optional
  eventType: enum(ProctorEventType values)
  metadata: object.optional

asyncInterviewScoreSchema:
  questionId: string.min(1)
  score: number.int.min(1).max(5)
  notes: string.optional

