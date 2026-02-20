# Roadmap

## Phase 1 — Core Platform ✅ Complete

**Goal:** Build a fully functional structured hiring platform with AI interview capabilities.

### Delivered
- Auth + multi-tenant organizations
- Assessment builder with AI generation
- Evaluator calibration (BARS)
- ICC + bias analytics
- Candidate pipeline (Kanban)
- Structured interview management
- Async video interviews
- AI synchronous interviews (Web Speech API, Claude)
- Recruiter dashboard for AI interviews
- Public landing page with kanban + AI interview demos

---

## Phase 2 — AI Interview Depth (Next 6 Weeks)

**Goal:** Make AI interviews production-grade: better voice quality, analytics integration, human oversight.

### Sprint 1 (Weeks 1–2): Human Oversight + Analytics Bridge

**Why:** Recruiters need to trust AI scores. The analytics bridge makes AI interviews feed directly into ICC/bias reporting.

| Task | Effort | Description |
|---|---|---|
| Human review page | M | `/ai-interviews/[id]/review` — override AI scores per question |
| Analytics bridge | M | Seed system AI evaluator user, write Evaluation rows post-completion |
| Evaluation display | S | Show AI vs human score side-by-side in review UI |

### Sprint 2 (Weeks 3–4): Production Voice Quality

**Why:** Web Speech API TTS sounds robotic and has no cross-browser support guarantee. Whisper is far more accurate than browser STT for accented speech.

| Task | Effort | Description |
|---|---|---|
| OpenAI TTS route | M | `POST /api/ai-interview/[token]/speak` streaming nova voice |
| Client TTS upgrade | S | Replace `speakText()` to call TTS route instead of Web Speech API |
| Whisper STT route | M | `POST /api/ai-interview/[token]/transcribe` — 30s audio chunks |
| Client STT upgrade | M | Record audio via MediaRecorder, send chunks, merge transcript |

### Sprint 3 (Weeks 5–6): Session Management + Credit System

**Why:** Demo sessions accumulate indefinitely. Credit system is required before monetization.

| Task | Effort | Description |
|---|---|---|
| Session expiry | S | Add `expiresAt` to `AIInterviewSession`, nightly cleanup |
| Credit deduction | M | Track AI API usage per org, deduct per turn + scoring call |
| Usage dashboard | S | Show credit usage in `/settings` |
| AI Co-Pilot page | L | `/copilot` — AI-suggested questions, candidate summaries |

---

## Phase 3 — Enterprise (Q3 2025)

**Goal:** Win enterprise HR teams with integrations, SSO, and compliance reporting.

| Feature | Rationale |
|---|---|
| Email notifications | Candidate invite emails, evaluator assignment alerts |
| HRIS integrations | Pull candidates from Workday/BambooHR, push hire decisions |
| SSO (SAML / OIDC) | Required by enterprise IT policy |
| Multi-brand workspaces | Staffing agencies managing multiple client brands |
| Webhook events | ATS integration (Greenhouse, Lever, etc.) |
| Adverse impact PDF reports | EEOC compliance documentation |
| Bulk import (CSV) | Import candidates + assessments from existing systems |

---

## Phase 4 — Scale (Q4 2025+)

| Feature | Rationale |
|---|---|
| Mobile app (React Native) | Evaluators scoring on-the-go |
| Real-time collaborative scoring | Multiple evaluators score simultaneously |
| Video recording for AI interviews | Save candidate video alongside transcript |
| Advanced WPM/sentiment analysis | Deeper candidate communication metrics |
| Predictive hiring analytics | ML model correlating interview scores with 90-day performance |
