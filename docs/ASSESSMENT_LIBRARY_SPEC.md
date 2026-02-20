# Assessment Library — Public Marketing Content Specification

**Version:** 1.0
**Date:** February 2026
**Author:** Assessment Expert Agent
**Status:** Ready for Marketing/Frontend Implementation
**Audience:** Frontend developers building the `/assessments` library pages; copywriters reviewing content

---

## Overview and Purpose

This document specifies the complete content for AssInt's public-facing Assessment Library — the
equivalent of `https://www.talentics.id/assessments` in the competitive landscape. It covers:

1. **Library Card Content** — what appears in the grid on `/assessments` (the catalog index page)
2. **Detail Page Content** — the full marketing and education page for each instrument at `/assessments/[slug]`

The audience for these pages is HR directors, talent acquisition leads, and recruitment managers at
mid-to-large companies in Southeast Asia. Write for someone who is educated, time-poor, and skeptical
of vague vendor claims. They want evidence, specifics, and business relevance — not abstract
descriptions of "cutting-edge AI."

**Brand voice guidelines (per Landing Redesign Spec):**
- Direct, confident, precise — the tone of a trusted technical consultant, not a salesperson
- Evidence-anchored — cite research traditions (not cherry-picked studies) when making claims
- Candidate-respecting — always acknowledge that assessments affect real people
- Specific over vague — "78% of Fortune 500 HR teams" is better than "widely used by leading organizations"

