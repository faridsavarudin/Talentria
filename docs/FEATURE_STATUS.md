# Feature Status

Legend: ✅ Done · 🚧 Partial / needs polish · 📋 Planned

## Phase 1 — Core Platform

| Feature | Status | Notes |
|---|---|---|
| User registration + organization creation | ✅ | Auto-login after register |
| Email/password auth | ✅ | NextAuth v5 |
| Google OAuth | ✅ (hidden) | Button hidden pending OAuth app approval |
| Role system (ADMIN / RECRUITER / EVALUATOR) | ✅ | Enforced in middleware + API |
| Assessment builder (manual) | ✅ | Title, job description, competencies, questions |
| AI assessment generation | ✅ | Paste JD → Claude generates competencies + questions |
| AI question generation | ✅ | Per-competency question suggestions |
| Evaluator calibration training | ✅ | BARS gamified scoring exercises |
| ICC calculation | ✅ | Intraclass Correlation Coefficient per assessment |
| Adverse impact / bias detection | ✅ | 4/5ths rule, per-evaluator + per-question |
| Candidate CRUD | ✅ | Create, list, detail, edit |
| Interview scheduling | ✅ | Link candidate + assessment + evaluators |
| Interview evaluation form | ✅ | Per-question scoring with rubric display |
| Evaluator management | ✅ | Invite, list, role management |
| Analytics dashboard | ✅ | ICC summary, evaluator reliability, trend charts |
| Calibration dashboard | ✅ | Certification tracking, score drift detection |
| Kanban pipeline | ✅ | Applied → Screening → Interview → Offer → Hired |
| Pipeline drag-and-drop | 🚧 | UI exists, drag-and-drop may need refinement |
| Async video interviews (recruiter side) | ✅ | Create, send invites, view responses |
| Async video interviews (candidate portal) | ✅ | Token-based, no auth required |
| AI scoring for async video responses | ✅ | Per-question AI suggested score |
| AI synchronous interview (candidate portal) | ✅ | Web Speech API TTS/STT, Claude conversation |
| AI synchronous interview — demo mode | ✅ | Public `/demo` route, no auth, no DB session |
| AI interview session creation (recruiter) | ✅ | `/ai-interviews/new` generates invite link |
| AI interview session list (recruiter) | ✅ | `/ai-interviews` with stats + score display |
| AI interview session detail (recruiter) | ✅ | Transcript, AI evaluation, recommendation |
| Landing page | ✅ | Hero, features, kanban demo, AI interview CTA, pricing |
| Settings page | 🚧 | Basic shell exists, not fully wired |

## Phase 2 — AI Interview Enhancement

| Feature | Status | Notes |
|---|---|---|
| Human score override for AI interviews | 📋 | `/ai-interviews/[id]/review` page |
| Analytics bridge (AI → Evaluation table) | 📋 | System AI evaluator user, ICC includes AI rater |
| OpenAI TTS (nova voice) | 📋 | Replaces Web Speech API TTS |
| Whisper STT | 📋 | Replaces Web Speech API STT |
| Session expiry (TTL) | 📋 | `expiresAt` field + background cleanup |
| Credit deduction per AI turn | 📋 | Track usage per org |
| AI Co-Pilot page | 📋 | `/copilot` — suggestions, summaries, scoring help |

## Phase 3 — Enterprise

| Feature | Status | Notes |
|---|---|---|
| HRIS integrations (Workday, BambooHR) | 📋 | Phase 3 |
| Multi-brand workspaces | 📋 | Phase 3 |
| SSO (SAML) | 📋 | Phase 3 |
| Email notifications | 📋 | Candidate invites, evaluator assignments |
| Webhook events | 📋 | Hire/reject events for ATS integration |
| Mobile app | 📋 | Phase 4 |
