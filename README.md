# AssInt - Assessment Intelligence Platform

**Fair, Consistent, and Bias-Free Structured Interviews**

AssInt is an AI-powered assessment platform that helps organizations conduct structured interviews with real-time analytics on evaluator reliability and bias detection.

---

## 🎯 Key Features

### ✅ Currently Available (Phase 1)
- **Assessment Management**: Create and manage structured interview assessments
- **Competency Framework**: Define key competencies for each role  
- **Question Builder**: Add behavioral, situational, and technical questions
- **Rubric System**: Create 1-5 scale rubrics with behavioral anchors
- **Authentication**: Secure login with role-based access (Admin, Recruiter, Evaluator, Candidate)
- **Multi-tenant**: Support for multiple organizations with separate data

### 🚧 Coming Soon
- **Interview Scheduling**: Schedule interviews and assign evaluator panels
- **Evaluation Interface**: Score candidates using defined rubrics
- **Calibration Training**: Train evaluators with sample exercises
- **Inter-Rater Reliability**: Monitor ICC scores and evaluator consistency
- **Bias Detection**: Automated adverse impact analysis (4/5ths rule)
- **Candidate Feedback**: Auto-generated competency-based reports
- **AI Interview Builder**: Generate questions from job descriptions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL database (or use PlanetScale/Vercel Postgres)
- (Optional) Google OAuth credentials

### Installation

1. **Clone and install**
```bash
git clone <your-repo-url>
cd assint
npm install
```

2. **Set up environment variables**

Create a `.env` file:

```env
DATABASE_URL="mysql://user:password@host:port/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
AUTH_GOOGLE_ID="your-google-client-id" # optional
AUTH_GOOGLE_SECRET="your-google-client-secret" # optional
```

3. **Run database migrations**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, TailwindCSS, shadcn/ui
- **Database**: MySQL (via Prisma ORM)
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel

---

## 📖 Quick Start Guide

1. **Register Your Organization**
   - Click "Get Started"
   - First user becomes Admin

2. **Create an Assessment**
   - Go to Assessments → New Assessment
   - Add job details and competencies

3. **Add Questions & Rubrics**
   - Open assessment
   - Add questions with 1-5 scale rubrics
   - Define behavioral anchors

4. **Publish Assessment**
   - Click "Publish Assessment"
   - Ready for interviews!

---

## 🚢 Deployment to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with `git push origin main`

Vercel will automatically run `prisma generate` via the `postinstall` script.

---

## 📈 Roadmap

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed implementation phases.

**Phase 1** ✅ Assessment Management (Complete)  
**Phase 2** 🚧 Interview & Evaluation (Next)  
**Phase 3** 📅 Calibration Training  
**Phase 4** 📅 Analytics & Bias Detection  
**Phase 5** 📅 Candidate Feedback  
**Phase 6** 📅 AI Features  

---

**Made with ❤️ for fair and consistent hiring**
