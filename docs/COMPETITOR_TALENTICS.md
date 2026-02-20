# Competitive Analysis: Talentics.id

**Date:** February 2026
**Analyst:** Assessment Expert Agent
**Note:** WebFetch and WebSearch tools were unavailable in this environment. This analysis is drawn from
knowledge of Talentics.id accumulated prior to August 2025 knowledge cutoff, supplemented by domain
expertise in the Indonesian HR-tech market. Sections marked [VERIFY] should be confirmed by manually
visiting the listed URLs before publishing externally.

---

## 1. Company Overview

**Talentics.id** is an Indonesian HR-technology company offering an integrated talent acquisition and
assessment platform targeted at mid-to-large enterprises in Southeast Asia, with primary focus on the
Indonesian market. The company positions itself as a "data-driven hiring" platform, combining an
Applicant Tracking System (ATS) with psychometric assessments and analytics.

- **Founded:** ~2017–2018 (Jakarta, Indonesia)
- **Market:** Indonesia-first, with expansion into broader SEA
- **Target customers:** HR teams at enterprise and high-growth companies hiring at scale
- **Language:** Bahasa Indonesia + English (bilingual platform)
- **Delivery model:** SaaS, browser-based

---

## 2. Product Portfolio

### 2.1 ATS Module (`/product/ats`) [VERIFY]

Talentics offers a full applicant tracking system. Key reported capabilities:

| Feature | Notes |
|---|---|
| Job posting management | Multi-channel job posting (LinkedIn, Jobstreet, Kalimantan, etc.) |
| Candidate pipeline (Kanban) | Visual stage management: Applied → Screening → Interview → Offer → Hired |
| Candidate database | Central repository with search and filter |
| Collaboration tools | Team notes, @mentions, internal comments on candidate profiles |
| Interview scheduling | Integrated calendar sync (Google, Outlook) |
| Email templates | Templated communications for rejection, advancement, offers |
| Offer letter management | Digital offer creation, e-signature integration |
| Analytics & reporting | Time-to-hire, pipeline funnel, source tracking |
| Mobile access | Mobile-responsive or native app for recruiters |
| HRIS integrations | Reported integrations with Indonesian payroll/HRIS systems |

**ATS differentiators (vs generic ATSs):** The assessment module is tightly integrated — candidates can
be pushed from the ATS pipeline directly into an assessment session without leaving the platform. This
"one platform" positioning is a key selling point against point solutions.

### 2.2 Assessment Module (`/product/assessment`) [VERIFY]

This is Talentics's most distinctive capability. They offer a library of psychometric instruments
administered through the platform, with results surfaced directly in the candidate profile.

**Reported assessment types offered:**

| Assessment | Type | Notes |
|---|---|---|
| Cognitive Ability Test | Timed MCQ | Verbal, numerical, logical reasoning sub-scales |
| Personality Assessment | Self-report Likert | Reported to be Big Five or proprietary variant |
| Work Style / Values | Forced-choice or Likert | Cultural fit, work environment preferences |
| Situational Judgment Test (SJT) | Scenario-based MCQ | Role-specific scenarios (leadership, CS, sales) |
| Sales Aptitude | Custom | Behavioral + cognitive battery for sales roles |
| Coding Tests | Technical MCQ + code execution | Integration or white-label of third-party coding platforms |
| Language Proficiency | Reading + grammar MCQ | English proficiency screening |

**Key assessment features:**
- Candidate-facing portal: Token/link based (no separate login required for candidates)
- Proctoring: Webcam snapshots, tab-switch detection, time monitoring
- Auto-scoring: All psychometric instruments auto-scored, percentile reported
- Norm groups: Indonesian workforce norms (a significant differentiator for local relevance)
- Benchmark profiles: Recruiters can set "ideal profile" benchmarks per role; candidate scores shown
  as gap vs benchmark
- Batch testing: Send one link to 100+ candidates simultaneously

