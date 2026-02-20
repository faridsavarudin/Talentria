# AssInt — Project Overview

## What is AssInt?

**AssInt** (Assessment Intelligence) is a SaaS platform for structured, bias-aware hiring. It helps HR teams and recruiters conduct fair, consistent, and legally defensible job interviews by combining:

- AI-generated competency-mapped assessments
- Evaluator calibration training (BARS-based)
- Real-time inter-rater reliability (ICC) analytics
- Automated adverse impact (bias) detection
- AI synchronous video interviews
- A visual Kanban hiring pipeline

## Who Is It For?

| Persona | Role in AssInt | Primary Pain Point Solved |
|---|---|---|
| HR Manager / Recruiter | Creates assessments, manages pipeline, invites evaluators | Inconsistent interviews, no audit trail |
| Interviewer / Evaluator | Conducts structured interviews, scores candidates | Unclear scoring criteria, bias risk |
| Hiring Manager | Views analytics, sees candidate recommendations | Can't trust evaluator scores |
| Candidate | Takes AI interview or async video interview | Impersonal, opaque hiring process |

## Core Value Propositions

1. **Consistency** — Every candidate for the same role answers the same questions, scored on the same rubric. ICC tracks whether evaluators actually agree.
2. **Bias reduction** — Automated 4/5ths rule analysis flags adverse impact by demographic group before a hiring decision is made.
3. **Speed** — AI synchronous interviews and async video interviews mean candidates can complete assessments any time, anywhere — no scheduling.
4. **Defensibility** — Full audit trail of every score, every evaluator, every calibration session. Required for EEOC compliance.

## Current Status

Phase 1 is complete and deployed. All core features are functional end-to-end. Phase 2 (AI interview analytics bridge, OpenAI TTS/Whisper STT, credit system) is planned.

## Key URLs

| Path | Description |
|---|---|
| `/` | Landing page (public) |
| `/demo` | Public AI practice interview (no auth) |
| `/register` | Create account + organization |
| `/dashboard` | Recruiter/Admin home |
| `/assessments` | Assessment management |
| `/pipeline` | Kanban hiring pipeline |
| `/ai-interviews` | AI interview session management |
| `/async-interviews` | Async video interview management |
| `/analytics` | ICC + bias analytics |
| `/calibration` | Evaluator calibration training |
| `/ai-interview/[token]` | Candidate-facing AI interview (public, token-based) |
| `/interview/[token]` | Candidate-facing structured interview (public, token-based) |
