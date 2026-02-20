# AssInt Project Planner Memory

## Project Overview
- **App**: AssInt — AI-powered Assessment Intelligence & Recruitment Platform
- **Stack**: Next.js 15.5, PostgreSQL/Prisma 5, NextAuth v5, TailwindCSS v4, shadcn/ui, Anthropic SDK 0.77
- **Team**: 1 full-stack developer + 1 AI coding assistant
- **Phase**: Flowmingo-inspired feature expansion (8-week plan from Feb 2026)

## Architecture Patterns
- App Router with route groups: `(auth)` and `(dashboard)`
- API routes under `app/api/` — all auth-guarded via `auth()` from `@/lib/auth`
- Prisma client at `@/lib/prisma`, validations at `@/lib/validations/`
- Session user cast via `(session.user as Record<string, unknown>).organizationId`
- All data is organization-scoped (multi-tenant)
- Dashboard layout: fixed 64-wide sidebar + content area at `lg:pl-64`

## What Is Actually Built (verified Feb 2026)
- Auth: login, register, NextAuth v5, `middleware.ts` route protection
- Assessment CRUD: list, create, detail with competencies/questions/rubrics
- API: `/api/assessments`, `/api/assessments/[id]`, competencies, questions, publish
- Candidates: list `/candidates`, create `/candidates/new`, detail `/candidates/[id]` — API exists
- Interviews: list `/interviews`, create `/interviews/new`, detail `/interviews/[id]`, evaluate `/interviews/[id]/evaluate` — API exists
- Evaluations API: `/api/interviews/[id]/evaluations`
- Evaluators API: `/api/evaluators`
- Dashboard: LIVE Prisma queries (not mock) — totalAssessments, activeInterviews, ICC avg, pending reviews
- Analytics page: STATIC mock data (hardcoded names/scores — not live)
- Calibration page: STATIC mock data (hardcoded exercises list — not live)
- Evaluators page: stub only

## What Is Actually Built (updated Feb 2026 — more complete than previously recorded)
- Pipeline Kanban: `/pipeline` page LIVE with real DB data and drag-and-drop KanbanBoard component
- Async Video Interviews: full schema (AsyncInterview, CandidateInvite, VideoResponse, ProctorLog), API routes `/api/async-interviews`, candidate portal at `/(candidate)/interview/[token]`
- Proctoring backend: `ProctorLog` model in schema, `/api/proctor-log` POST route, `/api/async-interviews/[id]/proctors` GET aggregation route — ALL LIVE
- Proctoring frontend (partial): tab-switch detection + `logProctorEvent` implemented in `/(candidate)/interview/[token]/page.tsx` — LIVE
- AI synchronous interview: `AIInterviewSession` schema, candidate portal at `/(candidate)/ai-interview/[token]`, API routes at `/api/ai-interview/`
- Assessment Inventory: full schema (InventoryBattery, InventoryBatteryTest, InventoryInvitation, InventoryResult), `/inventory` CRUD pages, results detail page with per-test charts
- Pipeline API: `/api/pipeline` route, `/api/candidates/[id]/stage` PATCH route

## What Is Still Missing (verified Feb 2026)
- Landing page: no Talent Acquisition, Talent Assessment, or Assessment Inventory sections — SPRINT A
- Proctoring gaps vs. plan: copy-paste disable NOT implemented, time-per-question tracking NOT implemented, proctoring notice modal is plain text only (not a dedicated gated component), no proctor report UI on async-interviews/[id] detail page — SPRINT B
- Inventory candidate portal: no proctoring hooks in inventory test-taking flow (separate from async video interview portal)
- InventoryInvitation does NOT have ProctorLog relation — schema addition needed for SPRINT B
- CTA links on landing page all go to /register, not to specific app sections — SPRINT C

## Key File Paths
- Schema: `/Users/farid/kerja/assint/prisma/schema.prisma`
- Auth config: `/Users/farid/kerja/assint/lib/auth.ts`
- Sidebar: `/Users/farid/kerja/assint/components/layout/sidebar.tsx`
- Dashboard: `/Users/farid/kerja/assint/app/(dashboard)/dashboard/page.tsx`
- Analytics (stub): `/Users/farid/kerja/assint/app/(dashboard)/analytics/page.tsx`
- Calibration (stub): `/Users/farid/kerja/assint/app/(dashboard)/calibration/page.tsx`

## Estimation Baselines (this codebase)
- Simple CRUD API route: 1-2h
- Full CRUD page (list + create + detail): 4-6h
- Complex UI component (kanban, scoring rubric): 4-8h
- AI integration route (Claude API): 3-5h
- Analytics calculation + recharts chart: 4-6h
- PDF generation (react-pdf or puppeteer): 5-8h
- Schema migration + seed: 1-2h
- Video recording UI (MediaRecorder API): 6-10h
- File upload (Supabase Storage or S3): 3-5h
- i18n setup (next-intl full wiring): 8-12h

See `sprint-plan.md` for full 8-week Flowmingo-inspired plan.