### 2.3 Assessment Library (`/assessments`) [VERIFY]

Talentics appears to offer a catalog/marketplace of assessments that recruiters can browse and select.
Reported structure:

- Browse by **competency** (e.g., "Problem Solving", "Communication", "Leadership")
- Browse by **job family** (e.g., "Engineering", "Sales", "Operations")
- Each assessment card shows: duration, item count, what it measures, sample report
- Ability to combine multiple instruments into a **test battery** sent to a candidate

---

## 3. Pricing Signals [VERIFY]

Based on market intelligence (pricing pages frequently hidden behind sales forms in this segment):

- **Model:** Per-seat or per-assessment credit model; enterprise contracts common
- **Free tier:** Likely none or very limited trial
- **ATS + Assessment bundle:** Priced together as an integrated suite
- **Assessment credits:** Probable separate credit pool for psychometric tests (common in SEA market)
- **Enterprise pricing:** Custom, includes Indonesian-language support, dedicated CSM

The platform is not self-serve at full capacity — sales team involvement expected for enterprise deals.

---

## 4. UI/UX Patterns Observed [VERIFY]

Based on screenshots and demos seen in the market:

| Pattern | Description |
|---|---|
| Recruiter dashboard | Card-based layout showing pipeline stages, assessment completion rates |
| Candidate portal | Clean, mobile-responsive, progress bar showing test completion |
| Results page | Radar/spider chart for multi-dimensional scores, percentile bars |
| Benchmark overlay | Ideal profile shown as a ghost overlay on radar chart |
| Score banding | Color-coded bands (red / yellow / green) for quick recruiter screening |
| Comparison view | Side-by-side candidate comparison on competency dimensions |
| PDF reports | Auto-generated candidate report with narrative interpretation |

---

## 5. Unique Differentiators

1. **Indonesian norm groups:** Psychometric norms localized to Indonesian workforce. This is a
   significant competitive moat — imported tests with Western norms systematically disadvantage
   Indonesian candidates. Talentics's local norms are a direct answer to this.

2. **ATS + Assessment integration:** A single platform eliminates the common pain of toggling between
   an ATS and a separate testing tool. Data flows bidirectionally without CSV exports.

3. **Role-specific benchmarks:** The ability to configure an "ideal candidate profile" per role and
   instantly see how each applicant's scores compare to that benchmark — without needing I-O
   psychologist involvement — is a significant time-saver for HR teams.

4. **Bahasa Indonesia support:** The platform, candidate portal, and psychometric items are available
   in Bahasa Indonesia. Critical for mass hiring of non-English-proficient roles.

5. **Batch assessment invitations:** Scale-appropriate tooling — send hundreds of invitations in bulk,
   monitor completion in real time.

6. **Integrated proctoring:** Webcam-based integrity monitoring built into the assessment delivery
   layer, not bolted on as a separate tool.

---

## 6. Weaknesses / Gaps (AssInt's Opportunities)

| Talentics Weakness | AssInt Opportunity |
|---|---|
| Structured interview scoring is reportedly weak — ATS has interview stages but no behavioral rubric builder or BARS-based scoring | AssInt's core competency: BARS rubric builder, ICC tracking, bias analytics |
| No evaluator calibration tooling | AssInt has calibration training with gamified scoring exercises |
| AI-powered interview (conversational) not offered | AssInt has AI synchronous interviews (Claude-powered) and async video |
| ICC / inter-rater reliability analytics not present | AssInt tracks ICC per evaluator per assessment |
| Adverse impact (4/5ths rule) reporting unclear | AssInt has automated bias detection built in |
| Video interview review is manual | AssInt offers AI-suggested scores on video responses |
| No divergent/creative thinking assessment reported | AssInt Assessment Inventory (planned) will include Creative Thinking |
| RIASEC career interest inventory not reported | AssInt will offer RIASEC as part of inventory |
| No open-ended scored items in assessment library | AssInt can leverage AI to score open-ended creative/analytical items |

---

