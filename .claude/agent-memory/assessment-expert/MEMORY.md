# Assessment Expert Agent Memory

## Project: AssInt (Assessment Intelligence Platform)
- Stack: Next.js 15, React 19, PostgreSQL, Prisma 5, NextAuth v5, TailwindCSS 4, shadcn/ui, Zod v4
- Path: /Users/farid/kerja/assint
- Auth: JWT strategy, roles: ADMIN, RECRUITER, EVALUATOR, CANDIDATE
- Multi-tenant: organizationId scopes all data

## Codebase State (as of Feb 2026)
- Assessment CRUD API: fully implemented (create, list, get, update, publish)
- Assessment Builder UI: functional (new/page.tsx, [id]/page.tsx, dialogs for competency+question)
- Calibration page: mock data only, no backend
- Analytics page: mock data only, no backend
- Dashboard: mock data only
- Evaluators page: mock data only
- No candidate management UI or API
- No interview scheduling UI or API
- No evaluation/scoring flow
- No kanban pipeline
- No AI integration

## Schema Key Facts
- RubricLevel.behavioralAnchors is Json (array of strings)
- Evaluation uniqueness: [interviewId, evaluatorId, questionId]
- CalibrationAttempt.isCalibrated = within 0.5 of expertScore
- BiasReport.reportData is Json blob
- ReliabilityScore stores ICC per (assessment, evaluator) pair
- CandidateFeedback.competencyScores is Json

## Rubric Scale Convention
- 1 = Below Expectations
- 2 = Partially Meets Expectations
- 3 = Meets Expectations
- 4 = Exceeds Expectations
- 5 = Far Exceeds Expectations

## ICC Thresholds (standard psychometric)
- < 0.50: Poor reliability, block from evaluating
- 0.50–0.74: Moderate, require calibration
- 0.75–0.89: Good, certified
- >= 0.90: Excellent

## 4/5ths Rule Thresholds
- ratio > 0.80: No adverse impact (green)
- ratio 0.70–0.80: Monitor (yellow)
- ratio < 0.70: Adverse impact alert (red)

## Preferred Patterns
- Use React Hook Form + Zod for all forms
- Alert/confirm dialogs should be replaced with shadcn/ui Dialog components
- All API routes must check session.user.organizationId for multi-tenancy
- Prefer server components for data fetching where possible

## Detailed Specs Files
- project-specs.md — original feature spec (Feb 2026)
- async-video-spec.md — async video interview + proctoring + AI scoring + resume analysis (Feb 2026)

## Async Video Interview Key Decisions (see async-video-spec.md for full detail)
- invitationToken on AsyncInterview IS the auth mechanism — no separate CandidateToken model
- AsyncInterview also creates a sibling Interview record so existing Evaluation/analytics models stay intact
- AsyncInterviewStatus enum is SEPARATE from InterviewStatus
- Candidate pages: /interview/[token]/* in own layout, added to publicRoutes in middleware.ts
- Video storage: Vercel Blob presigned URL; recording via browser MediaRecorder API (webm/mp4)
- AI: Anthropic claude-3-5-sonnet for insights + resume; OpenAI Whisper for transcription
- Face detection: MediaPipe WASM lazy-loaded in browser at 1fps during recording
- ResumeAnalysis is 1-to-1 on Candidate (upserted)
- New sidebar item: "Video Interviews" at /async-interviews

## Codebase State Update (Feb 2026)
- Candidate API: implemented (GET list with cursor pagination, POST create, GET [id], PATCH [id])
- Interview API: implemented (GET list, POST create, GET [id], PATCH [id], POST evaluations bulk upsert)
- Candidates page: implemented with search + stage filter
- Interviews page + detail + evaluate page: all implemented
- Assessment builder: fully functional with rubric level creation
- Async video, proctoring, AI, resume: NOT YET IMPLEMENTED (spec in async-video-spec.md)
- Sync AI interview: NOT YET IMPLEMENTED (spec in sync-ai-interview-spec.md)

## Schema Attention: AIInterviewSession
- Organization and Assessment models already reference AIInterviewSession (relation fields exist)
- AIInterviewSession MODEL IS NOT YET IN SCHEMA — must be added before implementation
- siblingInterview pattern: AIInterviewSession creates sibling Interview+Evaluation on completion
- System AI evaluator: seeded User with role=EVALUATOR, ID stored in SYSTEM_AI_EVALUATOR_ID env var

## Sync AI Interview Key Decisions (see sync-ai-interview-spec.md)
- AI persona: "Morgan" (production), "Alex" (demo)
- Demo route: /demo — public, no auth, no DB, browser TTS/STT
- Production route: /ai-interview/[token] — invitationToken auth (same pattern as async)
- Claude for interviewer turns: claude-sonnet-4-6, max_tokens=400, stream=true
- Sentinel: [INTERVIEW_COMPLETE] detected server-side in stream
- Follow-up rule: < 60 words OR missing Action+Result = one follow-up max per question
- Insufficient flag: < 25 words — logged for analytics only
- Human override: new Evaluation row created; AI row preserved for ICC; human takes precedence
- Credits: 1/turn + 1/scoring call; demo = 0 credits
- Auto-flag for review: AI confidence < 0.5, extreme WPM, > 50% follow-up rate, session < 5min

## Assessment Inventory Module (see ASSESSMENT_INVENTORY_SPEC.md)
- 6 instruments: RIASEC (66 items, 15min), CAT (48 items, 35min), VRA (24 items, 20min),
  CTA (18 items, 25min), ART (30 items, 25min), BFPI (60 items, 12min)
- Candidate portal: /test/[token]/* — public, token-based, same pattern as async/AI interviews
- CTA (Creative Thinking) uses Claude AI scoring for 12 open-ended items — novel feature
- Scoring: raw → percentile → 5-band label (1=Low to 5=Exceptional)
- RIASEC and BFPI excluded from battery composite score (profile, not performance)
- CAT has highest adverse impact risk — always flag, never auto-reject
- New Prisma models: AssessmentInventory, InventoryBatteryItem, CandidateInventorySession,
  InstrumentSession, ItemResponse, InventoryResult, InventoryProctorLog
- Item bank stored as seeded JSON, not in ItemResponse (itemKey references bank)
- CTA scoring: async 202 Accepted pattern, Claude call in background, < 15s
- Competitor file: docs/COMPETITOR_TALENTICS.md (Talentics.id analysis, live URLs unverified)
- Assessment Library marketing spec: docs/ASSESSMENT_LIBRARY_SPEC.md (Feb 2026) — covers all 6 instruments
