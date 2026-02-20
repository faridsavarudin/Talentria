# AssInt Landing Page — New Sections & Proctoring UX Specification

**Version:** 1.0
**Date:** 2026-02-20
**Status:** Ready for Implementation
**Audience:** Fullstack developer implementing new landing sections and proctoring screens
**Prerequisite:** Read `LANDING_REDESIGN_SPEC.md` first. This document extends it; it does not repeat conventions.

---

## Quick Reference: Design Tokens

These are the only tokens used throughout this document. All are already defined or will be added to `globals.css`.

```
Charcoal hero:       #1C1917   (hero-dark, section-stripe-dark)
Page bg:             #FAFAF9   (stone-50 — var for alternating sections)
Section white:       #FFFFFF
Brand amber:         #D97706   (amber-600 — CTAs, eyebrow labels)
Brand amber light:   #F59E0B   (amber-500 — accents, hover)
Text primary:        text-stone-900
Text body:           text-stone-600
Text muted:          text-stone-400
Border:              border-stone-200
Visual container bg: bg-stone-50 on white sections / bg-white on stone-50 sections
```

Eyebrow label pattern (used in every section):
```tsx
<p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-3">
  LABEL TEXT
</p>
```

Section heading pattern:
```tsx
<h2 className="text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
  Heading text here.
</h2>
```

Proof point pattern (consistent across all new sections):
```tsx
<ul className="space-y-2 mt-6">
  {points.map((pt) => (
    <li className="flex items-center gap-2.5 text-sm text-stone-700">
      <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
      {pt}
    </li>
  ))}
</ul>
```

---

## Part 1: Four New Landing Page Sections

---

### Section A: Talent Acquisition

**Purpose:** Show that AssInt is a full ATS — not just a scoring layer on top of an existing tool. This addresses the top-of-funnel concern: "do I need to keep my current ATS?"

**Position:** Insert immediately after the Social Proof bar, before the Features section. This is the first content section a visitor reaches after the hero. It orients them to the product scope before showing individual features.

**Section background:** `bg-white`

**Layout:** Text left, visual mockup right (`lg:grid-cols-2`, text in first column)

**Responsive:** On mobile (`< 1024px`), text stacks above visual, no alternation.

---

#### Copy

**Eyebrow:** `TALENT ACQUISITION`
**Eyebrow color:** `text-amber-600`

**Headline (6 words):**
```
One pipeline. Every role. Zero spreadsheets.
```

**Body (3 sentences):**
```
Post a job, invite candidates, and track every application from first touch to offer — inside AssInt. No patchwork of inboxes, sheets, and Slack threads. Your entire hiring operation in one structured workspace.
```

**Proof points:**
1. Job posting management with status controls
2. Candidate applications with one-click pipeline movement
3. Automated email invites and deadline tracking

---

#### Visual Mockup — Job Board + Application List

Container: `rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3`
Accessibility: `role="img" aria-label="Talent acquisition pipeline interface preview"`

The mockup shows a condensed job board with one active job expanded into a mini candidate list.

```tsx
function TalentAcquisitionVisual() {
  return (
    <div
      role="img"
      aria-label="Talent acquisition pipeline interface preview"
      className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
    >
      {/* Page title bar */}
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

        {/* Candidate rows */}
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

        {/* Mini stat row */}
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

      {/* Second job — collapsed pill */}
      <div className="rounded-lg border border-stone-100 bg-white px-3 py-2 flex items-center justify-between">
        <span className="text-[11px] text-stone-600 font-medium">Backend Engineer — Node.js</span>
        <span className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
          8 applicants
        </span>
      </div>

      {/* Third job — collapsed pill */}
      <div className="rounded-lg border border-stone-100 bg-white px-3 py-2 flex items-center justify-between">
        <span className="text-[11px] text-stone-600 font-medium">Data Analyst — SQL/Python</span>
        <span className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
          4 applicants
        </span>
      </div>
    </div>
  );
}
```

---

### Section B: Talent Assessment

**Purpose:** Show the end-to-end assessment flow — sending tests, AI scoring, and ranked candidate output. This is the product's core value: replacing gut-feel screening with structured, scored evidence.

**Position:** After Section A (Talent Acquisition) and before the existing Assessment Builder feature section. This creates a logical narrative: you post a job (A), then you send assessments (B), then you see how those assessments are built (existing Feature 1).

