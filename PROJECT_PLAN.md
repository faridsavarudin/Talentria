# AssInt - Assessment Intelligence Platform
## Project Plan & Implementation Roadmap

## 🎯 Product Vision

**AssInt** is an AI-powered Assessment Intelligence Platform that helps organizations conduct fair, consistent, and bias-free structured interviews. The platform combines AI-powered interview builders with real-time analytics on evaluator reliability and bias detection.

### Target Users
- **Recruiters**: Create and manage assessments
- **Evaluators**: Conduct interviews and score candidates
- **Admin**: Monitor reliability, detect bias, manage calibration
- **Candidates**: Receive detailed feedback

---

## 📊 Current State

### ✅ Completed
- Database schema (comprehensive Prisma models)
- Landing page
- Auth UI (Login/Register pages)
- Dashboard layouts and navigation
- UI components (shadcn/ui)
- Mock data for assessments page

### ❌ Missing (Critical)
- Working authentication system
- Backend API endpoints
- Database connection and migrations
- Form validation and actual data operations
- Interview flow
- Evaluation scoring system
- Calibration exercises
- Analytics and reporting

---

## 🏗️ Implementation Phases

## **Phase 1: Foundation (Week 1)**
*Goal*: Get basic CRUD operations working with real database

### 1.1 Database & Auth Setup
- [x] Prisma schema already defined
- [ ] Set up database (MySQL)
- [ ] Run migrations
- [ ] Configure NextAuth.js with credentials provider
- [ ] Test registration and login flow
- [ ] Protect dashboard routes with middleware

### 1.2 Assessment Management APIs
- [ ] `POST /api/assessments` - Create assessment
- [ ] `GET /api/assessments` - List assessments
- [ ] `GET /api/assessments/[id]` - Get single assessment
- [ ] `PATCH /api/assessments/[id]` - Update assessment
- [ ] `DELETE /api/assessments/[id]` - Archive assessment

### 1.3 Assessment Creation UI
- [ ] Multi-step form for assessment creation
- [ ] Add competencies dynamically
- [ ] Add questions per competency
- [ ] Define rubric levels (1-5 scale with behavioral anchors)
- [ ] Save as draft or publish

**Success Criteria**: Users can create, view, edit, and list assessments with real data

---

## **Phase 2: Core Interview Flow (Week 2)**
*Goal*: Enable end-to-end interview process

### 2.1 Candidate Management
- [ ] `POST /api/candidates` - Add candidate
- [ ] `GET /api/candidates` - List candidates
- [ ] Candidate profile page
- [ ] Upload resume (optional)

### 2.2 Interview Scheduling
- [ ] `POST /api/interviews` - Schedule interview
- [ ] Assign assessment to candidate
- [ ] Add evaluators to interview panel
- [ ] Set interview date/time
- [ ] Interview list view with filters (scheduled, in-progress, completed)

### 2.3 Evaluation Interface
- [ ] Interview detail page for evaluators
- [ ] Display questions with rubric levels
- [ ] Score each question (1-5)
- [ ] Add notes per question
- [ ] Save and submit evaluation
- [ ] Show all panel members' scores (after submission)

**Success Criteria**: Complete flow from scheduling interview → conducting evaluation → viewing results

---

## **Phase 3: Calibration System (Week 3)**
*Goal*: Train evaluators to score consistently

### 3.1 Calibration Exercise Management
- [ ] `POST /api/calibration/exercises` - Create exercise
- [ ] Video/text sample response
- [ ] Expert score and rationale
- [ ] Link to specific competency

### 3.2 Evaluator Training Flow
- [ ] Calibration exercise list for evaluators
- [ ] Take exercise: watch/read → score → get feedback
- [ ] Compare evaluator score vs expert score
- [ ] Mark as "calibrated" if within ±0.5 points
- [ ] Track certification status per competency

### 3.3 Admin Dashboard for Calibration
- [ ] View evaluator calibration status
- [ ] Track attempts and pass rates
- [ ] Require calibration before allowing real evaluations

**Success Criteria**: Evaluators complete calibration before scoring candidates

---

## **Phase 4: Analytics & Bias Detection (Week 4)**
*Goal*: Provide insights on evaluator reliability and bias

### 4.1 Inter-Rater Reliability
- [ ] Calculate ICC (Intraclass Correlation Coefficient)
- [ ] Per evaluator reliability score
- [ ] Per question variance analysis
- [ ] Flag evaluators with low reliability
- [ ] Generate reliability report

### 4.2 Bias Detection
- [ ] Collect optional demographic data (gender, ethnicity)
- [ ] Calculate pass rates per demographic group
- [ ] Apply 4/5ths rule for adverse impact
- [ ] Flag questions with significant bias
- [ ] Per-evaluator bias analysis
- [ ] Generate bias report

