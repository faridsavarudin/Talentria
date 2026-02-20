# Architecture

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 App Router | TypeScript strict, server + client components |
| Styling | Tailwind CSS + shadcn/ui | Custom `btn-brand-gradient`, `glass-card` utilities |
| Database | Supabase (PostgreSQL) | Managed Postgres, accessed via Prisma |
| ORM | Prisma 5.x | Schema at `prisma/schema.prisma` |
| Auth | NextAuth v5 (Auth.js) | Email/password + session JWT |
| AI | Anthropic SDK | `claude-sonnet-4-6` for all AI features |
| Speech (browser) | Web Speech API | TTS via `SpeechSynthesis`, STT via `SpeechRecognition` |
| Toasts | Sonner | Used across all client forms |
| Date formatting | date-fns | `formatDistanceToNow`, `format` |
| Icons | Lucide React | Consistent icon set throughout |

## Folder Structure

```
assint/
├── app/
│   ├── (auth)/                    # Login, register pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (candidate)/               # Public candidate portals (no auth)
│   │   ├── ai-interview/[token]/  # Synchronous AI interview
│   │   └── interview/[token]/     # Structured interview scoring form
│   ├── (dashboard)/               # Protected recruiter/admin pages
│   │   ├── dashboard/
│   │   ├── assessments/           # + [id]/, new/
│   │   ├── candidates/            # + [id]/, new/
│   │   ├── interviews/            # + [id]/, new/, [id]/evaluate/
│   │   ├── pipeline/
│   │   ├── ai-interviews/         # + [id]/, new/
│   │   ├── async-interviews/      # + [id]/, new/
│   │   ├── analytics/
│   │   ├── calibration/
│   │   ├── evaluators/
│   │   └── settings/
│   ├── api/                       # All API routes
│   │   ├── auth/register/         # Public registration
│   │   ├── assessments/           # CRUD (auth: ADMIN/RECRUITER)
│   │   ├── candidates/
│   │   ├── interviews/
│   │   ├── ai-interview/          # Candidate-facing (token auth)
│   │   │   ├── sessions/          # Create session (public + rate-limited)
│   │   │   ├── [token]/           # GET session state
│   │   │   │   ├── message/       # POST: send answer, get AI response
│   │   │   │   └── complete/      # POST: evaluate + persist results
│   │   │   └── demo/complete/     # POST: demo evaluation (no DB write)
│   │   ├── ai-interviews/         # Recruiter CRUD (auth: ADMIN/RECRUITER)
│   │   ├── async-interviews/
│   │   ├── analytics/
│   │   │   ├── calculate-icc/
│   │   │   └── summary/
│   │   └── ai/
│   │       ├── generate-assessment/
│   │       ├── generate-questions/
│   │       └── score-response/
│   ├── demo/                      # Redirects to /ai-interview/demo
│   └── page.tsx                   # Landing page
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx            # Collapsible nav (client component)
│   │   └── header.tsx
│   ├── landing/
│   │   ├── PracticeInterviewDemo.tsx
│   │   └── PipelineKanbanDemo.tsx
│   ├── ui/                        # shadcn/ui components
│   └── async-interviews/
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── prisma.ts                  # Prisma singleton
│   ├── session.ts                 # requireAuth(), requireRole()
│   ├── api-auth.ts                # requireApiAuth(), requireApiRole()
│   ├── rate-limit.ts              # In-memory sliding window
│   └── validations/               # Zod schemas
├── prisma/
│   └── schema.prisma
└── middleware.ts                  # Route-level auth + role guards
```

## Auth Architecture

**Two auth layers:**

1. **Session auth** (recruiters/admins): NextAuth session cookie. Checked in:
   - Server Components via `requireAuth()` / `requireRole()` from `lib/session.ts`
   - API routes via `requireApiAuth()` / `requireApiRole()` from `lib/api-auth.ts`
   - Page-level routing via `middleware.ts`

2. **Token auth** (candidates): Invite tokens stored in DB (`inviteToken` on `AIInterviewSession`, `CandidateInvite`, `AsyncInvitation`). Candidates access their portal via `/ai-interview/[token]` — no account needed. The token is verified at the API route level by looking it up in the DB.

## Middleware Route Guards

`middleware.ts` runs on all non-API, non-static routes:

| Path pattern | Rule |
|---|---|
| `/`, `/login`, `/register`, `/demo` | Public |
| `/interview/*`, `/ai-interview/*` | Public (candidate portal) |
| Everything else (unauthenticated) | Redirect to `/login` |
| `/dashboard`, `/assessments`, `/candidates`, `/interviews`, `/ai-interviews`, `/async-interviews` | Require ADMIN or RECRUITER role |
| `/evaluator/*` | Require EVALUATOR or ADMIN role |
| `/interviews/[id]/evaluate` | Require ADMIN, RECRUITER, or EVALUATOR |

## Data Flow: AI Synchronous Interview

```
Browser                        Next.js API              Anthropic
  │                                │                        │
  ├─ getUserMedia() ──────────────►│                        │
  ├─ SpeechSynthesis (TTS) ───────►│                        │
  ├─ SpeechRecognition (STT) ─────►│                        │
  │                                │                        │
  │  POST /api/ai-interview/       │                        │
  │       [token]/message          │                        │
  │  { transcript, questionIndex,  │                        │
  │    conversationHistory }       │                        │
  │ ─────────────────────────────►│                        │
  │                                ├─ messages.create() ──►│
  │                                │◄── { nextMessage } ───│
  │◄─────────────────────────────  │                        │
  │  SpeechSynthesis speaks        │  (updates DB:          │
  │  nextMessage aloud             │   currentQuestion,     │
  │                                │   status)              │
  │  [after all questions done]    │                        │
  │  POST /api/ai-interview/       │                        │
  │       [token]/complete         │                        │
  │  { sessionId, transcript }     │                        │
  │ ─────────────────────────────►│                        │
  │                                ├─ messages.create() ──►│
  │                                │◄── { evaluation JSON}─│
  │                                │  (persists aiEvaluation│
  │                                │   completedAt,         │
  │                                │   durationSeconds)     │
  │◄─────────────────────────────  │                        │
  │  Show results screen           │                        │
```

## Rate Limiting

In-memory sliding window (`lib/rate-limit.ts`) applied to:
- `POST /api/auth/register` — 5 per IP per 15 minutes
- `POST /api/ai-interview/sessions` — 10 per IP per hour

**Note:** In-memory rate limiting resets on server restart and does not work in multi-instance deployments. Should be replaced with Redis for production scale.
