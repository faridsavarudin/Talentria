# AssInt — 8-Week Flowmingo-Inspired Sprint Plan
Generated: 2026-02-19

## Sprint Assignments
- Sprint 1 (Feb 19-25): Tech Debt + Kanban Pipeline + Toast/Dialog cleanup
- Sprint 2 (Feb 26 - Mar 4): AI Interview Builder (Claude API)
- Sprint 3 (Mar 5-11): Analytics Live (ICC calculation + Bias + recharts)
- Sprint 4 (Mar 12-18): Calibration Training Live + PDF Candidate Feedback
- Sprint 5 (Mar 19-25): CV/Resume Parser + AI Question Generator
- Sprint 6 (Mar 26 - Apr 1): Async Video — Schema + Storage + Candidate Portal
- Sprint 7 (Apr 2-8): Async Video — Review UI + AI Scoring + Basic Proctoring
- Sprint 8 (Apr 9-15): i18n Foundation + Production Hardening + Polish

## New Schema Models Needed
- AsyncVideoInterview: candidateId, assessmentId, questions(Json), status, expiresAt, token(unique)
- VideoResponse: asyncInterviewId, questionIndex, videoUrl, duration, transcript, aiScore, proctoringFlags(Json)
- ResumeAnalysis: candidateId, rawText, parsedData(Json), generatedQuestions(Json)

## Key New Dependencies to Install
- next-intl (i18n) — Sprint 8
- react-pdf or @react-pdf/renderer (PDF generation) — Sprint 4
- File storage: Supabase Storage (already have Supabase) or uploadthing — Sprint 5/6

## Estimation Baselines (confirmed for this codebase)
- Simple CRUD API route: 1-2h
- Full CRUD page: 4-6h
- Complex UI (kanban, video recorder): 4-8h
- AI Claude API route: 3-5h
- Analytics calculation + recharts chart: 4-6h
- PDF generation: 5-8h
- Video recording UI (MediaRecorder API): 6-10h
- i18n full wiring: 8-12h
