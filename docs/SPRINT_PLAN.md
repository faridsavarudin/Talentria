# Phase 2 Sprint Plan

## Overview

Phase 2 spans 3 two-week sprints focused on making AI interviews production-grade and closing the analytics loop.

---

## Sprint 1 — Human Oversight + Analytics Bridge (Weeks 1–2)

**Sprint Goal:** Recruiters can review AI interview scores, override them, and AI scores flow into the existing ICC analytics pipeline.

### User Stories

**US-1: Human score review**
> As a recruiter, I want to see the AI's score and reasoning for each interview question so I can trust or override it.

Acceptance criteria:
- [ ] `/ai-interviews/[id]/review` page loads the session transcript
- [ ] Each question shows: AI score (1–5), confidence bar, rationale text, STAR breakdown
- [ ] Recruiter can select an override score per question (1–5 dropdown) and add notes
- [ ] Saving creates Evaluation rows in the DB (different evaluatorId from AI, same interviewId + questionId)
- [ ] Review page shows "AI score" vs "Your score" side-by-side after saving

**US-2: Analytics bridge**
> As an analytics admin, I want AI interview scores to appear in the ICC dashboard automatically so I can measure human-AI rater agreement.

Acceptance criteria:
- [ ] A system AI evaluator user exists (seeded per org or globally)
- [ ] When an AIInterviewSession completes, Evaluation rows are written (one per question) with `evaluatorId = SYSTEM_AI_EVALUATOR_ID`
- [ ] These rows appear in the ICC calculation without any changes to the ICC route
- [ ] The evaluations list shows "AI Interviewer" as evaluator name

### Technical Tasks

| Task | Files | Effort |
|---|---|---|
| Create review page UI | `app/(dashboard)/ai-interviews/[id]/review/page.tsx` | M |
| Create review API endpoint | `app/api/ai-interviews/[id]/review/route.ts` (GET + PATCH) | M |
| Seed system AI evaluator | `prisma/seed.ts` or one-time migration script | S |
| Write Evaluation rows on completion | Update `app/api/ai-interview/[token]/complete/route.ts` | M |
| Link AIInterviewSession to Interview | Add `siblingInterviewId` to schema + create Interview on completion | L |
| Show AI evaluator in evaluations list | Update evaluations display to show "AI Interviewer" label | S |

### Definition of Done
- Review page renders with real data
- Override saves correctly and doesn't overwrite AI row
- ICC dashboard includes AI evaluator scores
- TypeScript clean, no console errors

---

## Sprint 2 — Production Voice Quality (Weeks 3–4)

**Sprint Goal:** Replace browser TTS/STT with OpenAI TTS (nova voice) and Whisper STT for production-quality voice in AI interviews.

### User Stories

**US-3: Better AI voice**
> As a candidate, I want the AI interviewer to sound natural and clear so the interview feels professional.

Acceptance criteria:
- [ ] AI responses are spoken using OpenAI TTS `nova` voice (not browser SpeechSynthesis)
- [ ] Audio streams to the browser without noticeable delay (< 1s to first audio)
- [ ] Falls back to Web Speech API if `OPENAI_API_KEY` is not set

**US-4: Accurate transcription**
> As a recruiter reviewing a transcript, I want the candidate's words transcribed accurately even with accents or background noise.

Acceptance criteria:
- [ ] Candidate audio is recorded via MediaRecorder
- [ ] Audio chunks are sent to the Whisper API route
- [ ] Transcript returned from Whisper replaces the Web Speech API result
- [ ] Transcript displays in real-time (live words shown while candidate speaks)

### Technical Tasks

| Task | Files | Effort |
|---|---|---|
| OpenAI TTS API route | `app/api/ai-interview/[token]/speak/route.ts` | M |
| Upgrade client TTS | Update `speakText()` in `app/(candidate)/ai-interview/[token]/page.tsx` | S |
| Whisper STT API route | `app/api/ai-interview/[token]/transcribe/route.ts` | M |
| MediaRecorder integration | Update candidate page STT section | L |
| Streaming audio playback | Use `AudioContext` to play streamed TTS audio | L |
| Fallback detection | Check OPENAI_API_KEY at runtime, fall back to Web Speech API | S |

### Definition of Done
- TTS sounds like nova voice in Chrome, Safari, Firefox
- Whisper transcript accuracy significantly better than Web Speech API baseline
- No regression in demo mode (still uses Web Speech API)

---

## Sprint 3 — Session Management + Credit System (Weeks 5–6)

**Sprint Goal:** Sessions expire automatically; credit usage is tracked per org; AI Co-Pilot page ships.

### User Stories

**US-5: Session expiry**
> As a system admin, I want old pending AI interview sessions to expire automatically so we don't accumulate dead sessions.

Acceptance criteria:
- [ ] `AIInterviewSession` has an `expiresAt` field (default: 7 days from creation)
- [ ] A scheduled job marks sessions as `expired` when `expiresAt` has passed and status is still `pending`
- [ ] Candidate attempting to open an expired session sees a clear error message

**US-6: Credit tracking**
> As an organization admin, I want to see how many AI API calls we've made this month so I can understand our usage.

Acceptance criteria:
- [ ] Each `POST /api/ai-interview/[token]/message` call records 1 credit to the org
- [ ] Each `POST /api/ai-interview/[token]/complete` call records 1 credit (scoring call)
- [ ] Usage totals are visible on the Settings page
- [ ] Demo sessions do NOT deduct credits

**US-7: AI Co-Pilot page**
> As a recruiter, I want AI-suggested follow-up questions and candidate summary so I can make faster decisions.

Acceptance criteria:
- [ ] `/copilot` page accessible to ADMIN/RECRUITER
- [ ] Given a completed interview, shows AI-generated candidate summary
- [ ] Suggests 3 follow-up questions based on gaps in the interview
- [ ] Shows scoring assistance (what score to give and why) for ambiguous answers

### Technical Tasks

| Task | Files | Effort |
|---|---|---|
| Add `expiresAt` to schema | `prisma/schema.prisma` + `npx prisma db push` | S |
| Expiry check on session fetch | Update `GET /api/ai-interview/[token]/route.ts` | S |
| Scheduled cleanup | Vercel Cron or Supabase cron job | M |
| Credit model (schema) | Add `CreditUsage` model or `Organization.creditBalance` field | M |
| Credit deduction in message route | Update `POST .../message/route.ts` | S |
| Usage display in settings | Update `app/(dashboard)/settings/page.tsx` | S |
| AI Co-Pilot page | `app/(dashboard)/copilot/page.tsx` | L |
| Co-Pilot API route | `app/api/ai/copilot/route.ts` | M |

### Definition of Done
- Expired sessions return 410 Gone to candidates
- Credits visible in settings with monthly breakdown
- Co-Pilot generates useful suggestions (manual QA)
