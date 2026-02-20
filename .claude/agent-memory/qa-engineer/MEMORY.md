# QA Engineer Agent Memory — AssInt

## Project Identity
- **App**: AssInt — AI-powered Assessment Intelligence & Recruitment Platform
- **Stack**: Next.js 15 (App Router), React 19, PostgreSQL, Prisma 5, NextAuth v5 (beta.30)
- **Styling**: Tailwind CSS v4, Radix UI, Lucide icons, Sonner (toasts)
- **State/Forms**: react-hook-form v7, Zod v4 (validation)
- **AI**: @anthropic-ai/sdk (Claude API — upcoming AI Builder feature)
- **DnD**: @hello-pangea/dnd (Kanban — upcoming)
- **Charts**: recharts

## Key File Paths
- Schema: `/Users/farid/kerja/assint/prisma/schema.prisma`
- Middleware (RBAC): `/Users/farid/kerja/assint/middleware.ts`
- Auth validation: `/Users/farid/kerja/assint/lib/validations/auth.ts`
- Assessment validation: `/Users/farid/kerja/assint/lib/validations/assessment.ts`
- Interview validation: `/Users/farid/kerja/assint/lib/validations/interview.ts`
- Candidate validation: `/Users/farid/kerja/assint/lib/validations/candidate.ts`
- Utils: `/Users/farid/kerja/assint/lib/utils.ts` (cn, formatDate, getInitials)
- Evaluation UI: `/Users/farid/kerja/assint/components/interviews/evaluation-interface.tsx`

## Validation Rules (from Zod schemas)
- Register: name>=2, email valid, password>=8, confirmPassword must match, orgName>=2
- Login: email valid, password>=6
- Assessment: title>=3, jobTitle>=2, jobDescription>=50 chars
- Question content: >=10 chars; rubric description: >=10 chars; behavioralAnchors: array min 1
- Interview: requires assessmentId, candidateId, valid ISO datetime, panelMembers min 1
- Evaluation score: int 1-5; at least 1 evaluation in array
- Candidate update: pipelineStage must be one of 8 valid enum values
- Candidate email: unique within org (not globally)

## Business Logic / Defect-Prone Areas
- Registration creates Org + User atomically; org slug uses `${slug}-${Date.now().toString(36)}`
- Interview creation uses Prisma $transaction (interview + panel + candidate stage update)
- Assessment must be status=ACTIVE for interview scheduling (DRAFT assessments rejected)
- Evaluators must belong to same org as the interview's assessment
- Evaluation submission uses upsert (interviewId+evaluatorId+questionId unique key)
- Evaluation only allowed on SCHEDULED or IN_PROGRESS interviews (not COMPLETED/CANCELLED)
- First evaluation submission auto-transitions interview SCHEDULED -> IN_PROGRESS
- EvaluationInterface uses localStorage autosave (key: `eval-draft-{interviewId}`)
  - DB scores win over localStorage on merge
- Candidate deletion blocked if SCHEDULED or IN_PROGRESS interviews exist
- RubricLevel: unique constraint on (questionId, level) — levels 1-5 only
- Candidate email uniqueness is org-scoped, not global

## RBAC (middleware.ts)
- Public routes: /, /login, /register
- /interviews/[id]/evaluate — ADMIN, RECRUITER, EVALUATOR roles allowed
- /dashboard, /assessments, /analytics, /candidates, /interviews — ADMIN or RECRUITER only
- Logged-in users on /login or /register redirect to /dashboard
- API routes not protected by middleware — auth checked per-handler via `auth()`

## AI Synchronous Interview Feature (new, not yet in production)
- DB model: `AIInterviewSession` (schema lines 519-552) — inviteToken @unique @default(cuid())
- organizationId/assessmentId nullable (null = demo/practice session)
- status: "pending"|"in_progress"|"completed"|"abandoned" (string, not enum)
- transcript: Json @default("[]") — array of {role, content, questionIndex}
- API: POST /api/ai-interview/sessions (PUBLIC), GET /api/ai-interview/[token] (PUBLIC)
- MISSING: /message and /complete endpoints — not yet implemented
- Middleware: /ai-interview/* is public prefix (no auth required)
- AI models: claude-sonnet-4-6 (generate-assessment/questions streaming), claude-haiku-4-5-20251001 (score-response)
- score-response/route.ts line 106: JSON.parse() with NO try/catch — critical bug pattern to avoid repeating
- Test plan: `/Users/farid/kerja/assint/QA_AI_INTERVIEW_TEST_PLAN.md`

## No Test Infrastructure Yet
- No test framework installed (no Vitest, Jest, Playwright, Cypress in package.json)
- Test plan document: `/Users/farid/kerja/assint/QA_TEST_PLAN.md`
- AI interview test plan: `/Users/farid/kerja/assint/QA_AI_INTERVIEW_TEST_PLAN.md`
- See `test-infrastructure.md` for framework recommendations
- Recommended: Vitest (unit) + Playwright (E2E) — see AI interview test plan for config

## Known Architecture Gaps / Risk Areas
- No rate limiting on auth endpoints (brute force risk)
- No email verification flow (emailVerified field exists but unused)
- No CSRF token beyond NextAuth default; API routes only check session
- localStorage draft not encrypted — sensitive eval data in plaintext
- No pagination on candidate/assessment list endpoints (1000+ record performance risk)
- Dashboard runs 6 parallel DB queries on every page load
- Subscription/AI credits model exists in schema but not enforced in API yet
- GET /api/ai-interview/[token] returns candidateEmail + transcript with NO auth — PII exposure
- AIInterviewSession has no expiresAt field (no TTL for demo sessions)
- No rate limiting on POST /api/ai-interview/sessions (public endpoint, no cost to spam)
- MediaStream cleanup: async interview page only stops tracks on completion (line 139), not on unmount/error
- SpeechRecognition: Firefox has zero support (no dom.webSpeech.recognition in stable builds)
- SpeechSynthesis getVoices() returns [] synchronously — must await voiceschanged event before speak()