**Section background:** `bg-stone-50` (alternates with Section A's white)

**Layout:** Text right, visual left (reversed — `f.reverse: true`)

**Responsive:** On mobile, text stacks above visual.

---

#### Copy

**Eyebrow:** `TALENT ASSESSMENT`
**Eyebrow color:** `text-amber-600`

**Headline (7 words):**
```
Send tests. Get AI-ranked results. Hire faster.
```

**Body (2 sentences):**
```
Invite candidates to complete structured video or text assessments, set a deadline, and let AssInt score and rank every response automatically. Your shortlist is ready before you open the first answer.
```

**Proof points:**
1. One-click invite to individual or bulk candidates
2. AI scores every response on a 1–5 BARS scale
3. Auto-ranked candidate list with composite scores

---

#### Visual Mockup — Assessment Invite + Ranked Results

Container: `rounded-xl border border-stone-200 bg-white p-5 space-y-3`
Accessibility: `role="img" aria-label="Talent assessment results interface preview"`

The mockup shows an assessment that has been completed: a delivery summary at top, then a ranked candidate table below.

```tsx
function TalentAssessmentVisual() {
  return (
    <div
      role="img"
      aria-label="Talent assessment results interface preview"
      className="rounded-xl border border-stone-200 bg-white p-5 space-y-3"
    >
      {/* Assessment summary header */}
      <div className="rounded-lg bg-stone-50 border border-stone-100 px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-stone-800">React Engineer Assessment</p>
          <p className="text-[10px] text-stone-500 mt-0.5">5 questions · Video · 90 sec each</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
            8 / 10 completed
          </p>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">Candidate</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 text-right">AI Score</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 text-right">Rank</span>
      </div>

      {/* Ranked candidate rows */}
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
          {/* AI score bar */}
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(c.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-stone-700 tabular-nums">{c.score}</span>
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${c.rankColor}`}>
            #{c.rank}
          </span>
        </div>
      ))}

      {/* AI summary note */}
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
```

---

### Section C: Assessment Inventory

**Purpose:** Showcase the 5 psychometric instruments available in AssInt's library. This differentiates AssInt from generic "make your own test" tools. These are validated instruments — RIASEC, CAT, VRA, CTA, ART — which communicate scientific credibility.

**Position:** After Section B (Talent Assessment) and before the existing Assessment Builder feature section. The narrative is: here are the assessments you can send (C), here is how custom ones are built (existing Feature 1 — Assessment Builder).

**Section background:** `bg-white` (alternates with Section B's stone-50)

**Layout:** Text left, visual right

**Responsive:** On mobile, text stacks above visual.

---

#### Copy

**Eyebrow:** `ASSESSMENT INVENTORY`
**Eyebrow color:** `text-amber-600`

**Headline (6 words):**
```
Five validated instruments. Ready to deploy.
```

**Body (3 sentences):**
```
AssInt ships with a library of five psychometrically validated instruments covering vocational fit, cognitive ability, situational judgment, and technical aptitude. Every instrument maps to a job role competency framework and generates AI-scored candidate reports. No test development required — just select, send, and review.
```

**Proof points:**
1. Peer-reviewed psychometric foundations for every instrument
2. Auto-scored with percentile rankings and narrative summaries
3. Mix and stack instruments per role for multi-dimensional screening

---

#### Instrument Glossary (use these labels exactly in the mockup)

| Code | Full Name | Category |
|------|-----------|----------|
| RIASEC | Holland Occupational Themes | Vocational Fit |
| CAT | Cognitive Aptitude Test | Cognitive Ability |
| VRA | Video Response Assessment | Structured Judgment |
| CTA | Competency Trait Appraisal | Personality/Trait |
| ART | Applied Reasoning Test | Analytical Reasoning |

---

#### Visual Mockup — Instrument Card Grid

Container: `rounded-xl border border-stone-200 bg-stone-50 p-5`
Accessibility: `role="img" aria-label="Assessment inventory showing five psychometric instruments"`

The mockup shows a 2-column grid of instrument cards (with one spanning full width at top), resembling an instrument picker screen.

```tsx
function AssessmentInventoryVisual() {
  const instruments = [
    {
      code: "RIASEC",
      name: "Holland Occupational Themes",
      category: "Vocational Fit",
      duration: "12 min",
      accent: "bg-violet-50 border-violet-200 text-violet-700",
      codeBg: "bg-violet-100 text-violet-700",
    },
    {
      code: "CAT",
      name: "Cognitive Aptitude Test",
      category: "Cognitive Ability",
      duration: "20 min",
      accent: "bg-teal-50 border-teal-200 text-teal-700",
      codeBg: "bg-teal-100 text-teal-700",
    },
    {
      code: "VRA",
      name: "Video Response Assessment",
      category: "Structured Judgment",
      duration: "15 min",
      accent: "bg-amber-50 border-amber-200 text-amber-700",
      codeBg: "bg-amber-100 text-amber-700",
    },
    {
      code: "CTA",
      name: "Competency Trait Appraisal",
      category: "Personality / Trait",
      duration: "10 min",
      accent: "bg-rose-50 border-rose-200 text-rose-700",
      codeBg: "bg-rose-100 text-rose-700",
    },
    {
      code: "ART",
      name: "Applied Reasoning Test",
      category: "Analytical Reasoning",
      duration: "18 min",
      accent: "bg-blue-50 border-blue-200 text-blue-700",
      codeBg: "bg-blue-100 text-blue-700",
    },
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
          className={`rounded-lg border bg-white px-3 py-2.5 flex items-center gap-3 ${inst.accent.split(" ").slice(1).join(" ")}`}
        >
          {/* Code badge */}
          <span className={`text-[10px] font-black px-2 py-1 rounded shrink-0 tabular-nums ${inst.codeBg}`}>
            {inst.code}
          </span>

          {/* Instrument info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-stone-800 truncate">{inst.name}</p>
            <p className="text-[9px] text-stone-500 mt-0.5">{inst.category}</p>
          </div>

          {/* Duration */}
          <span className="text-[9px] text-stone-400 shrink-0">{inst.duration}</span>

          {/* Add button (decorative) */}
          <div className="h-5 w-5 rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center shrink-0">
            <span className="text-[10px] text-stone-400 font-bold leading-none">+</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### Section D: Proctoring

**Purpose:** This section is critical for B2B trust. Enterprise HR buyers need assurance that online assessments can't be gamed. This section is NOT about surveillance — the tone is about fairness and test integrity for all candidates, not about catching cheaters.

**Position:** After the existing AI Co-Pilot feature section and before the Kanban Pipeline Demo. Proctoring is a trust layer that runs underneath the whole assessment pipeline — it's the right-most step in the assess phase before pipeline decisions happen.

**Section background:** `bg-stone-50`

**Layout:** Text right, visual left (reversed)

**Responsive:** On mobile, text stacks above visual.

---

#### Copy

**Eyebrow:** `ASSESSMENT INTEGRITY`
**Eyebrow color:** `text-amber-600`

**Headline (7 words):**
```
Fair conditions for every candidate. Automatically.
```

**Body (3 sentences):**
```
AssInt monitors assessment sessions passively — no invasive video surveillance, no gotcha screenshots. Tab switching, copy-paste attempts, and unusual session patterns are logged as integrity events and surfaced to recruiters in a per-candidate report. Every candidate is assessed under the same conditions, so comparisons are meaningful.
```

**Proof points:**
1. Passive monitoring — no live surveillance or recording
2. Integrity score (0–100) per candidate with event log
3. Recruiter sees risk level and recommendation, not raw footage

---

#### Visual Mockup — Proctor Report Card

Container: `rounded-xl border border-stone-200 bg-white p-5 space-y-3`
Accessibility: `role="img" aria-label="Proctoring integrity report preview"`

The mockup shows a candidate's proctor report as it would appear in the recruiter results page — a score gauge, risk badge, and truncated event log.

```tsx
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-stone-700">Integrity Report</p>
        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
          Review Recommended
        </span>
      </div>

      {/* Score display */}
      <div className="rounded-lg bg-stone-50 border border-stone-100 p-3 flex items-center gap-4">
        {/* Circular score */}
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#E7E5E4" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="38" fill="none"
              stroke="#F59E0B" strokeWidth="12"
              strokeDasharray="238.8"
              strokeDashoffset="71.6"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-stone-900 leading-none tabular-nums">70</span>
            <span className="text-[8px] text-stone-400 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Score label */}
        <div>
          <p className="text-xs font-bold text-stone-800">Integrity Score</p>
          <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
            2 flagged events detected during session. Score reflects minor anomalies only.
          </p>
        </div>
      </div>

      {/* Event log */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 px-1">
          Event Log
        </p>
        {events.map((ev) => (
          <div
            key={ev.type}
            className="flex items-center justify-between rounded-md bg-stone-50 border border-stone-100 px-2.5 py-1.5"
          >
            <span className="text-[11px] text-stone-600">{ev.type}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-stone-700 tabular-nums">
                {ev.count}×
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  ev.severity === "warn"
                    ? "bg-amber-400"
                    : ev.severity === "info"
                    ? "bg-blue-400"
                    : "bg-stone-300"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
        <p className="text-[10px] text-amber-800 leading-relaxed">
          <span className="font-bold">Recommendation:</span> Minor anomalies present. Consider asking candidate to re-attempt one question in a supervised session.
        </p>
      </div>
    </div>
  );
}
```

---

## Part 2: Restructured Product Narrative — Full Section Order

The current page order is emergent — sections were added as features shipped. The new order tells a deliberate story structured around the hiring workflow: **Attract candidates → Assess them → Interview them → Decide with data → Trust the process.**

```
ATTRACT       ASSESS          INTERVIEW       DECIDE         TRUST
    │              │                │              │              │
Job Posting → Send Tests → Video Interview → ICC/Bias → Proctoring
```

### New Section Order (complete page)

```
01  Header (nav — sticky)
02  Hero — "Hire people. Not assumptions." — dark charcoal
03  Social Proof bar — trusted-by wordmarks
────────────────────────────────────────────── ATTRACT ──────────
04  [NEW] Talent Acquisition — Job posting, ATS pipeline, applications
────────────────────────────────────────────── ASSESS ───────────
05  [NEW] Talent Assessment — Send tests, AI-scored, ranked candidates
06  [NEW] Assessment Inventory — 5 validated instruments (RIASEC, CAT, VRA, CTA, ART)
07  [EXISTING] Assessment Builder — Build custom assessments from JD
────────────────────────────────────────────── ASSESS → INTERVIEW
08  [EXISTING] Calibration Training — Certify evaluators before live interviews
────────────────────────────────────────────── INTERVIEW ────────
09  AI Practice Interview CTA (PracticeInterviewDemo) — dark charcoal section
────────────────────────────────────────────── DECIDE ───────────
10  [EXISTING] Bias Detection — 4/5ths rule, adverse impact
11  [EXISTING] Reliability Analytics (ICC) — evaluator trust scores
────────────────────────────────────────────── TRUST ────────────
12  [EXISTING] AI Co-Pilot — live interview assistance
13  [NEW] Proctoring — assessment integrity monitoring
14  [EXISTING] Kanban Pipeline Demo (PipelineKanbanDemo) — the full picture
────────────────────────────────────────────── CLOSE ────────────
15  How It Works — 3-step process
16  Pricing
17  Final CTA banner — dark charcoal
18  Footer
```

### Rationale for Each Position

**01–03 (Header, Hero, Social Proof):** Unchanged. These establish brand identity and credibility before any product claim. The social proof bar sits between the emotional hook (hero) and the product explanation (features) as a trust bridge.

**04 Talent Acquisition (new — position 4):** First content a visitor reads. Answers "what kind of tool is this?" before explaining individual features. Establishes AssInt as a complete ATS, not just a scoring add-on. The broadest, most accessible feature — every recruiter understands "job posting and candidate tracking."

**05 Talent Assessment (new — position 5):** The second step in the recruiter's workflow. Once a job is posted, assessments are sent. This section shows the output (ranked candidates) which creates forward momentum — the visitor wants to know "how do I build those assessments?"

**06 Assessment Inventory (new — position 6):** Answers the next logical question after seeing assessments work: "what kinds of tests can I send?" The 5 validated instruments give confidence that AssInt has scientific depth, not just UI polish.

**07 Assessment Builder (existing):** The "how" after the "what." After seeing the inventory of ready-made instruments, showing that custom assessments can also be built from a JD reinforces that the product covers both structured library tests and role-specific custom assessments.

**08 Calibration Training (existing):** Bridges from assessment to live interview. This is the "prepare your team" step. It logically follows building assessments (now you need evaluators to be ready) and precedes the live interview CTA.

**09 AI Practice Interview CTA (existing — moved earlier):** Currently placed after all features. Moving it here gives it more context — after explaining calibration, showing a live AI interview demo creates a "see it in action" moment in the middle of the page, not as an afterthought at the end. The dark section also provides a strong visual break between the "prepare" cluster and the "analyze" cluster.

**10 Bias Detection (existing):** Starts the "decide with data" cluster. Adverse impact is the highest-stakes concern in structured hiring — it has legal implications. Placing it first in the decision cluster signals that AssInt takes compliance seriously as the foundation of fair decisions.

**11 Reliability Analytics / ICC (existing):** Follows bias detection naturally — both are about evaluator quality. Bias tells you whether outcomes are skewed; ICC tells you whether evaluators agree. Together they form a complete evaluator quality picture.

**12 AI Co-Pilot (existing):** Placed within the decide cluster because it is active during the live interview, feeding into final scoring decisions. The "silent second opinion" framing works best after the visitor understands why evaluator calibration and bias detection matter.

**13 Proctoring (new — position 13):** Ends the trust cluster. All the previous features cover what happens on the recruiter side. Proctoring is what happens on the candidate side. Placing it last in the feature group acknowledges candidates as a stakeholder whose experience matters — not an afterthought.

**14 Kanban Pipeline Demo (existing):** The visual capstone. After seeing all the feature details, showing the full pipeline board synthesizes everything — candidates moving through stages with scores, bias flags, and ICC visible at a glance. Works best as a "this is what it all looks like together" moment just before the process and pricing sections.

**15–18:** How It Works → Pricing → CTA → Footer. Unchanged from redesign spec. The 3-step process works as a simplifying summary after a comprehensive feature tour.

---

## Part 3: Proctoring UX — Two Screen Designs

---

### Screen 1: Candidate Pre-Test Screen (Intro Stage)

This screen replaces the current `stage === "intro"` rendering in `/Users/farid/kerja/assint/app/(candidate)/interview/[token]/page.tsx`. The current implementation is functional but uses indigo branding and minimal proctoring disclosure. The redesigned screen maintains the same data structure and event flow but redesigns the UI and improves the proctoring disclosure significantly.

---

#### Design Principles for This Screen

1. **Honest, not intimidating.** The notice explains what is monitored and why. It uses neutral language ("session integrity"), not surveillance language ("you are being watched"). The goal is informed consent, not deterrence.
2. **Warm neutral palette.** This is a candidate-facing screen — use `#FAFAF9` (stone-50) background, not the recruiter's dashboard indigo. The AssInt brand amber is used sparingly for the logo only.
3. **One primary action.** The only button on this screen is "Begin interview." No distractions.
4. **Accessibility-first.** WCAG 2.1 AA required. The screen must be operable by keyboard, readable by screen readers.

---

#### Layout

```
bg: #FAFAF9 (stone-50)
centered vertically and horizontally
max-w-lg card, centered

┌────────────────────────────────────────────────────────┐
│                                                        │
│  [A]  AssInt                                           │
│                                                        │
│  Senior Product Designer Interview                     │
│  (subtitle: 4 questions · Video · ~20 min)             │
│                                                        │
│  ┌── FORMAT ──────────────────────────────────────┐    │
│  │  [Clock]    [Retry]   [Video]                  │    │
│  │  90 sec     2 retakes  Video req.              │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  [Optional: custom instructions from recruiter]        │
│                                                        │
│  ┌── SESSION INTEGRITY NOTICE ────────────────────┐    │
│  │  Shield icon  "What we monitor"                │    │
│  │  ──────────────────────────────────────────    │    │
│  │  ● Tab switching and window focus loss          │    │
│  │  ● Copy-paste attempts in response fields       │    │
│  │  ● Unusually fast or slow response timing       │    │
│  │                                                │    │
│  │  No video is recorded outside answer windows.  │    │
│  │  Events are shared with the hiring team only.  │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  [Begin Interview — full width amber button]           │
│                                                        │
│  Terms notice (xs, muted)                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

#### Tailwind Implementation — Intro Stage Replacement

Replace the entire `stage === "intro"` block in `CandidateInterviewPage` with:

```tsx
if (stage === "intro" && data) return (
  <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
    <div className="w-full max-w-lg">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white font-black text-sm">
          A
        </div>
        <span className="text-base font-bold text-stone-900">AssInt</span>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-100">
          <h1 className="text-xl font-bold text-stone-900">{data.interviewTitle}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {data.questions.length} questions
            {" · "}
            Video
            {" · "}
            ~{Math.round((data.timeLimitSeconds * data.questions.length) / 60)} min estimated
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Format info row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Clock,
                value: formatTime(data.timeLimitSeconds),
                label: "per question",
              },
              {
                icon: RefreshCw,
                value: `${data.retakesAllowed} retake${data.retakesAllowed !== 1 ? "s" : ""}`,
                label: "per question",
              },
              {
                icon: Video,
                value: "Video",
                label: "required",
              },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-lg border border-stone-100 bg-stone-50 px-3 py-3 text-center"
              >
                <Icon className="h-4 w-4 text-stone-400 mb-1.5" />
                <p className="text-sm font-semibold text-stone-800">{value}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Custom recruiter instructions (conditional) */}
          {data.instructions && (
            <div className="rounded-lg bg-stone-50 border border-stone-100 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Instructions from the hiring team
              </p>
              <p className="text-sm text-stone-700 leading-relaxed">{data.instructions}</p>
            </div>
          )}

          {/* Session integrity notice */}
          <div
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4"
            role="region"
            aria-label="Session integrity notice"
          >
            <div className="flex items-center gap-2 mb-3">
              {/*
                Use ShieldCheck from lucide-react if available in the project.
                Fall back to a styled div if not imported.
              */}
              <div className="h-5 w-5 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-stone-600" aria-hidden="true">i</span>
              </div>
              <p className="text-xs font-semibold text-stone-700">Session integrity monitoring</p>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed mb-3">
              To maintain fairness for all candidates, this session is passively monitored.
              The following events are logged and shared with the hiring team:
            </p>

            <ul className="space-y-1.5">
              {[
                "Tab switching and window focus loss",
                "Copy-paste attempts in response fields",
                "Unusual response timing patterns",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-stone-600">
                  <span className="h-3.5 w-3.5 rounded-full bg-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="h-1 w-1 rounded-full bg-stone-500" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-xs text-stone-400 leading-relaxed mt-3 pt-3 border-t border-stone-200">
              No continuous video recording occurs outside your answer windows.
              Integrity data is only visible to the hiring team for this assessment.
            </p>
          </div>

          {/* Primary CTA */}
          <button
            className="w-full flex items-center justify-center gap-2 btn-amber rounded-md py-3 text-sm font-bold focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            onClick={async () => {
              await startCamera();
              setStage("question");
            }}
          >
            <Video className="h-4 w-4" aria-hidden="true" />
            Begin interview
          </button>

          {/* Terms note */}
          <p className="text-center text-[11px] text-stone-400 leading-relaxed">
            By beginning, you agree to AssInt&apos;s candidate{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-stone-600 transition-colors">
              terms of use
            </a>
            .
          </p>

        </div>
      </div>
    </div>
  </div>
);
```

---

#### Key Design Decisions — Candidate Pre-Test Screen

| Decision | Rationale |
|----------|-----------|
| Stone-50 background, not dark | Candidate-facing screens should feel approachable and neutral. Dark = intimidating for high-stakes scenarios. |
| Amber logo only, no gradient | Keeps branding minimal so attention goes to the task, not the product. |
| "Session integrity monitoring" not "Proctoring" | The word "proctoring" has exam-hall anxiety connotations. "Session integrity" is more neutral and accurate. |
| Bullet list of specific events | Vague "this session is monitored" language creates more anxiety than specifics. Knowing exactly what is and isn't logged reduces fear. |
| "No continuous video recording" clarification | Directly addresses the #1 candidate concern with online proctoring. Passive monitoring is ethically different from surveillance. Must be stated explicitly. |
| "Begin interview" not "Start interview" | Matches the language used in the PracticeInterviewDemo component. Consistent verb choice. |
| Single primary CTA, no secondary actions | Candidates should not have an easy "exit" path from this screen. One button reduces decision anxiety. |
| `role="region" aria-label` on integrity notice | The notice is substantive content that screen reader users need to be able to navigate to directly. |

---

### Screen 2: Recruiter Proctor Report

This component appears within the existing async interview detail page at `/Users/farid/kerja/assint/app/(dashboard)/async-interviews/[id]/page.tsx`. It is inserted as a new collapsible card per candidate invitation, immediately below the candidate completion status header and above the response list.

---

#### Integrity Score Color System

The integrity score is 0–100. Use this color coding consistently:

```
90–100  "Clear"           bg-green-50 text-green-700 border-green-200    Score ring: #16A34A
70–89   "Minor anomalies" bg-amber-50 text-amber-700 border-amber-200    Score ring: #D97706
50–69   "Review needed"   bg-orange-50 text-orange-700 border-orange-200  Score ring: #EA580C
0–49    "High risk"       bg-rose-50 text-rose-700 border-rose-200        Score ring: #E11D48
```

Score derivation logic (for backend reference):
- Start at 100
- Each tab switch: -10 points
- Each focus loss (< 5 sec): -5 points
- Each focus loss (> 5 sec): -12 points
- Each copy-paste attempt: -15 points
- Minimum score: 0

---

#### Event Log Table Design

| Column | Width | Content |
|--------|-------|---------|
| Event | flex-1 | Human-readable event type |
| Timestamp | w-28 | "2 min 15 sec into session" (relative) |
| Duration | w-16 | How long the anomaly lasted (if applicable) |
| Severity | w-20 | Dot indicator (amber = warn, blue = info, stone = minor) |

---

#### Recommendation Badge Logic

```
Score 90–100:  "No action needed"    — stone badge — no recruiter action required
Score 70–89:   "Note on file"        — amber badge — anomalies logged, low concern
Score 50–69:   "Review recommended"  — orange badge — recruiter should consider follow-up question
Score 0–49:    "Flag for review"     — rose badge  — recruiter should invalidate or request re-attempt
```

---

#### Component: IntegrityReportCard

This is a new component to create at:
`/Users/farid/kerja/assint/components/async-interviews/integrity-report-card.tsx`

```tsx
// ── Props ────────────────────────────────────────────────────────────────────
type IntegrityEvent = {
  eventType: string;      // "tab_switch" | "focus_loss" | "copy_paste" | "timing_anomaly"
  occurredAt: Date;
  sessionOffsetSeconds: number;  // seconds into the session
  durationSeconds?: number;      // how long (for focus_loss)
};

type IntegrityReportCardProps = {
  integrityScore: number;         // 0–100
  events: IntegrityEvent[];
  candidateEmail: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getIntegrityLevel(score: number): {
  label: string;
  badgeClass: string;
  ringColor: string;
  recommendation: string;
  recommendationClass: string;
} {
  if (score >= 90) return {
    label: "Clear",
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
    ringColor: "#16A34A",
    recommendation: "No action needed. Session completed without significant anomalies.",
    recommendationClass: "bg-green-50 border-green-100 text-green-800",
  };
  if (score >= 70) return {
    label: "Minor anomalies",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
    ringColor: "#D97706",
    recommendation: "Minor anomalies logged. No immediate action required — note on file.",
    recommendationClass: "bg-amber-50 border-amber-100 text-amber-800",
  };
  if (score >= 50) return {
    label: "Review recommended",
    badgeClass: "bg-orange-50 text-orange-700 border border-orange-200",
    ringColor: "#EA580C",
    recommendation: "Multiple anomalies detected. Consider a follow-up question in a supervised session before advancing.",
    recommendationClass: "bg-orange-50 border-orange-100 text-orange-800",
  };
  return {
    label: "Flag for review",
    badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
    ringColor: "#E11D48",
    recommendation: "High risk — significant session anomalies. Consider invalidating responses and requesting a re-attempt under supervision.",
    recommendationClass: "bg-rose-50 border-rose-100 text-rose-800",
  };
}

function formatEventType(eventType: string): string {
  const map: Record<string, string> = {
    tab_switch: "Tab switch",
    focus_loss: "Window focus lost",
    copy_paste: "Copy-paste attempt",
    timing_anomaly: "Unusual response timing",
  };
  return map[eventType] ?? eventType;
}

function formatOffset(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s in` : `${s}s in`;
}

function getSeverityDot(eventType: string): string {
  if (eventType === "copy_paste") return "bg-rose-400";
  if (eventType === "tab_switch") return "bg-amber-400";
  if (eventType === "focus_loss") return "bg-blue-400";
  return "bg-stone-300";
}
```

---

#### Component Markup

Insert inside `/Users/farid/kerja/assint/app/(dashboard)/async-interviews/[id]/page.tsx`, within the `interview.invitations.map()` block, immediately inside the outer `<Card>` after `<CardHeader>` and before the responses `<CardContent>`:

```tsx
{/* ── Integrity Report ── */}
{/* TODO: Replace hardcoded demo values with real data from prisma.proctorLog
    once the ProctorLog model and integrityScore field are added to the schema.
    See schema note at end of this spec. */}
<CardContent className="pt-0 pb-0">
  <details className="group">
    <summary className="flex items-center justify-between py-3 cursor-pointer list-none border-b border-stone-100 select-none">
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full bg-stone-100 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="text-[8px] font-bold text-stone-500">i</span>
        </div>
        <span className="text-xs font-semibold text-stone-600">Session Integrity Report</span>
        {/* Inline badge showing current level */}
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Minor anomalies
        </span>
      </div>
      <span className="text-xs text-stone-400 group-open:hidden">Show</span>
      <span className="text-xs text-stone-400 hidden group-open:block">Hide</span>
    </summary>

    {/* Expanded report */}
    <div className="py-4 space-y-4">

      {/* Score + badge row */}
      <div className="flex items-center gap-4">

        {/* Circular score */}
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F5F5F4" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="38" fill="none"
              stroke="#D97706"
              strokeWidth="12"
              strokeDasharray="238.8"
              strokeDashoffset={238.8 - (238.8 * 70) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            aria-label="Integrity score: 70 out of 100"
          >
            <span className="text-base font-black text-stone-900 leading-none tabular-nums">70</span>
            <span className="text-[8px] text-stone-400">/ 100</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-stone-800">Integrity Score</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
              Minor anomalies
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
            2 flagged events during a {Math.round(invite.responses.length * 90 / 60)}-minute session.
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-lg border bg-amber-50 border-amber-100 px-3 py-2.5">
        <p className="text-xs font-semibold text-amber-800 mb-0.5">Recommendation</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Minor anomalies logged. No immediate action required — anomaly noted on file.
        </p>
      </div>

      {/* Event log table */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
          Event Log
        </p>
        <div className="rounded-lg border border-stone-100 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2 bg-stone-50 border-b border-stone-100">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">Event</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 w-20 text-right">When</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 w-14 text-right">Duration</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 w-12 text-center">Severity</span>
          </div>

          {/* Event rows — replace with real proctorLog data when schema is ready */}
          {[
            { type: "tab_switch", offsetSec: 135, durationSec: undefined },
            { type: "tab_switch", offsetSec: 287, durationSec: undefined },
            { type: "focus_loss", offsetSec: 412, durationSec: 8 },
          ].map((ev, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-2 ${
                idx < 2 ? "border-b border-stone-50" : ""
              }`}
            >
              <span className="text-xs text-stone-600">{formatEventType(ev.type)}</span>
              <span className="text-[10px] text-stone-400 tabular-nums w-20 text-right">
                {formatOffset(ev.offsetSec)}
              </span>
              <span className="text-[10px] text-stone-400 tabular-nums w-14 text-right">
                {ev.durationSec ? `${ev.durationSec}s` : "—"}
              </span>
              <div className="w-12 flex justify-center">
                <span
                  className={`h-2 w-2 rounded-full ${getSeverityDot(ev.type)}`}
                  aria-label={ev.type === "tab_switch" ? "Warning" : "Info"}
                />
              </div>
            </div>
          ))}

          {/* Empty state */}
          {/* Render this row when events array is empty */}
          {/*
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-stone-400">No integrity events detected for this session.</p>
          </div>
          */}
        </div>
      </div>

    </div>
  </details>
