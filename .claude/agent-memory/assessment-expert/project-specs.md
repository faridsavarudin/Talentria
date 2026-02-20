# AssInt Full Feature Specifications (Feb 2026)

## Navigation Structure to Add
Sidebar needs: Candidates (/candidates), Pipeline (/pipeline), Interviews (/interviews)

## Missing API Routes Needed
- POST/GET /api/candidates
- GET /api/candidates/[id]
- POST/GET /api/interviews
- GET/PATCH /api/interviews/[id]
- POST /api/interviews/[id]/evaluations (bulk upsert)
- GET /api/interviews/[id]/evaluations
- POST /api/calibration/exercises
- GET /api/calibration/exercises
- POST /api/calibration/exercises/[id]/attempt
- GET /api/analytics/reliability?assessmentId=
- GET /api/analytics/bias?assessmentId=
- POST /api/ai/generate-questions
- POST /api/feedback/generate/[interviewId]

## ICC Formula (Two-Way Mixed, Absolute Agreement)
ICC = (MSB - MSW) / (MSB + (k-1)*MSW + k*(MST-MSW)/n)
Where k = num raters, n = num targets, MSB/MSW/MST = mean squares between/within/total
Simplified for 2 raters: use Pearson r as approximation for small panels
For implementation: collect all [score] arrays per question across evaluators, compute

## Bias Detection Data Model
demographicGroups: string[] (gender, ethnicity, ageGroup, etc.)
For each group: collect candidateIds, compute passRate = passedCount/totalCount
majorityPassRate = max(passRates)
ratio = minorityPassRate / majorityPassRate
Apply 4/5ths: ratio < 0.80 = adverse impact

## AI Question Generation Prompt Structure
System: "You are an expert IO psychologist..."
User: jobTitle + jobDescription + competencies[]
Output: JSON { competency: string, questions: { content, type, rationale, rubricLevels: [{level, label, description, behavioralAnchors[]}] }[] }[]
Model: gpt-4o or claude-3-5-sonnet
Max tokens: 4000

## Calibration Certification Logic
- Per competency: need >= 3 exercises passed (isCalibrated=true)
- Global cert: >= 80% of attempted exercises calibrated
- Expiry: recertify every 90 days (add certifiedUntil field to User)

## Kanban Pipeline Stages
APPLIED -> SCREENING -> ASSESSMENT -> INTERVIEW -> OFFER -> HIRED / REJECTED
Store as: add pipelineStage enum to Candidate model

## Feedback Report Template
Sections: Overview (score, recommendation), Competency Breakdown (per competency score + comments), Strengths, Development Areas, Next Steps
AI version: pass all evaluator notes + scores, ask AI to synthesize
Template version: use score thresholds to pick pre-written text blocks
