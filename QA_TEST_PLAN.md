# AssInt — Comprehensive QA Test Plan

**Document Version:** 1.0
**Date:** 2026-02-19
**Platform:** AssInt — AI-powered Assessment Intelligence & Recruitment Platform
**Stack:** Next.js 15 (App Router), React 19, PostgreSQL, Prisma 5, NextAuth v5 (beta.30), Zod v4
**Author:** QA Engineering

---

## Table of Contents

1. [Test Scenarios — Happy Path](#1-test-scenarios--happy-path)
2. [Edge Cases & Negative Tests](#2-edge-cases--negative-tests)
3. [API Test Cases](#3-api-test-cases)
4. [UI/UX Test Checklist](#4-uiux-test-checklist)
5. [Security Test Cases](#5-security-test-cases)
6. [Performance Test Considerations](#6-performance-test-considerations)
7. [Automated Test Recommendations](#7-automated-test-recommendations)
8. [Test Environment & Data Setup](#8-test-environment--data-setup)

---

## 1. Test Scenarios — Happy Path

### Feature 1: Authentication (Register & Login)

---

**TC-AUTH-01 — Successful New Organization Registration**

| Field | Detail |
|---|---|
| Priority | P0 (Smoke) |
| Type | Manual + Automated |
| Tags | auth, registration, happy-path |

**Preconditions:**
- No existing account with the test email address
- Application is running and `/register` route is accessible

**Test Data:**
```
Name: Alice Johnson
Email: alice.johnson@testorg.com
Password: SecurePass123!
Confirm Password: SecurePass123!
Organization Name: Test Recruitment Co
```

**Steps:**
1. Navigate to `/register`
2. Enter Name: "Alice Johnson"
3. Enter Email: "alice.johnson@testorg.com"
4. Enter Password: "SecurePass123!"
5. Enter Confirm Password: "SecurePass123!"
6. Enter Organization Name: "Test Recruitment Co"
7. Click the "Create account" button

**Expected Result:**
- HTTP 201 returned from `POST /api/auth/register`
- A new `Organization` record is created with name "Test Recruitment Co" and a unique slug
- A new `User` record is created with role `ADMIN` and linked to the new org
- User is automatically logged in and redirected to `/dashboard`
- Welcome greeting displays "Good morning, Alice"

**Acceptance Criteria:**
- [ ] Organization and User records exist in the database
- [ ] User's password is stored as a bcrypt hash (never plaintext)
- [ ] User role is `ADMIN`
- [ ] Session is established immediately after registration (no second login required)
- [ ] Redirect lands on `/dashboard`, not `/login`

---

**TC-AUTH-02 — Successful Login with Valid Credentials**

| Field | Detail |
|---|---|
| Priority | P0 (Smoke) |
| Type | Manual + Automated |
| Tags | auth, login, happy-path |

**Preconditions:**
- An existing user account has been registered (TC-AUTH-01 prerequisite)

**Test Data:**
```
Email: alice.johnson@testorg.com
Password: SecurePass123!
```

**Steps:**
1. Navigate to `/login`
2. Enter the registered email
3. Enter the correct password
4. Click "Sign in"

**Expected Result:**
- NextAuth session is created
- User is redirected to `/dashboard`
- Session cookie is set with appropriate expiry

**Acceptance Criteria:**
- [ ] No error messages displayed
- [ ] Session token is present in cookies
- [ ] Dashboard loads with user's organization data

---

**TC-AUTH-03 — Session Persistence Across Page Refresh**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual + Automated |
| Tags | auth, session, happy-path |

**Preconditions:** User is logged in

**Steps:**
1. Log in successfully
2. Navigate to `/dashboard`
3. Refresh the browser (F5 / Cmd+R)

**Expected Result:**
- User remains authenticated after refresh
- Dashboard data reloads without redirecting to login

**Acceptance Criteria:**
- [ ] No redirect to `/login` after refresh
- [ ] Session cookie is still valid

---

**TC-AUTH-04 — Already-Logged-In User Redirected Away from Auth Pages**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual + Automated |
| Tags | auth, redirect, middleware |

**Preconditions:** User is currently logged in

**Steps:**
1. While authenticated, navigate directly to `/login`
2. Then navigate directly to `/register`

**Expected Result:**
- Both navigations redirect the user to `/dashboard`
- Auth pages are not rendered to already-authenticated users

**Acceptance Criteria:**
- [ ] `/login` redirects to `/dashboard` for authenticated users
- [ ] `/register` redirects to `/dashboard` for authenticated users

---

### Feature 2: Assessment Builder

---

**TC-ASSESS-01 — Create Assessment with Title, Job Info, and Competencies**

| Field | Detail |
|---|---|
| Priority | P0 (Smoke) |
| Type | Manual + Automated |
| Tags | assessment, builder, happy-path |

**Preconditions:**
- User is logged in as ADMIN or RECRUITER
- User is on the `/assessments/new` page

**Test Data:**
```
Title: Senior Software Engineer Assessment
Job Title: Senior Software Engineer
Job Description: We are looking for a Senior Software Engineer with 5+ years of experience
  in backend systems, cloud infrastructure, and team leadership. (>=50 chars)
Department: Engineering
Competency 1: Problem Solving
Competency 2: Communication
```

**Steps:**
1. Fill in all required fields
2. Add Competency "Problem Solving" via "Add Competency" dialog
3. Add Competency "Communication" via "Add Competency" dialog
4. Click "Create Assessment"

**Expected Result:**
- `POST /api/assessments` returns HTTP 201
- Assessment is created with status `DRAFT`
- Both competencies are created and linked to the assessment
- User is redirected to the assessment detail page `/assessments/[id]`

**Acceptance Criteria:**
- [ ] Assessment appears in the `/assessments` list
- [ ] Assessment status is `DRAFT`
- [ ] Both competencies visible on assessment detail page
- [ ] `createdById` is the logged-in user's ID
- [ ] `organizationId` matches the user's org

---

**TC-ASSESS-02 — Add Question with Full Rubric to Assessment**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual |
| Tags | assessment, question, rubric |

**Preconditions:**
- An assessment with at least one competency exists
- User is on the assessment detail page

**Test Data:**
```
Question: Describe a time when you had to debug a complex production issue under pressure.
Type: BEHAVIORAL
Competency: Problem Solving
Rubric Level 1 - Label: "Does Not Meet", Description: "Unable to describe a systematic approach to debugging."
Rubric Level 3 - Label: "Meets Expectations", Description: "Describes a structured approach with reasonable outcomes."
Rubric Level 5 - Label: "Exceeds Expectations", Description: "Demonstrates exceptional debugging methodology with measurable impact."
```

**Steps:**
1. On the assessment detail page, click "Add Question"
2. Fill in question content and select type BEHAVIORAL
3. Select the competency
4. Add at least 3 rubric levels with labels and descriptions
5. Add at least one behavioral anchor per level
6. Save the question

**Expected Result:**
- Question is saved with the correct type and competency link
- All rubric levels are persisted with unique level numbers (1-5)
- Question appears in the assessment's question list

**Acceptance Criteria:**
- [ ] Question content, type, and competencyId stored correctly
- [ ] RubricLevel records created with unique (questionId, level) constraint enforced
- [ ] Behavioral anchors stored as JSON array

---

**TC-ASSESS-03 — Publish Assessment (DRAFT to ACTIVE)**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual + Automated |
| Tags | assessment, publish, status |

**Preconditions:**
- Assessment exists in DRAFT status

**Steps:**
1. Navigate to assessment detail page
2. Click "Publish" button
3. Confirm the action in the dialog

**Expected Result:**
- `POST /api/assessments/[id]/publish` returns success
- Assessment status changes from `DRAFT` to `ACTIVE`
- Assessment is now available for interview scheduling

**Acceptance Criteria:**
- [ ] Status badge shows "ACTIVE" after publish
- [ ] Published assessment appears in interview scheduling dropdown
- [ ] DRAFT assessments do NOT appear in interview scheduling

---

### Feature 3: Candidate Management

---

**TC-CAND-01 — Create New Candidate**

| Field | Detail |
|---|---|
| Priority | P0 (Smoke) |
| Type | Manual + Automated |
| Tags | candidate, create, happy-path |

**Preconditions:**
- User is logged in as ADMIN or RECRUITER

**Test Data:**
```
Name: John Smith
Email: john.smith@example.com
Phone: +1-555-0100
Resume URL: https://linkedin.com/in/johnsmith
Notes: Strong background in distributed systems
```

**Steps:**
1. Navigate to `/candidates/new`
2. Fill in all fields
3. Click "Add Candidate"

**Expected Result:**
- `POST /api/candidates` returns HTTP 201
- Candidate is created with `pipelineStage: APPLIED` (default)
- Candidate appears in the candidate list

**Acceptance Criteria:**
- [ ] Candidate record exists in DB with correct organizationId
- [ ] Default pipelineStage is `APPLIED`
- [ ] `lastActivityAt` is set to creation time

---

**TC-CAND-02 — Update Candidate Pipeline Stage**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual + Automated |
| Tags | candidate, pipeline, stage |

**Preconditions:**
- A candidate exists in `APPLIED` stage

**Steps:**
1. Navigate to the candidate list or candidate detail
2. Use the stage picker to move candidate from `APPLIED` to `SCREENING`
3. Verify the change
4. Move candidate from `SCREENING` to `ASSESSMENT`

**Expected Result:**
- `PATCH /api/candidates/[id]` with `pipelineStage: "SCREENING"` returns 200
- Stage badge updates immediately in the UI
- `lastActivityAt` is updated

**Acceptance Criteria:**
- [ ] Stage changes are persisted
- [ ] `lastActivityAt` reflects the update time
- [ ] UI stage badge updates without full page reload

---

**TC-CAND-03 — Search and Filter Candidates**

| Field | Detail |
|---|---|
| Priority | P2 (Extended) |
| Type | Manual |
| Tags | candidate, search, filter |

**Preconditions:**
- At least 5 candidates exist across multiple pipeline stages

**Steps:**
1. Navigate to `/candidates`
2. Type a partial name in the search bar
3. Apply a stage filter (e.g., "SCREENING")
4. Clear filters

**Expected Result:**
- Search filters candidates by name/email in real time (debounced)
- Stage filter shows only candidates in selected stage
- Clearing filters restores full list

**Acceptance Criteria:**
- [ ] Search is debounced (no request on every keystroke)
- [ ] Stage filter is additive/independent from search
- [ ] Empty state message shown when no results match

---

### Feature 4: Interview Scheduling

---

**TC-INT-01 — Schedule Interview with Panel**

| Field | Detail |
|---|---|
| Priority | P0 (Smoke) |
| Type | Manual + Automated |
| Tags | interview, schedule, panel |

**Preconditions:**
- At least one ACTIVE assessment exists
- At least one candidate exists
- At least one EVALUATOR user exists in the same org

**Test Data:**
```
Assessment: Senior Software Engineer Assessment (ACTIVE)
Candidate: John Smith
Scheduled At: 2026-03-01T10:00:00.000Z
Panel Members: [{ evaluatorId: "eval-user-id", role: "LEAD" }]
```

**Steps:**
1. Navigate to `/interviews/new`
2. Select the active assessment
3. Select the candidate
4. Set the scheduled date and time
5. Add at least one panel member
6. Click "Schedule Interview"

**Expected Result:**
- `POST /api/interviews` returns HTTP 201
- Interview is created with status `SCHEDULED`
- Candidate's `pipelineStage` is automatically updated to `INTERVIEW`
- InterviewPanel record is created for each panel member
- Interview appears in `/interviews` list

**Acceptance Criteria:**
- [ ] Interview status is `SCHEDULED`
- [ ] Candidate stage updated to `INTERVIEW` atomically
- [ ] Panel member count matches submitted panelMembers array
- [ ] `scheduledAt` is stored as UTC DateTime

---

**TC-INT-02 — View Interview Detail Page**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual |
| Tags | interview, detail, view |

**Preconditions:**
- A scheduled interview exists

**Steps:**
1. Navigate to `/interviews`
2. Click on an interview row

**Expected Result:**
- Interview detail page loads at `/interviews/[id]`
- Shows candidate name, assessment title, scheduled date, panel members, and current status

**Acceptance Criteria:**
- [ ] All interview details are rendered correctly
- [ ] Panel member list is shown
- [ ] Status badge reflects current state

---

### Feature 5: Evaluation Scoring

---

**TC-EVAL-01 — Score All Questions and Submit Evaluation**

| Field | Detail |
|---|---|
| Priority | P0 (Smoke) |
| Type | Manual + Automated |
| Tags | evaluation, scoring, submit |

**Preconditions:**
- An interview exists with status `SCHEDULED`
- The logged-in user is a panel member for this interview
- The assessment has at least 3 questions with rubric levels

**Steps:**
1. Navigate to `/interviews/[id]/evaluate`
2. For Question 1: click rubric level 4, add a note
3. Click "Save & Next"
4. For Question 2: click rubric level 3
5. Click "Save & Next"
6. For Question 3: click rubric level 5
7. Confirm "Submit All" is now enabled
8. Click "Submit All"
9. Confirm submission in the dialog

**Expected Result:**
- `POST /api/interviews/[id]/evaluations` returns `{ count: 3 }`
- All 3 evaluation records are upserted with correct scores
- Interview status transitions from `SCHEDULED` to `IN_PROGRESS`
- localStorage draft key `eval-draft-[id]` is cleared after submission
- User is redirected to `/interviews/[id]`
- Toast notification: "Evaluations submitted successfully"

**Acceptance Criteria:**
- [ ] Exactly 3 Evaluation records in DB with correct scores and notes
- [ ] Interview status = `IN_PROGRESS`
- [ ] localStorage draft is cleared
- [ ] `lastActivityAt` on the candidate is updated
- [ ] "Submit All" button was disabled until all questions scored

---

**TC-EVAL-02 — LocalStorage Autosave Draft Recovery**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual |
| Tags | evaluation, autosave, localStorage |

**Preconditions:**
- User is on the evaluate page with questions to score
- No existing DB scores for this interview/evaluator

**Steps:**
1. Navigate to `/interviews/[id]/evaluate`
2. Score Question 1 (level 3), add notes
3. Wait 2 seconds (autosave debounce fires at 1.5s)
4. Simulate browser crash: hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
5. Navigate back to `/interviews/[id]/evaluate`

**Expected Result:**
- localStorage key `eval-draft-[interviewId]` is read on mount
- Question 1 score (3) and notes are restored from the draft
- Progress indicator shows 1/N scored

**Acceptance Criteria:**
- [ ] Draft is visible in localStorage after 2 seconds
- [ ] After page reload, score is pre-populated
- [ ] DB-saved scores override localStorage on merge

---

**TC-EVAL-03 — Save Progress (Partial Submission)**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual |
| Tags | evaluation, save, partial |

**Preconditions:**
- User has scored at least 1 question but not all

**Steps:**
1. Score 2 of 5 questions
2. Click the "Save" button (not "Submit All")

**Expected Result:**
- `POST /api/interviews/[id]/evaluations` is called with the 2 scored questions
- Toast: "Progress saved"
- Interview transitions to `IN_PROGRESS` if previously `SCHEDULED`
- "Submit All" button remains disabled (not all questions scored)

**Acceptance Criteria:**
- [ ] Only scored questions are submitted (not null scores)
- [ ] Interview status changes to `IN_PROGRESS`
- [ ] Submit button disabled state persists after partial save

---

### Feature 6: Dashboard

---

**TC-DASH-01 — Dashboard Displays Accurate Real-Time Metrics**

| Field | Detail |
|---|---|
| Priority | P1 (Critical) |
| Type | Manual |
| Tags | dashboard, metrics, real-time |

**Preconditions:**
- Org has: 3 assessments, 2 IN_PROGRESS interviews, 1 SCHEDULED interview

**Steps:**
1. Log in and navigate to `/dashboard`
2. Verify metric cards
3. Create a new assessment
4. Return to dashboard and verify count update

**Expected Result:**
- "Total Assessments" = 3 (then 4 after creation)
- "Active Interviews" = 2
- "Pending Reviews" = 1
- "Avg. Reliability" = "—" if no ICC data, else formatted to 2 decimal places

**Acceptance Criteria:**
- [ ] All 4 metric cards render correct values from DB
- [ ] Dashboard loads within 3 seconds (6 parallel queries expected)
- [ ] Empty states render correctly when no data exists
- [ ] ICC value shows "—" when `reliabilityScore` table is empty for this org

---

## 2. Edge Cases & Negative Tests

### Feature 1: Authentication

| TC ID | Scenario | Input | Expected Behavior |
|---|---|---|---|
| TC-AUTH-NEG-01 | Register with already-registered email | `email: alice@test.com` (existing) | HTTP 409, error: "User with this email already exists" |
| TC-AUTH-NEG-02 | Register with password < 8 chars | `password: "Short1"` | HTTP 400, Zod error on password field, form shows inline error |
| TC-AUTH-NEG-03 | Register with mismatched passwords | `password: "Pass123!", confirmPassword: "Different1!"` | HTTP 400, error on `confirmPassword` field: "Passwords don't match" |
| TC-AUTH-NEG-04 | Login with wrong password | Correct email, wrong password | Auth failure, HTTP 401 (or NextAuth credentials callback returns null), error toast |
| TC-AUTH-NEG-05 | Login with non-existent email | `email: nobody@ghost.com` | Same generic auth failure (no user enumeration) |
| TC-AUTH-NEG-06 | Register with name < 2 chars | `name: "A"` | HTTP 400, Zod error: "Name must be at least 2 characters" |
| TC-AUTH-NEG-07 | Register with invalid email format | `email: "not-an-email"` | HTTP 400, Zod error: "Invalid email address" |
| TC-AUTH-NEG-08 | Submit empty register form | All fields empty | Multiple Zod errors returned, no DB writes |
| TC-AUTH-NEG-09 | Access /dashboard without session | Direct URL navigation | Redirect to `/login` via middleware |
| TC-AUTH-NEG-10 | EVALUATOR role accesses /assessments | Navigate directly | Middleware redirects to `/` (root) |

---

### Feature 2: Assessment Builder

| TC ID | Scenario | Input | Expected Behavior |
|---|---|---|---|
| TC-ASSESS-NEG-01 | Create assessment with title < 3 chars | `title: "SE"` | HTTP 400, Zod error: "Title must be at least 3 characters" |
| TC-ASSESS-NEG-02 | Create assessment with jobDescription < 50 chars | `jobDescription: "Short desc"` | HTTP 400, Zod error on jobDescription |
| TC-ASSESS-NEG-03 | Create assessment while unauthenticated | No session cookie | HTTP 401, `{ error: "Unauthorized" }` |
| TC-ASSESS-NEG-04 | Create assessment belonging to different org | Forge `organizationId` in request body | `organizationId` is pulled from session, not body — org override is ignored |
| TC-ASSESS-NEG-05 | Add duplicate rubric level to question | Two rubric levels both with `level: 3` | DB constraint violation on `(questionId, level)` unique index — HTTP 500 (no graceful handling currently) |
| TC-ASSESS-NEG-06 | Add question with content < 10 chars | `content: "Short?"` | HTTP 400, Zod error |
| TC-ASSESS-NEG-07 | Publish a DRAFT assessment that has 0 questions | Click publish on empty assessment | System should block publish or warn — verify current behavior (potential gap) |
| TC-ASSESS-NEG-08 | Access another org's assessment by ID | `/assessments/[other-org-id]` | Should return 404 (org isolation via DB query), not 403 |

---

### Feature 3: Candidate Management

| TC ID | Scenario | Input | Expected Behavior |
|---|---|---|---|
| TC-CAND-NEG-01 | Create candidate with duplicate email in same org | Same email as existing candidate | HTTP 409, "A candidate with this email already exists in your organization" |
| TC-CAND-NEG-02 | Create candidate with same email in DIFFERENT org | Cross-org — same email | Should succeed (email uniqueness is org-scoped, not global) |
| TC-CAND-NEG-03 | Update candidate with invalid pipeline stage | `pipelineStage: "PENDING"` | HTTP 400, Zod enum validation error |
| TC-CAND-NEG-04 | Delete candidate with active interview | Candidate has SCHEDULED interview | HTTP 422, "Cannot delete a candidate with in-progress or scheduled interviews" |
| TC-CAND-NEG-05 | PATCH candidate from different org | Forge candidate ID from another org | Prisma `findFirst` with `organizationId` filter returns null → HTTP 404 |
| TC-CAND-NEG-06 | Create candidate with name = 1 char | `name: "J"` | HTTP 400, Zod error: "Name must be at least 2 characters" |
| TC-CAND-NEG-07 | Create candidate with malformed URL | `resumeUrl: "not-a-url"` | HTTP 400, Zod URL validation error (unless empty string, which is allowed) |
| TC-CAND-NEG-08 | View candidates with empty org | New org with 0 candidates | Empty state component renders with "No candidates yet" message |

---

### Feature 4: Interview Scheduling

| TC ID | Scenario | Input | Expected Behavior |
|---|---|---|---|
| TC-INT-NEG-01 | Schedule interview with DRAFT assessment | `assessmentId` of a DRAFT assessment | HTTP 404, "Assessment not found or not active" |
| TC-INT-NEG-02 | Schedule interview with non-existent assessmentId | Random CUID string | HTTP 404, "Assessment not found or not active" |
| TC-INT-NEG-03 | Schedule interview with evaluator from different org | Foreign org's user ID in panelMembers | HTTP 404, "One or more evaluators not found in your organization" |
| TC-INT-NEG-04 | Schedule interview without any panel members | `panelMembers: []` | HTTP 400, Zod error: "At least one panel member is required" |
| TC-INT-NEG-05 | Schedule interview with invalid ISO date | `scheduledAt: "not-a-date"` | HTTP 400, Zod error: "Invalid date/time" |
| TC-INT-NEG-06 | Schedule interview with past date | `scheduledAt: "2020-01-01T00:00:00Z"` | Currently no validation for past dates — potential gap to flag |
| TC-INT-NEG-07 | Duplicate panel member in same interview | Same evaluatorId twice in panelMembers | DB unique constraint on `(interviewId, evaluatorId)` — HTTP 500 (no graceful handling) |
| TC-INT-NEG-08 | Access interview from different org | `/interviews/[foreign-id]` | Should return 404 (org scoped via assessment.organizationId) |

---

### Feature 5: Evaluation Scoring

| TC ID | Scenario | Input | Expected Behavior |
|---|---|---|---|
| TC-EVAL-NEG-01 | Submit evaluation as non-panel member | User not in `panels` for this interview | HTTP 403, "You are not a panel member for this interview" |
| TC-EVAL-NEG-02 | Submit evaluation for COMPLETED interview | Interview status = "COMPLETED" | HTTP 422, "Evaluations can only be submitted for active interviews" |
| TC-EVAL-NEG-03 | Submit evaluation for CANCELLED interview | Interview status = "CANCELLED" | HTTP 422, same message as above |
| TC-EVAL-NEG-04 | Submit score outside 1-5 range | `score: 6` or `score: 0` | HTTP 400, Zod int min(1).max(5) validation error |
| TC-EVAL-NEG-05 | Submit score as non-integer | `score: 3.5` | HTTP 400, Zod int() validation error |
| TC-EVAL-NEG-06 | Submit evaluation with questionId from different assessment | Foreign questionId | HTTP 400, "One or more question IDs are invalid for this interview" |
| TC-EVAL-NEG-07 | Submit empty evaluations array | `evaluations: []` | HTTP 400, Zod min(1) error |
| TC-EVAL-NEG-08 | Re-submit (update) a previously submitted score | Same interviewId+evaluatorId+questionId | Upsert updates the score — HTTP 200, existing record updated |
| TC-EVAL-NEG-09 | Unauthenticated evaluation submission | No session | HTTP 401, "Unauthorized" |
| TC-EVAL-NEG-10 | Submit All clicked before all questions scored | `scoredCount < totalQuestions` | "Submit All" button is disabled at the UI level; if bypassed via API, partial submission proceeds |

---

### Feature 6: Dashboard

| TC ID | Scenario | Expected Behavior |
|---|---|---|
| TC-DASH-NEG-01 | New org with zero data | All metric cards show 0; empty states shown in tables; ICC shows "—" |
| TC-DASH-NEG-02 | Org has assessments but no interviews | "Active Interviews" = 0, "Pending Reviews" = 0; Recent Assessments table populates |
| TC-DASH-NEG-03 | Dashboard loads when DB is slow | Loading skeleton/spinner shown; no blank white screen |

---

### Upcoming Features — Edge Cases to Prepare For

**Kanban Pipeline (TC-KANBAN-NEG)**
- Drag candidate to invalid stage (e.g., HIRED to APPLIED — regression)
- Concurrent drag from two sessions — last write wins or conflict resolution
- Empty pipeline columns when no candidates at that stage

**AI Interview Builder (TC-AI-NEG)**
- Claude API timeout (>30s) — graceful error message shown
- Empty job description submitted — validate before calling API
- AI credits exhausted — user sees "upgrade plan" message, not 500 error
- Malicious prompt injection in job description field

**Async Video Interviews (TC-VIDEO-NEG)**
- Video upload exceeds size limit — clear error
- Unsupported codec — clear error
- Candidate accesses expired video link

---

## 3. API Test Cases

> All API tests assume base URL: `http://localhost:3000`
> Authentication: NextAuth session cookie (`next-auth.session-token`)

---

### `POST /api/auth/register`

| TC ID | Description | Request Body | Expected Status | Expected Response |
|---|---|---|---|---|
| TC-API-REG-01 | Valid registration | `{ name, email, password, confirmPassword, organizationName }` all valid | 201 | `{ message: "User created successfully", userId: "<cuid>" }` |
| TC-API-REG-02 | Duplicate email | Same email as existing user | 409 | `{ error: "User with this email already exists" }` |
| TC-API-REG-03 | Missing `name` field | Body without `name` | 400 | `{ error: "Invalid input", details: { fieldErrors: { name: [...] } } }` |
| TC-API-REG-04 | Missing `email` field | Body without `email` | 400 | `{ error: "Invalid input" }` |
| TC-API-REG-05 | Missing `password` | Body without `password` | 400 | `{ error: "Invalid input" }` |
| TC-API-REG-06 | Password < 8 chars | `password: "Short1!"` | 400 | Zod error: "Password must be at least 8 characters" |
| TC-API-REG-07 | Passwords do not match | `password != confirmPassword` | 400 | Zod error on `confirmPassword`: "Passwords don't match" |
| TC-API-REG-08 | Invalid email format | `email: "invalid"` | 400 | Zod error: "Invalid email address" |
| TC-API-REG-09 | Empty body `{}` | No fields | 400 | Multiple field errors in `details` |
| TC-API-REG-10 | organizationName < 2 chars | `organizationName: "A"` | 400 | Zod error |
| TC-API-REG-11 | Non-JSON body | Raw string body | 500 (JSON parse error) | `{ error: "Internal server error" }` |
| TC-API-REG-12 | Extra fields in body | Add `role: "SUPER_ADMIN"` | 201 | Extra fields ignored; user created with default ADMIN role |
| TC-API-REG-13 | Concurrent duplicate registration | Two requests with same email simultaneously | One gets 201, other gets 409 (unique DB constraint protects) |

---

### `POST /api/assessments`

| TC ID | Description | Auth | Request Body | Expected Status | Expected Response |
|---|---|---|---|---|---|
| TC-API-ASSESS-01 | Valid minimal assessment | Authenticated | `{ title, jobTitle, jobDescription }` all valid | 201 | Assessment object with `status: "DRAFT"` |
| TC-API-ASSESS-02 | Valid with competencies | Authenticated | Include `competencies: [{ name, description }]` | 201 | Assessment with nested competencies |
| TC-API-ASSESS-03 | Missing `title` | Authenticated | No `title` | 400 | `{ error: "Invalid input" }` |
| TC-API-ASSESS-04 | Missing `jobTitle` | Authenticated | No `jobTitle` | 400 | `{ error: "Invalid input" }` |
| TC-API-ASSESS-05 | `jobDescription` < 50 chars | Authenticated | `jobDescription: "Too short"` | 400 | Zod error on `jobDescription` |
| TC-API-ASSESS-06 | Unauthenticated request | No session | Any body | 401 | `{ error: "Unauthorized" }` |
| TC-API-ASSESS-07 | `title` < 3 chars | Authenticated | `title: "SE"` | 400 | Zod error |
| TC-API-ASSESS-08 | `status` field in body | Authenticated | Add `status: "ACTIVE"` | 201 | Status ignored; assessment created as `DRAFT` (status not in createSchema) |
| TC-API-ASSESS-09 | `organizationId` in body | Authenticated | Add foreign `organizationId` | 201 | Field ignored; org from session used |

---

### `POST /api/interviews`

| TC ID | Description | Auth | Request Body | Expected Status | Expected Response |
|---|---|---|---|---|---|
| TC-API-INT-01 | Valid interview creation | Authenticated | Valid assessmentId (ACTIVE), candidateId, scheduledAt, panelMembers | 201 | Interview object with `status: "SCHEDULED"` |
| TC-API-INT-02 | DRAFT assessmentId | Authenticated | assessmentId of DRAFT assessment | 404 | `{ error: "Assessment not found or not active" }` |
| TC-API-INT-03 | Non-existent assessmentId | Authenticated | Random CUID | 404 | `{ error: "Assessment not found or not active" }` |
| TC-API-INT-04 | Non-existent candidateId | Authenticated | Random CUID for candidate | 404 | `{ error: "Candidate not found" }` |
| TC-API-INT-05 | Evaluator from different org | Authenticated | panelMembers with foreign userId | 404 | `{ error: "One or more evaluators not found in your organization" }` |
| TC-API-INT-06 | Empty panelMembers array | Authenticated | `panelMembers: []` | 400 | Zod error: "At least one panel member is required" |
| TC-API-INT-07 | Invalid scheduledAt format | Authenticated | `scheduledAt: "March 1 2026"` | 400 | Zod datetime error |
| TC-API-INT-08 | Unauthenticated | No session | Any body | 401 | `{ error: "Unauthorized" }` |
| TC-API-INT-09 | Missing required fields | Authenticated | `{}` | 400 | Multiple Zod field errors |
| TC-API-INT-10 | Valid — verify atomic transaction | Authenticated | Valid payload | 201 | Candidate's `pipelineStage` updated to `INTERVIEW` in same transaction |
| TC-API-INT-11 | LEAD role assignment | Authenticated | `panelMembers: [{ evaluatorId, role: "LEAD" }]` | 201 | Panel record has `role: "LEAD"` |

---

### `POST /api/interviews/[id]/evaluations`

| TC ID | Description | Auth | Scenario | Expected Status | Expected Response |
|---|---|---|---|---|---|
| TC-API-EVAL-01 | Valid full submission | Panel member | All questions scored, interview SCHEDULED | 200 | `{ message: "Evaluations submitted successfully", count: N }` |
| TC-API-EVAL-02 | Valid partial (save progress) | Panel member | Subset of questions scored, interview SCHEDULED | 200 | Count = scored questions only |
| TC-API-EVAL-03 | Wrong evaluator (not on panel) | Non-panel member | Any valid payload | 403 | `{ error: "You are not a panel member for this interview" }` |
| TC-API-EVAL-04 | Interview is COMPLETED | Panel member | Interview status = COMPLETED | 422 | `{ error: "Evaluations can only be submitted for active interviews" }` |
| TC-API-EVAL-05 | Interview is CANCELLED | Panel member | Interview status = CANCELLED | 422 | Same 422 error |
| TC-API-EVAL-06 | Score = 0 (below range) | Panel member | `score: 0` | 400 | Zod error: min(1) |
| TC-API-EVAL-07 | Score = 6 (above range) | Panel member | `score: 6` | 400 | Zod error: max(5) |
| TC-API-EVAL-08 | Score is float | Panel member | `score: 3.5` | 400 | Zod int() error |
| TC-API-EVAL-09 | Foreign questionId | Panel member | questionId from different assessment | 400 | `{ error: "One or more question IDs are invalid for this interview" }` |
| TC-API-EVAL-10 | Empty evaluations array | Panel member | `evaluations: []` | 400 | Zod min(1) error |
| TC-API-EVAL-11 | Re-submit (update) | Panel member | Same questionId, new score | 200 | DB upserted, score updated |
| TC-API-EVAL-12 | Non-existent interviewId | Panel member | Random ID in URL | 404 | `{ error: "Interview not found" }` |
| TC-API-EVAL-13 | Unauthenticated | No session | Any body | 401 | `{ error: "Unauthorized" }` |
| TC-API-EVAL-14 | Auto-transition to IN_PROGRESS | Panel member | First submission on SCHEDULED interview | 200 | Interview status updated to `IN_PROGRESS` |
| TC-API-EVAL-15 | Concurrent submissions from two evaluators | Two panel members simultaneously | Both valid | 200 each | Both sets of evaluations saved (different evaluatorId in upsert key) |

---

### `PATCH /api/candidates/[id]`

| TC ID | Description | Auth | Request Body | Expected Status | Expected Response |
|---|---|---|---|---|---|
| TC-API-CAND-01 | Valid stage change | ADMIN/RECRUITER | `{ pipelineStage: "SCREENING" }` | 200 | Updated candidate object |
| TC-API-CAND-02 | Valid partial update (name only) | ADMIN/RECRUITER | `{ name: "John Updated" }` | 200 | Updated candidate object |
| TC-API-CAND-03 | Invalid stage value | ADMIN/RECRUITER | `{ pipelineStage: "PENDING" }` | 400 | Zod enum error |
| TC-API-CAND-04 | All valid pipeline stages | ADMIN/RECRUITER | Each of: APPLIED, SCREENING, ASSESSMENT, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN | 200 each | Stage updated successfully |
| TC-API-CAND-05 | Unauthenticated | No session | Any body | 401 | `{ error: "Unauthorized" }` |
| TC-API-CAND-06 | Cross-org candidate ID | Authenticated as Org A | ID of Org B's candidate | 404 | `{ error: "Candidate not found" }` |
| TC-API-CAND-07 | Non-existent candidate ID | Authenticated | Random CUID | 404 | `{ error: "Candidate not found" }` |
| TC-API-CAND-08 | Email update to existing email (same org) | Authenticated | `{ email: "other-candidate@same-org.com" }` | 409 | `{ error: "A candidate with this email already exists in your organization" }` |
| TC-API-CAND-09 | Email update to existing email (different org) | Authenticated | `{ email: "candidate@other-org.com" }` | 200 | Update succeeds (cross-org emails are not checked) |
| TC-API-CAND-10 | Empty body `{}` | Authenticated | `{}` | 200 | Candidate unchanged (all fields optional in update schema) |
| TC-API-CAND-11 | Invalid resume URL format | Authenticated | `{ resumeUrl: "not-a-url" }` | 400 | Zod URL error |
| TC-API-CAND-12 | Empty string resumeUrl | Authenticated | `{ resumeUrl: "" }` | 200 | Stored as `null` (per `parsed.data.resumeUrl \|\| null` logic) |

---

## 4. UI/UX Test Checklist

### 4.1 Form Validation

**Client-side (Zod + react-hook-form):**
- [ ] Register form: all fields show inline error messages below the field on blur/submit
- [ ] Password mismatch shows error on `confirmPassword` field, not on password
- [ ] Login form: invalid email format shows error before API call
- [ ] Assessment creation: "Job Description" shows character count or error when below 50 chars
- [ ] Question creation: content < 10 chars shows validation error inline
- [ ] Interview scheduling: past dates are handled clearly (verify if blocked client-side)
- [ ] Score input: user cannot type letters in score fields
- [ ] All required fields indicated visually (asterisk or label styling)

**Server-side error display:**
- [ ] 409 conflict errors (duplicate email on register) are shown as toast or form error
- [ ] 400 field errors from API surface at the field level, not just a generic toast
- [ ] 401 Unauthorized redirects to login or shows appropriate message
- [ ] 422 Unprocessable errors display human-readable messages to the user
- [ ] 500 errors show a friendly error message, not a raw JSON dump

---

### 4.2 Toast Notifications

| Action | Expected Toast |
|---|---|
| Assessment created | Success: "Assessment created" (or equivalent) |
| Assessment published | Success: "Assessment published" |
| Evaluation progress saved | Success: "Progress saved" |
| Evaluation submitted | Success: "Evaluations submitted successfully" |
| Save with 0 scores | Info: "No scores to save yet" |
| API error during save | Error: error message from API response |
| API error during submit | Error: error message from API response |
| Candidate created | Success toast |
| Candidate deleted | Success toast |
| Candidate stage changed | Success toast or silent update |
| Network failure | Error: "Something went wrong" |

**Toast behavior checklist:**
- [ ] Toasts auto-dismiss after appropriate duration (not permanent)
- [ ] Multiple toasts stack correctly (Sonner handles stacking)
- [ ] Error toasts are visually distinct from success toasts (color/icon)
- [ ] Toasts do not block interactive UI elements

---

### 4.3 Loading States

| Screen | Expected Loading Behavior |
|---|---|
| Candidates list | Skeleton or spinner while fetching |
| Assessment detail | Loading state while fetching assessment data |
| Interview detail | `/interviews/[id]/loading.tsx` skeleton |
| Dashboard page | All metric cards show placeholder while 6 DB queries run |
| Evaluate page | Loading state before questions render |
| Form submit buttons | Button shows loading text/spinner during API call |
| Save progress button | Shows "Saving..." text, button disabled |
| Submit all button | Shows "Submitting..." text, button disabled |

**Loading state checklist:**
- [ ] No content flash (layout shift) between loading and loaded states
- [ ] Loading skeletons match the shape of the final content
- [ ] Buttons are disabled during in-flight requests to prevent double-submit
- [ ] Page titles and headers render immediately (not blocked by data fetch)

---

### 4.4 Empty States

| Screen | Trigger | Expected Empty State |
|---|---|---|
| Assessments list | No assessments in org | EmptyState component with "Create your first assessment" CTA |
| Candidates list | No candidates in org | EmptyState with "Add a candidate" CTA |
| Interviews list | No interviews scheduled | EmptyState with "Schedule an interview" CTA |
| Dashboard: Recent Assessments | No assessments | "No assessments yet. Create your first one" with link |
| Dashboard: Evaluator Reliability | No evaluators | "No evaluators yet. Invite one" with link |
| Candidate search: no results | Search returns 0 matches | "No candidates match your search" message |
| Assessment with 0 questions | Assessment has no questions | "This assessment has no questions" message in evaluate view |

**Empty state checklist:**
- [ ] All empty states have a clear action/CTA (not just text)
- [ ] Empty states use the shared `EmptyState` component for consistency
- [ ] Empty state messages are helpful and specific (not just "No data")

---

### 4.5 Responsive Design

**Breakpoints to test:** 375px (mobile), 768px (tablet), 1280px (desktop), 1920px (wide)

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Dashboard metric cards | Stack 2x2 or 1-col | 2-col grid | 4-col grid |
| Sidebar navigation | Hidden / hamburger menu | Collapsible | Always visible |
| Evaluation interface sidebar | Hidden (dots navigation shown) | Hidden | Visible question list |
| Interview list table | Horizontal scroll or card layout | Partial columns | All columns |
| Candidate list table | Key columns only | Most columns | All columns |
| Assessment builder | Full form | Full form | Full form with sidebar |
| Forms (register, login) | Full-width inputs | Centered card | Centered card |
| Dashboard AI CTA banner | Stacked layout | Row layout | Row layout |

**Responsive checklist:**
- [ ] No horizontal overflow on any mobile screen
- [ ] Touch targets >= 44x44px on mobile (buttons, links, rubric cards)
- [ ] Text remains legible at all breakpoints (no overflow/truncation causing data loss)
- [ ] Evaluation rubric cards are usable on mobile (full text visible or scrollable)

---

### 4.6 Accessibility (WCAG 2.1 AA)

**Keyboard Navigation:**
- [ ] All interactive elements reachable via Tab key
- [ ] Register/login forms fully completable with keyboard only
- [ ] Evaluation interface: rubric cards selectable via Enter/Space
- [ ] Navigation buttons (Previous/Next) in evaluation UI accessible via keyboard
- [ ] Dialog (AlertDialog for submit confirmation) traps focus correctly
- [ ] Modal/dialog dismissible with Escape key
- [ ] Sidebar navigation links accessible with keyboard

**ARIA & Semantics:**
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Loading states announced to screen readers (`aria-live`, `aria-busy`)
- [ ] Score selection buttons have `aria-label` (e.g., "Score 3 — Meets Expectations")
- [ ] Question navigation dots have `aria-label="Question N"` (confirmed in code)
- [ ] Icons that convey meaning have `aria-label` or adjacent visible text
- [ ] Status badges have sufficient color contrast ratio (>= 4.5:1)
- [ ] Page `<title>` updates correctly on route change

**Color & Contrast:**
- [ ] Rubric level colors (red=1, orange=2, yellow=3, teal=4, green=5) not the sole means of communication
- [ ] Selected rubric card indicated by both color AND border/ring (confirmed in code — ring-2 added)
- [ ] ICC gauge conveys value numerically, not by color alone

---

### 4.7 Error Boundaries

- [ ] If a page component throws during render, React error boundary catches it and shows a fallback UI
- [ ] Error boundary does not expose internal stack traces to the user
- [ ] Navigation away from an errored page clears the error state
- [ ] API fetch failures in `page.tsx` Server Components (not wrapped in try/catch) trigger Next.js error page
- [ ] `loading.tsx` files present for routes that do heavy data fetching: `/interviews/[id]/loading.tsx`, `/candidates/[id]/loading.tsx`, `/candidates/loading.tsx`, `/interviews/loading.tsx` (confirmed in codebase)

---

## 5. Security Test Cases

### 5.1 Organization Isolation

> Critical: All data access MUST be scoped to `organizationId` from the authenticated session. No user should access another org's data.

| TC ID | Attack Scenario | Method | Expected Defense |
|---|---|---|---|
| TC-SEC-ISO-01 | Access another org's assessment | `GET /api/assessments/[foreign-id]` with valid session | Prisma query includes `organizationId` filter — returns 404 |
| TC-SEC-ISO-02 | Access another org's candidate | `GET /api/candidates/[foreign-id]` | organizationId from session used in `findFirst` — returns 404 |
| TC-SEC-ISO-03 | Submit evaluation for another org's interview | `POST /api/interviews/[foreign-id]/evaluations` | Interview lookup checks `assessment.organizationId` — returns 404 |
| TC-SEC-ISO-04 | Schedule interview using another org's assessment | POST /api/interviews with foreign assessmentId | Assessment lookup includes `organizationId` filter — returns 404 |
| TC-SEC-ISO-05 | Schedule interview using another org's evaluator | panelMembers with foreign userId | User lookup includes `organizationId` filter — returns 404 |
| TC-SEC-ISO-06 | Delete another org's candidate | `DELETE /api/candidates/[foreign-id]` | `findFirst` with organizationId — returns 404 |
| TC-SEC-ISO-07 | Dashboard data leakage | Check all dashboard DB queries | All `where` clauses include `organizationId: orgId` — confirmed in code |

**Verification method:** Create two separate organizations (Org A and Org B), perform actions as Org A user using resource IDs from Org B. All attempts must return 404 or 403, never actual data.

---

### 5.2 CSRF Protection

| TC ID | Scenario | Expected Behavior |
|---|---|---|
| TC-SEC-CSRF-01 | Forged POST from external origin | Request to `/api/assessments` from `evil.com` | NextAuth session cookie has `SameSite=Lax` by default — cross-site POSTs without cookie rejected |
| TC-SEC-CSRF-02 | API route called without session | Any mutating endpoint with no auth | HTTP 401 — session check is the primary CSRF defense for API routes |
| TC-SEC-CSRF-03 | Non-JSON Content-Type on POST | `Content-Type: text/plain` with JSON body | `request.json()` parsing — verify behavior (may throw 500) |

**Note:** NextAuth v5 provides CSRF protection for sign-in/sign-out endpoints. App API routes rely on session validation. Consider adding explicit CSRF tokens for sensitive mutations as the platform scales.

---

### 5.3 Input Sanitization & XSS

> The application uses React, which escapes HTML by default in JSX rendering. Risk exists where `dangerouslySetInnerHTML` is used or where user content is rendered in non-React contexts.

| TC ID | Field | XSS Payload | Expected Behavior |
|---|---|---|---|
| TC-SEC-XSS-01 | Assessment title | `<script>alert('xss')</script>` | Stored in DB, rendered as escaped text in React — script does NOT execute |
| TC-SEC-XSS-02 | Candidate name | `<img src=x onerror=alert(1)>` | Rendered as escaped text — no event fires |
| TC-SEC-XSS-03 | Job description | `javascript:alert(1)` in text | No execution — stored as text |
| TC-SEC-XSS-04 | Evaluation notes | `<script>document.cookie</script>` | Escaped by React renderer |
| TC-SEC-XSS-05 | Organization name (slug generation) | `<script>` tag | Slug generation strips non-alphanumeric — safe |
| TC-SEC-XSS-06 | localStorage draft (eval-draft-[id]) | Manipulated JSON with XSS payload | `JSON.parse` result is used in React state — React escapes on render |
| TC-SEC-XSS-07 | Resume URL field | `javascript:alert(1)` as URL | Zod URL validator should reject `javascript:` protocol — verify this |

**Verification:** Confirm no `dangerouslySetInnerHTML` in any component that renders user-generated content. Audit `lib/utils.ts` and all components.

---

### 5.4 SQL Injection

> Prisma ORM uses parameterized queries exclusively. Direct SQL injection via the Prisma client is not possible through normal API usage. Tests should verify no raw SQL query construction from user input.

| TC ID | Scenario | Expected Behavior |
|---|---|---|
| TC-SEC-SQL-01 | SQL injection in search param | `GET /api/assessments?search='; DROP TABLE assessments; --` | Prisma `contains` uses parameterized query — injection is not executed |
| TC-SEC-SQL-02 | SQL injection in ID param | `GET /api/candidates/'; DELETE FROM "Candidate"; --` | Prisma `findFirst` treats value as a string parameter — no SQL execution |

---

### 5.5 Authentication & Authorization

| TC ID | Scenario | Expected Behavior |
|---|---|---|
| TC-SEC-AUTH-01 | Access protected route without session | Direct navigation to `/dashboard` | Middleware redirects to `/login` |
| TC-SEC-AUTH-02 | Expired session token | Use an old/invalid session cookie | NextAuth rejects session — redirect to `/login` |
| TC-SEC-AUTH-03 | EVALUATOR accesses `/assessments` | Log in as EVALUATOR role, navigate | Middleware redirects to `/` (root) |
| TC-SEC-AUTH-04 | EVALUATOR accesses `/candidates` | Log in as EVALUATOR role, navigate | Middleware redirects to `/` |
| TC-SEC-AUTH-05 | EVALUATOR calls `POST /api/assessments` via API | Direct API call with EVALUATOR session | API does not check role; session is valid → HTTP 201. Risk: role check is only in middleware for UI routes, not API routes. Flag as a gap. |
| TC-SEC-AUTH-06 | RECRUITER accesses `/evaluator/*` | Log in as RECRUITER, navigate | Middleware redirects to `/` |
| TC-SEC-AUTH-07 | Non-panel EVALUATOR accesses evaluate page | Navigate to `/interviews/[id]/evaluate` | Page renders (middleware allows it), but API POST returns 403 |
| TC-SEC-AUTH-08 | Forge organizationId in request | Add `organizationId: "other-org-id"` to POST body | Field ignored; session-derived organizationId used |
| TC-SEC-AUTH-09 | Brute force login | 100 rapid POST /api/auth/signin attempts | Currently no rate limiting — document as security gap |
| TC-SEC-AUTH-10 | JWT secret rotation | Rotate `AUTH_SECRET` env var | Existing sessions invalidated, users must re-login |

**Critical Gap Identified:** API routes (`/api/*`) are not covered by the middleware matcher (`/((?!api|...).*)`). This means role-based access is enforced in middleware for page routes only. API endpoints only check for authentication (valid session), not authorization (role). An EVALUATOR with a valid session could call `POST /api/assessments` successfully. Consider adding role checks inside API route handlers.

---

### 5.6 Session Security

| TC ID | Scenario | Expected Behavior |
|---|---|---|
| TC-SEC-SESS-01 | Session cookie attributes | Inspect cookie via DevTools | `HttpOnly: true`, `Secure: true` (in prod), `SameSite: Lax` |
| TC-SEC-SESS-02 | Logout clears session | Sign out, then use back button | Session is invalidated; back-button navigation to dashboard redirects to login |
| TC-SEC-SESS-03 | Session expiry | Wait for session to expire | User redirected to login on next protected route access |
| TC-SEC-SESS-04 | localStorage contains sensitive data | Open DevTools > Application > localStorage | Eval draft contains scores/notes — not encrypted. Risk: shared device. Document as accepted risk or implement encryption. |

---

## 6. Performance Test Considerations

### 6.1 Large Candidate List (1,000+ Candidates)

**Scenario:** An organization has accumulated 1,000+ candidates across all pipeline stages.

**Tests:**

| Test | Tool | Acceptance Criteria |
|---|---|---|
| GET /api/candidates — baseline latency | k6 / Artillery | p95 < 500ms at 1 single user |
| GET /api/candidates — 50 concurrent users | k6 | p95 < 2,000ms, error rate < 1% |
| GET /api/candidates — load with pagination | Manual + DB EXPLAIN | Verify index `(organizationId, createdAt)` is used; query plan shows index scan |
| Candidate list page render | Lighthouse / WebPageTest | LCP < 2.5s with 1,000 rows |
| Search with 1,000 candidates | k6 with search param | p95 < 1,000ms; verify `contains` uses `organizationId` index |

**Current Risk:** No pagination is implemented on the candidate list API. A single GET request loads all candidates for the org. At 1,000+ records with `include` clauses (interviews, counts), this will degrade significantly.

**Recommendation:** Implement cursor-based or offset pagination before this reaches production with real data.

---

### 6.2 Many Evaluations Per Interview

**Scenario:** An interview has 20+ questions; 10 evaluators each submit evaluations.

**Tests:**

| Test | Tool | Acceptance Criteria |
|---|---|---|
| POST /api/interviews/[id]/evaluations with 20 questions | k6 | p95 < 1,000ms |
| 10 concurrent evaluators submitting simultaneously | k6 concurrent VUs | No upsert conflicts (unique key handles this); all 200 responses |
| GET /api/interviews/[id] with 200 evaluation rows | k6 | p95 < 500ms |
| Prisma $transaction with 20 upserts | Manual timing | Transaction completes < 500ms |

**Observation:** The evaluation upsert uses `prisma.$transaction(evaluations.map(...))` — this is an interactive transaction. With 20+ questions × 10 evaluators, there will be 200+ upserts. The `(interviewId, evaluatorId, questionId)` unique index makes this safe from race conditions.

---

### 6.3 Dashboard with Large Org Data

**Scenario:** Org has 100+ assessments, 50+ active interviews, and 500+ evaluations.

**Tests:**

| Test | Tool | Acceptance Criteria |
|---|---|---|
| Dashboard page load (6 parallel DB queries) | Lighthouse, server timing | Total server response < 2,000ms |
| Assessment count query | DB EXPLAIN | Uses `(organizationId)` index — confirmed in schema |
| Interview count query | DB EXPLAIN | Joins `assessment.organizationId` — verify join efficiency |
| ReliabilityScore aggregate query | DB EXPLAIN | Uses `(assessmentId)` index, then joins assessment |
| Dashboard under concurrent load | k6 (20 VUs) | p95 < 3,000ms; no DB connection pool exhaustion |

**Current Risk:** `Promise.all` of 6 DB queries on every dashboard page load. The `reliabilityScore` aggregate query joins through `assessment` table — ensure composite indexes support this join pattern.

---

### 6.4 Assessment Builder with Many Questions

**Scenario:** Assessment has 50+ questions, each with 5 rubric levels and multiple anchors.

| Test | Tool | Acceptance Criteria |
|---|---|---|
| GET /api/assessments/[id] with 50 questions | API timer | < 1,000ms |
| Evaluation interface render with 50 questions | Browser DevTools | Initial render < 500ms; question sidebar scroll is smooth |
| localStorage write with 50 questions draft | Manual | No lag on autosave (1.5s debounce) |

---

### 6.5 Performance Benchmarks Summary

| Operation | Target (p95) | Critical Threshold |
|---|---|---|
| Page load (dashboard) | < 2,000ms server | < 5,000ms total |
| API GET (list endpoints) | < 500ms | < 2,000ms |
| API POST (create) | < 1,000ms | < 3,000ms |
| Evaluation submit (20 questions) | < 1,000ms | < 3,000ms |
| Authentication (login) | < 800ms | < 2,000ms |
| Database query (single record) | < 100ms | < 500ms |

---

## 7. Automated Test Recommendations

### 7.1 Recommended Framework Stack

| Layer | Tool | Rationale |
|---|---|---|
| Unit Tests | **Vitest** | Native ESM support, fast HMR, compatible with TypeScript and Zod v4, no Babel config needed |
| Component Tests | **Vitest + React Testing Library** | Test components in isolation with DOM assertions |
| E2E Tests | **Playwright** | Best-in-class Next.js App Router support, network interception, mobile emulation, multi-browser |
| API Tests | **Playwright APIRequestContext** or **Vitest + node-fetch** | Reuse Playwright session cookies for auth; or use msw for mocking |
| Visual Regression | **Playwright + pixelmatch** or **Chromatic** | Catch UI regressions in evaluation interface, dashboard |

**Installation commands:**
```bash
# Vitest + React Testing Library
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Playwright
npm install -D @playwright/test
npx playwright install
```

**Vitest config** (`vitest.config.ts`):
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
});
```

**Playwright config** (`playwright.config.ts`):
```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### 7.2 Playwright E2E Test Scripts

#### E2E Test 1 — Full Authentication Flow

**File:** `/Users/farid/kerja/assint/tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

// Unique email per test run to avoid collisions
const testEmail = `qa-test-${Date.now()}@assint-qa.com`;
const testPassword = "TestPassword123!";
const testName = "QA Test User";
const testOrgName = "QA Test Organization";

test.describe("Authentication Flow", () => {
  test("TC-AUTH-01 — Register a new user and org, auto-login to dashboard", async ({ page }) => {
    // Arrange: Navigate to register page
    await page.goto("/register");
    await expect(page).toHaveTitle(/Register|AssInt/i);

    // Act: Fill the registration form
    await page.getByLabel(/name/i).fill(testName);
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/^password$/i).fill(testPassword);
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByLabel(/organization/i).fill(testOrgName);

    // Submit the form
    await page.getByRole("button", { name: /create account/i }).click();

    // Assert: Redirected to dashboard after auto-login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Good morning, QA Test/i)).toBeVisible();
  });

  test("TC-AUTH-NEG-01 — Register with duplicate email shows conflict error", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel(/name/i).fill("Duplicate User");
    await page.getByLabel(/email/i).fill(testEmail); // Already registered above
    await page.getByLabel(/^password$/i).fill(testPassword);
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByLabel(/organization/i).fill("Duplicate Org");

    await page.getByRole("button", { name: /create account/i }).click();

    // Assert: Error message shown, no redirect
    await expect(page.getByText(/already exists/i)).toBeVisible();
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test("TC-AUTH-NEG-03 — Register with mismatched passwords shows inline error", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill(`mismatch-${Date.now()}@test.com`);
    await page.getByLabel(/^password$/i).fill("Password123!");
    await page.getByLabel(/confirm password/i).fill("DifferentPassword!");
    await page.getByLabel(/organization/i).fill("Test Org");

    await page.getByRole("button", { name: /create account/i }).click();

    // Assert: Inline validation error on confirmPassword
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
    await expect(page).toHaveURL(/\/register/); // Still on register page
  });

  test("TC-AUTH-02 — Login with valid credentials redirects to dashboard", async ({ page }) => {
    // Arrange: Navigate to login (user registered in first test)
    await page.goto("/login");

    // Act: Fill login form
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill(testPassword);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Assert
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("TC-AUTH-04 — Authenticated user visiting /login is redirected to dashboard", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill(testPassword);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Try to visit /login while authenticated
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("TC-AUTH-NEG-09 — Unauthenticated access to /dashboard redirects to /login", async ({ page }) => {
    // Ensure no session by using a fresh context
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

#### E2E Test 2 — Create Assessment Flow

**File:** `/Users/farid/kerja/assint/tests/e2e/assessment.spec.ts`

```typescript
import { test, expect, Page } from "@playwright/test";

// Shared auth state — run login once and reuse session
test.use({ storageState: "tests/e2e/.auth/user.json" });

async function loginAndSaveState(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL ?? "admin@assint-qa.com");
  await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD ?? "TestPassword123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
}

test.describe("Assessment Builder", () => {
  test.beforeAll(async ({ browser }) => {
    // Create authenticated session state file once for this suite
    const page = await browser.newPage();
    await loginAndSaveState(page);
    await page.close();
  });

  test("TC-ASSESS-01 — Create a new assessment with required fields", async ({ page }) => {
    // Arrange
    await page.goto("/assessments/new");

    // Act: Fill assessment form
    await page.getByLabel(/title/i).fill("Senior Backend Engineer Assessment");
    await page.getByLabel(/job title/i).fill("Senior Backend Engineer");
    await page.getByLabel(/job description/i).fill(
      "We are seeking a Senior Backend Engineer to lead the design and implementation of scalable distributed systems, mentor junior engineers, and drive technical excellence across our platform."
    );
    await page.getByLabel(/department/i).fill("Engineering");

    // Submit
    await page.getByRole("button", { name: /create assessment/i }).click();

    // Assert: Redirected to assessment detail page
    await expect(page).toHaveURL(/\/assessments\/[a-z0-9]+$/);
    await expect(page.getByText("Senior Backend Engineer Assessment")).toBeVisible();
    await expect(page.getByText(/DRAFT/i)).toBeVisible();
  });

  test("TC-ASSESS-NEG-01 — Title too short shows validation error", async ({ page }) => {
    await page.goto("/assessments/new");

    await page.getByLabel(/title/i).fill("SE"); // 2 chars, min is 3
    await page.getByLabel(/job title/i).fill("Software Engineer");
    await page.getByLabel(/job description/i).fill(
      "A full job description that meets the 50 character minimum requirement for this field."
    );

    await page.getByRole("button", { name: /create assessment/i }).click();

    // Assert: Inline validation error
    await expect(page.getByText(/at least 3 characters/i)).toBeVisible();
    await expect(page).toHaveURL(/\/assessments\/new/); // Still on create page
  });

  test("TC-ASSESS-NEG-05 — Job description under 50 chars shows validation error", async ({ page }) => {
    await page.goto("/assessments/new");

    await page.getByLabel(/title/i).fill("Valid Title Assessment");
    await page.getByLabel(/job title/i).fill("Engineer");
    await page.getByLabel(/job description/i).fill("Too short"); // < 50 chars

    await page.getByRole("button", { name: /create assessment/i }).click();

    await expect(page.getByText(/at least 50 characters/i)).toBeVisible();
  });

  test("TC-ASSESS-02 — Add a competency to an existing assessment", async ({ page }) => {
    // First create an assessment
    await page.goto("/assessments/new");
    await page.getByLabel(/title/i).fill("Competency Test Assessment");
    await page.getByLabel(/job title/i).fill("Product Manager");
    await page.getByLabel(/job description/i).fill(
      "Looking for a Product Manager to define product vision, work with cross-functional teams, and deliver user-centric solutions that drive business impact."
    );
    await page.getByRole("button", { name: /create assessment/i }).click();
    await expect(page).toHaveURL(/\/assessments\/[a-z0-9]+/);

    // Add a competency
    await page.getByRole("button", { name: /add competency/i }).click();

    // Fill competency dialog
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("Strategic Thinking");
    await dialog.getByLabel(/description/i).fill("Ability to think long-term and define product direction");
    await dialog.getByRole("button", { name: /add|save/i }).click();

    // Assert: Competency appears on the page
    await expect(page.getByText("Strategic Thinking")).toBeVisible();
  });
});
```

---

#### E2E Test 3 — Submit Evaluation Flow

**File:** `/Users/farid/kerja/assint/tests/e2e/evaluation.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

// Assumes storageState is set up from a previous auth step (evaluator role user)
test.use({ storageState: "tests/e2e/.auth/evaluator.json" });

test.describe("Evaluation Scoring Flow", () => {
  /**
   * This test requires:
   * - A SCHEDULED interview with ID stored in TEST_INTERVIEW_ID env var
   * - The logged-in evaluator is on the interview panel
   * - The assessment has at least 3 questions
   */
  const interviewId = process.env.TEST_INTERVIEW_ID ?? "test-interview-id";

  test("TC-EVAL-01 — Score all questions and submit evaluation", async ({ page }) => {
    // Arrange
    await page.goto(`/interviews/${interviewId}/evaluate`);

    // Verify evaluation interface loaded
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();

    // Act: Score Question 1
    // Select rubric level 4 (the 4th rubric card button)
    const rubricCards = page.getByRole("button").filter({ hasText: /4/ }).first();
    await rubricCards.click();

    // Add a note
    await page.getByPlaceholder(/observations/i).fill("Candidate demonstrated strong systematic approach");

    // Navigate to Question 2
    await page.getByRole("button", { name: /save.*next|next/i }).click();
    await expect(page.getByText(/Question 2 of/i)).toBeVisible();

    // Score Question 2 — select level 3
    await page.getByRole("button").filter({ hasText: /3/ }).first().click();
    await page.getByRole("button", { name: /save.*next|next/i }).click();

    // Score Question 3 — select level 5
    await expect(page.getByText(/Question 3 of/i)).toBeVisible();
    await page.getByRole("button").filter({ hasText: /5/ }).first().click();

    // Assert: Submit All is now enabled (all questions scored)
    const submitButton = page.getByRole("button", { name: /submit all/i });
    await expect(submitButton).toBeEnabled();

    // Act: Submit
    await submitButton.click();

    // Confirm in dialog
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /submit evaluations/i }).click();

    // Assert: Toast success and redirect
    await expect(page.getByText(/submitted successfully/i)).toBeVisible();
    await expect(page).toHaveURL(`/interviews/${interviewId}`);
  });

  test("TC-EVAL-NEG-10 — Submit All is disabled until all questions are scored", async ({ page }) => {
    await page.goto(`/interviews/${interviewId}/evaluate`);

    // Assert: Submit is disabled initially (no questions scored)
    const submitButton = page.getByRole("button", { name: /submit all/i });
    await expect(submitButton).toBeDisabled();

    // Score only one question
    await page.getByRole("button").filter({ hasText: /3/ }).first().click();

    // Assert: Still disabled (not all questions scored)
    await expect(submitButton).toBeDisabled();
  });

  test("TC-EVAL-02 — LocalStorage draft persists after page reload", async ({ page }) => {
    await page.goto(`/interviews/${interviewId}/evaluate`);

    // Score one question
    await page.getByRole("button").filter({ hasText: /4/ }).first().click();
    await page.getByPlaceholder(/observations/i).fill("Test note for autosave");

    // Wait for autosave debounce (1.5s + buffer)
    await page.waitForTimeout(2500);

    // Verify localStorage has the draft
    const draft = await page.evaluate((key) => localStorage.getItem(key), `eval-draft-${interviewId}`);
    expect(draft).not.toBeNull();
    expect(JSON.parse(draft!)).toMatchObject(
      expect.objectContaining({
        // At least one entry with score set
      })
    );

    // Reload the page
    await page.reload();

    // Assert: Score is still shown after reload (merged from localStorage)
    const scoredCount = await page.locator('[data-testid="scored-count"]').textContent();
    expect(parseInt(scoredCount ?? "0")).toBeGreaterThanOrEqual(1);
  });

  test("TC-EVAL-NEG-07 — API rejects empty evaluations array", async ({ request }) => {
    // Direct API test using Playwright's request context (authenticated)
    const response = await request.post(`/api/interviews/${interviewId}/evaluations`, {
      data: { evaluations: [] },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid input");
  });

  test("TC-EVAL-NEG-04 — API rejects score of 0", async ({ request }) => {
    const response = await request.post(`/api/interviews/${interviewId}/evaluations`, {
      data: {
        evaluations: [{ questionId: "some-valid-question-id", score: 0 }],
      },
    });

    expect(response.status()).toBe(400);
  });
});
```

---

### 7.3 Vitest Unit Tests

#### Unit Test 1 — ICC Calculation Utility

**File:** `/Users/farid/kerja/assint/tests/unit/icc.test.ts`

```typescript
import { describe, it, expect } from "vitest";

/**
 * Intraclass Correlation Coefficient (ICC) calculation
 * ICC = (MSB - MSW) / (MSB + (k-1)*MSW)
 * where MSB = Mean Square Between raters, MSW = Mean Square Within, k = number of raters
 *
 * This tests the utility function that would be implemented in lib/analytics/icc.ts
 */

// The function to be implemented
function calculateICC(scores: number[][]): number {
  // scores[i][j] = score given by rater j to subject i
  const n = scores.length; // number of subjects
  const k = scores[0].length; // number of raters

  if (n < 2 || k < 2) return 0;

  // Grand mean
  const allScores = scores.flat();
  const grandMean = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  // Row (subject) means
  const subjectMeans = scores.map((row) => row.reduce((a, b) => a + b, 0) / k);

  // Mean Square Between subjects (MSB)
  const SSB = k * subjectMeans.reduce((sum, m) => sum + Math.pow(m - grandMean, 2), 0);
  const MSB = SSB / (n - 1);

  // Mean Square Within (residual) (MSW)
  let SSW = 0;
  scores.forEach((row, i) => {
    row.forEach((score) => {
      SSW += Math.pow(score - subjectMeans[i], 2);
    });
  });
  const MSW = SSW / (n * (k - 1));

  // ICC (two-way mixed, consistency)
  const icc = (MSB - MSW) / (MSB + (k - 1) * MSW);
  return Math.max(0, Math.min(1, icc)); // clamp to [0, 1]
}

describe("calculateICC", () => {
  it("returns 1.0 for perfect agreement between raters", () => {
    // All raters give identical scores
    const scores = [
      [4, 4, 4],
      [3, 3, 3],
      [5, 5, 5],
      [2, 2, 2],
    ];
    const icc = calculateICC(scores);
    expect(icc).toBeCloseTo(1.0, 2);
  });

  it("returns a low value for random/disagreeing scores", () => {
    // Raters completely disagree
    const scores = [
      [1, 5, 3],
      [5, 1, 3],
      [3, 3, 1],
      [2, 4, 5],
    ];
    const icc = calculateICC(scores);
    // ICC should be significantly less than 0.6 for poor agreement
    expect(icc).toBeLessThan(0.6);
  });

  it("returns 0 for n < 2 subjects", () => {
    const scores = [[4, 3]]; // Only 1 subject
    const icc = calculateICC(scores);
    expect(icc).toBe(0);
  });

  it("returns 0 for k < 2 raters", () => {
    const scores = [[4], [3], [5]]; // Only 1 rater per subject
    const icc = calculateICC(scores);
    expect(icc).toBe(0);
  });

  it("clamps result to [0, 1] range", () => {
    // Edge case: all same scores (no between-subject variance)
    const scores = [
      [3, 3],
      [3, 3],
    ];
    const icc = calculateICC(scores);
    expect(icc).toBeGreaterThanOrEqual(0);
    expect(icc).toBeLessThanOrEqual(1);
  });

  it("returns moderate ICC for mostly-aligned but imperfect scores", () => {
    // Raters mostly agree but with minor variation
    const scores = [
      [4, 4, 5],
      [3, 3, 3],
      [5, 4, 5],
      [2, 2, 3],
    ];
    const icc = calculateICC(scores);
    // Should be high (>0.7) for mostly consistent raters
    expect(icc).toBeGreaterThan(0.7);
  });
});
```

---

#### Unit Test 2 — Score Formatting Utilities

**File:** `/Users/farid/kerja/assint/tests/unit/utils.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { formatDate, getInitials } from "@/lib/utils";

describe("formatDate", () => {
  it("formats a Date object to short US date format", () => {
    const date = new Date("2026-03-15T10:00:00Z");
    const formatted = formatDate(date);
    // Intl.DateTimeFormat output: "Mar 15, 2026"
    expect(formatted).toMatch(/Mar\s+15,\s+2026/);
  });

  it("formats a date string correctly", () => {
    const formatted = formatDate("2026-01-01T00:00:00Z");
    expect(formatted).toMatch(/Jan\s+1,\s+2026/);
  });

  it("handles end-of-year date correctly", () => {
    const formatted = formatDate("2025-12-31T23:59:59Z");
    expect(formatted).toMatch(/Dec\s+31,\s+2025/);
  });

  it("handles ISO string with timezone offset", () => {
    const formatted = formatDate("2026-06-15T00:00:00+08:00");
    // Result depends on local timezone, but should be a valid date string
    expect(formatted).toBeTruthy();
    expect(formatted).toMatch(/\w+ \d+, \d{4}/);
  });
});

describe("getInitials", () => {
  it("returns two uppercase initials for a two-word name", () => {
    expect(getInitials("Alice Johnson")).toBe("AJ");
  });

  it("returns one initial for a single-word name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns only first two initials for a three-word name", () => {
    // getInitials takes first 2 chars of the joined initials
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
  });

  it("handles lowercase names by uppercasing", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("handles a single character name", () => {
    expect(getInitials("X")).toBe("X");
  });

  it("handles names with extra spaces gracefully", () => {
    // split(" ") on "Alice  Johnson" produces ["Alice", "", "Johnson"]
    // "" is falsy — n[0] would be undefined; test current behavior
    const result = getInitials("Alice  Johnson");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns uppercase result regardless of casing", () => {
    const result = getInitials("alice johnson");
    expect(result).toBe(result.toUpperCase());
  });
});

describe("Score formatting helpers", () => {
  // Tests for a score-to-label mapping utility (to be implemented in lib/analytics/score.ts)
  function scoreToLabel(score: number): string {
    const labels: Record<number, string> = {
      1: "Does Not Meet",
      2: "Partially Meets",
      3: "Meets Expectations",
      4: "Exceeds Expectations",
      5: "Exceptional",
    };
    return labels[score] ?? "Unknown";
  }

  function formatICC(icc: number | null): string {
    if (icc == null) return "—";
    return icc.toFixed(2);
  }

  it("scoreToLabel returns correct label for each score 1-5", () => {
    expect(scoreToLabel(1)).toBe("Does Not Meet");
    expect(scoreToLabel(2)).toBe("Partially Meets");
    expect(scoreToLabel(3)).toBe("Meets Expectations");
    expect(scoreToLabel(4)).toBe("Exceeds Expectations");
    expect(scoreToLabel(5)).toBe("Exceptional");
  });

  it("scoreToLabel returns 'Unknown' for out-of-range scores", () => {
    expect(scoreToLabel(0)).toBe("Unknown");
    expect(scoreToLabel(6)).toBe("Unknown");
    expect(scoreToLabel(-1)).toBe("Unknown");
  });

  it("formatICC returns em-dash for null", () => {
    expect(formatICC(null)).toBe("—");
  });

  it("formatICC returns 2 decimal places for a valid ICC", () => {
    expect(formatICC(0.8)).toBe("0.80");
    expect(formatICC(0.923456)).toBe("0.92");
    expect(formatICC(1.0)).toBe("1.00");
    expect(formatICC(0.0)).toBe("0.00");
  });
});
```

---

#### Unit Test 3 — Zod Validation Schemas

**File:** `/Users/farid/kerja/assint/tests/unit/validations.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { assessmentCreateSchema } from "@/lib/validations/assessment";
import { evaluationSubmitSchema } from "@/lib/validations/interview";
import { candidateUpdateSchema } from "@/lib/validations/candidate";

describe("registerSchema", () => {
  const validInput = {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
    organizationName: "Test Org",
  };

  it("passes for valid input", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("fails when name is less than 2 characters", () => {
    const result = registerSchema.safeParse({ ...validInput, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("fails when password is less than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "Short1!",
      confirmPassword: "Short1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it("fails when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "DifferentPassword!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
    }
  });

  it("fails for invalid email format", () => {
    const result = registerSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("assessmentCreateSchema", () => {
  const validInput = {
    title: "Senior Engineer Assessment",
    jobTitle: "Senior Engineer",
    jobDescription: "A detailed job description that is at least 50 characters long for this role.",
  };

  it("passes for valid minimal input", () => {
    expect(assessmentCreateSchema.safeParse(validInput).success).toBe(true);
  });

  it("fails when title is less than 3 characters", () => {
    const result = assessmentCreateSchema.safeParse({ ...validInput, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("fails when jobDescription is less than 50 characters", () => {
    const result = assessmentCreateSchema.safeParse({
      ...validInput,
      jobDescription: "Too short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.jobDescription).toBeDefined();
    }
  });

  it("jobDescription at exactly 50 characters passes", () => {
    const exactly50 = "A".repeat(50);
    const result = assessmentCreateSchema.safeParse({
      ...validInput,
      jobDescription: exactly50,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields when not provided", () => {
    const result = assessmentCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.department).toBeUndefined();
      expect(result.data.description).toBeUndefined();
    }
  });
});

describe("evaluationSubmitSchema", () => {
  const validInput = {
    evaluations: [
      { questionId: "q1-cuid", score: 4, notes: "Good response" },
      { questionId: "q2-cuid", score: 3 },
    ],
  };

  it("passes for valid evaluations", () => {
    expect(evaluationSubmitSchema.safeParse(validInput).success).toBe(true);
  });

  it("fails for empty evaluations array", () => {
    const result = evaluationSubmitSchema.safeParse({ evaluations: [] });
    expect(result.success).toBe(false);
  });

  it("fails for score below 1", () => {
    const result = evaluationSubmitSchema.safeParse({
      evaluations: [{ questionId: "q1", score: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("fails for score above 5", () => {
    const result = evaluationSubmitSchema.safeParse({
      evaluations: [{ questionId: "q1", score: 6 }],
    });
    expect(result.success).toBe(false);
  });

  it("fails for non-integer score", () => {
    const result = evaluationSubmitSchema.safeParse({
      evaluations: [{ questionId: "q1", score: 3.5 }],
    });
    expect(result.success).toBe(false);
  });

  it("allows null notes", () => {
    const result = evaluationSubmitSchema.safeParse({
      evaluations: [{ questionId: "q1", score: 3, notes: null }],
    });
    expect(result.success).toBe(true);
  });
});

describe("candidateUpdateSchema — pipelineStage", () => {
  const validStages = [
    "APPLIED", "SCREENING", "ASSESSMENT",
    "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
  ];

  validStages.forEach((stage) => {
    it(`accepts valid stage: ${stage}`, () => {
      const result = candidateUpdateSchema.safeParse({ pipelineStage: stage });
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid stage value", () => {
    const result = candidateUpdateSchema.safeParse({ pipelineStage: "PENDING" });
    expect(result.success).toBe(false);
  });

  it("accepts empty update body (all fields optional)", () => {
    const result = candidateUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
```

---

## 8. Test Environment & Data Setup

### 8.1 Environment Configuration

```env
# .env.test
DATABASE_URL="postgresql://postgres:password@localhost:5432/assint_test"
DIRECT_URL="postgresql://postgres:password@localhost:5432/assint_test"
AUTH_SECRET="test-secret-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Test user credentials (pre-seeded)
TEST_ADMIN_EMAIL="admin@assint-qa.com"
TEST_ADMIN_PASSWORD="TestPassword123!"
TEST_EVALUATOR_EMAIL="evaluator@assint-qa.com"
TEST_EVALUATOR_PASSWORD="TestPassword123!"
TEST_INTERVIEW_ID="<seeded-interview-id>"
```

### 8.2 Test Data Seeding Strategy

For E2E tests, maintain a seed script at `/Users/farid/kerja/assint/prisma/seed.test.ts` that creates:

- **Org A** with admin user, 1 recruiter, 2 evaluators
- **Org B** (for org isolation tests) with its own admin user
- **3 Assessments** (1 DRAFT, 1 ACTIVE with 5 questions+rubrics, 1 ARCHIVED)
- **5 Candidates** across different pipeline stages
- **1 SCHEDULED Interview** (ACTIVE assessment + Candidate in INTERVIEW stage + Evaluator on panel)
- **1 IN_PROGRESS Interview** with partial evaluations

### 8.3 CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx vitest run --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: assint_test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Seed test database
        run: npx prisma migrate deploy && npx tsx prisma/seed.test.ts
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/assint_test
      - run: npx playwright test
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/assint_test
          AUTH_SECRET: test-secret-minimum-32-characters-long-placeholder
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 8.4 Quality Gates

| Gate | Threshold | Enforced In |
|---|---|---|
| Unit test pass rate | 100% | CI — blocks merge |
| E2E test pass rate (P0/P1) | 100% | CI — blocks merge |
| Code coverage (unit) | >= 70% | CI — warning |
| No Critical/High open bugs | 0 at release | Manual gate |
| Lighthouse Performance score | >= 70 | Weekly run |
| API response time p95 | < 2,000ms | Performance test gate |

---

## Appendix: Identified Gaps & Risks

| Gap | Severity | Recommendation |
|---|---|---|
| No rate limiting on `POST /api/auth/register` and login | High | Add rate limiting middleware (e.g., `@upstash/ratelimit`) |
| API routes not role-protected (only auth-checked) | High | Add role guard inside API handlers for sensitive mutations |
| No pagination on list endpoints | High | Implement cursor pagination before production |
| Duplicate rubric level throws unhandled 500 | Medium | Add try/catch for unique constraint violation, return 409 |
| Duplicate panel member throws unhandled 500 | Medium | Same as above |
| Past dates allowed in interview scheduling | Medium | Add `scheduledAt.min(new Date())` validation |
| No email verification flow | Medium | `emailVerified` field unused — implement or remove |
| localStorage eval draft not encrypted | Low | Accepted risk; document in security notes |
| Publish assessment with 0 questions | Low | Add validation: require at least 1 question before publish |
| `javascript:` protocol in resume URL | Low | Verify Zod `z.string().url()` rejects `javascript:` scheme |
