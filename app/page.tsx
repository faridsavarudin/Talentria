import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeInterviewDemo } from "@/components/landing/PracticeInterviewDemo";
import { PipelineKanbanDemo } from "@/components/landing/PipelineKanbanDemo";
import { ASSESSMENT_LIST, COLOR_MAP, ICON_LABEL } from "@/lib/assessments-data";

// ── Data ───────────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "94%", label: "reduction in evaluator bias" },
  { value: "3.2×", label: "faster time-to-hire" },
  { value: "0.87", label: "avg. ICC after calibration" },
  { value: "4/5ths", label: "adverse impact rule enforced" },
];

const COMPANIES = [
  "ACME CORP",
  "VERITAS HR",
  "TALENTEDGE",
  "RECRUIT.AI",
  "HIREFAST",
  "PEOPLE OPS",
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For solo hiring managers exploring structured interviews.",
    cta: "Start Free",
    ctaHref: "/register",
    featured: false,
    features: [
      "3 active assessments",
      "Up to 5 evaluators",
      "Basic ICC reports",
      "Candidate feedback reports",
      "Email support",
    ],
  },
  {
    name: "Starter",
    price: "$49",
    period: "/ month",
    description: "For growing teams running structured hiring at scale.",
    cta: "Start free trial",
    ctaHref: "/register",
    featured: true,
    features: [
      "Unlimited assessments",
      "Up to 25 evaluators",
      "Advanced ICC & bias analytics",
      "AI-powered question builder",
      "Evaluator calibration training",
      "Priority support",
    ],
  },
  {
    name: "Professional",
    price: "$149",
    period: "/ month",
    description: "For enterprise teams requiring deep analytics and compliance.",
    cta: "Contact Sales",
    ctaHref: "/register",
    featured: false,
    features: [
      "Everything in Starter",
      "Unlimited evaluators",
      "Multi-brand workspaces",
      "Adverse impact compliance reports",
      "HRIS integrations",
      "Dedicated customer success",
      "SLA guarantee",
    ],
  },
];