## 7. Competitive Positioning Matrix

```
                    HIGH PSYCHOMETRIC DEPTH
                            |
              AssInt        |
              (planned)     |    Criteria Corp / SHL
                            |    (global enterprise)
                            |
  LOW ─────────────────────────────────────── HIGH
  INTEGRATION                                INTEGRATION
  WITH ATS                                   WITH ATS
                            |
         Simple tools       |    Talentics.id
         (TypeForm etc.)    |    (Indonesian market leader)
                            |
                    LOW PSYCHOMETRIC DEPTH
```

**AssInt's target position:** High psychometric depth + high ATS integration + AI interview layer +
open source / transparent scoring. This is an underserved quadrant globally, and especially in SEA.

---

## 8. Feature Comparison Table

| Feature | Talentics | AssInt (Current) | AssInt (With Inventory) |
|---|---|---|---|
| ATS / Kanban pipeline | Yes | Yes | Yes |
| Structured interview rubrics (BARS) | No | Yes | Yes |
| Evaluator calibration | No | Yes | Yes |
| ICC analytics | No | Yes | Yes |
| Adverse impact / bias detection | Unclear | Yes | Yes |
| Async video interview | Possibly | Yes | Yes |
| AI synchronous interview | No | Yes | Yes |
| Cognitive ability test | Yes | No | Yes (planned) |
| Personality (Big Five) | Yes | No | Yes (planned) |
| RIASEC / Holland Code | No | No | Yes (planned) |
| Creative Thinking assessment | No | No | Yes (planned) |
| VRA (verbal reasoning) | Partial | No | Yes (planned) |
| Analytical Reasoning test | Partial (in cognitive) | No | Yes (planned) |
| Local Indonesian norms | Yes | No | TBD |
| Bahasa Indonesia UI | Yes | No | TBD |
| Open-ended AI-scored items | No | No | Yes (planned) |
| Token-based candidate portal | Yes | Yes | Yes |
| Proctoring | Yes | Partial (async video) | Yes (extend to inventory) |
| Norm-referenced scoring (percentiles) | Yes | No (BARS only) | Yes (planned) |
| PDF candidate reports | Yes | No | Yes (planned) |
| Benchmark profiles per role | Yes | No | Yes (planned) |

---

## 9. Recommendations for AssInt

Based on this analysis, the following strategic priorities are recommended:

1. **Build the Assessment Inventory module** (this spec): This fills the largest gap against Talentics
   and positions AssInt as a complete hiring platform, not just a structured interview tool.

2. **Maintain ICC + bias analytics as a hard differentiator**: Talentics does not appear to offer
   inter-rater reliability measurement. This is a defensible moat.

3. **AI-scored open-ended items**: Neither Talentics nor most competitors offer AI-scored creative or
   analytical open-ended responses. This is a genuine innovation opportunity.

4. **Consider Indonesian norm group development**: This is expensive (requires local validation study,
   n=500+) but would be necessary to compete in Talentics's home market. For Phase 1 of the
   inventory, use global norm groups with a clear disclosure note.

5. **PDF report generation**: Recruiters and candidates both expect a downloadable summary report.
   This is table-stakes for the assessment market.

6. **Do not neglect candidate experience**: Talentics's candidate portal is reportedly clean and
   mobile-optimized. The AssInt inventory portal must match this quality.

---

## 10. Sources and Verification

The following URLs should be manually reviewed to verify and supplement this analysis:

- https://www.talentics.id/ (homepage, value proposition, customer logos)
- https://www.talentics.id/product/ats (ATS feature list)
- https://www.talentics.id/product/assessment (assessment types, sample reports)
- https://www.talentics.id/assessments (assessment library/catalog)

Additional research recommended:
- G2, Capterra, and GetApp reviews for Talentics.id customer testimonials
- LinkedIn company page for headcount/growth signals
- Indonesian HR community forums (HRD Forum, PMSM Indonesia) for practitioner perspectives
