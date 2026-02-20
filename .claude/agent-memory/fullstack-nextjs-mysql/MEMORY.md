# Kaleo Agent Memory

## Project Identity
- **App**: Kaleo — Structured hiring platform for fair, calibrated, bias-free decisions (formerly "AssInt")
- **Tagline**: "Hear every candidate clearly."
- **Logo**: LogoIcon component at `components/brand/logo-icon.tsx` — "The Signal" (3 ascending bars + amber dot + dashed trajectory). Props: size, theme ("light"|"dark"), className. Use theme="dark" on dark backgrounds (AI interview page, footers on dark bg).
- **Favicon**: `/public/favicon.svg` — same SVG with indigo-50 rounded rect background
- **Stack**: Next.js 15.5, React 19, TypeScript, Prisma + PostgreSQL, NextAuth v5 beta, TailwindCSS v4, shadcn/ui
- **Colors**: indigo (#6366F1) + amber (#D97706) — do NOT change these
- **DB**: PostgreSQL via Prisma (not MySQL despite agent persona)
- **Auth**: NextAuth v5 beta with credentials provider (JWT strategy). Google OAuth in code but disabled.

## Key File Paths
- Auth config: `lib/auth.ts` — exports `{ handlers, auth, signIn, signOut }`; adapter cast to `any` due to beta version mismatch
- Prisma client: `lib/prisma.ts` — singleton pattern with globalThis
- Session helper: `lib/session.ts` — `requireAuth()` returns typed `AuthUser { id, name, email, image, role, organizationId }`
- Middleware: `middleware.ts` — auth RBAC; evaluators allowed on `/interviews/[id]/evaluate` specifically
- Validations: `lib/validations/assessment.ts`, `lib/validations/auth.ts`, `lib/validations/candidate.ts`, `lib/validations/interview.ts`
- Utils: `lib/utils.ts` — `cn()`, `formatDate()`, `getInitials()`
- Custom hook: `lib/use-debounced-callback.ts`
- Dashboard layout: `app/(dashboard)/layout.tsx` — sidebar + topbar shell
- Sidebar: `components/layout/sidebar.tsx` — includes Pipeline nav item already; no changes needed

## Schema Highlights (prisma/schema.prisma)
- Organization owns Users, Assessments, Candidates, Subscription
- PipelineStage enum: APPLIED, SCREENING, ASSESSMENT, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN
- Candidate: `pipelineStage`, `notes`, `lastActivityAt`, `updatedAt`; indexes on `[organizationId, pipelineStage]` and `[organizationId, createdAt]`
- Subscription: `aiCredits Int @default(50)`, `plan String @default("FREE")`
- Assessment → Competency → Question → RubricLevel (1-5)
- Evaluation unique: `[interviewId, evaluatorId, questionId]`

## Phase 1: Candidates + Interviews (completed)
See previous sessions. All CRUD, evaluation, and interview management features built.

## Phase 2: Kanban Pipeline (completed)

### Files
- `app/(dashboard)/pipeline/page.tsx` — RSC, Prisma groupBy stage, passes to KanbanBoard
- `app/(dashboard)/pipeline/_components/KanbanBoard.tsx` — DragDropContext, optimistic updates + refetch
- `app/(dashboard)/pipeline/_components/KanbanColumn.tsx` — Droppable, colored header, empty state
- `app/(dashboard)/pipeline/_components/CandidateCard.tsx` — Draggable, reject button, ASSESSMENT-only schedule button
- `app/actions/pipeline.ts` — Server Action: `updateCandidateStage()`, revalidates /pipeline
- `app/api/pipeline/route.ts` — GET, candidates grouped by stage

### DnD Patterns (@hello-pangea/dnd v18)
- Use `provided.innerRef` (not `ref`) for both Droppable and Draggable DOM refs
- Droppable children: `(provided, snapshot) => JSX` — `snapshot.isDraggingOver: boolean`
- Draggable children: `(provided, snapshot) => JSX` — `snapshot.isDragging: boolean`
- `DropResult` has: `source.droppableId`, `destination?.droppableId`, `draggableId`

## Phase 2: AI Interview Builder (completed)

### Files
- `app/api/ai/generate-assessment/route.ts` — POST, streams claude-sonnet-4-6, deducts 1 credit
- `app/api/ai/generate-questions/route.ts` — POST, streams questions for one competency
- `app/api/credits/route.ts` — GET `{ plan, aiCredits }`, auto-creates subscription if missing
- `app/api/credits/deduct/route.ts` — POST deduct with 402 on insufficient
- `app/(dashboard)/assessments/_components/AiCreditsDisplay.tsx` — colored pill, refreshSignal prop
- `app/(dashboard)/assessments/[id]/_components/AiGeneratePanel.tsx` — 4-phase UI: idle/streaming/review/saving

### AI Streaming Pattern
- `anthropic.messages.stream()` → async for-await on chunks → `chunk.delta.type === "text_delta"` → `controller.enqueue(encoder.encode(chunk.delta.text))`
- Client: `fetch` → `res.body.getReader()` → accumulate string → `JSON.parse()` when done
- Credit: deduct before generation, refund on catch inside stream start

## Phase 3: Analytics Dashboard (completed)

### Files
- `app/(dashboard)/analytics/page.tsx` — RSC, Promise.all for all metrics, passes typed props to charts
- `app/(dashboard)/analytics/_components/OverviewCards.tsx` — 4 metric cards
- `app/(dashboard)/analytics/_components/IccReliabilityChart.tsx` — BarChart with Cell coloring, ReferenceLine at 0.75
- `app/(dashboard)/analytics/_components/HiringFunnelChart.tsx` — BarChart funnel with conversion rates
- `app/(dashboard)/analytics/_components/PipelineDistributionChart.tsx` — PieChart donut with breakdown list

### Recharts Patterns (v3)
- Custom Tooltip: `content={<CustomTooltip />}` (ReactElement) — recharts clones it with `active`, `payload` props
- Custom Legend: `content={<CustomLegend />}` — `LegendPayload` has `value?: string`, `color?: string`
- `Cell` key must be unique; use `entry.stage` or index fallback
- `nameKey="label"` on Pie gives correct legend labels from data objects
- ReferenceLine: add `label={{ value, position, fontSize, fill }}`

## Auth Patterns
- API routes: `(session.user as Record<string, unknown>).organizationId as string`
- Server components: use `requireAuth()` → fully typed `AuthUser`

## Conventions Confirmed
- `await params` for all dynamic route params (Next.js 15)
- Org scoping: every query filters by `organizationId`
- API errors: `{ error: string, details?: ... }` shape
- PostgreSQL search: `mode: "insensitive"` on `contains`
- Toast: `sonner` — `toast.success/error/info`
- NO `@radix-ui/react-tooltip` installed — use native HTML `title` attribute

## Phase 4: AI Synchronous Video Interview (completed)

### Schema
- `AIInterviewSession` model added to `prisma/schema.prisma`; relations added to Organization + Assessment
- Prisma model accessor: `prisma.aIInterviewSession` (camelCase of AIInterviewSession)
- After schema changes always run `npx prisma generate` to update the TS client types

### Files
- `app/(candidate)/ai-interview/[token]/page.tsx` — "use client", full stage machine (loading/error/intro/camera_check/ai_speaking/candidate_thinking/candidate_speaking/processing/completed)
- `app/api/ai-interview/sessions/route.ts` — POST: creates AIInterviewSession, returns inviteToken
- `app/api/ai-interview/[token]/route.ts` — GET: returns session data
- `app/api/ai-interview/[token]/message/route.ts` — POST: sends answer to Claude, returns next question
- `app/api/ai-interview/[token]/complete/route.ts` — POST: evaluates full transcript via Claude, persists results
- `app/api/ai-interview/demo/complete/route.ts` — POST: evaluates demo (no-DB) transcript
- `app/demo/page.tsx` — Public route, redirects to /ai-interview/demo
- `components/landing/PracticeInterviewDemo.tsx` — "use client" CTA card for landing page

### Key Patterns
- Demo mode: token === "demo" skips DB, uses hardcoded questions stored in SessionData
- SpeechSynthesis TTS: `speakText()` helper, picks `Samantha`/`Google US English`/`Alex` voice preference
- Web Speech API: `window.SpeechRecognition ?? (window as any).webkitSpeechRecognition` — cast window to any for cross-browser
- Transcript state is mirrored in refs (`finalTranscriptRef`, `liveTranscriptRef`) for synchronous reads in callbacks
- `stopSpeechRecognition()` reads from refs (not state) to reliably capture in-flight text
- Middleware updated: `/ai-interview/` prefix + `/demo` added to public routes

### Browser Compatibility Notes
- `window.SpeechRecognition` doesn't exist on the TS DOM lib — cast to `any` first
- `window.speechSynthesis.getVoices()` returns [] until `onvoiceschanged` fires — handle both cases
- Chrome/Edge support full SpeechRecognition; Safari partial; Firefox none — show textarea fallback

## Phase 5: Assessment Inventory (completed)

### Schema additions (prisma/schema.prisma)
- Enums: `InventoryTestType` (RIASEC, COGNITIVE, VRA, CREATIVE_THINKING, ANALYTICAL_REASONING, BIG_FIVE), `ItemFormat`
- Models: `InventoryBattery`, `InventoryBatteryTest`, `InventoryInvitation`, `InventoryResult`
- Reverse relations added on `Organization` and `User` (BatteryCreator relation name)
- Prisma accessor: `prisma.inventoryBattery`, `prisma.inventoryInvitation`, `prisma.inventoryResult`, `prisma.inventoryBatteryTest`

### API Routes
- `app/api/inventory/route.ts` — GET list, POST create battery + invitations
- `app/api/inventory/[id]/route.ts` — GET battery detail with stats
- `app/api/inventory/[id]/invite/route.ts` — POST add more invitations
- `app/api/inventory/invite/[token]/route.ts` — Public GET: candidate portal data
- `app/api/inventory/invite/[token]/submit/route.ts` — Public POST: score calculation + result persistence

### Dashboard Pages
- `app/(dashboard)/inventory/page.tsx` — RSC list with test chips, completion rate bar
- `app/(dashboard)/inventory/new/page.tsx` — Client form: custom checkbox UI for test selection
- `app/(dashboard)/inventory/[id]/page.tsx` — RSC battery detail: stats + invitation list
- `app/(dashboard)/inventory/[id]/invite/page.tsx` — Client: add more invitations
- `app/(dashboard)/inventory/[id]/results/[invitationId]/page.tsx` — RSC full result: per-test cards, inline SVG bar chart for RIASEC

### Score Calculation Pattern (submit route)
- itemId naming convention: `R_1`, `I_2` for RIASEC; `cog_1_A` (last segment = correct answer) for MCQ; `ct_fluency_1` for creative
- `upsert` on `[invitationId, testType]` unique — idempotent re-submission
- Status auto-advances: in_progress → completed when all battery tests submitted

### Middleware
- `/inventory/invite/` added to `isPublicPrefix` (checked before auth guard)
- `/inventory` added to ADMIN/RECRUITER only routes

### Sidebar
- `FlaskConical` icon from lucide-react, item added between AI Interviews and AI Co-Pilot

## Phase 6: Assessment Library (Marketing Pages, completed)

### Files
- `lib/assessments-data.ts` — All static data: `ASSESSMENTS` record, `ASSESSMENT_LIST`, `COLOR_MAP`, `ICON_LABEL`, TypeScript types
- `app/assessments-library/page.tsx` — Public list page, server component, 6-card grid
- `app/assessments-library/[slug]/page.tsx` — Public detail page, `generateStaticParams`, accordion FAQ
- `components/ui/accordion.tsx` — Custom accordion built on `<details>`/`<summary>` (no @radix-ui/react-accordion installed)
- `app/page.tsx` — Added Assessment Library section with card grid before `<PracticeInterviewDemo />`

### Patterns
- `@radix-ui/react-accordion` NOT installed — built native `<details>`-based accordion in `components/ui/accordion.tsx`; uses `group-open:rotate-180` for chevron animation
- Middleware: `/assessments-library` added to `isPublicPrefix` (returns NextResponse.next() early, before the `/assessments` admin-only check)
- Static data pattern: export `Record<string, Assessment>` + `Assessment[]` list from `lib/assessments-data.ts`, import in RSC pages
- Color map pattern: `COLOR_MAP[assessment.color]` gives `{ badge, badgeBorder, iconBg, iconText, accent, accentText, ring, dot }` — use class strings directly in JSX

## Installed Packages (key ones)
- `@radix-ui/*` — alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, select, separator, tabs, toast (NO tooltip)
- `bcryptjs`, `sonner`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`
- `next-auth@^5.0.0-beta.30`, `@auth/prisma-adapter`
- `@hello-pangea/dnd@^18.0.1`, `@anthropic-ai/sdk@^0.77.0`, `recharts@^3.7.0`
- No `react-query` — server components + `router.refresh()`
