# Data Model

All models defined in `prisma/schema.prisma`. Database: Supabase (PostgreSQL).

## Core Entities

### Organization
The top-level tenant. Every user, assessment, candidate, and interview belongs to one organization.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | Display name |
| slug | String (unique) | `${name-slug}-${timestamp36}` — URL-safe |
| createdAt | DateTime | |

**Relations:** users, assessments, candidates, interviews, asyncInterviews, aiInterviewSessions, pipelines

---

### User
A human who logs in. Always belongs to an organization.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String? | |
| email | String (unique) | Login identifier |
| password | String? | bcrypt hash, null for OAuth users |
| role | UserRole | ADMIN / RECRUITER / EVALUATOR |
| organizationId | String | FK → Organization |
| image | String? | Avatar URL |
| emailVerified | DateTime? | For NextAuth |

**Role capabilities:**
- `ADMIN` — Full access: create assessments, manage users, view all analytics
- `RECRUITER` — Create/manage assessments, interviews, candidates, pipeline
- `EVALUATOR` — Score interviews, view their own calibration stats

**Relations:** accounts (OAuth), sessions, assessments (created), evaluations, interviewPanels

---

### Assessment
A structured interview guide for a specific role.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| title | String | e.g. "Senior Frontend Engineer" |
| jobTitle | String? | |
| jobDescription | String? | Long text |
| department | String? | |
| status | AssessmentStatus | DRAFT / ACTIVE / ARCHIVED |
| organizationId | String | FK → Organization |
| createdById | String | FK → User |

**Relations:** competencies, questions, interviews, asyncInterviews, aiInterviewSessions

---

### Competency
A skill or behavioral dimension being assessed. Belongs to one Assessment.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | e.g. "Problem Solving" |
| description | String? | |
| assessmentId | String | FK → Assessment |

**Relations:** questions

---

### Question
A single interview question. Belongs to an Assessment and optionally a Competency.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| content | String | The question text |
| type | QuestionType | BEHAVIORAL / SITUATIONAL / TECHNICAL |
| order | Int | Display/ask order |
| rubric | String? | BARS scoring guide text |
| assessmentId | String | FK → Assessment |
| competencyId | String? | FK → Competency |

**Relations:** evaluations, asyncResponses

---

### Candidate
A job applicant. Belongs to one Organization.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| email | String | |
| phone | String? | |
| resumeUrl | String? | |
| notes | String? | |
| organizationId | String | FK → Organization |

**Relations:** interviews, pipelineCards, candidateInvites

---

## Interview Models

### Interview
A single structured interview event. Links one Candidate to one Assessment.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| status | InterviewStatus | SCHEDULED / IN_PROGRESS / COMPLETED / CANCELLED |
| scheduledAt | DateTime? | |
| completedAt | DateTime? | |
| candidateId | String | FK → Candidate |
| assessmentId | String | FK → Assessment |
| organizationId | String | FK → Organization |
| createdById | String | FK → User |

**Relations:** panel (InterviewPanel[]), evaluations, candidateFeedback

---

### InterviewPanel
Maps evaluators to an interview. Many-to-many bridge.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| interviewId | String | FK → Interview |
| evaluatorId | String | FK → User |
| role | PanelRole | LEAD / MEMBER |

---

### Evaluation
One evaluator's score for one question in one interview.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| score | Int | 1–5 (BARS scale) |
| notes | String? | JSON string with rationale, confidence, starAnalysis |
| interviewId | String | FK → Interview |
| questionId | String | FK → Question |
| evaluatorId | String | FK → User |

**Unique constraint:** `[interviewId, evaluatorId, questionId]` — one score per evaluator per question per interview.

**Note:** AI scores from AI interviews are written here with `evaluatorId = SYSTEM_AI_EVALUATOR_ID` (planned Phase 2 feature). This enables ICC to include the AI as a rater.

---

## Async Video Interview Models

### AsyncInterview
A batch async video interview campaign. Has many candidates (invitations).

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| title | String | Campaign name |
| status | String | DRAFT / SENT / IN_PROGRESS / COMPLETED / EXPIRED |
| timeLimitSeconds | Int | Per-question time limit |
| retakesAllowed | Int | How many retakes per question |
| deadlineAt | DateTime? | Optional submission deadline |
| instructions | String? | Shown to candidate |
| assessmentId | String | FK → Assessment |
| organizationId | String | FK → Organization |
| createdById | String | FK → User |

**Relations:** invitations (AsyncInvitation[])

---

### AsyncInvitation
One candidate's link to an AsyncInterview. Tracks open/completion state.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| email | String | Candidate email |
| token | String (unique) | URL-safe invite token |
| openedAt | DateTime? | First time candidate opened the link |
| completedAt | DateTime? | When all questions submitted |
| asyncInterviewId | String | FK → AsyncInterview |

**Relations:** responses (AsyncResponse[])

---

### AsyncResponse
One candidate's video/text response to one question.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| videoUrl | String? | Recorded video URL |
| transcript | String? | Speech-to-text transcript |
| submittedAt | DateTime? | |
| aiSuggestedScore | Int? | 1–5, from AI scoring |
| evaluatorScore | Int? | Human override |
| aiInsights | Json? | `{ rationale, starAnalysis, confidence }` |
| invitationId | String | FK → AsyncInvitation |
| questionId | String | FK → Question |

---

## AI Synchronous Interview Model

### AIInterviewSession
One candidate's synchronous AI interview session.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| organizationId | String? | FK → Organization (null for demo) |
| assessmentId | String? | FK → Assessment (optional) |
| inviteToken | String (unique) | URL token, e.g. `/ai-interview/[token]` |
| candidateEmail | String? | |
| candidateName | String? | Shown on welcome screen |
| status | String | pending / in_progress / completed |
| totalQuestions | Int | Default 4 |
| currentQuestion | Int | Index of last question asked |
| transcript | Json | Array of `{ role, content, questionIndex }` |
| aiEvaluation | Json? | `{ overallScore, summary, strengths, improvements, recommendation }` |
| startedAt | DateTime? | |
| completedAt | DateTime? | |
| durationSeconds | Int? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Indexes:** organizationId, inviteToken, assessmentId

---

## Pipeline Models

### Pipeline
A Kanban board scoped to an organization (usually one per org).

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | e.g. "Hiring Pipeline" |
| organizationId | String | FK → Organization |

**Relations:** stages (PipelineStage[])

---

### PipelineStage
A column in the Kanban board.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | e.g. "Applied", "Screening", "Interview", "Offer", "Hired" |
| order | Int | Column position |
| color | String? | Hex or Tailwind color |
| pipelineId | String | FK → Pipeline |

**Relations:** cards (PipelineCard[])

---

### PipelineCard
One candidate in one pipeline stage.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| candidateId | String | FK → Candidate |
| stageId | String | FK → PipelineStage |
| position | Int | Card order within column |
| notes | String? | |
| movedAt | DateTime | When card entered current stage |

---

## Enums

```prisma
enum UserRole       { ADMIN  RECRUITER  EVALUATOR }
enum AssessmentStatus { DRAFT  ACTIVE  ARCHIVED }
enum QuestionType   { BEHAVIORAL  SITUATIONAL  TECHNICAL }
enum InterviewStatus { SCHEDULED  IN_PROGRESS  COMPLETED  CANCELLED }
enum PanelRole      { LEAD  MEMBER }
```