// ── Feature data ───────────────────────────────────────────────────────────────
const FEATURES = [
  // ── ATTRACT ──────────────────────────────────────────────────────────────────
  {
    label: "TALENT ACQUISITION",
    labelColor: "text-amber-600",
    headline: "One pipeline. Every role. Zero spreadsheets.",
    body: "Post a job, invite candidates, and track every application from first touch to offer — inside AssInt. No patchwork of inboxes, sheets, and Slack threads. Your entire hiring operation in one structured workspace.",
    points: [
      "Job posting management with status controls",
      "Candidate applications with one-click pipeline movement",
      "Automated email invites and deadline tracking",
    ],
    visual: <TalentAcquisitionVisual />,
    reverse: false,
    bg: "bg-white",
  },
  // ── ASSESS ───────────────────────────────────────────────────────────────────
  {
    label: "TALENT ASSESSMENT",
    labelColor: "text-amber-600",
    headline: "Send tests. Get AI-ranked results. Hire faster.",
    body: "Invite candidates to complete structured video or text assessments, set a deadline, and let AssInt score and rank every response automatically. Your shortlist is ready before you open the first answer.",
    points: [
      "One-click invite to individual or bulk candidates",
      "AI scores every response on a 1–5 BARS scale",
      "Auto-ranked candidate list with composite scores",
    ],
    visual: <TalentAssessmentVisual />,
    reverse: true,
    bg: "bg-stone-50",
  },
  {
    label: "ASSESSMENT INVENTORY",
    labelColor: "text-amber-600",
    headline: "Five validated instruments. Ready to deploy.",
    body: "AssInt ships with a library of five psychometrically validated instruments covering vocational fit, cognitive ability, situational judgment, and analytical aptitude. Every instrument maps to a job role competency framework and generates AI-scored candidate reports. No test development required — just select, send, and review.",
    points: [
      "Peer-reviewed psychometric foundations for every instrument",
      "Auto-scored with percentile rankings and narrative summaries",
      "Mix and stack instruments per role for multi-dimensional screening",
    ],
    visual: <AssessmentInventoryVisual />,
    reverse: false,
    bg: "bg-white",
  },
  {
    label: "ASSESSMENT BUILDER",
    labelColor: "text-amber-600",
    headline: "Turn a job description into 20 calibrated questions.",
    body: "Paste any job posting. AssInt maps it to competencies and generates behavioral questions with BARS anchors and scoring rubrics — in under 60 seconds.",
    points: ["Competency-mapped questions", "BARS scoring rubrics included", "Customizable before sending"],
    visual: <AssessmentBuilderVisual />,
    reverse: true,
    bg: "bg-stone-50",
  },
  {
    label: "CALIBRATION TRAINING",
    labelColor: "text-amber-600",
    headline: "Your interviewers need practice. Not on real candidates.",
    body: "Before the first real interview, evaluators complete calibration exercises on anonymized cases. Only certified evaluators score candidates.",
    points: ["Gamified BARS training", "Certification tracking", "Score drift detection"],
    visual: <CalibrationVisual />,
    reverse: false,
    bg: "bg-white",
  },
  // ── DECIDE ───────────────────────────────────────────────────────────────────
  {
    label: "BIAS DETECTION",
    labelColor: "text-rose-600",
    headline: "See adverse impact before it becomes a lawsuit.",
    body: "Automated 4/5ths rule analysis across protected groups. Flagged at the question level and the evaluator level — not just at the hiring decision.",
    points: ["Real-time adverse impact analysis", "Per-evaluator bias flags", "EEOC-defensible audit trail"],
    visual: <BiasDetectionVisual />,
    reverse: true,
    bg: "bg-stone-50",
  },
  {
    label: "RELIABILITY ANALYTICS",
    labelColor: "text-teal-600",
    headline: "Know which evaluators you can trust — and which need coaching.",
    body: "Inter-rater reliability (ICC) tracked in real time. When two evaluators diverge, AssInt surfaces it before a decision is locked.",
    points: ["ICC per evaluator pair", "Divergence alerts", "Trend tracking over time"],
    visual: <ICCVisual />,
    reverse: false,
    bg: "bg-white",
  },
  {
    label: "AI CO-PILOT",
    labelColor: "text-amber-600",
    headline: "The evaluator's silent second opinion.",
    body: "While your interviewer talks, AssInt suggests follow-up questions, flags gaps in coverage, and proposes preliminary scores. The human always decides.",
    points: ["Real-time question suggestions", "Coverage gap detection", "AI-proposed scoring"],
    visual: <AICopilotVisual />,
    reverse: true,
    bg: "bg-stone-50",
  },
  // ── TRUST ────────────────────────────────────────────────────────────────────
  {
    label: "ASSESSMENT INTEGRITY",
    labelColor: "text-amber-600",
    headline: "Fair conditions for every candidate. Automatically.",
    body: "AssInt monitors assessment sessions passively — no invasive video surveillance, no gotcha screenshots. Tab switching, copy-paste attempts, and unusual session patterns are logged as integrity events and surfaced to recruiters in a per-candidate report. Every candidate is assessed under the same conditions, so comparisons are meaningful.",
    points: [
      "Passive monitoring — no live surveillance or recording",
      "Integrity score (0–100) per candidate with event log",
      "Recruiter sees risk level and recommendation, not raw footage",
    ],
    visual: <ProctoringVisual />,
    reverse: false,
    bg: "bg-white",
  },
];

// ── Inline visual mockup components ──────────────────────────────────────────

