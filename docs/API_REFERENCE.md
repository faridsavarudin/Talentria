# API Reference

Base URL: `/api`

Auth legend:
- **Public** — no auth required
- **Token** — `inviteToken` verified via DB lookup
- **Session** — NextAuth session cookie required
- **ADMIN/RECRUITER** — Session + role check

---

## Auth

### POST /api/auth/register
**Auth:** Public (rate-limited: 5/IP/15min)

Creates a new user and organization.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "password": "minimum8chars",
  "organizationName": "Acme Corp"
}
```

**Response 201:**
```json
{ "message": "User created successfully", "userId": "cuid" }
```

**Errors:** 400 (invalid input), 409 (email exists), 429 (rate limit)

---

## Assessments

### GET /api/assessments
**Auth:** Session

Returns all assessments for the user's organization. Supports `?status=ACTIVE|DRAFT|ARCHIVED` and `?search=query`.

**Response 200:** Array of Assessment objects with `createdBy`, `_count.questions`, `_count.interviews`, `_count.competencies`.

### POST /api/assessments
**Auth:** ADMIN / RECRUITER

Creates a new assessment (status: DRAFT).

**Request:**
```json
{
  "title": "Senior Engineer",
  "description": "...",
  "jobTitle": "Staff Software Engineer",
  "jobDescription": "...",
  "department": "Engineering",
  "competencies": [
    { "name": "Problem Solving", "description": "..." }
  ]
}
```

**Response 201:** Full Assessment with competencies and questions.

### GET /api/assessments/[id]
**Auth:** Session

Returns single assessment with competencies, questions (ordered), and interview count.

### PATCH /api/assessments/[id]
**Auth:** ADMIN / RECRUITER — Updates assessment fields. Also handles status transitions (DRAFT → ACTIVE → ARCHIVED).

### DELETE /api/assessments/[id]
**Auth:** ADMIN — Soft-deletes (or hard-deletes, verify implementation).

---

## AI Generation

### POST /api/ai/generate-assessment
**Auth:** ADMIN / RECRUITER

Generates competencies + questions from a job description using Claude.

**Request:**
```json
{ "jobTitle": "...", "jobDescription": "...", "department": "..." }
```

**Response 200:** `{ competencies: [...], questions: [...] }`

### POST /api/ai/generate-questions
**Auth:** ADMIN / RECRUITER

Generates additional questions for a specific competency.

**Request:**
```json
{ "competencyName": "...", "competencyDescription": "...", "jobTitle": "...", "count": 3 }
```

**Response 200:** `{ questions: [{ content, type, rubric }] }`

### POST /api/ai/score-response
**Auth:** Session (evaluator context)

Scores a candidate's answer against a rubric using Claude.

**Request:**
```json
{
  "questionContent": "...",
  "rubric": "...",
  "candidateResponse": "...",
  "competencyName": "..."
}
```

**Response 200:** `{ score: 1-5, rationale: "...", starAnalysis: {...}, confidence: 0.0-1.0 }`

---

## Candidates

### GET /api/candidates
**Auth:** ADMIN / RECRUITER

Lists candidates for the org. Supports `?search=`.

### POST /api/candidates
**Auth:** ADMIN / RECRUITER

**Request:** `{ name, email, phone?, resumeUrl?, notes? }`

**Response 201:** Created candidate.

### GET /api/candidates/[id]
**Auth:** Session

### PATCH /api/candidates/[id]
**Auth:** ADMIN / RECRUITER

### DELETE /api/candidates/[id]
**Auth:** ADMIN

---

## Interviews

### GET /api/interviews
**Auth:** Session

Lists interviews for the org.

### POST /api/interviews
**Auth:** ADMIN / RECRUITER

Creates a structured interview (links candidate + assessment + evaluators).

**Request:**
```json
{
  "candidateId": "...",
  "assessmentId": "...",
  "scheduledAt": "ISO datetime",
  "evaluatorIds": ["..."]
}
```

### GET /api/interviews/[id]
**Auth:** Session

### PATCH /api/interviews/[id]
**Auth:** ADMIN / RECRUITER

---

## AI Synchronous Interviews (Candidate-Facing)

### POST /api/ai-interview/sessions
**Auth:** Public (rate-limited: 10/IP/hour)

Creates a new AI interview session. Used for both recruiter-initiated and demo sessions.

**Request:**
```json
{
  "organizationId": "optional",
  "assessmentId": "optional",
  "candidateEmail": "optional",
  "candidateName": "optional",
  "totalQuestions": 4
}
```

**Response 200:** `{ id, inviteToken, totalQuestions, status }`

### GET /api/ai-interview/[token]
**Auth:** Public (token lookup)

Returns session info for the candidate page (no PII — email and transcript excluded).

**Response 200:** `{ id, inviteToken, status, totalQuestions, currentQuestion, candidateName, startedAt }`

### POST /api/ai-interview/[token]/message
**Auth:** Token

Sends candidate's transcribed answer to Claude, returns AI interviewer's next message.

**Request:**
```json
{
  "sessionId": "...",
  "transcript": "Candidate's spoken answer text",
  "questionIndex": 0,
  "totalQuestions": 4,
  "conversationHistory": [
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

**Response 200:** `{ nextMessage: "...", isLastQuestion: false, questionIndex: 1 }`

### POST /api/ai-interview/[token]/complete
**Auth:** Token

Evaluates the full interview transcript with Claude and persists results.

**Request:**
```json
{
  "sessionId": "...",
  "transcript": [{ "role": "user|assistant", "content": "...", "questionIndex": 0 }],
  "startedAt": "ISO datetime"
}
```

**Response 200:**
```json
{
  "evaluation": {
    "overallScore": 4,
    "summary": "...",
    "strengths": ["..."],
    "improvements": ["..."],
    "recommendation": "advance|hold|reject"
  },
  "durationSeconds": 840
}
```

### POST /api/ai-interview/demo/complete
**Auth:** Public

Same as `/complete` but does NOT write to DB. Used for the public demo session.

---

## AI Interviews (Recruiter-Facing)

### GET /api/ai-interviews
**Auth:** ADMIN / RECRUITER

Lists all AI interview sessions for the recruiter's organization.

**Response 200:** Array of sessions with `aiEvaluation`, `assessment.title`, candidate info.

### POST /api/ai-interviews
**Auth:** ADMIN / RECRUITER

Creates a new AI interview session scoped to the recruiter's org.

**Request:**
```json
{
  "candidateName": "optional",
  "candidateEmail": "optional",
  "totalQuestions": 4
}
```

**Response 201:** `{ id, inviteToken, totalQuestions, status }`

---

## Async Video Interviews

### GET /api/async-interviews
**Auth:** ADMIN / RECRUITER

### POST /api/async-interviews
**Auth:** ADMIN / RECRUITER

Creates an async interview + sends invite emails to candidates.

**Request:**
```json
{
  "title": "...",
  "assessmentId": "...",
  "instructions": "optional",
  "timeLimitSeconds": 180,
  "retakesAllowed": 1,
  "deadlineAt": "optional ISO datetime",
  "candidateEmails": ["alice@example.com", "bob@example.com"]
}
```

**Response 201:** `{ id, invitesSent: 2 }`

---

## Analytics

### POST /api/analytics/calculate-icc
**Auth:** ADMIN / RECRUITER

Calculates ICC for an assessment.

**Request:** `{ assessmentId: "..." }`

**Response 200:** `{ icc: 0.87, evaluatorCount: 3, ratingCount: 45 }`

### GET /api/analytics/summary
**Auth:** ADMIN / RECRUITER

Returns org-level analytics summary (total interviews, avg ICC, adverse impact flags).