### 4.3 Analytics Dashboard
- [ ] Overview metrics (total assessments, interviews, avg reliability)
- [ ] Reliability trends over time
- [ ] Bias detection alerts
- [ ] Evaluator performance comparison
- [ ] Question-level analytics

**Success Criteria**: Admin can identify unreliable evaluators and biased questions

---

## **Phase 5: Candidate Experience (Week 5)**
*Goal*: Auto-generate feedback for candidates

### 5.1 Feedback Generation
- [ ] Aggregate scores per competency
- [ ] Calculate overall score
- [ ] Generate summary text (template-based or AI)
- [ ] Show strengths and development areas
- [ ] Mark feedback as sent

### 5.2 Candidate Portal (Optional)
- [ ] Candidate login (view feedback only)
- [ ] View interview results
- [ ] Download PDF feedback

**Success Criteria**: Candidates receive clear, competency-based feedback

---

## **Phase 6: AI Features (Week 6+)**
*Goal*: Leverage AI for question generation and insights

### 6.1 AI Interview Builder
- [ ] Integrate OpenAI API
- [ ] Parse job description
- [ ] Extract competencies
- [ ] Generate questions with rubrics
- [ ] Human review and edit before saving

### 6.2 AI-Generated Feedback
- [ ] Use AI to write personalized feedback summaries
- [ ] Highlight patterns in evaluator notes
- [ ] Suggest development actions

### 6.3 Predictive Analytics (Stretch Goal)
- [ ] Predict candidate success based on scores
- [ ] Identify high-performing evaluators
- [ ] Recommend interview panel composition

---

## 🎨 Key Features Summary

| Feature | Description | Priority |
|---------|-------------|----------|
| **Assessment Builder** | Create structured interviews with competencies, questions, and rubrics | P0 |
| **Interview Management** | Schedule interviews, assign evaluators, track status | P0 |
| **Evaluation Scoring** | Evaluators score candidates on 1-5 rubric per question | P0 |
| **Calibration Training** | Train evaluators with sample exercises before live scoring | P1 |
| **Inter-Rater Reliability** | Monitor ICC and flag inconsistent evaluators | P1 |
| **Bias Detection** | Apply 4/5ths rule to detect adverse impact | P1 |
| **Candidate Feedback** | Auto-generate competency-based feedback reports | P2 |
| **AI Interview Builder** | AI-powered question generation from job descriptions | P2 |
| **Multi-Tenant Orgs** | Support multiple organizations with separate data | P2 |
| **Role-Based Access** | Admin, Recruiter, Evaluator, Candidate roles | P0 |

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Auth**: NextAuth.js v5
- **AI**: OpenAI API (for question generation and feedback)
- **Deployment**: Vercel
- **File Storage**: Vercel Blob (for resumes, videos)

---

## 📈 Success Metrics

### Product Metrics
- Time to create assessment: < 15 minutes
- Evaluator calibration pass rate: > 80%
- Average ICC score: > 0.75
- Bias detection alerts per 100 interviews: < 5
- Candidate feedback delivery: < 24 hours after interview

### Technical Metrics
- API response time: < 500ms (p95)
- Page load time: < 2s
- Zero data breaches
- 99.9% uptime

---

## 🚀 Next Steps (Immediate Actions)

1. ✅ Fix Vercel build (already done - added `postinstall: prisma generate`)
2. **Set up MySQL database** (use PlanetScale or Vercel Postgres)
3. **Run `npx prisma migrate dev`** to create tables
4. **Implement auth flow** (registration + login working end-to-end)
5. **Build Assessment CRUD** (create, list, view, edit)
6. **Deploy and test** on Vercel

---

## 📋 Definition of Done (DoD)

For each feature to be considered "done":
- [ ] Backend API implemented and tested
- [ ] Frontend UI connected to real API
- [ ] Form validation (client + server)
- [ ] Error handling
- [ ] Loading states
- [ ] Protected by authentication
- [ ] Responsive design
- [ ] No console errors
- [ ] Deployed to Vercel

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex analytics calculations slow | High | Cache reports, use background jobs |
| AI API costs too high | Medium | Set usage limits, offer manual mode |
| Evaluator adoption low | High | Gamify calibration, show reliability scores |
| Data privacy concerns | Critical | Encrypt PII, GDPR compliance, audit logs |
| Database query performance | Medium | Index key fields, use pagination |

---

## 📞 Key Stakeholders

- **Product Owner**: Define features and priorities
- **Engineering**: Build and deploy
- **Design**: UI/UX for evaluator and candidate flows
- **HR/Recruiting**: Domain expertise and testing
- **Legal/Compliance**: Data privacy and bias regulations

---

*Last Updated*: February 11, 2026
*Status*: Foundation Phase (In Progress)