function TalentAcquisitionVisual() {
  return (
    <div
      role="img"
      aria-label="Talent acquisition pipeline interface preview"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-stone-700">Open Roles</p>
        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
          3 active
        </span>
      </div>

      {/* Active job card — expanded */}
      <div className="rounded-lg border border-amber-200 bg-white p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-stone-800">Senior Product Designer</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Design · Remote · Full-time</p>
          </div>
          <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded shrink-0">
            Active
          </span>
        </div>

        <div className="space-y-1.5">
          {[
            { initials: "SC", name: "Sara Chen", stage: "Screening", stageColor: "bg-amber-100 text-amber-700" },
            { initials: "JO", name: "James Okafor", stage: "Interview", stageColor: "bg-teal-100 text-teal-700" },
            { initials: "PK", name: "Priya K.", stage: "Applied", stageColor: "bg-stone-100 text-stone-600" },
          ].map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 rounded-md bg-stone-50 border border-stone-100 px-2 py-1.5"
            >
              <div className="h-5 w-5 rounded-full bg-stone-300 flex items-center justify-center text-[9px] font-bold text-stone-700 shrink-0">
                {c.initials}
              </div>
              <span className="text-[11px] text-stone-700 flex-1 truncate">{c.name}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${c.stageColor}`}>
                {c.stage}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-1 border-t border-stone-100">
          <span className="text-[10px] text-stone-500">
            <span className="font-bold text-stone-700">12</span> applicants
          </span>
          <span className="text-[10px] text-stone-500">
            <span className="font-bold text-stone-700">5</span> assessed
          </span>
          <span className="text-[10px] text-stone-500">
            Closes <span className="font-bold text-stone-700">Mar 15</span>
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-stone-100 bg-white px-3 py-2 flex items-center justify-between">
        <span className="text-[11px] text-stone-600 font-medium">Backend Engineer — Node.js</span>
        <span className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
          8 applicants
        </span>
      </div>

      <div className="rounded-lg border border-stone-100 bg-white px-3 py-2 flex items-center justify-between">
        <span className="text-[11px] text-stone-600 font-medium">Data Analyst — SQL/Python</span>
        <span className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
          4 applicants
        </span>
      </div>
    </div>
  );
}

function TalentAssessmentVisual() {
  return (
    <div
      role="img"
      aria-label="Talent assessment results interface preview"
      className="rounded-xl border border-stone-200 bg-white p-5 space-y-3"
    >
      <div className="rounded-lg bg-stone-50 border border-stone-100 px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-stone-800">React Engineer Assessment</p>
          <p className="text-[10px] text-stone-500 mt-0.5">5 questions · Video · 90 sec each</p>
        </div>
        <p className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
          8 / 10 completed
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">Candidate</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 text-right">AI Score</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 text-right">Rank</span>
      </div>

      {[
        { initials: "ER", name: "Elena Rodriguez", score: 4.8, rank: 1, rankColor: "text-amber-600 bg-amber-50 border-amber-200" },
        { initials: "DK", name: "Daniel Kim", score: 4.5, rank: 2, rankColor: "text-stone-600 bg-stone-50 border-stone-200" },
        { initials: "AT", name: "Alex Turner", score: 4.1, rank: 3, rankColor: "text-stone-600 bg-stone-50 border-stone-200" },
        { initials: "MW", name: "Marcus W.", score: 3.7, rank: 4, rankColor: "text-stone-400 bg-stone-50 border-stone-100" },
      ].map((c) => (
        <div
          key={c.name}
          className="grid grid-cols-[1fr_auto_auto] gap-2 items-center rounded-lg border border-stone-100 bg-stone-50 px-2.5 py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-600 shrink-0">
              {c.initials}
            </div>
            <span className="text-[11px] text-stone-700 font-medium truncate">{c.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(c.score / 5) * 100}%` }} />
            </div>
            <span className="text-[10px] font-bold text-stone-700 tabular-nums">{c.score}</span>
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${c.rankColor}`}>#{c.rank}</span>
        </div>
      ))}

      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 flex items-start gap-2">
        <div className="h-4 w-4 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[7px] font-bold text-amber-600">AI</span>
        </div>
        <p className="text-[10px] text-stone-600 leading-relaxed">
          Top 2 candidates scored above 4.5. Recommend advancing to structured interview.
        </p>
      </div>
    </div>
  );
}

function AssessmentInventoryVisual() {
  const instruments = [
    { code: "RIASEC", name: "Holland Occupational Themes", category: "Vocational Fit", duration: "12 min", border: "border-violet-200", codeBg: "bg-violet-100 text-violet-700" },
    { code: "CAT", name: "Cognitive Aptitude Test", category: "Cognitive Ability", duration: "20 min", border: "border-teal-200", codeBg: "bg-teal-100 text-teal-700" },
    { code: "VRA", name: "Video Response Assessment", category: "Structured Judgment", duration: "15 min", border: "border-amber-200", codeBg: "bg-amber-100 text-amber-700" },
    { code: "CTA", name: "Competency Trait Appraisal", category: "Personality / Trait", duration: "10 min", border: "border-rose-200", codeBg: "bg-rose-100 text-rose-700" },
    { code: "ART", name: "Applied Reasoning Test", category: "Analytical Reasoning", duration: "18 min", border: "border-blue-200", codeBg: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div
      role="img"
      aria-label="Assessment inventory showing five psychometric instruments"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-2.5"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-stone-700">Instrument Library</p>
        <span className="text-[10px] text-stone-400 font-medium">5 validated</span>
      </div>

      {instruments.map((inst) => (
        <div
          key={inst.code}
          className={`rounded-lg border bg-white px-3 py-2.5 flex items-center gap-3 ${inst.border}`}
        >
          <span className={`text-[10px] font-black px-2 py-1 rounded shrink-0 tabular-nums ${inst.codeBg}`}>
            {inst.code}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-stone-800 truncate">{inst.name}</p>
            <p className="text-[9px] text-stone-500 mt-0.5">{inst.category}</p>
          </div>
          <span className="text-[9px] text-stone-400 shrink-0">{inst.duration}</span>
          <div className="h-5 w-5 rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center shrink-0">
            <span className="text-[10px] text-stone-400 font-bold leading-none">+</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssessmentBuilderVisual() {
  return (
    <div
      aria-label="Assessment builder interface preview"
      role="img"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
    >
      <div className="rounded-lg border border-stone-200 bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Job Description</p>
        <div className="space-y-1">
          <div className="h-2 bg-stone-200 rounded w-full" />
          <div className="h-2 bg-stone-200 rounded w-4/5" />
          <div className="h-2 bg-stone-200 rounded w-3/5" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-semibold py-1">
        <span>↓</span> Generating questions...
      </div>
      {[
        { comp: "Problem Solving", q: "Describe a time you had to work through a complex technical obstacle..." },
        { comp: "Communication", q: "Tell me about a situation where you had to align cross-functional..." },
        { comp: "Adaptability", q: "Walk me through a time when project requirements changed significantly..." },
      ].map((item) => (
        <div key={item.comp} className="rounded-lg border border-stone-200 bg-white p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{item.comp}</span>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">{item.q}</p>
        </div>
      ))}
    </div>
  );
}

function CalibrationVisual() {
  return (
    <div
      aria-label="Calibration training interface preview"
      role="img"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-stone-700">Evaluator Calibration</p>
        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Session 3/5</span>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E7E5E4" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#D97706" strokeWidth="10"
              strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-black text-stone-900">75%</span>
            <span className="text-[10px] text-stone-500">certified</span>
          </div>
        </div>
      </div>
      {[
        { name: "Sarah M.", icc: "0.91", color: "text-green-600", bg: "bg-green-50" },
        { name: "James T.", icc: "0.74", color: "text-amber-600", bg: "bg-amber-50" },
        { name: "Priya K.", icc: "0.51", color: "text-rose-600", bg: "bg-rose-50" },
      ].map((ev) => (
        <div key={ev.name} className="flex items-center justify-between rounded-lg bg-white border border-stone-100 px-3 py-2">
          <span className="text-xs font-medium text-stone-700">{ev.name}</span>
          <span className={`text-xs font-bold ${ev.color} ${ev.bg} px-2 py-0.5 rounded`}>ICC {ev.icc}</span>
        </div>
      ))}
    </div>
  );
}

function BiasDetectionVisual() {
  return (
    <div
      aria-label="Bias detection report preview"
      role="img"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
    >
      <p className="text-xs font-bold text-stone-700">Adverse Impact Analysis</p>
      <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider grid grid-cols-4 gap-2 px-1">
        <span>Group</span><span className="text-center">Pass rate</span><span className="text-center">4/5ths</span><span className="text-center">Status</span>
      </div>
      {[
        { group: "Group A", rate: "82%", ratio: "—", status: "Baseline", sc: "text-stone-500 bg-stone-100" },
        { group: "Group B", rate: "74%", ratio: "0.90", status: "Pass", sc: "text-green-700 bg-green-100" },
        { group: "Group C", rate: "61%", ratio: "0.74", status: "Monitor", sc: "text-amber-700 bg-amber-100" },
        { group: "Group D", rate: "48%", ratio: "0.59", status: "Flag", sc: "text-rose-700 bg-rose-100" },
      ].map((row) => (
        <div key={row.group} className="grid grid-cols-4 gap-2 items-center bg-white border border-stone-100 rounded-lg px-3 py-2">
          <span className="text-xs font-medium text-stone-700">{row.group}</span>
          <span className="text-xs text-center text-stone-600">{row.rate}</span>
          <span className="text-xs text-center text-stone-600">{row.ratio}</span>
          <span className={`text-[10px] font-bold text-center px-1.5 py-0.5 rounded-full ${row.sc}`}>{row.status}</span>
        </div>
      ))}
    </div>
  );
}

function ICCVisual() {
  return (
    <div
      aria-label="ICC reliability analytics preview"
      role="img"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
    >
      <p className="text-xs font-bold text-stone-700">Inter-Rater Reliability</p>
      {[
        { pair: "Sarah M. & James T.", icc: 0.91, label: "Excellent", color: "bg-teal-500" },
        { pair: "James T. & Priya K.", icc: 0.67, label: "Moderate", color: "bg-amber-500" },
        { pair: "Sarah M. & Priya K.", icc: 0.43, label: "Poor", color: "bg-rose-500" },
      ].map((item) => (
        <div key={item.pair} className="bg-white rounded-lg border border-stone-100 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-600">{item.pair}</span>
            <span className="text-xs font-bold text-stone-800 tabular-nums">{item.icc}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.icc * 100}%` }} />
          </div>
          <span className={`text-[10px] font-semibold ${item.color.replace("bg-", "text-")}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function AICopilotVisual() {
  return (
    <div
      aria-label="AI Co-Pilot chat interface preview"
      role="img"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <span className="text-[10px] font-bold text-amber-600">AI</span>
        </div>
        <span className="text-xs font-semibold text-stone-700">AssInt Co-Pilot</span>
        <span className="ml-auto text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Live</span>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
        <p className="text-xs text-stone-700 leading-relaxed">Candidate&apos;s answer lacks a clear <strong>Result</strong>. Consider asking: <em>&ldquo;What was the measurable outcome of that approach?&rdquo;</em></p>
      </div>
      <div className="rounded-xl bg-white border border-stone-200 px-4 py-3">
        <p className="text-xs text-stone-500 leading-relaxed">Coverage gap detected: <strong>Adaptability</strong> competency has not been assessed. Suggested: Q4 — Resilience under change.</p>
      </div>
      <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
        <p className="text-xs text-stone-700 leading-relaxed">Preliminary AI score: <strong>3 / 5</strong> — Answer shows Situation and Action but no Result. Confidence: 79%.</p>
      </div>
    </div>
  );
}

function ProctoringVisual() {
  const events = [
    { type: "Tab switch", count: 2, severity: "warn" },
    { type: "Focus loss", count: 1, severity: "info" },
    { type: "Copy attempt", count: 0, severity: "ok" },
  ];

  return (
    <div
      role="img"
      aria-label="Proctoring integrity report preview"
      className="rounded-xl border border-stone-200 bg-white p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-stone-700">Integrity Report</p>
        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
          Review Recommended
        </span>
      </div>

      <div className="rounded-lg bg-stone-50 border border-stone-100 p-3 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#E7E5E4" strokeWidth="12" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="12"
              strokeDasharray="238.8" strokeDashoffset="71.6" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-stone-900 leading-none tabular-nums">70</span>
            <span className="text-[8px] text-stone-400 mt-0.5">/ 100</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-stone-800">Integrity Score</p>
          <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
            2 flagged events detected. Score reflects minor anomalies only.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 px-1">Event Log</p>
        {events.map((ev) => (
          <div key={ev.type} className="flex items-center justify-between rounded-md bg-stone-50 border border-stone-100 px-2.5 py-1.5">
            <span className="text-[11px] text-stone-600">{ev.type}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-stone-700 tabular-nums">{ev.count}×</span>
              <span className={`h-1.5 w-1.5 rounded-full ${ev.severity === "warn" ? "bg-amber-400" : ev.severity === "info" ? "bg-blue-400" : "bg-stone-300"}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
        <p className="text-[10px] text-amber-800 leading-relaxed">
          <span className="font-bold">Recommendation:</span> Minor anomalies present. Consider asking candidate to re-attempt one question in a supervised session.
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white font-black text-sm">
              A
            </div>
            <span className="text-base font-bold text-stone-900">AssInt</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {["Features", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="btn-amber border-0 rounded-md px-4 h-9 text-sm font-semibold shadow-none">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-dark relative overflow-hidden">
        <div aria-hidden className="hero-grid-overlay pointer-events-none absolute inset-0" />

        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: copy */}
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.1em] mb-6">
                Assessment Intelligence Platform
              </p>
              <div className="w-12 h-0.5 bg-amber-500 mb-8" />

              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black text-white leading-[0.97] tracking-[-0.035em]">
                Hire people.
                <br />
                Not assumptions.
              </h1>

              <p className="mt-7 text-lg text-stone-300 leading-relaxed max-w-lg">
                AssInt gives your hiring team structured interviews, evaluator calibration,
                and real-time bias detection — so every decision is fair, consistent, and defensible.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-start gap-3">
                <Link href="/register">
                  <button className="inline-flex items-center gap-2 btn-amber rounded-md px-6 py-3 text-sm font-bold">
                    Start free — no card needed
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="#features">
                  <button className="inline-flex items-center gap-2 rounded-md border border-stone-600 bg-transparent text-stone-200 hover:border-stone-400 hover:text-white transition-colors px-6 py-3 text-sm font-semibold">
                    See how it works
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: product screenshot */}
            <div className="relative">
              <div
                className="rounded-2xl ring-1 ring-white/10 overflow-hidden shadow-2xl"
                style={{ transform: "rotate(0.5deg)" }}
              >
                <div className="flex h-9 items-center gap-1.5 border-b border-stone-800 bg-stone-900 px-4">
                  {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                    <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                  <div className="ml-4 h-4 flex-1 max-w-xs rounded bg-stone-700/80" />
                </div>
                <div className="bg-[#0f1117] p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Assessments", val: "24", color: "text-amber-400" },
                      { label: "Interviews", val: "12", color: "text-teal-400" },
                      { label: "Avg. ICC", val: "0.87", color: "text-blue-400" },
                      { label: "Pending", val: "8", color: "text-stone-300" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl bg-stone-800/60 border border-stone-700/50 p-3">
                        <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">{m.label}</p>
                        <p className={`text-xl font-bold mt-1 tabular-nums ${m.color}`}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-stone-800/60 border border-stone-700/50 p-4">
                    <p className="text-xs font-semibold text-stone-300 mb-3">Recent Assessments</p>
                    <div className="space-y-2.5">
                      {[
                        { title: "Senior Frontend Engineer", status: "Active", icc: "0.91" },
                        { title: "Product Manager", status: "Draft", icc: "—" },
                        { title: "Data Scientist", status: "Active", icc: "0.78" },
                      ].map((r) => (
                        <div key={r.title} className="flex items-center justify-between">
                          <span className="text-xs font-medium text-stone-300">{r.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-stone-500">ICC {r.icc}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${r.status === "Active" ? "bg-teal-900/60 text-teal-400" : "bg-amber-900/60 text-amber-400"}`}>
                              {r.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat bar */}
        <div className="mt-16 border-t border-stone-800 bg-[#292524]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center sm:items-start">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white stat-number">{s.value}</span>
                  <span className="text-xs text-stone-400 mt-1 leading-tight max-w-[110px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="border-y border-stone-200 bg-stone-100 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-6">
            Trusted by people-first companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {COMPANIES.map((c, i) => (
              <span key={c} className="flex items-center gap-10">
                <span className="text-lg font-bold tracking-[-0.05em] text-stone-300 hover:text-stone-500 transition-colors cursor-default select-none">
                  {c}
                </span>
                {i < COMPANIES.length - 1 && (
                  <span aria-hidden className="h-4 w-px bg-stone-300 hidden sm:block" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        {/* Section opener */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">What AssInt Does</p>
          <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight max-w-lg heading-accent">
            Acquire. Assess. Interview. Decide.
          </h2>
          <p className="mt-5 text-lg text-stone-600 max-w-2xl">
            One platform for the full hiring lifecycle — from posting a role to making a defensible, bias-checked offer.
          </p>
        </div>

        {/* Alternating feature rows */}
        {FEATURES.map((f) => (
          <div key={f.label} className={`${f.bg} py-16 sm:py-20`}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
                {/* Text */}
                <div className={f.reverse ? "order-last lg:order-first" : ""}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.1em] mb-3 ${f.labelColor}`}>
                    {f.label}
                  </p>
                  <h3 className="text-3xl font-bold text-stone-900 tracking-tight leading-tight mb-4">
                    {f.headline}
                  </h3>
                  <p className="text-lg text-stone-600 leading-relaxed mb-6">{f.body}</p>
                  <ul className="space-y-2">
                    {f.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2.5 text-sm text-stone-700">
                        <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={f.reverse ? "order-first lg:order-last" : ""}>
                  {f.visual}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Pipeline Demo ── */}
      <PipelineKanbanDemo />

      {/* ── Assessment Library ── */}
      <section className="bg-stone-50 border-y border-stone-200 py-24 sm:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-3">
                Assessment Library
              </p>
              <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight max-w-xl leading-tight">
                Six validated instruments.
                <br />
                Ready in minutes.
              </h2>
              <p className="mt-4 text-lg text-stone-600 max-w-lg leading-relaxed">
                From personality and cognitive ability to vocational interest and
                reasoning — every instrument is psychometrically validated and
                auto-scored by AI.
              </p>
            </div>
            <Link
              href="/assessments-library"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
            >
              View all assessments
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ASSESSMENT_LIST.map((assessment) => {
              const colors = COLOR_MAP[assessment.color];
              const initials = ICON_LABEL[assessment.slug];
              return (
                <Link
                  key={assessment.slug}
                  href={`/assessments-library/${assessment.slug}`}
                  className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200"
                >
                  {/* Icon */}
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${colors.iconBg}`}
                  >
                    <span className={`text-sm font-black ${colors.iconText}`}>
                      {initials}
                    </span>
                  </div>

                  {/* Category chip */}
                  <span
                    className={`mb-2 inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${colors.badge} ${colors.badgeBorder} ${colors.accentText}`}
                  >
                    {assessment.category}
                  </span>

                  {/* Name + tagline */}
                  <h3 className="text-sm font-bold text-stone-900 mb-1.5 leading-snug">
                    {assessment.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed flex-1">
                    {assessment.tagline}
                  </p>

                  {/* Meta chips */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                      <Clock className="h-3 w-3" />
                      {assessment.duration}
                    </span>
                    <span className="text-stone-300 text-[11px]">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                      <List className="h-3 w-3" />
                      {assessment.questions}
                    </span>
                  </div>

                  {/* CTA arrow */}
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-stone-400 group-hover:text-amber-600 transition-colors">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI Practice Interview ── */}
      <PracticeInterviewDemo />

      {/* ── How it works ── */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">How It Works</p>
            <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight">
              From zero to certified hiring process
              <br className="hidden sm:block" /> in one afternoon.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
            {[
              {
                step: "01",
                title: "Acquire candidates",
                description: "Post a role, invite applicants, and manage every pipeline stage — from first application to final offer — in one structured workspace.",
              },
              {
                step: "02",
                title: "Assess with science",
                description: "Send validated psychometric instruments and custom BARS assessments. AI scores every response and ranks candidates before you open a single answer.",
              },
              {
                step: "03",
                title: "Interview with calibration",
                description: "Run calibration exercises so every interviewer scores consistently. Only certified evaluators enter the live interview room.",
              },
              {
                step: "04",
                title: "Decide with confidence",
                description: "ICC dashboards show who to trust. Bias detection flags risky patterns. Make defensible hiring decisions backed by data, not gut feel.",
              },
            ].map((s) => (
              <div key={s.step}>
                <span className="text-7xl font-black text-stone-100 leading-none tabular-nums select-none block">
                  {s.step}
                </span>
                <div className="w-8 h-0.5 bg-amber-500 mt-2 mb-4" />
                <h3 className="text-xl font-bold text-stone-900 mb-2">{s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-stone-50 py-24 sm:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-3">Pricing</p>
            <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight">
              Simple pricing.
              <br />
              No surprises.
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-md">
              Start free. Upgrade when your team needs more. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 items-start">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-7 bg-white ${
                  plan.featured
                    ? "border-2 border-amber-500 shadow-[0_0_0_4px_rgb(245_158_11_/_0.12)] scale-[1.02]"
                    : "border border-stone-200 shadow-sm"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-stone-900 px-3 py-1 text-xs font-bold tracking-wide">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-sm font-semibold text-stone-500">{plan.name}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-stone-900 tabular-nums">{plan.price}</span>
                    <span className="text-sm text-stone-500 ml-1">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-stone-700">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaHref}>
                  <Button
                    className={`w-full font-semibold rounded-md ${
                      plan.featured
                        ? "btn-amber border-0"
                        : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 shadow-none"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="hero-dark relative overflow-hidden py-28 sm:py-36">
        <div aria-hidden className="hero-grid-overlay pointer-events-none absolute inset-0" />
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-12 h-0.5 bg-amber-500 mb-8" />
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[0.97]">
            The fair hire
            <br />
            starts here.
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 btn-amber rounded-md px-6 py-3.5 text-sm font-bold">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-stone-400">
            Already have an account?{" "}
            <Link href="/login" className="text-stone-300 underline underline-offset-2 hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="about" className="bg-stone-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-600 text-white font-black text-xs">
                  A
                </div>
                <span className="text-sm font-bold text-white">AssInt</span>
              </Link>
              <p className="text-sm text-stone-400 leading-relaxed">
                Assessment Intelligence Platform for fair, consistent, and defensible hiring.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-600 mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-stone-400 hover:text-stone-200 transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-600">
              &copy; {new Date().getFullYear()} AssInt. All rights reserved.
            </p>
            <p className="text-xs text-stone-600">Built for fair hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