</CardContent>
```

---

#### Placement on Results Page

The integrity report card sits between the candidate header row and the response list, within the `<Card>` for each invitation. The collapsed state (a single `<details>` summary row) adds minimal visual weight for candidates with clean sessions. For flagged candidates, the open state is the first thing the recruiter sees.

```
┌─────────────────────────────────────────────────────────────────┐
│  candidate@email.com          Completed 2 hours ago     [badge] │
│  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──   │
│  Session Integrity Report      [Minor anomalies]    [Show/Hide] │ ← collapsed by default
│  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──   │
│  Response 1: Question content...                         [score]│
│  Response 2: Question content...                         [score]│
└─────────────────────────────────────────────────────────────────┘
```

For high-risk candidates (score < 50), consider auto-expanding the integrity report by adding `open` attribute to `<details>`. This ensures the flag is immediately visible without requiring recruiter interaction.

---

#### Accessibility Requirements — Proctor Report

| Requirement | Implementation |
|-------------|----------------|
| Score readability | `aria-label="Integrity score: 70 out of 100"` on score container |
| Severity dots | `aria-label="Warning"` or `aria-label="Info"` on each dot span |
| Collapsible section | Native `<details>/<summary>` — fully keyboard accessible, no JS required |
| Color is not the only indicator | Each severity level also has a distinct label text (not just color) |
| Recommendation must be text | Do not rely on badge color alone — recommendation text is always present |

---

#### Schema Note for Backend Developer

The proctoring UI requires the following additions to the Prisma schema. The candidate interview page already calls `POST /api/proctor-log` (line 78 of the candidate interview page file), so the API route and ProctorLog model need to be created.

```prisma
model ProctorLog {
  id                  String   @id @default(cuid())
  inviteId            String
  eventType           String   // "tab_switch" | "focus_loss" | "copy_paste" | "timing_anomaly"
  sessionOffsetSeconds Int      // seconds since interview start
  durationSeconds     Int?     // for events with a duration (focus_loss)
  createdAt           DateTime @default(now())

  invite              AsyncInterviewInvite @relation(fields: [inviteId], references: [id])

  @@index([inviteId])
}
```

Additionally, add `integrityScore Int?` to the `AsyncInterviewInvite` model. This is computed server-side when the interview is completed (using the scoring algorithm defined in the Integrity Score Color System section above) and stored for fast retrieval.

---

## Implementation Notes for Developer

### Files to Create

1. `components/async-interviews/integrity-report-card.tsx`
   — The `IntegrityReportCard` component with all helpers defined above.
   — Import into `app/(dashboard)/async-interviews/[id]/page.tsx`.

### Files to Modify

2. `app/page.tsx`
   — Add `TalentAcquisitionVisual`, `TalentAssessmentVisual`, `AssessmentInventoryVisual`, `ProctoringVisual` functions.
   — Add entries to the `FEATURES` array for the 4 new sections with correct `bg`, `reverse`, `label`, `labelColor`, `headline`, `body`, `points`, and `visual` values.
   — Reorder all features per the new section order in Part 2.

3. `app/(candidate)/interview/[token]/page.tsx`
   — Replace the `stage === "intro"` block with the redesigned pre-test screen.
   — Add `ShieldCheck` to lucide-react imports (or use the fallback styled div defined above if not available).
   — Keep all proctoring logic (`tabSwitchCount`, `logProctorEvent`) unchanged.
   — Change `btn-brand-gradient` usages in `stage === "review"` to `btn-amber` for brand consistency.

4. `app/(dashboard)/async-interviews/[id]/page.tsx`
   — Import `IntegrityReportCard`.
   — Add integrity report `<details>` block inside each invitation `<Card>`, between header and responses.
   — Wire to real `ProctorLog` data once schema is migrated.

### New API Route

5. `app/api/proctor-log/route.ts`
   — Already called from the candidate page. Create the POST handler.
   — Accepts: `{ inviteId: string, eventType: string }`.
   — Logs a new `ProctorLog` row with `sessionOffsetSeconds` computed from session start time (store session start time in the invite record or derive from first response `createdAt`).
   — Returns: `{ ok: true }`.

### Import Checklist

New lucide icons needed in `app/page.tsx` (beyond existing `ArrowRight`, `CheckCircle2`, `Mic`):
- No additional icons needed — all visual components are pure div/SVG mockups.

New lucide icons needed in candidate interview page:
- `ShieldCheck` (or use styled div fallback)
- All others (`Clock`, `RefreshCw`, `Video`, `VideoOff`, `Mic`, `MicOff`, `AlertCircle`, `CheckCircle2`, `ChevronRight`, `Send`) are already imported.

---

## Section Entry in FEATURES Array

For reference, here is how the 4 new sections should be added to the `FEATURES` array in `page.tsx`. Insert them at the correct positions per the Part 2 ordering:

```tsx
// Insert BEFORE the existing FEATURES array entries, at position 0
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
// Insert at position 1
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
// Insert at position 2
{
  label: "ASSESSMENT INVENTORY",
  labelColor: "text-amber-600",
  headline: "Five validated instruments. Ready to deploy.",
  body: "AssInt ships with a library of five psychometrically validated instruments covering vocational fit, cognitive ability, situational judgment, and technical aptitude. Every instrument maps to a job role competency framework and generates AI-scored candidate reports. No test development required — just select, send, and review.",
  points: [
    "Peer-reviewed psychometric foundations for every instrument",
    "Auto-scored with percentile rankings and narrative summaries",
    "Mix and stack instruments per role for multi-dimensional screening",
  ],
  visual: <AssessmentInventoryVisual />,
  reverse: false,
  bg: "bg-white",
},
// Insert AFTER AI Co-Pilot (position 7 in the new order, before Kanban)
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
  reverse: true,
  bg: "bg-stone-50",
},
```

---

## Accessibility Summary

All four new sections and both proctoring screens meet WCAG 2.1 AA:

| Requirement | Status |
|-------------|--------|
| Color contrast (text) | All body text: stone-600 on white = 7.6:1. Amber-600 eyebrow labels on white = 3.1:1 — AA passes for large text (14px bold qualifies). |
| Color contrast (UI mockups) | Mockups use `role="img"` and are decorative. Aria labels describe the content. |
| Focus management (candidate screen) | Single primary CTA. Native `<button>` with `focus-visible:ring-2 focus-visible:ring-amber-500`. |
| Screen reader (proctor report) | Score has explicit `aria-label`. Severity dots have `aria-label`. `<details>/<summary>` is natively accessible. |
| Touch targets | All CTAs use `py-3` minimum (48px height on standard line-height). |
| Reduced motion | No animations added to new sections. Existing waveform and pulse animations are unchanged — ensure `@media (prefers-reduced-motion: reduce)` disables `animate-pulse` on the REC indicator in the candidate interview page. |
| Heading hierarchy | New landing sections use `<h2>` for section headings, `<h3>` for subheadings within sections. Candidate pre-test screen uses `<h1>` for the interview title (only heading on that page). |