**Tailwind palette reference (from global design system):**
- Primary brand: `amber-600` (#D97706) for CTAs and highlights
- Backgrounds: `stone-50` / `stone-100` for card surfaces
- Dark text: `stone-900` / `stone-700`
- Supporting accent colors per instrument (see icon_color in each card spec below)

---

## Part 1: Library Index Page — `/assessments`

### Page-Level Content

**Page title:** `Assessment Library | AssInt`
**Page headline:** `Six scientifically grounded instruments. One integrated pipeline.`
**Page subheadline:**
`Every AssInt assessment is built on established psychometric frameworks, produces percentile-referenced
scores against working adult norms, and integrates directly into your candidate pipeline — no
separate testing platform required.`

**Category filter tabs:** All | Cognitive | Reasoning | Personality | Interest

**Sorting options:** Most Popular | Shortest | Longest | A–Z

---

### 1.1 Library Card: RIASEC Career Interest Inventory

```
slug:          riasec-career-interest
name:          RIASEC Career Interest Inventory
tagline:       Match candidates to roles they will actually stay in — not just perform well at initially.
category:      Interest
duration:      15 min
questions:     66 items
icon_color:    bg-amber-100 text-amber-700
badge:         (none)
```

**Card descriptor (2 lines shown under tagline):**
`Measures vocational interest across six themes: Realistic, Investigative, Artistic, Social,
Enterprising, and Conventional. Predicts job satisfaction and retention, not raw performance.`

---

### 1.2 Library Card: Cognitive Ability Test

```
slug:          cognitive-ability-test
name:          Cognitive Ability Test (CAT)
tagline:       The single strongest predictor of job performance in the selection science literature.
category:      Cognitive
duration:      35 min
questions:     48 items
icon_color:    bg-blue-100 text-blue-700
badge:         Highest Validity
```

**Card descriptor (2 lines shown under tagline):**
`Three timed sub-scales — Verbal, Numerical, and Abstract Reasoning — measure general mental ability
(GMA). Norm-referenced against a working adult population with percentile scores per sub-scale.`

---

### 1.3 Library Card: Verbal Reasoning Assessment

```
slug:          verbal-reasoning-assessment
name:          Verbal Reasoning Assessment (VRA)
tagline:       Go beyond vocabulary tests. Measure how candidates reason with language under pressure.
category:      Reasoning
duration:      20 min
questions:     24 items
icon_color:    bg-teal-100 text-teal-700
badge:         (none)
```

**Card descriptor (2 lines shown under tagline):**
`Covers reading comprehension inference, vocabulary in context, sentence logic, and argument
analysis. Recommended for roles where complex written communication is central to the job.`

---

### 1.4 Library Card: Analytical Reasoning Test

```
slug:          analytical-reasoning-test
name:          Analytical Reasoning Test (ART)
tagline:       Identify candidates who can structure a problem before they try to solve it.
category:      Reasoning
duration:      25 min
questions:     30 items
icon_color:    bg-violet-100 text-violet-700
badge:         (none)
```

**Card descriptor (2 lines shown under tagline):**
`Tests deductive logic, constraint-based reasoning, argument evaluation, data sufficiency, and
causal inference. Strongest predictor for strategy, consulting, operations, and product roles.`

---

### 1.5 Library Card: Creative Thinking Assessment

```
slug:          creative-thinking-assessment
name:          Creative Thinking Assessment (CTA)
tagline:       Measure divergent thinking — the cognitive engine behind genuine innovation.
category:      Cognitive
duration:      25 min
questions:     18 items
icon_color:    bg-rose-100 text-rose-700
badge:         AI-Scored
```

**Card descriptor (2 lines shown under tagline):**
`Open-ended and structured items scored across four dimensions: Fluency, Flexibility, Originality,
and Elaboration. Open-ended responses evaluated by AI with human review flagging.`

---

### 1.6 Library Card: Big Five Personality Inventory

```
slug:          big-five-personality
name:          Big Five Personality Inventory (BFPI)
tagline:       Predict workplace behavior with the most rigorously validated personality model in psychology.
category:      Personality
duration:      12 min
questions:     60 items
icon_color:    bg-green-100 text-green-700
badge:         Scientifically Validated
```

**Card descriptor (2 lines shown under tagline):**
`Measures the OCEAN factors — Openness, Conscientiousness, Extraversion, Agreeableness, and
Neuroticism — with built-in validity scales to detect acquiescent or inconsistent responding.`

---

## Part 2: Detail Pages — `/assessments/[slug]`

---

## 2.1 RIASEC Career Interest Inventory

**Route:** `/assessments/riasec-career-interest`

---

### Hero Section

**Headline (bold, 2–3 lines):**
```
Hire for the role they will
stay in, not just the one
they can perform.
```

**Subtitle paragraph:**
`Most hiring processes optimize for immediate performance. The RIASEC Career Interest Inventory
adds a dimension that performance measures miss entirely: whether a candidate actually wants to do
this kind of work. Based on John Holland's foundational theory of vocational interests — with over
six decades of validation research — RIASEC identifies the type of work environment a person is
drawn to, predicting job satisfaction and long-term retention far better than any competency-based
screen alone.`

**Key stats row:**

| Duration | Items | Best For | Scoring |
|---|---|---|---|
| 15 minutes | 66 items | All career stages | Interest profile + role-fit score |

---

### What It Measures

The RIASEC model classifies vocational interests into six themes arranged on a hexagon. Adjacent
themes are more similar; opposite themes are most different. A candidate's profile is their relative
ranking across all six.

| Theme | What High Scorers Prefer | Representative Roles |
|---|---|---|
| **Realistic (R)** | Hands-on work, tools, machines, the physical world | Engineering, manufacturing, logistics, IT infrastructure |
| **Investigative (I)** | Research, analysis, abstract problem-solving, intellectual inquiry | Data science, medicine, R&D, consulting |
| **Artistic (A)** | Creative expression, originality, ambiguity, aesthetics | Design, copywriting, product, UX, brand |
| **Social (S)** | Helping, teaching, coaching, interpersonal engagement | HR, customer success, training, healthcare |
| **Enterprising (E)** | Leadership, persuasion, business development, competitive achievement | Sales, management, entrepreneurship, BD |
| **Conventional (C)** | Structure, accuracy, data organization, systematic processes | Finance, compliance, administration, operations |

**Important framing note for the page:**
RIASEC measures *interest fit*, not competence. A candidate can score low on Conventional themes and
still be an excellent accountant. This instrument predicts whether they will *want* to come to work
every day — which predicts retention. Use it alongside cognitive and competency-based screens, not
as a standalone filter.

---

### Why Use It

- **Retention is a cost problem.** Voluntary turnover in the first year costs an estimated 50–200% of
  annual salary when onboarding, productivity ramp, and recruitment fees are included. P-E fit
  (person-environment fit) is one of the strongest, most underutilized levers available in the initial
  screening stage.

- **Resumes cannot tell you this.** A candidate can have ten years of accounting experience and deeply
  dislike structured, rule-bound work. Their resume tells you what they have done, not what they want
  to do. RIASEC surfaces that preference before the interview stage.

- **Configurable role benchmarks.** Recruiters define the target Holland Code for a role (e.g., "IC"
  for a Data Scientist). AssInt automatically calculates the hexagonal distance between each candidate's
  profile and the target, producing a 0–100 role-fit score that ranks candidates without adding
  evaluator subjectivity.

- **Fast and non-threatening.** At 15 minutes with no right or wrong answers, RIASEC has the highest
  candidate completion rates of any instrument in the AssInt inventory. It is an appropriate first
  step in any assessment battery.

---

### Who It Is For

**Job levels:** All levels — from fresh graduates to senior individual contributors. Note: for
C-suite and VP-level searches, RIASEC should be contextualized within a broader leadership assessment.

**Use cases:**
- Campus and early-career recruitment (when work history is limited as a signal)
- High-volume screening where quick interest-fit sorting reduces downstream interview waste
- Internal mobility and career development (employees discover fit with new role families)
- Any role where retention risk is a known problem (high-churn functions like sales, customer service)

**Industries:** Applicable across all industries. Particularly valuable in consulting, technology,
finance, healthcare, and any industry running structured early-career programs.

---

### How It Works

**Step 1 — Candidate completes the inventory**
A 66-item Likert questionnaire asks candidates how much they would enjoy each described activity
(1 = Strongly Dislike to 5 = Strongly Like). No time pressure. Typical completion: 8–12 minutes.
Accessible via token link — no candidate login required.

**Step 2 — Automatic scoring and profile generation**
Raw scores are calculated per theme and converted to T-scores (mean=50, SD=10) against a working
adult norm group. The system derives the candidate's Holland Code — their top two or three themes
by score — and plots their hexagonal profile. If the recruiter has configured a role benchmark,
a fit score (0–100) is calculated using the hexagonal distance method.

**Step 3 — Results appear on the candidate profile**
The recruiter sees a hexagonal radar chart with the candidate's profile, a theme score table with
percentiles and band labels (Low / Average / High / Very High), the derived Holland Code, and a
role-fit indicator. An auto-generated narrative describes the candidate's interest pattern in plain
language. The full profile is exportable as PDF.

---

### Sample Insight

> **Candidate: Priya S. — Applied for: Data Analytics Manager**
>
> **Holland Code: IC** (Investigative primary, Conventional secondary)
>
> | Theme | T-Score | Percentile | Band |
> |---|---|---|---|
> | Investigative | 66 | 95th | Very High |
> | Conventional | 58 | 79th | High |
> | Realistic | 51 | 56th | Average |
> | Artistic | 44 | 30th | Below Average |
> | Social | 39 | 16th | Low |
> | Enterprising | 36 | 11th | Low |
>
> **Role Fit Score: 94 / 100** (target code: IC)
>
> **Auto-generated narrative:** "Priya shows a dominant orientation toward analytical inquiry and
> systematic, data-driven work — the IC profile is among the strongest predictors of sustained
> engagement in data-intensive roles. She scores significantly lower on Enterprising and Social
> themes, suggesting a preference for technical depth over people management or business development
> responsibilities. This is consistent with long-term fit as a senior individual contributor or
> technical manager, but may warrant a conversation about career trajectory if this role has a
> management path."

---

### FAQ

**Q: Does RIASEC predict job performance?**
A: Not directly. RIASEC predicts job satisfaction and retention — meaning a good fit candidate is
more likely to stay and grow into the role. Performance prediction comes from cognitive ability and
competency-based assessments (CAT, ART, structured interview). RIASEC is most powerful when used
in combination, not as a standalone screen.

**Q: Can candidates fake their responses?**
A: To some extent, yes — it is a self-report instrument and there are no "correct" answers. However,
there is limited incentive to fake, since candidates rarely know what the target profile is. For roles
where faking is a concern, consider adding a consistency check (pair similar items) or having a brief
discussion of RIASEC results in the interview.

**Q: Is there a right or wrong Holland Code for any job?**
A: No. Holland Codes indicate fit tendencies, not fixed rules. A strong candidate can succeed in
any role. RIASEC results should inform a conversation, not determine a decision.

**Q: How is the role benchmark configured?**
A: Recruiters define the target Holland Code in the battery settings — for example, "SE" for a
Customer Success Manager role, or "IC" for a data analyst. The system calculates the fit score
automatically for every candidate who completes the inventory. Benchmarks can be updated at any time.

**Q: What norm group is used?**
A: Phase 1 uses a published general working adult norm group. The norm group used is disclosed on
every score report. AssInt is developing localized Southeast Asian norms for future releases.

---

---

## 2.2 Cognitive Ability Test (CAT)

**Route:** `/assessments/cognitive-ability-test`

---

### Hero Section

**Headline (bold, 2–3 lines):**
```
The most validated predictor
of job performance in the
selection science literature.
```

**Subtitle paragraph:**
`Meta-analytic research spanning 85 years of personnel selection data consistently identifies general
mental ability as the single strongest predictor of job performance across role types and industries
(Schmidt & Hunter, 1998). The AssInt Cognitive Ability Test measures GMA through three complementary
sub-scales — Verbal, Numerical, and Abstract Reasoning — producing composite and sub-scale scores
norm-referenced against a working adult population. Results are ready in under two hours.`

**Key stats row:**

| Duration | Items | Time Enforcement | Scoring |
|---|---|---|---|
| 35 minutes | 48 items (timed) | Strict per sub-scale | Percentile + 5-band label |

---

### What It Measures

The CAT measures three broad cognitive abilities that together account for the majority of variance
in general mental ability (g):

| Sub-scale | What It Measures | Items | Time |
|---|---|---|---|
| **Verbal Reasoning** | Comprehend written information, draw logical inferences from text, identify conceptual relationships, evaluate arguments | 16 | 10 min |
| **Numerical Reasoning** | Interpret numerical data, tables, and charts; perform ratio, percentage, and proportion calculations; solve quantitative word problems | 16 | 15 min |
| **Abstract Reasoning** | Identify patterns and rules in non-verbal figure sequences; apply inferred rules to novel stimuli; fluid intelligence | 16 | 10 min |

**Why three sub-scales?** Separate sub-scale scores reveal cognitive *strengths and gaps* within a
candidate's profile. A candidate with very high Numerical and low Verbal reasoning is a different
hire for a content role than a candidate with the inverse pattern — even if their composite GMA
scores are identical.

---

### Why Use It

- **Strongest single predictor available.** No other assessment type — personality, structured
  interview, work sample — matches the criterion validity of cognitive ability tests for predicting
  supervisor ratings, training performance, and promotion pace. The CAT belongs at the core of any
  data-driven hiring battery.

- **Scales to any volume.** Where structured interviews require evaluator hours per candidate, the
  CAT screens 500 candidates in the same window it would take to conduct 10 interviews. For
  high-volume hiring, this is the most efficient ROI in the talent acquisition toolkit.

- **Sub-scale scores enable role-specific cutoffs.** A software engineering role may require high
  Abstract scores. A legal role may prioritize Verbal. A finance role, Numerical. AssInt lets
  recruiters configure minimum band thresholds per sub-scale rather than applying a single blunt
  composite cutoff.

- **Integrated adverse impact monitoring.** Cognitive ability tests carry documented adverse impact
  risks across demographic groups. AssInt automatically monitors 4/5ths rule compliance at the
  battery level, flagging when pass rates diverge across groups. This is an ethical and legal
  protection, not just an analytics feature.

---

### Who It Is For

**Job levels:** Entry-level through senior individual contributor. For VP and above, cognitive
ability screening is typically replaced by structured case interviews and leadership assessments.

**Use cases:**
- Technical roles: software engineering, data science, data analysis, IT, finance
- Knowledge-work screening at any seniority where problem-solving is central
- Management trainee and graduate programs where role-specific experience is absent
- Any position where on-the-job training requires fast learning of complex material

**Industries:** Technology, financial services, consulting, FMCG, pharmaceuticals, logistics and
supply chain, manufacturing management roles.

**A note on fairness:** Cognitive ability tests have the highest documented adverse impact of any
common hiring tool. AssInt's position is that this does not mean the CAT should not be used —
it means it should be used thoughtfully: always alongside other assessments, always with a
job-relatedness rationale for any threshold set, and always with ongoing adverse impact monitoring.
We build those guardrails directly into the platform.

---

### How It Works

**Step 1 — Timed, sub-scale-by-sub-scale delivery**
Candidates receive the three sub-scales sequentially: Verbal (10 min), Numerical (15 min), Abstract
(10 min). A countdown timer is visible throughout. Each sub-scale auto-advances on timeout. Candidates
cannot return to a previous sub-scale once it is closed. The test is delivered via secure token link
with tab-switch detection and response-level timestamps logged.

**Step 2 — Automatic scoring and norming**
On submission, raw scores for each sub-scale are calculated (number correct, no penalty for incorrect
answers) and converted to percentiles using the norm table for a working adult population. Composite
GMA percentile is calculated from the total raw score. Band labels (Exceptional / High / Average /
Below Average / Low) are assigned per the standard 5-band system.

**Step 3 — Results on the recruiter dashboard**
The recruiter sees a composite GMA score (percentile + band), a sub-scale bar chart, any threshold
flags (e.g., "Numerical below required High band"), time-on-task data, and an auto-generated
interpretive note. All scores are downloadable as a formatted PDF report.

---

### Sample Insight

> **Candidate: Budi W. — Applied for: Business Intelligence Analyst**
>
> **CAT Composite: 81st percentile — High**
>
> | Sub-scale | Raw Score | Percentile | Band | Threshold |
> |---|---|---|---|---|
> | Verbal Reasoning | 13 / 16 | 74th | Average | Met |
> | Numerical Reasoning | 15 / 16 | 93rd | Exceptional | Met (required: High) |
> | Abstract Reasoning | 12 / 16 | 68th | Average | Met |
>
> **Time on task:** 31 of 35 minutes used. 0 unanswered items.
>
> **Auto-generated narrative:** "Budi demonstrates exceptional numerical reasoning (93rd percentile),
> making him well-suited for data-intensive analytical work. Verbal and Abstract scores are solidly
> average — sufficient for the BI Analyst role where quantitative fluency is the primary cognitive
> demand. No threshold flags. Recommend advancing to the structured interview stage."

---

### FAQ

**Q: Why is the test strictly timed?**
A: Cognitive ability tests are designed to be speeded — the time constraint is part of what the test
measures. Under unlimited time, nearly all candidates would answer correctly on easier items, eliminating
the discriminative power that makes the test predictive. Strict timing is a psychometric requirement,
not an arbitrary constraint.

**Q: How does AssInt handle the adverse impact concern?**
A: Three ways. First, we surface adverse impact monitoring automatically — recruiters see 4/5ths rule
compliance data at the battery level. Second, we recommend pairing the CAT with other assessment types
rather than using it as a sole screen. Third, we require recruiters to document a job-relatedness
justification before setting any automatic rejection threshold. Cognitive ability is a powerful tool
that requires responsible use; we build the responsibility into the workflow.

**Q: Are the items adapted for Southeast Asian candidates?**
A: Phase 1 uses items calibrated for a general working adult population, with disclosures about the
norm group. Items are presented in English. We are actively developing localized item banks and
Indonesian-normed versions for future releases.

**Q: Can a high ART or VRA score compensate for a low CAT composite?**
A: Yes, partially. ART and VRA measure constructs that overlap with CAT sub-scales. When building a
battery, AssInt lets you configure weighted composite scores that blend all three instruments. A
recruiter may reasonably decide that exceptional ART performance offsets a moderate CAT composite for
a strategy role. The platform supports this judgment — it does not make the call for you.

**Q: What if a candidate claims they need more time for a disability accommodation?**
A: Recruiters can set an extended-time flag per candidate (default: +50% time on each sub-scale) before
the invitation is sent. This is the platform's accommodation mechanism. We recommend having a clear
accommodation request process in the invitation email.

---

---

## 2.3 Verbal Reasoning Assessment (VRA)

**Route:** `/assessments/verbal-reasoning-assessment`

---

### Hero Section

**Headline (bold, 2–3 lines):**
```
Not vocabulary. Reasoning.
How candidates think with
language under real conditions.
```

**Subtitle paragraph:**
`For roles where written communication, policy interpretation, client correspondence, or argument
construction are central to daily work, a 4-item vocabulary sub-scale is insufficient evidence.
The Verbal Reasoning Assessment goes deeper: it measures how candidates extract meaning from dense
text, evaluate argument quality, and draw defensible logical inferences — the skills that separate
adequate from excellent performance in knowledge-intensive professional roles.`

**Key stats row:**

| Duration | Items | Format | Best For |
|---|---|---|---|
| 20 minutes | 24 items (timed) | MCQ + True/False/Cannot Determine | Communication-intensive roles |

---

### What It Measures

Four distinct facets of verbal reasoning, with independent sub-scores:

| Facet | Description | Items |
|---|---|---|
| **Reading Comprehension Inference** | Given a 200–300 word passage, determine whether statements are True, False, or Cannot Be Determined from the text alone. Tests precision of reading and resistance to over-inference. | 10 |
| **Vocabulary in Context** | Identify the closest synonym for an underlined word within a sentence. Measures vocabulary breadth and semantic precision rather than isolated word recall. | 4 |
| **Sentence Completion** | Select the word that makes a sentence logically and stylistically coherent. Measures grammatical reasoning and contextual judgment. | 4 |
| **Argument Analysis** | Given a short argument, identify its underlying assumption, a logical flaw, or the strongest counter-argument. Measures critical thinking applied to language. | 6 |

**Relationship to the CAT:** The VRA is not a replacement for the CAT's Verbal sub-scale — it is a
dedicated deep-dive for roles where verbal ability is the primary cognitive demand. The CAT's 16-item
verbal section is appropriate for baseline screening; the VRA is appropriate when you need
discriminative power at the upper end of the verbal ability distribution.

---

### Why Use It

- **Many roles are won or lost on communication.** In customer-facing, legal, policy, HR, or content
  roles, a professional who cannot reason clearly with complex text creates downstream risk: missed
  contractual nuances, compliance failures, or poorly structured reports that undermine trust with
  stakeholders. The VRA identifies this capability before the hire.

- **Argument analysis predicts more than vocabulary tests.** Standard reading comprehension tests
  measure whether candidates can retrieve information. The VRA's argument analysis items measure whether
  candidates can *evaluate* information — a much stronger predictor of performance in advisory,
  consulting, and leadership roles.

- **Short enough to add to any battery.** At 20 minutes, the VRA adds meaningful signal to a screening
  battery without exceeding candidate time tolerance. When combined with the CAT and ART, total battery
  time is approximately 80 minutes — within the recommended ceiling.

- **Separate sub-scale scores enable targeted interviewing.** A candidate who scores well on
  comprehension but poorly on argument analysis may need different follow-up questions than the inverse
  pattern. VRA sub-scores give interviewers a directed starting point.

---

### Who It Is For

**Job levels:** Graduate through senior professional. The VRA is well-suited for mid-seniority roles
where verbal ability has been the primary selection criterion historically (e.g., legal, policy,
editorial) — bringing structure and quantification to what was previously a gut-feel assessment.

**Use cases:**
- Content, editorial, and copywriting roles
- Legal, compliance, and regulatory affairs
- Human resources and people analytics
- Customer success and account management (complex product, long relationship cycles)
- Public policy, government affairs, and research
- Management consulting and strategy roles

**Industries:** Any knowledge-intensive industry. Particularly high-ROI in legal services, financial
services (compliance teams), publishing, telecommunications, and the public sector.

---

### How It Works

**Step 1 — Timed delivery with passage access**
Candidates read two passages of approximately 250 words each, then answer inference questions about
each passage. Passages remain visible while answering. Vocabulary, sentence, and argument items
follow. The 20-minute timer applies to the whole instrument — candidates manage their own pacing.
Tab-switch detection and response timestamps are logged.

**Step 2 — Scoring and norming**
Each item is scored correct or incorrect. Raw scores are calculated per facet and in total (max 24).
The total raw score is converted to a percentile against a working adult norm group. Four sub-scores
are also reported. Band labels are assigned using the standard 5-band system.

**Step 3 — Results with sub-scale breakdown**
Recruiters see the composite VRA percentile and band, a sub-scale performance table, and — for
roles with configured benchmarks — a recommended minimum band indicator. The interpretive note
highlights specific strengths or gaps relevant to the role profile.

---

### Sample Insight

> **Candidate: Ayu R. — Applied for: Policy and Regulatory Affairs Manager**
>
> **VRA Composite: 87th percentile — High**
>
> | Facet | Score | Percentile |
> |---|---|---|
> | Reading Comprehension Inference | 8 / 10 | 82nd |
> | Vocabulary in Context | 4 / 4 | 98th |
> | Sentence Completion | 3 / 4 | 71st |
> | Argument Analysis | 6 / 6 | 95th |
>
> **Auto-generated narrative:** "Ayu demonstrates exceptional vocabulary precision (98th percentile)
> and perfect argument analysis performance (95th percentile), indicating strong capacity for
> identifying logical gaps in policy arguments and stakeholder communications. Reading comprehension
> inference is high (82nd percentile), though two inference items were answered incorrectly —
> suggesting occasional over-inference beyond what text explicitly supports. This is worth exploring
> in interview for a role requiring precise regulatory interpretation."

---

### FAQ

**Q: What is the difference between the VRA and the CAT's Verbal sub-scale?**
A: The CAT Verbal sub-scale (16 items, 10 minutes) provides a broad screening score sufficient for
most roles. The VRA (24 items, 20 minutes) provides deeper coverage: more passage-based inference
items, dedicated argument analysis, and sub-scale scores that pinpoint specific verbal strengths and
gaps. Use the CAT for initial screening; add the VRA for roles where verbal reasoning is the central
job demand.

**Q: Does vocabulary level create language bias against non-native English speakers?**
A: This is a legitimate concern. The VRA vocabulary items use professional workplace vocabulary
rather than literary or culturally specific idioms. However, any test administered in English will
disadvantage candidates whose first language is not English to some degree. We recommend recruiters
consider whether English-language verbal ability is genuinely a job requirement before including the
VRA. For roles where Bahasa Indonesia proficiency is more relevant, we are developing localized
instrument versions.

**Q: Can candidates see the passages while answering inference questions?**
A: Yes. Passages remain visible throughout the inference item set. This is an intentional design
decision — real-world verbal reasoning tasks almost always allow reference to source material. What
we measure is the quality of reasoning from the text, not memorization of it.

**Q: How does VRA combine with other instruments in a battery composite?**
A: The battery composite score weights are recruiter-configurable. Default weighting in a mixed
battery assigns VRA 20% of the composite when paired with CAT and ART. For roles where verbal
ability is the primary screen, this weight can be increased to 40–50%.

---

---

## 2.4 Analytical Reasoning Test (ART)

**Route:** `/assessments/analytical-reasoning-test`

---

### Hero Section

**Headline (bold, 2–3 lines):**
```
Find candidates who can build
a logical case — not just
execute an existing one.
```

**Subtitle paragraph:**
`Strategy, consulting, operations, product, and policy roles reward a specific cognitive skill: the
ability to take incomplete information, identify what is actually being asked, apply the right
reasoning framework, and reach a defensible conclusion — under time pressure. The Analytical
Reasoning Test measures exactly this, using item types drawn from the same tradition as the LSAT,
GMAT, and GRE analytical sections. The ART separates structured thinkers from talented generalists
before a single interview hour is spent.`

**Key stats row:**

| Duration | Items | Item Types | Best For |
|---|---|---|---|
| 25 minutes | 30 items (timed) | 5 item families | Strategy, consulting, PM, ops, legal |

---

### What It Measures

Five distinct reasoning skills, each with its own item family:

| Item Type | What It Tests | Items |
|---|---|---|
| **Deductive Syllogisms** | Draw the correct logical conclusion from premises involving all/some/none relationships, conditional statements, and categorical logic | 6 |
| **Logical Sequencing and Grouping** | Given a set of constraints (ordering rules, group membership rules, exclusion conditions), determine valid arrangements — the LSAT "logic games" tradition | 6 |
| **Argument Structure Analysis** | Identify the logical flaw in an argument, the assumption it depends on, the evidence that would strengthen or weaken it | 6 |
| **Data Sufficiency** | Determine whether given information is sufficient to answer a question — the GMAT Data Sufficiency tradition. Tests meta-cognition: knowing what you know | 6 |
| **Causal Reasoning** | Identify the most plausible cause, a plausible alternative explanation, a confound, or a flawed causal analogy in a stated relationship | 6 |

**Relationship to CAT Abstract Reasoning:** The CAT's abstract reasoning sub-scale measures pattern
recognition in non-verbal figure sequences — primarily fluid intelligence. The ART measures structured
logical reasoning in verbal-symbolic form. These are distinct (though correlated) abilities. Many
roles require both: use the CAT for fluid intelligence screening and the ART for structured logic.

---

### Why Use It

- **Solves the "smart but disorganized" hiring problem.** High GMA alone does not guarantee that a
  candidate will structure problems clearly, communicate reasoning transparently, or identify flawed
  assumptions in their own arguments. The ART targets those specific skills.

- **Role-critical for consulting, strategy, and operations.** In McKinsey, BCG, and Bain-style
  consulting interviews, structured logical reasoning is explicitly tested via case interviews. The
  ART provides a standardized, scalable version of this same screen — applicable at any hiring volume.

- **Argument analysis identifies critical-thinking maturity.** The argument structure items are among
  the strongest predictors of performance in roles requiring policy evaluation, legal reasoning, or
  executive communication. A senior hire who cannot identify a logical flaw in a business proposal
  represents significant organizational risk.

- **Data sufficiency items screen for intellectual honesty.** Knowing what you do *not* know is a
  rare and valuable attribute, particularly in data-rich organizations where overconfident analysis
  from incomplete data causes strategy failures. Data sufficiency items directly probe this tendency.

---

### Who It Is For

**Job levels:** Mid-level professional through senior leadership. The ART is best suited for roles
where promotion is linked to quality of thinking rather than technical execution speed.

**Use cases:**
- Management consulting and strategy
- Product management and product strategy
- Legal and regulatory roles
- Operations management and process improvement
- Policy analysis and government
- Senior finance and investment analysis
- Business development and M&A

**Industries:** Consulting, technology, financial services, pharmaceuticals/healthcare strategy,
government and multilateral organizations, fast-growth startups hiring general-intelligence generalists.

---

### How It Works

**Step 1 — Timed, sequenced delivery**
30 items are delivered in a single 25-minute timed block. Items are not ordered by difficulty — they
vary by type throughout the test. Candidates cannot go back after advancing. Full-screen mode is
encouraged. Tab-switch events are logged.

**Step 2 — Scoring with sub-scale breakdown**
Each correct answer scores one point (no penalty for incorrect). Raw total (0–30) is converted to a
composite percentile against a working adult norm group. Three sub-scale scores are also provided:
Deductive Logic (items 1–12), Argument Analysis (items 13–24), Causal Reasoning (items 25–30).

**Step 3 — Layered results report**
Recruiters see composite ART percentile and band, sub-scale breakdown bars, and an interpretive
narrative that highlights reasoning profile shape — for example, identifying a candidate who excels
at argument evaluation but struggles with formal constraint-based logic, or vice versa.

---

### Sample Insight

> **Candidate: Marco T. — Applied for: Senior Strategy Analyst**
>
> **ART Composite: 89th percentile — High**
>
> | Sub-scale | Score | Percentile | Band |
> |---|---|---|---|
> | Deductive Logic | 10 / 12 | 84th | High |
> | Argument Analysis | 12 / 12 | 97th | Exceptional |
> | Causal Reasoning | 5 / 6 | 80th | High |
>
> **Auto-generated narrative:** "Marco's exceptional argument analysis performance (97th percentile)
> is a strong indicator of the critical-thinking maturity required for senior strategy roles. His
> deductive logic score is high (84th percentile), though two constraint-satisfaction items were
> missed — suggesting he may work more intuitively than systematically when problems require formal
> rule application. This is worth probing in a case interview. His causal reasoning is strong,
> indicating good instincts for identifying confounds and alternative explanations in business data.
> Recommend advancing with a structured case component to the interview."

---

### FAQ

**Q: How is the ART different from the CAT's Abstract Reasoning sub-scale?**
A: CAT Abstract Reasoning measures fluid intelligence — the ability to identify patterns in
non-verbal geometric sequences. The ART measures structured logical reasoning in language — formal
deduction, argument evaluation, constraint satisfaction. Both are cognitive assessments, but they
tap distinct abilities. For strategy and consulting roles, the ART is typically the more predictive
of the two.

**Q: The LSAT comparison sounds intimidating for candidates who have not taken it. Is that appropriate?**
A: The ART uses item *types* from that tradition — it does not import the full difficulty calibration
of the LSAT. Items are calibrated for a general professional adult population, not for law school
applicants. Candidates who have never encountered data sufficiency items will complete them
successfully if they read carefully. The test is fair for candidates without prior exposure.

**Q: Should I use ART and CAT together or choose one?**
A: For most roles, use both. The CAT provides the broader GMA composite; the ART provides depth on
structured reasoning. When battery time is a constraint, the CAT takes priority for breadth; add the
ART when analytical reasoning is the primary job performance driver.

**Q: Are the item types equally weighted in the composite score?**
A: Yes — all 30 items contribute equally to the raw total and thus to the composite percentile.
Sub-scale scores are available but do not independently feed the composite. Recruiters who need to
emphasize one sub-scale can configure battery composite weights accordingly.

---

---

## 2.5 Creative Thinking Assessment (CTA)

**Route:** `/assessments/creative-thinking-assessment`

---

### Hero Section

**Headline (bold, 2–3 lines):**
```
Standard interviews penalize
your most creative candidates.
This one was built for them.
```

**Subtitle paragraph:**
`The STAR method works well for behavioral competencies. It does not work well for divergent thinkers
— candidates whose value lies in their ability to generate unexpected ideas, make non-obvious
connections, and approach problems from angles that structured questions actively discourage. The
Creative Thinking Assessment measures the cognitive dimensions that drive real innovation: not just
how many ideas someone generates, but how original, flexible, and developed those ideas are. Scored
by AI with built-in human review flagging — a genuinely novel capability in the regional assessment
market.`

**Key stats row:**

| Duration | Items | Scoring Method | Best For |
|---|---|---|---|
| 25 minutes | 18 items | AI-scored (open-ended) + keyed (MCQ) | Creative, marketing, product, innovation roles |

---

### What It Measures

Based on Guilford's (1967) Structure of Intellect model and the Torrance Tests of Creative Thinking
(TTCT) framework, the CTA measures four dimensions of divergent thinking:

| Dimension | Definition | How It Is Measured |
|---|---|---|
| **Fluency** | The quantity of relevant, distinct ideas generated in response to an open prompt | Count of valid, non-repetitive responses per item |
| **Flexibility** | The breadth of categories represented across responses — ranging across conceptual space, not drilling within one domain | Count of distinct semantic categories across the response set |
| **Originality** | The statistical infrequency of responses compared to the norm group — ideas that few others think of | AI scoring on a 0–4 scale; anchored to a database of common and unusual responses |
| **Elaboration** | The degree to which ideas are developed, contextualized, and connected — not just listed | AI scoring on a 0–4 scale based on detail, specificity, and extension of ideas |

**A note on AI scoring:** The open-ended CTA items cannot be objectively keyed the way multiple-choice
items are. AssInt uses Claude (Anthropic's frontier language model) to evaluate responses against
the four-dimension rubric. The scoring prompt is explicitly calibrated to evaluate *cognitive
diversity and originality*, not linguistic sophistication or cultural familiarity. Results flagged
for human review are marked with a disclosure badge and available for recruiter override.

---

### Why Use It

- **Structured interviews systematically disadvantage creative candidates.** The STAR format rewards
  sequential, outcome-oriented thinking. Candidates who are best at divergent ideation often describe
  processes as nonlinear, mention dead ends as valuable, and struggle to package their creative work
  into tidy behavioral examples. The CTA creates a structured context where their cognitive strengths
  are visible.

- **Originality is measurable, not just observable.** Most hiring teams attempt to assess creativity
  through portfolio review or subjective "culture fit" impressions — both of which introduce
  evaluator bias. The CTA provides a norm-referenced, quantified originality score that removes
  evaluator subjectivity from the initial screen.

- **Fluency scores predict creative output at work.** Research in organizational creativity (Amabile,
  1996; Runco, 2014) shows that individuals who generate higher volumes of ideas in structured
  exercises also produce more novel solutions in professional contexts. Fluency is not trivial
  quantity — it is a meaningful predictor.

- **AI scoring enables scale.** Open-ended creative assessments were previously impractical for
  volume hiring because they required human scorers. AI scoring makes the CTA viable at any
  candidate volume while maintaining the richness of open-ended response formats.

---

### Who It Is For

**Job levels:** All levels where creative output is central. For entry-level creative roles, CTA
is an excellent substitute for portfolio requirements that disadvantage candidates from under-resourced
backgrounds. For senior roles, CTA provides a baseline for discussion in portfolio or case reviews.

**Use cases:**
- Brand, marketing, and content roles (copywriter, creative director, brand strategist)
- Product management and product design
- Innovation, R&D, and new business development
- Advertising and communications agencies
- UX research and service design
- Entrepreneurial and venture-adjacent roles

**Industries:** Advertising, technology, consumer goods (FMCG), media, e-commerce, education
(curriculum design), consulting (innovation practices).

**Who it is not for:** Roles where process adherence, accuracy, and compliance are the primary
performance drivers. RIASEC Conventional-dominant roles (finance, accounting, data entry,
compliance) should prioritize CAT and ART rather than CTA.

---

### How It Works

**Step 1 — Candidate completes a mix of open-ended and structured items**
The 18-item inventory includes: alternate uses tasks (generate creative uses for a common object),
consequence generation (list outcomes of an unusual hypothetical), structured MCQ items (select the
most original idea from four options), analogical reasoning prompts (complete an analogy in an
unexpected way), and story title generation (write compelling titles for a short excerpt). The overall
25-minute timer runs; no per-item enforcement is applied, which avoids artificially capping fluency.

**Step 2 — Automatic MCQ scoring + AI scoring for open-ended responses**
On submission, MCQ items are keyed immediately. Open-ended responses (12 items) are sent to Claude
with a structured evaluation prompt that scores each response on all four CTA dimensions. Scoring
typically completes within 15 seconds. If the AI's confidence on any item is flagged as ambiguous,
that item is marked for human review. The candidate sees a completion screen; the recruiter is
notified when results are ready.

**Step 3 — Dimensional profile on the candidate record**
Recruiters see a four-dimension bar chart with percentile scores, a CTA composite score (weighted:
Originality 30%, Fluency 30%, Flexibility 25%, Elaboration 15%), sample candidate responses with
the AI's scoring rationale, and a clear AI scoring disclosure badge. The composite and sub-dimension
scores appear on the candidate profile alongside other battery results.

---

### Sample Insight

> **Candidate: Tara H. — Applied for: Brand Strategy Copywriter**
>
> **CTA Composite: 91st percentile — Exceptional**
>
> | Dimension | Score | Percentile | Band |
> |---|---|---|---|
> | Fluency | 82nd | High | — |
> | Flexibility | 68th | Average | — |
> | Originality | 97th | Exceptional | — |
> | Elaboration | 74th | High | — |
>
> **Sample response (Alternate Uses — Paper Clip):**
> *"A sundial for a desk drawer. A bookmark that doubles as a tension-release mechanism when you
> bend it into a spiral. A tiny trellis for moss growing in a bottle garden. Emergency zipper pull.
> A crude angle-measuring tool if you know the length of the wire. Hang a very small photo over
> the face of someone you find calming. Trace it on paper and name the shape after someone."*
>
> **AI scoring rationale:** "Responses demonstrate high originality (7/7 responses rated unusual
> or highly unusual against norm group). Elaboration is high — most ideas include contextual
> detail and secondary functions. Flexibility is average — responses cluster in aesthetic/personal
> and practical/tool categories, with limited representation of commercial, social, or scientific
> categories."
>
> **AI Scoring Disclosure:** Scored by AI. Results reviewed and not flagged for human override.

---

### FAQ

**Q: Can candidates who are not "naturally creative" game the test by generating many responses?**
A: Partially. High Fluency requires genuine idea generation — quantity without variety scores low on
Flexibility. High Fluency with repetitive, obvious ideas scores low on Originality. The four-dimension
structure is designed so that gaming one dimension creates deficits in others. That said, no assessment
is immune to practice effects, and the CTA is best used as one signal among several.

**Q: Is AI scoring reliable?**
A: For the dimensions the CTA measures, yes — within documented limits. AI models are consistently
reliable at counting distinct ideas (Fluency), identifying semantic categories (Flexibility), and
assessing response elaboration. Originality scoring is the most nuanced: the AI is calibrated against
a reference database of common and unusual responses, but its judgments are probabilistic, not
absolute. AssInt's human review flag exists precisely for cases where AI confidence is low. We
recommend treating CTA scores as a starting point for a conversation rather than a final verdict.

**Q: Does the CTA disadvantage non-native English speakers?**
A: This is a legitimate concern that we take seriously. The CTA scoring prompt explicitly instructs
the AI to evaluate the *conceptual content* of responses — the originality of ideas — not grammatical
sophistication or idiomatic fluency. Simple English expressing an unusual idea should score as highly
on Originality as elegant English expressing the same idea. We monitor for linguistic bias patterns
in our norming data and update the prompt accordingly.

**Q: How is the CTA composite score weighted?**
A: Originality (30%) and Fluency (30%) carry the most weight because research evidence links them
most strongly to real-world creative output. Flexibility (25%) is weighted second because it
captures breadth of thinking. Elaboration (15%) is weighted lowest because it correlates most with
verbal facility, which the VRA already measures.

**Q: What if the AI makes a scoring error?**
A: Recruiters can view the AI scoring rationale for each response and request a human review override.
When an override is submitted, the item is flagged and the composite score is recalculated. All CTA
results include a disclosure badge stating that open-ended items were scored by AI, ensuring
transparency with candidates and regulators.

---

---

## 2.6 Big Five Personality Inventory (BFPI)

**Route:** `/assessments/big-five-personality`

---

### Hero Section

**Headline (bold, 2–3 lines):**
```
Predict workplace behavior
with the most rigorously
validated personality model in psychology.
```

**Subtitle paragraph:**
`The Five Factor Model — Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism
(OCEAN) — is not a new idea. It emerged from decades of factor-analytic personality research and
has been replicated across cultures, languages, and occupational contexts more than any other
personality framework. The AssInt BFPI translates this evidence base into an actionable hiring
tool: 60 items, 12 minutes, T-scored output with built-in validity scales, and configurable
role-benchmark comparison. Used responsibly, it adds genuine predictive value that cognitive
assessments alone cannot capture.`

**Key stats row:**

| Duration | Items | Scoring | Recommended Use |
|---|---|---|---|
| 12 minutes | 60 items + 10 validity items | T-scores per OCEAN factor | Optional add-on; leadership, team, culture fit |

---

### What It Measures

The five personality factors, each measured by 12 Likert items (6 positively keyed + 6 reverse-scored):

| Factor | High Score Indicates | Low Score Indicates | Most Predictive For |
|---|---|---|---|
| **Openness to Experience (O)** | Curiosity, creativity, comfort with ambiguity, broad intellectual interests, appreciation for novelty | Preference for routine, concrete thinking, conventional approaches | Training performance, creative roles, innovation-oriented positions |
| **Conscientiousness (C)** | Organization, discipline, reliability, goal-directedness, attention to detail and follow-through | Flexibility, spontaneity, adaptability under changing priorities | Job performance across all roles — strongest Big Five predictor (r ≈ 0.22) |
| **Extraversion (E)** | Sociability, assertiveness, talkativeness, positive affect, energy from social interaction | Reflectiveness, preference for depth over breadth, independent working style | Sales, management, customer-facing, leadership roles |
| **Agreeableness (A)** | Cooperativeness, empathy, conflict-avoidance, trust, supportiveness | Competitiveness, skepticism, directness, willingness to challenge | Team performance, customer service, roles requiring sustained collaboration |
| **Neuroticism (N)** | Emotional reactivity, anxiety sensitivity, stress vulnerability, negative affect | Emotional stability, calm under pressure, psychological resilience | Burnout risk, absenteeism, high-pressure role performance; lower N predicts better outcomes |

**Validity scales:** The BFPI includes 10 additional items that detect two common response distortions:
- **Acquiescence bias:** Tendency to agree with items regardless of content (endorsing more than 80% of items rated 4 or 5)
- **Inconsistency index:** Low correlation between pairs of items measuring the same facet, indicating random or careless responding

Both are flagged in the recruiter report with an interpretive caution — scores are not hidden, but
context is provided.

---

### Why Use It

- **Conscientiousness is the best personality predictor of job performance available.** When cognitive
  ability and Conscientiousness are combined in a battery, predictive validity increases substantially
  beyond either alone. A candidate who scores high on CAT and high on Conscientiousness has a very
  different expected performance trajectory than one who scores high on CAT with low Conscientiousness
  — particularly in roles requiring independent execution.

- **Role-benchmark comparison surfaces fit beyond "culture."** Vague appeals to "culture fit" are a
  major source of hiring bias — they often encode demographic preferences without acknowledging it.
  The BFPI benchmark system makes fit criteria explicit: for a Customer Success Manager role, the
  recruiter defines target ranges per factor (e.g., E ≥ High, A ≥ High, N ≤ Average), and every
  candidate's profile is evaluated against those explicit, documented criteria.

- **Extraversion and Agreeableness predict role-specific outcomes.** High Extraversion predicts
  performance in sales and leadership; low Extraversion (introversion) predicts performance in
  deep research and analytical roles. High Agreeableness predicts team cohesion and customer service
  quality. These are role-specific signals that cognitive tests cannot provide.

- **Built-in validity scales protect against faking.** In high-stakes hiring contexts, candidates
  are motivated to present themselves favorably. The BFPI's validity scales identify extreme
  response patterns that suggest acquiescence or random responding, giving recruiters context
  to weight the profile appropriately.

---

### Who It Is For

**Job levels:** All levels. Most value-add at mid-senior level where the role profile is well-defined
and team dynamics are important. For individual contributor technical roles, Conscientiousness is
often the most relevant factor; for leadership roles, the full OCEAN profile matters.

**Use cases:**
- Leadership assessment and succession planning
- Team composition and cohesion analysis for new teams
- Customer-facing role screening (Extraversion + Agreeableness profile)
- Sales recruitment (Extraversion + low Neuroticism)
- High-pressure role screening (Neuroticism as resilience proxy)
- Internal mobility and development (self-awareness for coaching)

**Industries:** Applicable across all industries. BFPI adds the most differentiated value in: financial
services (high-pressure environments), sales organizations, customer success and support, healthcare
(agreeableness and emotional stability), leadership development programs.

**Recommended configuration:** BFPI is not included in the default AssInt battery because personality
assessments carry unique risks (see FAQ). It should be deliberately selected by recruiters who have
a documented job-relatedness rationale for each factor used in the role benchmark.

---

### How It Works

**Step 1 — Candidate completes a self-report questionnaire**
60 items presented on a 5-point Likert scale: "Very Inaccurate" to "Very Accurate." Items describe
everyday personality tendencies (e.g., "I complete tasks on time and according to plan"; "I find
social interactions draining"). There is no time limit — the timer is indicative, not enforced.
Typical completion is 8–10 minutes. 10 additional validity items are embedded throughout.

**Step 2 — Scoring with validity screening**
Reverse-scored items are recoded. Raw scores are summed per factor. T-scores are calculated against
a working adult norm group (mean=50, SD=10). Validity indices are computed: acquiescence rate and
inter-item consistency. If either validity threshold is triggered, a caution flag is added to the
report without hiding the underlying scores.

**Step 3 — OCEAN profile on the candidate record**
Recruiters see a five-factor horizontal bar chart with T-scores and percentile bands, a role-fit
indicator per factor (if a benchmark is configured), the validity flag status, and an auto-generated
interpretive narrative. Where the profile aligns well with or diverges from the role benchmark,
specific interpretive guidance is provided. Full report available as PDF.

---

### Sample Insight

> **Candidate: Dewi M. — Applied for: Customer Success Manager**
>
> **Role benchmark (CSM): O ≥ Average, C ≥ High, E ≥ High, A ≥ High, N ≤ Average**
>
> | Factor | T-Score | Percentile | Band | Benchmark |
> |---|---|---|---|---|
> | Openness | 54 | 64th | Average | Met |
> | Conscientiousness | 63 | 90th | Exceptional | Met |
> | Extraversion | 58 | 79th | High | Met |
> | Agreeableness | 67 | 95th | Exceptional | Met |
> | Neuroticism | 43 | 24th | Average (Low) | Met |
>
> **Validity flags:** None. Acquiescence rate: 48%. Inconsistency index: 0.71 (above threshold — valid).
>
> **Auto-generated narrative:** "Dewi's profile is a strong fit for the Customer Success Manager
> benchmark across all five factors. Exceptional Conscientiousness (90th percentile) suggests
> outstanding reliability, follow-through on commitments, and organization — high-value traits in
> a role requiring proactive account management. Exceptional Agreeableness (95th percentile) combined
> with high Extraversion (79th percentile) predicts strong rapport-building and sustained client
> relationships. Low Neuroticism (24th percentile) indicates emotional stability under client
> pressure. One area to explore in interview: very high Agreeableness can sometimes correspond to
> difficulty maintaining firm positions in client negotiations. Ask for examples of boundary-setting
> in previous client relationships."

---

### FAQ

**Q: Can personality predict job performance?**
A: Yes, with important caveats. Conscientiousness has the strongest evidence base (r ≈ 0.22 against
supervisor performance ratings, per Schmidt & Hunter meta-analysis). Extraversion predicts sales
and leadership performance. Openness predicts training proficiency. These are meaningful but modest
effect sizes — personality should supplement cognitive and competency-based screens, not replace them.

**Q: Should I reject candidates based on personality scores?**
A: AssInt's strong recommendation is no. Personality profiles are descriptive, not evaluative.
There is no universally "good" OCEAN profile — different roles require different trait configurations.
Using personality for automatic rejection also creates adverse impact and legal risk if any protected
characteristic is correlated with the rejected trait profile. Use BFPI to generate interview probes
and team-fit considerations, not as a disqualifier.

**Q: Is it legal to use personality assessments in hiring?**
A: In most jurisdictions, yes — provided the assessment is job-related, administered uniformly, and
not used to infer protected characteristics. Neuroticism must never be used as a proxy for mental
health status. Ensure your use of the BFPI has a documented job-relatedness rationale and that you
are not using individual factor scores to discriminate against any protected group. AssInt's platform
requires recruiters to document their benchmark configuration rationale for compliance purposes.

**Q: What prevents candidates from faking desirable responses?**
A: The BFPI includes two validity mechanisms: acquiescence detection (flagging candidates who agree
with nearly everything) and inconsistency detection (flagging candidates whose responses to similar
items contradict each other). These do not eliminate motivated impression management, but they
identify the most obvious distortions. When validity flags are triggered, the report displays a
caution banner rather than suppressing the scores.

**Q: Can the BFPI be used for internal development purposes, not just hiring?**
A: Yes, and this is arguably where personality assessments add the most value — in low-stakes
contexts where candidates have no motivation to fake and where the goal is self-awareness and
development rather than pass/fail screening. AssInt supports sending the BFPI to existing employees
as part of a performance review or team development process, with results shared with the employee
directly.

**Q: What is the norm group used?**
A: Phase 1 uses the publicly available IPIP-NEO normative database (International Personality Item
Pool — a widely used research instrument). This norm group consists of English-speaking adults,
skewing toward North American samples. AssInt discloses the norm group on every score report.
Localized norms for Southeast Asian working populations are in development.

---

---

## Part 3: Design and Implementation Notes

### 3.1 Library Index Page Layout

```
/assessments
│
├── Page header (headline + subheadline)
├── Filter tabs: All | Cognitive | Reasoning | Personality | Interest
├── Instrument grid (2-column on desktop, 1-column mobile)
│   └── Card:
│       ├── Icon (colored background per icon_color)
│       ├── Name
│       ├── Badge (if any)
│       ├── Category chip
│       ├── Tagline (bold)
│       ├── Descriptor (2 lines, muted)
│       ├── Duration + Items row
│       └── [View Details →] link
├── CTA banner: "Ready to add assessments to your pipeline? → Start Free Trial"
└── Footer

```

### 3.2 Detail Page Layout

```
/assessments/[slug]
│
├── Breadcrumb: Assessments > [Name]
├── Hero section
│   ├── Category chip + Badge (if any)
│   ├── Headline (large, 3 lines max)
│   ├── Subtitle paragraph
│   └── Key stats row (4-column grid)
├── "What It Measures" section
│   └── Table or card grid of dimensions
├── "Why Use It" section
│   └── Bulleted list with brief headers
├── "Who It Is For" section
│   └── Job levels, use cases, industries
├── "How It Works" section
│   └── 3-step numbered process
├── "Sample Insight" section
│   └── Styled callout box with fictional candidate example
├── "Frequently Asked Questions" section
│   └── Accordion or inline Q&A
├── CTA strip: "Add [Name] to your assessment battery. → Get Started"
└── Related instruments: "You may also want to consider: [CAT] [ART]"

```

### 3.3 Tailwind Color Reference Per Instrument

| Instrument | Icon BG | Icon Text | Accent |
|---|---|---|---|
| RIASEC | `bg-amber-100` | `text-amber-700` | `amber-600` |
| CAT | `bg-blue-100` | `text-blue-700` | `blue-600` |
| VRA | `bg-teal-100` | `text-teal-700` | `teal-600` |
| ART | `bg-violet-100` | `text-violet-700` | `violet-600` |
| CTA | `bg-rose-100` | `text-rose-700` | `rose-600` |
| BFPI | `bg-green-100` | `text-green-700` | `green-600` |

### 3.4 Metadata Per Page (for SEO)

| Page | Title Tag | Meta Description |
|---|---|---|
| `/assessments` | `Assessment Library — AssInt` | `Six validated psychometric instruments integrated into your hiring pipeline. Cognitive ability, personality, reasoning, and interest assessments with automatic scoring.` |
| `/assessments/riasec-career-interest` | `RIASEC Career Interest Inventory — AssInt` | `Match candidates to roles they will stay in. The Holland Code assessment measures vocational interest fit, predicting job satisfaction and retention.` |
| `/assessments/cognitive-ability-test` | `Cognitive Ability Test (CAT) — AssInt` | `The most validated predictor of job performance. Three-scale GMA assessment measuring Verbal, Numerical, and Abstract Reasoning with percentile scoring.` |
| `/assessments/verbal-reasoning-assessment` | `Verbal Reasoning Assessment (VRA) — AssInt` | `Measure how candidates reason with language. Reading comprehension, vocabulary, sentence logic, and argument analysis in 20 minutes.` |
| `/assessments/analytical-reasoning-test` | `Analytical Reasoning Test (ART) — AssInt` | `Find candidates who can structure a problem before solving it. Deductive logic, argument analysis, and data sufficiency testing for strategy and consulting roles.` |
| `/assessments/creative-thinking-assessment` | `Creative Thinking Assessment (CTA) — AssInt` | `Measure divergent thinking: Fluency, Flexibility, Originality, and Elaboration. Open-ended items scored by AI. Built for roles where creativity drives value.` |
| `/assessments/big-five-personality` | `Big Five Personality Inventory (BFPI) — AssInt` | `OCEAN personality assessment with validity scales and role-benchmark comparison. The most validated personality model applied to structured hiring.` |

### 3.5 Internal Linking Recommendations

On each detail page, surface two or three related instruments under a "You may also want to consider"
section at the bottom. Recommended pairings:

| Viewing | Suggest Also |
|---|---|
| RIASEC | CAT, BFPI |
| CAT | ART, VRA |
| VRA | CAT, ART |
| ART | CAT, VRA |
| CTA | BFPI (Openness), ART |
| BFPI | CAT (Conscientiousness complement), RIASEC |

### 3.6 Fairness Disclosure Component

All assessment detail pages must include a brief, visible fairness disclosure section above the FAQ
or in the footer of the instrument section. Suggested implementation: a subdued `stone-100` callout
box with this content (adapt per instrument):

**For cognitive instruments (CAT, ART, VRA):**
`Fairness note: Cognitive ability assessments have documented adverse impact patterns across
demographic groups. AssInt automatically monitors 4/5ths rule compliance in your assessment data
and requires a job-relatedness rationale before thresholds can be configured. We recommend using
cognitive assessments as one input in a multi-method selection process.`

**For personality instruments (BFPI):**
`Fairness note: Personality assessments should never be used as the sole basis for hiring decisions
or as proxies for protected characteristics. AssInt's BFPI includes validity scales to detect
response distortion and requires recruiters to document a job-relatedness rationale for each factor
used in a role benchmark. Neuroticism scores must not be interpreted as indicators of mental health
conditions.`

**For interest and creative instruments (RIASEC, CTA):**
`Fairness note: Interest profiles are descriptive, not evaluative — there is no universally
correct Holland Code or creativity score for any role. CTA open-ended items are scored by AI
calibrated to assess conceptual originality, not linguistic sophistication. Results should inform
conversation and interview design, not serve as automatic decision thresholds.`

---

## Part 4: Content Decisions and Open Questions

| # | Decision | Current Answer | To Revisit |
|---|---|---|---|
| 1 | Do we show sample reports as downloadable PDFs on marketing pages? | Not in initial launch — too much build. Show static screenshot mockup. | Phase 2 |
| 2 | Do we include pricing context on assessment pages? | No — pricing handled separately. Assessment pages are pure product education. | Sales team decision |
| 3 | Do we name the norm group explicitly on the marketing page? | Yes — "US Adult General Population" with a note that Southeast Asian norms are in development. Transparency builds trust. | Update when SEA norms are available |
| 4 | Do we show actual item examples on the detail page? | Yes — 1–2 sample items per instrument in the How It Works section or a dedicated Sample Items component. Creates confidence; shows we know what we are doing. | Legal review before launch |
| 5 | Do we cite specific research papers on the page? | Attribute research traditions (Schmidt & Hunter, Holland, Costa & McCrae) without full citations. Full citations in the technical spec, not the marketing page. | Academic partners can review |
| 6 | Language: English only at launch? | Yes — Bahasa Indonesia versions are a future milestone. | Localization roadmap |
| 7 | Should the CTA detail page include a demo / live example? | Yes — a short interactive demo item (1–2 open-ended questions, AI-scored in real time) would be a strong conversion tool. Engineering effort: medium. | Sprint 3 consideration |

---

*This document is the authoritative content specification for AssInt's assessment library marketing pages.*
*Related specs: `ASSESSMENT_INVENTORY_SPEC.md` (product/technical), `COMPETITOR_TALENTICS.md` (competitive context), `LANDING_REDESIGN_SPEC.md` (brand and visual system).*
*Last updated: February 2026.*
