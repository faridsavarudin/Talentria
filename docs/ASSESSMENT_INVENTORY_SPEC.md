# Assessment Inventory — Product Specification

**Version:** 1.0
**Date:** February 2026
**Author:** Assessment Expert Agent
**Status:** Draft — Ready for Engineering Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision and Positioning](#2-product-vision-and-positioning)
3. [Instrument Specifications](#3-instrument-specifications)
   - 3.1 RIASEC / Holland Code Career Interest Inventory
   - 3.2 Cognitive Ability Test (CAT)
   - 3.3 Verbal Reasoning Assessment (VRA)
   - 3.4 Creative Thinking Assessment (CTA)
   - 3.5 Analytical Reasoning Test (ART)
   - 3.6 Big Five Personality Inventory (BFPI)
4. [Scoring Architecture](#4-scoring-architecture)
5. [Candidate Experience](#5-candidate-experience)
6. [Recruiter Experience](#6-recruiter-experience)
7. [Data Model](#7-data-model)
8. [API Design](#8-api-design)
9. [Fairness and Bias Controls](#9-fairness-and-bias-controls)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Open Questions](#11-open-questions)

---

## 1. Executive Summary

The **Assessment Inventory** is a new module within AssInt that delivers standardized psychometric
instruments to candidates via a token-based portal — no candidate login required. Recruiters select
from a library of validated tests, bundle them into a battery, assign the battery to candidates, and
receive auto-scored reports integrated directly into the candidate profile.

**Why this matters:**
- Structured interviews (AssInt's current core) measure behavioral competencies well but are
  resource-intensive — they require evaluator time and scheduling.
- Psychometric instruments can screen 100+ candidates in parallel, asynchronously, before a single
  interview is scheduled.
- This closes the funnel: Inventory screens at the top, AI interview deepens at the middle, human
  panel interview confirms at the final stage.

**Six instruments at launch:**

| Instrument | Abbrev | Items | Time | Scoring |
|---|---|---|---|---|
| RIASEC / Holland Code | RIASEC | 54 | 15 min | Ipsative profile |
| Cognitive Ability Test | CAT | 48 | 35 min | Raw → percentile |
| Verbal Reasoning Assessment | VRA | 24 | 20 min | Raw → percentile |
| Creative Thinking Assessment | CTA | 18 | 25 min | Divergent scoring |
| Analytical Reasoning Test | ART | 30 | 25 min | Raw → percentile |
| Big Five Personality Inventory | BFPI | 60 | 12 min | T-score per factor |

---

## 2. Product Vision and Positioning

### 2.1 Design Principles

1. **Psychometric integrity first.** Every instrument must have defensible validity evidence.
   We do not publish assessments without normative data and at least content validity support.

2. **Candidate respect.** Total battery time must be disclosed before the candidate starts.
   No hidden items, no bait-and-switch on time commitment. Maximum battery time: 90 minutes.
   We recommend 60 minutes for optimal completion rates.

3. **No login required for candidates.** The entire test portal is accessed via an invitation token
   embedded in a URL. Candidates do not create accounts. This pattern is already established in
   AssInt for async video and AI interviews.

4. **Recruiters see ranked, actionable output — not raw scores.** Raw numbers are meaningless to
   most recruiters. The output layer translates scores to percentile bands, descriptive labels,
   and role-fit indicators.

5. **Proctoring built in, not bolted on.** Basic integrity features (tab-switch logging, timer
   enforcement) apply to all instruments. Full webcam proctoring is opt-in per battery.

6. **AI-assisted scoring for open-ended items.** The Creative Thinking Assessment includes
   open-ended divergent thinking items. These are scored via a Claude call on submission, not
   by human raters. This is novel in the market.

### 2.2 Where This Fits in the AssInt Pipeline

```
[Job Posting / Sourcing]
        |
        v
[Candidate Applied — Pipeline Stage: APPLIED]
        |
        v
[Assessment Inventory Battery] ← NEW MODULE
   RIASEC + CAT + VRA (screening battery)
        |
   Auto-scored, ranked, pass/fail bands
        |
        v
[Pipeline Stage: ASSESSMENT → INTERVIEW]
        |
        v
[Async Video Interview or AI Sync Interview]
        |
        v
[Human Panel Interview + BARS Scoring]
        |
        v
[Offer / Reject]
```

### 2.3 Relation to Existing Models

The Assessment Inventory is a **parallel track** — it does not replace the existing
`Assessment → Interview → Evaluation` flow. It adds:

- A new `AssessmentInventory` entity (a battery of instruments for a role)
- A new candidate-facing session model (`CandidateInventorySession`)
- Results that surface on the `Candidate` profile page alongside interview scores
- Optional: inventory results can be used as a pre-screen gate before an interview is scheduled

---

## 3. Instrument Specifications

---

### 3.1 RIASEC / Holland Code Career Interest Inventory

#### What It Measures and Why It Matters

The RIASEC model (Holland, 1959; 1997) measures vocational interests across six themes:

| Code | Theme | Core Activities |
|---|---|---|
| R — Realistic | Practical, hands-on work with tools, machines, outdoors | Engineering, trades, logistics |
| I — Investigative | Research, analysis, intellectual inquiry | Data science, medicine, R&D |
| A — Artistic | Creative expression, ambiguity tolerance, aesthetics | Design, copywriting, UX |
| S — Social | Helping, teaching, interpersonal engagement | HR, customer success, teaching |
| E — Enterprising | Leadership, persuasion, business | Sales, management, entrepreneurship |
| C — Conventional | Structure, accuracy, data organization | Finance, admin, compliance |

**Why it matters for hiring:** Person-environment fit (P-E fit) is one of the strongest predictors
of job satisfaction and retention (Kristof-Brown et al., 2005). A candidate with a strong E+I profile
for an S+C role (e.g., data entry) is likely to leave within 6 months. RIASEC screens for intrinsic
fit — something a resume cannot reveal.

**Important caveat:** RIASEC predicts *satisfaction* and *retention*, not *performance*. It should
be used for role-interest fit screening, not as a disqualifier for competency.

#### Item Format and Count

- **Total items:** 54
- **Format:** Forced-choice paired comparison (ipsative design)
  - Each item presents two activity statements; candidate selects the one they would "most enjoy"
  - Example: "A) Repair a piece of mechanical equipment vs B) Analyze a dataset to find patterns"
  - Paired comparisons create a relative ranking of themes, not absolute endorsement
- **Alternative format (optional):** Likert (1 = "Strongly Dislike" to 5 = "Strongly Like") for 66
  activity statements (11 per theme). Less psychometrically elegant but simpler to explain.
- **Recommended format for AssInt v1:** Likert 66-item version for easier development and norming.
  Forced-choice can be added in v2.

#### Time Limit

- **15 minutes** (no strict enforcement — RIASEC is not speeded; provide as guidance only)
- Typical completion: 8–12 minutes

#### Scoring Methodology

**Step 1 — Raw sum per theme:**
```
R_raw = sum of all R-keyed items (11 items × 5-point scale = max 55 per theme)
```

**Step 2 — Convert to T-scores using norm group:**
```
T_score = 50 + 10 × ((raw - norm_mean) / norm_sd)
```
Norm group: General working adult population (N ≥ 500 per demographic segment).
Phase 1: Use published Holland Code norm tables (US adult norms, disclosed to recruiters).

**Step 3 — Derive Holland Code:**
- Identify the top 2–3 themes by T-score
- Express as 2-letter code (e.g., "RI") or 3-letter code (e.g., "RIA")
- Report as ordered from highest to lowest T-score

**Step 4 — Role-fit comparison:**
- Recruiter configures a "target Holland Code" for the role (e.g., "IC" for a data scientist)
- System calculates hexagonal distance (Euclidean distance on Holland hexagon) between candidate
  profile and target profile
- Fit score: 0–100 (100 = perfect match)

#### How Results Display to the Recruiter

1. **Radar chart (hexagonal):** Six axes, one per theme. Candidate profile shown as filled polygon.
   If a role benchmark is configured, the benchmark profile overlaid as dashed outline.

2. **Theme ranking table:**
   | Theme | T-Score | Percentile | Band |
   |---|---|---|---|
   | Investigative | 63 | 90th | Very High |
   | Realistic | 58 | 79th | High |
   | Conventional | 52 | 58th | Average |
   | Artistic | 47 | 38th | Average |
   | Social | 41 | 18th | Low |
   | Enterprising | 38 | 12th | Low |

3. **Holland Code:** "IC" (primary code — top 2 themes)

4. **Role fit indicator:** Green / Yellow / Red chip with fit score
   - "92% match to IC role benchmark"

5. **Interpretive narrative (auto-generated):**
   "This candidate shows a strong orientation toward analytical and intellectual activities (I=90th pct)
   combined with practical, hands-on preferences (R=79th pct). They prefer working with data and
   systems over people management or social roles. This profile aligns well with technical
   individual contributor roles."

#### Sample Items

1. "Design and build a working model or prototype of a device"
2. "Conduct experiments to test a scientific hypothesis"
3. "Create an original illustration or graphic for a publication"
4. "Teach or mentor a group of people learning a new skill"
5. "Negotiate a contract or business deal"
6. "Maintain accurate financial records for an organization"

#### Report Output for Recruiter

Single-page PDF section (or in-app card):
- Holland Code + radar chart
- Theme score table with percentiles and bands
- Role-fit score vs benchmark
- 3-sentence AI-generated interpretive narrative
- Recommendation flag: "Strong Fit / Moderate Fit / Low Fit" for configured role type

---

### 3.2 Cognitive Ability Test (CAT)

#### What It Measures and Why It Matters

General mental ability (GMA), also known as general intelligence (g), is the single strongest
predictor of job performance identified in the personnel selection literature (Schmidt & Hunter,
1998; meta-analytic r = 0.51). The CAT measures GMA through three sub-scales:

| Sub-scale | What It Measures | Items |
|---|---|---|
| Verbal Reasoning (V) | Comprehend written passages, draw logical conclusions from text, identify relationships between concepts | 16 |
| Numerical Reasoning (N) | Interpret numerical data, percentages, ratios, charts; perform mental arithmetic | 16 |
| Abstract Reasoning (A) | Identify patterns in non-verbal sequences, infer rules from geometric figures | 16 |

**Why three sub-scales?** Research (Carroll, 1993) identifies a hierarchical structure of cognitive
abilities: g sits at the top, with broad abilities (fluid reasoning, crystallized intelligence,
processing speed) below. V, N, and A together sample Gc (crystallized), Gf (fluid), and Gq
(quantitative) — capturing the bulk of g variance with manageable test length.

**Important:** Cognitive ability tests have the highest adverse impact of any hiring tool (d = 0.7–1.0
for Black/White comparisons in US data; smaller but real differences in other markets). This does not
mean they should not be used — the validity-diversity tradeoff is real and must be acknowledged. See
Section 9 (Fairness).

#### Item Format and Count

- **Total items:** 48 (16 per sub-scale)
- **Format:** Multiple choice, 4 options, one correct answer
- **Sub-scale V (Verbal):**
  - Item types: Word analogies (4 items), sentence completion (4 items), reading comprehension
    inference (4 items), classification/odd-one-out (4 items)
- **Sub-scale N (Numerical):**
  - Item types: Number series (4 items), data interpretation / table reading (4 items),
    word problems (4 items), ratio/percentage calculation (4 items)
- **Sub-scale A (Abstract):**
  - Item types: Matrix reasoning / figure completion (8 items), series completion (8 items)
- **Item difficulty:** Calibrated to produce a normal distribution in a general adult working
  population. Items ordered easy-to-hard within each sub-scale.

#### Time Limit

- **35 minutes total** (strictly enforced — cognitive tests are speeded by design)
  - Verbal: 10 minutes
  - Numerical: 15 minutes
  - Abstract: 10 minutes
- Timer shown prominently. Auto-advances to next sub-scale on timeout.
- No going back between sub-scales.

#### Scoring Methodology

**Step 1 — Raw score:**
```
V_raw = number correct (V items, max 16)
N_raw = number correct (N items, max 16)
A_raw = number correct (A items, max 16)
GMA_raw = V_raw + N_raw + A_raw (max 48)
```
No penalty for incorrect answers (number right, not number right minus fraction wrong).

**Step 2 — Percentile conversion:**
Using norm table for working adult population:
```
GMA_percentile = percentile_rank(GMA_raw, norm_table)
V_percentile   = percentile_rank(V_raw, norm_V_table)
N_percentile   = percentile_rank(N_raw, norm_N_table)
A_percentile   = percentile_rank(A_raw, norm_A_table)
```

**Step 3 — Band assignment:**

| Percentile Range | Band Label | Score Code |
|---|---|---|
| 90th–99th | Exceptional | 5 |
| 75th–89th | High | 4 |
| 40th–74th | Average | 3 |
| 20th–39th | Below Average | 2 |
| 1st–19th | Low | 1 |

**Step 4 — Role benchmark comparison (optional):**
Recruiter sets minimum band per sub-scale for the role.
Example for Data Analyst role: V ≥ Average, N ≥ High, A ≥ Average.

#### How Results Display to the Recruiter

1. **Overall GMA score:** Percentile + band label prominently displayed
   "78th percentile — High"

2. **Sub-scale breakdown bar chart:**
   ```
   Verbal Reasoning:   ████████░░  74th pct — Average
   Numerical Reasoning: ████████████ 88th pct — High
   Abstract Reasoning:  ██████░░░░  61st pct — Average
   ```

3. **Role benchmark comparison:** Red/Yellow/Green per sub-scale vs configured minimum

4. **Flags:**
   - "Completed in 28/35 minutes" (speed indicator)
   - "2 unanswered items" (if any)

5. **Interpretive note:** "Strong numerical reasoning (88th pct) with average verbal and abstract
   scores. Well-suited for roles requiring quantitative analysis. Would benefit from roles with
   structured data rather than open-ended problem solving."

#### Sample Items

**Verbal Reasoning:**
1. "ARTIST is to PAINTING as COMPOSER is to: (A) Stage (B) Orchestra (C) Symphony (D) Theater"
   Answer: C

2. "All managers attend the Monday meeting. Sara did not attend the Monday meeting. Therefore:
   (A) Sara is not a manager (B) Sara is a manager (C) Cannot be determined (D) Sara is ill"
   Answer: A

**Numerical Reasoning:**
3. "A project costs $48,000. The team completes 60% in the first phase. How much remains?
   (A) $18,000 (B) $19,200 (C) $28,800 (D) $30,000"
   Answer: B [Wait: 40% of 48,000 = 19,200. Correct: C = $19,200... let me re-check: 100%-60%=40%;
   0.40 × 48,000 = 19,200. Answer: B]
   Correction: Answer is B ($19,200).

4. "Sales in Q1: 120 units. Q2: 150 units. Q3: 135 units. What is the average quarterly sales?
   (A) 125 (B) 135 (C) 140 (D) 145"
   Answer: B [(120+150+135)/3 = 405/3 = 135]

**Abstract Reasoning:**
5. [Matrix 3x3: top row = circle, square, triangle; middle row = filled circle, filled square,
   filled triangle; bottom row = circle with X, square with X, ?]
   Answer: Triangle with X

#### Report Output for Recruiter

- GMA composite score: percentile + band label
- Sub-scale breakdown with percentile bars
- Role benchmark RAG status
- Time-on-task indicator
- Interpretive narrative (2–3 sentences, auto-generated)
- Download: PDF with candidate name, test date, all scores

---

### 3.3 Verbal Reasoning Assessment (VRA)

#### What It Measures and Why It Matters

The VRA goes deeper than the Verbal sub-scale of the CAT. It specifically measures:

1. **Reading comprehension:** Extract meaning from dense or technical prose
2. **Vocabulary and language precision:** Word meaning, nuance, contextual usage
3. **Logical inference from text:** Draw conclusions supported by passage content
4. **Argument evaluation:** Identify assumptions, logical fallacies, unsupported claims

**Why separate from CAT?** For roles where verbal communication is central — copywriters, legal,
HR, customer success leadership, policy analysts — a 16-item verbal screening is insufficient.
The VRA provides a full 24-item instrument with greater discriminative power at the upper end of
verbal ability.

**Criterion validity:** Verbal reasoning tests predict performance in roles requiring complex
communication (r ≈ 0.35–0.45 against supervisor ratings in knowledge-work roles).

#### Item Format and Count

- **Total items:** 24
- **Item types:**

| Type | Count | Description |
|---|---|---|
| Passage inference | 10 | 200–300 word passage followed by True/False/Cannot Determine statements |
| Vocabulary in context | 4 | A sentence with an underlined word; select the closest synonym from 4 options |
| Sentence completion | 4 | Fill the blank with the most logically consistent word from 4 options |
| Argument analysis | 6 | Short argument; identify the assumption, flaw, or strongest counter-argument |

- **Format:** Multiple choice (4 options) for all item types. True/False/Cannot Determine format for
  passage inference items.

#### Time Limit

- **20 minutes** (strictly enforced)
- Typical completion time: 16–18 minutes for average candidates
- 2 passages of ~250 words each; candidates can reference passages during inference questions

#### Scoring Methodology

Identical to CAT sub-scale scoring:
- Raw score (0–24)
- Percentile from norm table
- Band label (1–5 scale, same bands as CAT)

**Norm group note:** VRA norms should ideally be separated by industry/education level because
reading comprehension correlates strongly with education. Phase 1: single general norm group.
Phase 2: education-stratified norms.

#### How Results Display to the Recruiter

1. **VRA composite score:** Percentile + band
2. **Sub-dimension breakdown:**
   - Reading Comprehension: X/10
   - Vocabulary: X/4
   - Sentence Completion: X/4
   - Argument Analysis: X/6
3. **Role-specific note (if VRA is in the battery for a verbal-heavy role):**
   "For Content Writer roles, AssInt recommends a minimum of 65th percentile on VRA."

#### Sample Items

**Passage inference:**
> "Remote work arrangements have expanded significantly since 2020, yet research on productivity
> outcomes remains mixed. Some studies show gains of 13–17% for individual focused tasks, while
> others find that collaborative creativity suffers in asynchronous settings. Organizations
> implementing hybrid models report moderate satisfaction from employees but face challenges
> in maintaining team cohesion."
>
> Statement: "All studies agree that remote work improves individual productivity."
> Answer: FALSE

> Statement: "Hybrid models eliminate all challenges related to team cohesion."
> Answer: FALSE

> Statement: "The passage indicates remote work was rare before 2020."
> Answer: CANNOT DETERMINE (passage says "expanded significantly," not that it was rare)

**Vocabulary in context:**
> "The policy was met with *vociferous* opposition from the board."
> A) Silent  B) Loud and forceful  C) Quiet but sustained  D) Unanimous
> Answer: B

**Argument analysis:**
> "Our company should invest in employee wellness programs because companies with wellness
> programs report higher employee satisfaction scores."
> The argument above assumes that:
> A) Employee satisfaction causes better wellness outcomes
> B) Higher satisfaction scores are caused by the wellness programs, not other factors
> C) All wellness programs are equally effective
> D) Employee satisfaction is the primary goal of the company
> Answer: B (confound / correlation-causation assumption)

---

### 3.4 Creative Thinking Assessment (CTA)

#### What It Measures and Why It Matters

Creativity in a hiring context is typically operationalized as **divergent thinking** — the ability
to generate multiple, varied, and original responses to an open-ended prompt. Based on Guilford's
(1967) Structure of Intellect model and Torrance's (1966) TTCT framework, the CTA measures:

| Dimension | Definition |
|---|---|
| Fluency | Number of relevant responses generated |
| Flexibility | Number of distinct categories represented across responses |
| Originality | Statistical infrequency of responses compared to norm group |
| Elaboration | Degree of detail and development in responses |

**Why it matters:** For roles requiring innovation, copywriting, product ideation, marketing, design
strategy, or entrepreneurial thinking, divergent thinking predicts creative output better than any
structured interview question. Standard interviews systematically underestimate creative candidates
because the STAR format penalizes ambiguous, wide-ranging thinkers.

**Scoring challenge:** Open-ended responses require AI scoring. This is the most technically
complex instrument. The CTA scoring pipeline uses Claude to evaluate responses against rubric
dimensions.

#### Item Format and Count

- **Total items:** 18 (mix of formats)
- **Item types:**

| Type | Count | Format | AI Scored? |
|---|---|---|---|
| Alternate uses (open-ended) | 4 | Text input, no word limit | Yes — all 4 dimensions |
| Consequence (open-ended) | 2 | Text input | Yes — fluency + originality |
| Structured creative MCQ | 6 | 4 options (select the most creative/novel) | No — keyed scoring |
| Analogical reasoning (open-ended) | 3 | Complete the analogy in an unexpected way | Yes — originality |
| Story title generation | 3 | Generate 3 titles for a short story excerpt | Yes — fluency + flexibility |

**Total open-ended items:** 12 (AI scored)
**Total MCQ items:** 6 (keyed scored)

#### Time Limit

- **25 minutes** (no strict per-item enforcement — guided by overall timer)
- Candidates are told to generate as many responses as they can within the time available
- Timer visible but not per-item (would artificially cap fluency scores)

#### AI Scoring Pipeline for Open-Ended Items

**Step 1: Response submission.** On test completion, all open-ended responses are stored as raw text.

**Step 2: Claude evaluation call.** A single structured API call per candidate sends all 12
open-ended responses with the scoring rubric. Using `claude-sonnet-4-6`.

**Prompt structure (abbreviated):**
```
You are a psychometric scoring expert. Score the following divergent thinking responses
on four dimensions: Fluency (count of relevant, distinct ideas), Flexibility (count of
distinct semantic categories), Originality (0–4 scale: 0=common, 4=highly unusual),
Elaboration (0–4 scale: 0=bare list, 4=richly developed ideas).

Item: "List all the uses you can think of for a cardboard box."
Response: [candidate text]

Return JSON: { fluency: int, flexibility: int, originality: float, elaboration: float,
              rationale: string (1 sentence) }
```

**Step 3: Dimension aggregation.**
- Fluency total: sum of fluency counts across all items
- Flexibility total: sum of distinct categories
- Originality mean: mean of originality scores
- Elaboration mean: mean of elaboration scores

**Step 4: Composite CTA score.**
```
CTA_composite = (0.30 × fluency_pct) + (0.25 × flexibility_pct) +
                (0.30 × originality_pct) + (0.15 × elaboration_pct)
```
Weights are based on criterion validity research: originality and fluency are strongest predictors
of real-world creative output.

**Step 5: MCQ items scored conventionally** and added as "Structured Creative Thinking" sub-score.

**AI scoring confidence flag:** If Claude's returned confidence (extracted from rationale tone) is
ambiguous, flag for human review. Target: <5% of sessions flagged.

#### How Results Display to the Recruiter

1. **CTA Composite:** Percentile + band (same 5-band system)
2. **Dimension profile:**
   ```
   Fluency:      ████████░░  80th pct (High)
   Flexibility:  ██████░░░░  62nd pct (Average)
   Originality:  ██████████  94th pct (Exceptional)
   Elaboration:  █████░░░░░  51st pct (Average)
   ```
3. **Interpretive note:**
   "This candidate generates a high volume of ideas (Fluency: 80th pct) with exceptional
   originality (94th pct) — responses were consistently unusual and non-obvious. Flexibility
   is average, suggesting ideas cluster within a narrower range of categories. Strong fit for
   roles requiring novel problem-solving (brand strategy, concept development). May benefit
   from structured ideation frameworks to broaden categorical range."

4. **Sample responses (shown to recruiter with consent):**
   Show 2–3 of the candidate's best responses with Claude's per-response rationale.

5. **AI scoring disclosure badge:**
   "Scored by AI — review recommended for hiring decisions at offer stage."

#### Sample Items

**Alternate Uses (open-ended):**
1. "List as many different uses as you can think of for an empty glass bottle.
   Try to think of uses beyond the obvious ones. You have 3 minutes for this item."

2. "A company has just acquired 10,000 surplus bricks and has no construction projects planned.
   List all the ways the company could use or repurpose these bricks."

**Consequence (open-ended):**
3. "Imagine that humans no longer needed to sleep. List all the consequences — positive,
   negative, or neutral — that might result."

**Structured creative MCQ:**
4. "A marketing team needs a tagline for a sustainable water bottle. Which is most original?
   A) 'Pure, clean, refreshing'
   B) 'Your body will thank you'
   C) 'The last bottle you'll ever need to buy'
   D) 'Drink differently. Waste nothing. Live loudly.'
   Answer: D (original combination, avoidance of cliché)"

**Analogical reasoning (open-ended):**
5. "A traditional library is to books as [blank] is to [blank]. Complete the analogy in a
   surprising or non-obvious way."
   Example of low-originality answer: "A database is to data"
   Example of high-originality answer: "A forest is to fallen leaves — both are archives of
   what once lived, visited by few, overgrown by newer things"

---

### 3.5 Analytical Reasoning Test (ART)

#### What It Measures and Why It Matters

Analytical reasoning measures the ability to work with structured logical relationships, evaluate
arguments rigorously, and draw valid conclusions from given information. This is distinct from:
- **CAT abstract reasoning:** Pattern recognition in visual sequences
- **VRA argument analysis:** Language-based argument evaluation

The ART uses verbal and symbolic logic in structured scenarios. It is closest to the "logical
reasoning" sections of professional admission tests (LSAT, GRE, GMAT).

**Why it matters:** For roles in strategy, consulting, policy, legal, operations management, and
product management, the ability to reason through ambiguous structured problems is more predictive
than raw GMA. ART has strong criterion validity for roles requiring:
- Synthesizing information from multiple sources
- Building and stress-testing logical arguments
- Identifying flaws in reasoning chains
- Making decisions under constraints

#### Item Format and Count

- **Total items:** 30
- **Format:** Multiple choice (4–5 options), one correct answer
- **Item types:**

| Type | Count | Description |
|---|---|---|
| Deductive syllogisms | 6 | Classic if-then, all-some-none reasoning |
| Logical sequence / grouping | 6 | Scheduling, ordering, group membership constraints (LSAT-style) |
| Argument structure | 6 | Identify flaw, strengthen, weaken, assumption |
| Data sufficiency | 6 | Is the given information sufficient to answer the question? (GMAT-style) |
| Causal reasoning | 6 | Identify cause, confound, alternative explanation, analogy |

#### Time Limit

- **25 minutes** (strictly enforced)
- Typical completion: 20–24 minutes for high-performers
- Items are not ordered by difficulty — varies by type

#### Scoring Methodology

Same as CAT: raw score → percentile → band.

**Sub-scale scores** also available for:
- Deductive Logic: items 1–12
- Argument Analysis: items 13–24
- Causal Reasoning: items 25–30

#### How Results Display to the Recruiter

1. **ART Composite:** Percentile + band
2. **Sub-scale breakdown:**
   - Deductive Logic: X/12 (Xth percentile)
   - Argument Analysis: X/12 (Xth percentile)
   - Causal Reasoning: X/6 (Xth percentile)
3. **Interpretive note:**
   "Strong argument analysis (89th pct) with average deductive reasoning (55th pct). This
   candidate excels at identifying flaws in complex arguments but may benefit from support
   when problems require formal logical constraint satisfaction."

#### Sample Items

**Deductive syllogism:**
1. "All engineers at this firm have engineering degrees. Some engineers at this firm have MBAs.
   Therefore:
   A) All MBAs at this firm are engineers
   B) Some people with engineering degrees also have MBAs
   C) No engineer can have both degrees
   D) Some people with MBAs are not engineers
   Answer: B"

**Logical grouping (scheduling):**
2. "Five meetings — A, B, C, D, E — must be scheduled from 9am to 5pm on one day.
   Rules: A must be before B. C cannot be in the first two slots. D must be immediately after A.
   E must be last. Which of the following is a valid order?
   A) A, D, B, C, E  B) B, A, D, C, E  C) C, A, D, B, E  D) A, B, D, C, E
   Answer: A"

**Argument flaw:**
3. "Our office renovation increased employee satisfaction scores by 20%. We should renovate all
   offices across all branches to improve company-wide satisfaction.
   The flaw in this argument is:
   A) Correlation may not equal causation for this single location
   B) Renovation is too expensive to scale
   C) Employee satisfaction is not measurable
   D) The renovation may have been poorly executed elsewhere
   Answer: A"

**Data sufficiency:**
4. "Is x > 0?
   Statement 1: x² = 9
   Statement 2: x + 3 > 0
   A) Statement 1 alone is sufficient
   B) Statement 2 alone is sufficient
   C) Both statements together are sufficient
   D) Neither statement is sufficient
   Answer: B (Statement 2: x > -3, combined with x² = 9 → x = 3 or -3; only x > -3 includes
   both. But actually Statement 2 alone gives x > -3 which doesn't determine sign. Answer is C:
   both together give x = 3, the only value satisfying both.)"

---

### 3.6 Big Five Personality Inventory (BFPI)

#### What It Measures and Why It Matters

The Big Five (OCEAN) is the most empirically validated model of personality in work psychology
(Costa & McCrae, 1992; Goldberg, 1990). The five factors:

| Factor | High Score Traits | Low Score Traits | Abbreviation |
|---|---|---|---|
| Openness to Experience | Curious, creative, broad interests, tolerant of ambiguity | Conventional, prefers routine, concrete | O |
| Conscientiousness | Organized, disciplined, goal-directed, reliable | Spontaneous, flexible, less structured | C |
| Extraversion | Sociable, assertive, energetic, talkative | Reserved, reflective, independent | E |
| Agreeableness | Cooperative, trusting, empathetic, conflict-avoidant | Competitive, skeptical, direct | A |
| Neuroticism | Emotionally reactive, anxious, stress-sensitive | Emotionally stable, calm, resilient | N |

**Why it matters for hiring (evidence summary):**
- Conscientiousness: strongest predictor of job performance across all roles (r ≈ 0.22, Schmidt & Hunter)
- Extraversion: predicts performance in sales, management, and customer-facing roles
- Openness: predicts training proficiency and creative roles
- Agreeableness: predicts team performance, customer service quality
- Neuroticism (low = Emotional Stability): predicts lower burnout, lower absenteeism

**Critical caveats for responsible use:**
1. Personality does not predict performance as strongly as cognitive ability. Never use BFPI alone.
2. Faking/social desirability is a significant concern in high-stakes settings. Include validity scales.
3. Do not use personality for legally protected class inference (e.g., neuroticism ≠ mental health).
4. Personality is descriptive, not evaluative — there is no universally "good" profile.

**Decision: Include as "optional add-on" to battery, not in default screening battery.**
BFPI should be recruiter-selected, not auto-included. Rationale: cognitive ability + RIASEC already
provide strong screening; BFPI adds most value for leadership and team-fit decisions, less for
initial screening.

#### Item Format and Count

- **Total items:** 60 (12 per factor)
- **Format:** Likert, 5-point: "Very Inaccurate" to "Very Accurate"
- Each factor has 12 items; ~6 positively keyed + ~6 negatively keyed (reverse-scored) per factor
- **Validity scale:** 10 additional items to detect extreme response patterns (all agree, all disagree,
  inconsistent responding). Results flagged but not hidden if validity concerns detected.

#### Time Limit

- **12 minutes** (no strict enforcement — personality tests are not speeded)
- Typical completion: 8–10 minutes
- Timer shown as guidance only

#### Scoring Methodology

**Step 1:** Reverse-score negatively keyed items (6 → 1, 5 → 2, etc.)
**Step 2:** Sum per factor (max 60 per factor before normalization)
**Step 3:** Convert to T-scores (mean=50, SD=10) using norm table
**Step 4:** Derive facet-level scores (2 facets × 6 items per factor) for detailed profile
**Step 5:** Generate role-fit profile comparison if benchmark configured

**Validity scale scoring:**
- Acquiescence index: % of items rated 4 or 5
- Inconsistency index: correlation between similar item pairs
- Flag if acquiescence > 80% OR inconsistency correlation < 0.30

#### How Results Display to the Recruiter

1. **OCEAN profile bar chart:**
   ```
   Openness:          ████████░░  72nd pct — High
   Conscientiousness: █████████░  85th pct — High
   Extraversion:      █████░░░░░  48th pct — Average
   Agreeableness:     ██████████  92nd pct — Very High
   Neuroticism:       ████░░░░░░  38th pct — Average (low N = more stable)
   ```

2. **Role fit indicators (if benchmark configured):**
   For "Customer Success Manager" role: O ≥ Average, C ≥ High, E ≥ High, A ≥ High, N ≤ Average
   → Show green/yellow/red per factor vs benchmark

3. **Validity flag (if triggered):**
   "Response pattern suggests possible acquiescent bias (rated 73% of items 4 or 5). Interpret with
   caution. Consider a follow-up conversation."

4. **Interpretive narrative:**
   "This candidate shows high conscientiousness (85th pct) and very high agreeableness (92nd pct),
   suggesting a dependable, collaborative working style with strong attention to follow-through.
   High agreeableness combined with average extraversion may mean they are effective in supportive,
   team-oriented roles but may need coaching on assertiveness in client-facing situations."

5. **Facet detail (expandable section):**
   Each factor broken into 2 facets with brief label (e.g., Conscientiousness: Order=High, Self-Discipline=High)

#### Sample Items (Likert: 1=Very Inaccurate to 5=Very Accurate)

1. "I enjoy trying new and different things." (O+)
2. "I prefer to stick to familiar routines." (O-)
3. "I complete tasks on time and according to plan." (C+)
4. "I often leave tasks unfinished." (C-)
5. "I enjoy being the center of attention at social events." (E+)
6. "I find social interactions draining." (E-)
7. "I try to be kind and cooperative with others even when I disagree." (A+)
8. "I can be critical or skeptical of others' motives." (A-)
9. "I often feel nervous or anxious about upcoming events." (N+)
10. "I stay calm under pressure." (N-)

---

## 4. Scoring Architecture

### 4.1 Norm Group Strategy (Phase 1)

Phase 1 launches with a single general adult working population norm group (published academic norms).
This is disclosed clearly to recruiters. Phase 2 develops internal norms from AssInt's own accumulated
data (requires N ≥ 300 per instrument per country).

| Instrument | Phase 1 Norm Source | Phase 2 Target |
|---|---|---|
| RIASEC | Holland Code published norms (US adult) | In-platform working adult norms |
| CAT | Published cognitive ability test norms | Industry-stratified norms |
| VRA | Published verbal ability norms | Education-stratified norms |
| CTA | Torrance TTCT normative database | In-platform creative industry norms |
| ART | LSAT/GRE score distribution data | Professional role norms |
| BFPI | IPIP-NEO normative database (public domain) | In-platform norms |

### 4.2 Score Display Hierarchy

Every score is reported at three levels of granularity:

```
Level 1: Band label       → "High" (shown to recruiter in candidate list)
Level 2: Percentile       → "82nd percentile" (shown in candidate profile)
Level 3: Raw score + T    → "Raw: 39/48 | T-score: 62" (shown in detailed report / PDF)
```

This hierarchy respects that most recruiters are not psychometricians while still providing full
transparency for those who need it.

### 4.3 Battery Composite Score

When multiple instruments are combined in a battery, the recruiter can configure a **weighted
composite score** for ranking candidates:

```
Battery_composite = Σ (weight_i × percentile_i) / Σ weight_i
```

Default weights (recruiter-adjustable):
- CAT: 35%
- ART: 25%
- VRA: 20%
- CTA: 20%
- RIASEC / BFPI: excluded from composite (profile, not performance measures)

The composite produces a single "Assessment Score" (0–100) for each candidate, enabling ranked
sorting in the recruiter dashboard.

### 4.4 Pass/Fail Thresholds

Recruiters can configure a minimum band per instrument. Candidates who fall below any minimum are
flagged (not auto-rejected — that would create adverse impact liability). Options:

- "Flag for review" (default) — candidate visible with yellow warning
- "Archive" (aggressive) — candidate moved to rejected stage (requires recruiter confirmation)

**AssInt recommendation (displayed in UI):** "We recommend 'Flag for Review' rather than automatic
rejection based solely on assessment scores. Assessments are one input among many."

---

## 5. Candidate Experience

### 5.1 Invitation Flow

```
[Recruiter sends invitation from AssInt dashboard]
        |
        v
[Candidate receives email]
Subject: "Complete your assessment for [Role] at [Company]"

Body:
- What tests are included (names + time estimates)
- Total estimated time: ~45 minutes
- Deadline (if set)
- [Start Assessment] button → https://assint.com/test/[token]
```

The URL `/test/[token]` is the candidate portal entry point. No login required.
`[token]` resolves to a `CandidateInventorySession` in the database.

### 5.2 Candidate Portal Pages

**Route pattern:** `/test/[token]/*` — added to `publicRoutes` in middleware.ts

#### Page: `/test/[token]` — Welcome & Overview

```
[Company Logo (from org)]

Welcome, [Candidate Name]

You have been invited to complete an assessment for:
[Role Title] at [Company Name]

This assessment includes:
  1. Cognitive Ability Test        — 35 minutes
  2. Verbal Reasoning Assessment   — 20 minutes
  3. RIASEC Career Interest        — 15 minutes
  ─────────────────────────────────────────────
  Total estimated time:              ~70 minutes

You may pause between sections, but not within a timed section.
Once you start a timed section, the clock does not stop.

Deadline: [Date/Time] or "No deadline"

Before you start:
  ✓ Find a quiet location with stable internet
  ✓ Use a laptop or desktop (not mobile, for timed tests)
  ✓ Have ~75 minutes available without interruption

[Begin Assessment] button
```

#### Page: `/test/[token]/[instrumentSlug]` — Test Delivery

**For all instruments:**
- Progress bar: "Question 8 of 24"
- Timer (for timed tests): countdown clock in top-right, turns red at 5 minutes
- Question number and type label
- Response area (MCQ radio buttons / text textarea for open-ended)
- [Next] button — disabled until response selected/entered
- [Previous] button (disabled for timed sub-scales after advancing)

**For MCQ items:**
```
[Timer: 12:43 remaining]                      Question 14 of 16

Verbal Reasoning

A report states: "All project managers attended the training session.
Marcus did not attend the session." What can be concluded?

  O  Marcus is a project manager
  O  Marcus is not a project manager
  O  The training session was optional
  O  Cannot be determined from the information given

                                              [Next →]
```

**For open-ended items (CTA):**
```
[Timer: 18:42 remaining]                      Item 3 of 18

Creative Thinking — Alternate Uses

List as many different uses as you can think of for a
PAPER CLIP. Try to go beyond the obvious. Aim for variety.

[                                           ]
[  Large text area                          ]
[  (no minimum word count)                  ]
[                                           ]

Ideas so far: 0

                                              [Next →]
```

**Between timed sections:**
```
Section 1 Complete: Verbal Reasoning Assessment

You answered 22 of 24 questions.
Time used: 18:34 of 20:00

Take a short break if needed.
The next section is:

  Numerical Reasoning — 15 minutes

Press [Continue] when you are ready to start the timer.
```

#### Page: `/test/[token]/complete` — Completion Screen

```
[Company Logo]

Assessment Complete

Thank you, [Name]. You have completed all required assessments.

Your results will be reviewed by the hiring team at [Company].
You can expect to hear back within [X business days] if available.

What happens next:
  1. The hiring team reviews your results alongside your application
  2. Shortlisted candidates will be contacted for an interview
  3. All candidates receive a decision notification

Have questions? Contact [recruiter email]

[Close window]
```

**Note:** Candidates do NOT see their own scores in Phase 1. This is intentional — test security
and norm confidentiality. Phase 2 can include a candidate-facing feedback report as a feature.

### 5.3 Test Security Measures

| Measure | Default | Opt-in |
|---|---|---|
| Tab-switch detection | On | — |
| Timer enforcement | On | — |
| Full-screen mode (recommended) | Prompt (not enforced) | Force enforce |
| Webcam proctoring | Off | On |
| IP address logging | On | — |
| Item randomization | On (per bank) | Off |
| Response-level timestamps | On | — |
| Copy-paste disable | Off | On |

Tab-switch and timer events are logged to `InventoryProctorLog` (same pattern as `ProctorLog`
for async video interviews).

### 5.4 Sequence When Multiple Instruments Are Assigned

Instruments in a battery are presented sequentially. Default order (recruiter can reorder):

1. BFPI (if included) — first, because it's low-stakes and warms candidates up
2. RIASEC (if included) — second, same rationale
3. VRA — before CAT, because it's slightly lower stakes
4. CAT — core cognitive screen
5. ART — most demanding, placed after cognitive baseline established
6. CTA — last, because open-ended items require mental flexibility; better after structured items

Candidates can pause between (not within) timed sections. Session state is persisted server-side
so candidates can return using the same link if they close the browser between sections.

---

## 6. Recruiter Experience

### 6.1 Creating an Assessment Battery

**Route:** `/inventory/new` (new page in dashboard)

#### Step 1: Name and Role Context

```
Assessment Battery Builder

Battery Name:  [Data Analyst Screening Battery  ]
Role:          [Data Analyst                    ]
Department:    [Analytics                       ]

(Or link to existing Assessment: [Select...])
```

#### Step 2: Select Instruments

Grid of instrument cards, each showing:
- Instrument name + icon
- What it measures (1 sentence)
- Item count + time
- Toggle: On/Off

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  Cognitive Ability Test     │  │  Verbal Reasoning (VRA)     │
│  General intelligence       │  │  Reading + logic from text  │
│  48 items · 35 min         │  │  24 items · 20 min          │
│                         [ON]│  │                         [ON]│
└─────────────────────────────┘  └─────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│  Analytical Reasoning (ART) │  │  Creative Thinking (CTA)    │
│  Logic, deduction, argument │  │  Divergent thinking         │
│  30 items · 25 min         │  │  18 items · 25 min          │
│                         [ON]│  │                        [OFF]│
└─────────────────────────────┘  └─────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│  RIASEC Career Interest     │  │  Big Five Personality       │
│  Vocational interest profile│  │  OCEAN personality factors  │
│  66 items · 15 min         │  │  60 items · 12 min          │
│                        [OFF]│  │                        [OFF]│
└─────────────────────────────┘  └─────────────────────────────┘

Estimated total time: ~80 minutes  [Recommended: keep under 90 min]
```

#### Step 3: Configure Thresholds (Optional)

For each selected cognitive instrument:
```
Cognitive Ability Test — Minimum Threshold
  Overall:         [ Any band ▼ ]  (None / Low / Below Average / Average / High / Exceptional)
  Verbal sub:      [ Any band ▼ ]
  Numerical sub:   [ High      ▼ ]  ← recruiter sets this
  Abstract sub:    [ Any band ▼ ]

Action on below threshold:
  ( ) Flag for review   (recommended)
  ( ) Move to Rejected
```

#### Step 4: Configure Battery Composite Weights

```
How do you want to weight scores in the ranked list?

  CAT (Cognitive Ability):     [35]%
  VRA (Verbal Reasoning):      [25]%
  ART (Analytical Reasoning):  [40]%
  ─────────────────────────────────
  Total:                       100%

RIASEC and Big Five are excluded from composite (they are profiles, not performance scores).
```

#### Step 5: Review and Save

```
Battery Summary: Data Analyst Screening Battery

Instruments:         CAT · VRA · ART
Estimated time:      ~80 minutes
Threshold flags:     CAT Numerical ≥ High
Composite weights:   CAT 35%, VRA 25%, ART 40%
Deadline:            [Set deadline...] or None

[Save Battery]  [Save and Invite Candidates]
```

### 6.2 Inviting Candidates

**From the battery detail page OR from the candidate profile:**

```
Send Assessment Invitation

Battery:     [Data Analyst Screening Battery]
Candidates:  [Select from candidate list or paste emails]
             +  Add: [name@email.com              ] [+]
Deadline:    [2026-03-15] (optional)
Message:     [Custom message to append to invitation email]

                                [Send Invitations]
```

**Bulk invite:** Paste comma-separated emails. System creates `CandidateInventorySession` +
`CandidateInvite` row per email. If a `Candidate` record already exists with that email in the
org, it is linked. Otherwise, a stub `Candidate` record is created.

### 6.3 Viewing Results Dashboard

**Route:** `/inventory/[batteryId]/results`

#### List View (Ranked)

```
Data Analyst Screening Battery — Results
32 invited · 28 completed · 4 pending

[Filter: All ▼]  [Sort: Assessment Score ▼]  [Export CSV]

Rank  Candidate           Score   CAT    VRA    ART    Status
─────────────────────────────────────────────────────────────────
 1    Diana Chen          94      92%    87%    98%    ● Complete
 2    Raj Patel           88      85%    91%    88%    ● Complete
 3    Sarah Kim           81  ⚠   79%    88%    75%    ● Complete [CAT flag]
 4    James Liu           78      76%    72%    81%    ● Complete
...
28   Tom Nguyen          42      35%    58%    33%    ● Complete
─────────────────────────────────────────────────────────────────
                              28 pending completion
```

Legend: ⚠ = threshold flag triggered

#### Candidate Detail View

Clicking a candidate opens a side panel or full page with:
- **Summary card:** Assessment score, completion time, completion date
- **Per-instrument results:** Score cards for each instrument with percentile + band
- **Radar/bar charts** for multi-dimensional instruments
- **Composite score breakdown** showing how each instrument contributed
- **RIASEC hexagon** (if applicable)
- **BFPI ocean bars** (if applicable)
- **CTA response samples** (if applicable)
- **Proctoring events log** (tab switches, timing anomalies)
- **[Download Report PDF]** button
- **[Advance to Interview]** button → creates Interview record in existing pipeline

#### Comparison View

Select 2–5 candidates and click [Compare]:
- Side-by-side score cards
- Overlaid radar charts (each candidate a different color)
- Dimension-by-dimension table

### 6.4 PDF Report

Auto-generated when recruiter clicks [Download Report] or [Send to Candidate].

**Report structure (2–4 pages):**
1. **Cover page:** Candidate name, role, date, assessment battery name, company logo
2. **Executive summary:** Overall score, recommendation band, 3-sentence narrative
3. **Instrument results:** One section per instrument with charts and narrative
4. **Appendix:** Raw scores, norm group disclosure, interpretation guidance

**Technical implementation:** Generate server-side using a PDF library (e.g., `@react-pdf/renderer`
or Puppeteer rendering a hidden route). Store generated PDF in Vercel Blob with time-limited URL.

---

## 7. Data Model

The following Prisma schema additions are required. These are additive — no existing models are modified.

### 7.1 New Enums

```prisma
enum InventoryTestType {
  RIASEC
  CAT
  VRA
  CTA
  ART
  BFPI
}

enum InventorySessionStatus {
  INVITED      // invite sent, not yet opened
  IN_PROGRESS  // candidate has started at least one instrument
  COMPLETED    // all instruments submitted
  EXPIRED      // deadline passed before completion
  ABANDONED    // candidate started but did not complete (after 7 days of inactivity)
}

enum ItemResponseType {
  MCQ           // selected option index (stored as integer in responseData)
  LIKERT        // 1-5 integer
  OPEN_TEXT     // free text (stored as string in responseData)
  FORCED_CHOICE // selected index of pair (0 or 1)
}
```

### 7.2 AssessmentInventory (the battery)

```prisma
model AssessmentInventory {
  id             String   @id @default(cuid())
  organizationId String
  createdById    String
  name           String
  roleTitle      String?
  assessmentId   String?  // optional link to existing Assessment
  compositeWeights Json   // { CAT: 35, VRA: 25, ART: 40 } — percentage weights
  deadlineHours  Int?     // rolling deadline from invite send time (null = no deadline)
  proctor        Boolean  @default(false) // enable webcam proctoring
  status         String   @default("ACTIVE") // ACTIVE / ARCHIVED
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization         @relation(fields: [organizationId], references: [id])
  createdBy    User                 @relation(fields: [createdById], references: [id])
  assessment   Assessment?          @relation(fields: [assessmentId], references: [id])

  batteries    InventoryBatteryItem[] // which instruments are in this battery
  sessions     CandidateInventorySession[]

  @@index([organizationId])
  @@index([createdById])
}
```

### 7.3 InventoryBatteryItem (instruments selected per battery)

```prisma
model InventoryBatteryItem {
  id          String             @id @default(cuid())
  inventoryId String
  testType    InventoryTestType
  order       Int                // display/delivery order
  required    Boolean            @default(true)
  thresholds  Json?              // { overall: "AVERAGE", verbal: null, numerical: "HIGH" }

  inventory AssessmentInventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)

  @@unique([inventoryId, testType])
  @@index([inventoryId])
}
```

### 7.4 CandidateInventorySession (one candidate's attempt at one battery)

```prisma
model CandidateInventorySession {
  id          String                 @id @default(cuid())
  inventoryId String
  candidateId String?                // null if invited by email before Candidate record created
  email       String                 // always stored (for invite tracking)
  token       String                 @unique @default(cuid())
  status      InventorySessionStatus @default(INVITED)
  expiresAt   DateTime?
  openedAt    DateTime?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  inventory  AssessmentInventory  @relation(fields: [inventoryId], references: [id])
  candidate  Candidate?           @relation(fields: [candidateId], references: [id])

  testSessions   InstrumentSession[]     // one per instrument in the battery
  proctorLogs    InventoryProctorLog[]
  results        InventoryResult[]       // one per instrument, created on submission

  @@index([inventoryId])
  @@index([candidateId])
  @@index([token])
  @@index([email])
}
```

### 7.5 InstrumentSession (candidate's progress on one specific instrument)

```prisma
model InstrumentSession {
  id                String            @id @default(cuid())
  candidateSessionId String
  testType          InventoryTestType
  status            String            @default("NOT_STARTED") // NOT_STARTED / IN_PROGRESS / COMPLETED / TIMED_OUT
  startedAt         DateTime?
  completedAt       DateTime?
  timeLimitSeconds  Int?              // copied from instrument config at session creation time
  timeSpentSeconds  Int?              // actual time used
  order             Int               // delivery order within battery

  candidateSession CandidateInventorySession @relation(fields: [candidateSessionId], references: [id], onDelete: Cascade)
  itemResponses    ItemResponse[]

  @@unique([candidateSessionId, testType])
  @@index([candidateSessionId])
}
```

### 7.6 ItemResponse (individual item responses)

```prisma
model ItemResponse {
  id                 String           @id @default(cuid())
  instrumentSessionId String
  itemKey            String           // e.g., "CAT_V_001", "RIASEC_R_003" — references item bank
  responseType       ItemResponseType
  responseData       Json             // { selected: 2 } or { text: "..." } or { likert: 4 }
  isCorrect          Boolean?         // null for non-scored items (RIASEC, BFPI)
  respondedAt        DateTime         @default(now())
  timeOnItemMs       Int?             // milliseconds spent on this item

  instrumentSession InstrumentSession @relation(fields: [instrumentSessionId], references: [id], onDelete: Cascade)

  @@unique([instrumentSessionId, itemKey])
  @@index([instrumentSessionId])
}
```

### 7.7 InventoryResult (scored output per instrument per candidate)

```prisma
model InventoryResult {
  id                 String            @id @default(cuid())
  candidateSessionId String
  testType           InventoryTestType
  rawScore           Float?            // may be null for RIASEC (no single raw score)
  percentile         Float?            // 0–100
  tScore             Float?            // T-score (mean=50, SD=10)
  bandScore          Int?              // 1–5 band
  bandLabel          String?           // "High", "Exceptional" etc.
  subScores          Json?             // { verbal: { raw: 14, pct: 72 }, numerical: {...} }
  profileData        Json?             // For RIASEC: { R: 45, I: 63, A: 51, S: 38, E: 42, C: 55 }
  aiScoringData      Json?             // For CTA: { fluency: 12, flexibility: 8, originality: 3.4, elaboration: 2.1, rationale: "..." }
  thresholdPassed    Boolean?          // null if no threshold configured
  normGroupUsed      String?           // "US_ADULT_GENERAL_2024"
  scoredAt           DateTime          @default(now())
  compositeWeight    Float?            // weight used in battery composite (copied from config)

  candidateSession CandidateInventorySession @relation(fields: [candidateSessionId], references: [id], onDelete: Cascade)

  @@unique([candidateSessionId, testType])
  @@index([candidateSessionId])
}
```

### 7.8 InventoryProctorLog (integrity events)

```prisma
model InventoryProctorLog {
  id                 String   @id @default(cuid())
  candidateSessionId String
  instrumentSessionId String?
  eventType          String   // "tab_switch" | "timer_expired" | "copy_attempt" | "face_not_detected" | "browser_resize"
  eventData          Json?
  occurredAt         DateTime @default(now())

  candidateSession CandidateInventorySession @relation(fields: [candidateSessionId], references: [id], onDelete: Cascade)

  @@index([candidateSessionId])
}
```

### 7.9 Organization Model Addition (back-relation)

```prisma
// Add to Organization model:
inventories AssessmentInventory[]
```

### 7.10 Candidate Model Addition (back-relation)

```prisma
// Add to Candidate model:
inventorySessions CandidateInventorySession[]
```

### 7.11 Assessment Model Addition (back-relation)

```prisma
// Add to Assessment model:
inventories AssessmentInventory[]
```

### 7.12 User Model Addition (back-relation)

```prisma
// Add to User model:
inventoriesCreated AssessmentInventory[]
```

---

## 8. API Design

### 8.1 Recruiter APIs (authenticated, org-scoped)

| Method | Route | Description |
|---|---|---|
| GET | `/api/inventory` | List batteries for org |
| POST | `/api/inventory` | Create new battery |
| GET | `/api/inventory/[id]` | Get battery details + configuration |
| PATCH | `/api/inventory/[id]` | Update battery (name, weights, thresholds) |
| DELETE | `/api/inventory/[id]` | Archive battery |
| POST | `/api/inventory/[id]/invite` | Send invitations to candidates |
| GET | `/api/inventory/[id]/results` | List all session results for battery |
| GET | `/api/inventory/[id]/results/[sessionId]` | Get one candidate's full result |
| GET | `/api/inventory/[id]/results/[sessionId]/pdf` | Generate and return PDF report |

### 8.2 Candidate APIs (token-based, public)

| Method | Route | Description |
|---|---|---|
| GET | `/api/test/[token]` | Get session details (battery info, which instruments, status) |
| POST | `/api/test/[token]/start` | Mark session as started, log openedAt |
| GET | `/api/test/[token]/[instrumentSlug]` | Get instrument items for this session |
| POST | `/api/test/[token]/[instrumentSlug]/start` | Start instrument session, record startedAt |
| POST | `/api/test/[token]/[instrumentSlug]/response` | Submit individual item response (real-time save) |
| POST | `/api/test/[token]/[instrumentSlug]/submit` | Submit and score instrument session |
| GET | `/api/test/[token]/status` | Get progress across all instruments (for resume after break) |

### 8.3 Key Implementation Notes

**Item bank storage:** Items are stored as static JSON files or a seeded database table, not in
`ItemResponse`. The `itemKey` in `ItemResponse` references the item bank. This allows item versioning
without migrating response data.

**CTA scoring trigger:** `POST /api/test/[token]/cta/submit` triggers a Claude API call server-side.
The endpoint should return a 202 Accepted immediately, with scoring completing asynchronously.
The candidate sees a "Thank you" screen while scoring runs in the background (< 15 seconds for
12 open-ended items).

**Score calculation:** Happens server-side in the submit handler, not client-side. All scoring logic
is in `lib/inventory/scoring/` — one module per instrument.

**Resumption:** If a candidate closes and reopens the link, `GET /api/test/[token]/status` tells the
frontend which instruments are complete, which are in progress (resume from last saved `itemKey`),
and which are not started. Timed sessions that were abandoned mid-way reset (the timer restarts for
that instrument only).

---

## 9. Fairness and Bias Controls

### 9.1 Adverse Impact Monitoring

All inventory results feed into the existing `BiasReport` pipeline with a new source flag:
`source: "inventory"`. The 4/5ths rule analysis applies to:
- Battery composite scores (pass/fail rate by demographic group)
- Individual instrument results (pass rate by instrument by group)

**Disclosure:** Recruiters are shown the following when enabling automatic threshold gating:
"Cognitive ability tests can have differential impact across demographic groups. We recommend
reviewing adverse impact data monthly and validating that thresholds reflect genuine job-relatedness."

### 9.2 Instrument-Level Bias Risk Ratings

| Instrument | Adverse Impact Risk | Rationale |
|---|---|---|
| CAT | High | Largest adverse impact of any selection tool; well-documented |
| ART | High | Shares variance with CAT; similar risk |
| VRA | Medium-High | Correlates with education level; education-linked disparities |
| CTA | Medium | Cultural influences on "originality" judgments; AI scorer calibration needed |
| RIASEC | Low | Interest profiles show less group mean differences |
| BFPI | Low-Medium | Some facets (Conscientiousness) show small group differences |

### 9.3 Fairness Features Built Into Platform

1. **Score-only display:** Candidate names are collapsed by default in the ranked list view.
   Recruiters must expand to see the name (blind screening mode).

2. **AI scorer calibration for CTA:** The Claude prompt for CTA scoring explicitly instructs
   the model to evaluate fluency, flexibility, originality, and elaboration only — and to
   not use linguistic style, grammar, or cultural familiarity as evaluative criteria.

3. **Norm group disclosure:** Every score display includes the norm group used ("US Adult General
   Population, N=1,200, 2023"). Recruiters can see if norms are appropriate for their context.

4. **Threshold justification field:** When a recruiter sets a minimum band threshold, the system
   prompts them to enter a job-relatedness justification: "Why is this level required for this role?"
   This creates an audit trail.

5. **No autorejection without confirmation:** Even when thresholds are set to "Move to Rejected,"
   the system requires a single-click confirmation: "You are about to archive 14 candidates based
   on assessment scores alone. Confirm?"

6. **Reasonable accommodations flag:** Invitation email includes a line: "If you require
   accommodations to complete this assessment (extended time, screen reader compatibility, etc.),
   please contact [recruiter email]." Extended time (+50%) can be manually enabled per candidate
   by the recruiter.

### 9.4 Accessibility

- All candidate portal pages must pass WCAG 2.1 AA
- Screen reader compatible (ARIA labels on timer, progress bar, answer options)
- Extended time accommodation: recruiter can set `timeLimitMultiplier` on a per-session basis
  (default 1.0, accommodation 1.5 = 50% extra time)
- No color-only information (all status indicators have both color and icon/label)
- Font size minimum 16px in candidate portal

---

## 10. Implementation Roadmap

### Phase 1 — Foundation (Sprint 1–2, ~4 weeks)

**Goal:** Ship CAT + VRA as the MVP instruments. These are the simplest to score (keyed MCQ)
and have the highest recruiter demand.

| Task | Effort | Description |
|---|---|---|
| Schema migration | S | Add all new Prisma models (Section 7) |
| Item bank: CAT | M | Write/source 48 validated items (V, N, A sub-scales), store as JSON seed |
| Item bank: VRA | M | Write/source 24 validated items (passage, vocab, argument) |
| Scoring lib: CAT | M | Raw → percentile → band, norm table as JSON constant |
| Scoring lib: VRA | M | Same pattern |
| Candidate portal: token entry | S | `/test/[token]` welcome page (reuse async interview portal patterns) |
| Candidate portal: test delivery | L | `/test/[token]/[slug]` MCQ + timer UI |
| Candidate portal: completion | S | `/test/[token]/complete` screen |
| Test API routes | L | All 8 candidate-facing routes |
| Battery builder UI | L | `/inventory/new` recruiter page (Steps 1–5) |
| Results dashboard | L | `/inventory/[id]/results` list + detail view |
| Invitation system | M | Email trigger on invite, token generation |
| PDF report (basic) | M | Plain-formatted PDF with scores |
| Org relation + sidebar link | S | Add "Assessments" → "Inventory" to sidebar |

**Not in Phase 1:** RIASEC, ART, CTA, BFPI, webcam proctoring, AI scoring, comparison view

---

### Phase 2 — Full Instrument Library (Sprint 3–4, ~4 weeks)

| Task | Effort | Description |
|---|---|---|
| Item bank: ART | M | 30 items (deductive, grouping, argument, data sufficiency, causal) |
| Item bank: RIASEC | M | 66 Likert items (11 per theme) |
| Item bank: BFPI | S | 60 items (IPIP-NEO, public domain) + 10 validity items |
| Item bank: CTA | M | 18 items (alternate uses, consequence, MCQ, analogy, story title) |
| Scoring lib: ART | S | Same pattern as CAT |
| Scoring lib: RIASEC | M | Theme sums → T-scores, hexagonal distance to benchmark |
| Scoring lib: BFPI | M | Reverse scoring, factor sums, validity indices |
| Scoring lib: CTA | L | AI scoring pipeline via Claude, dimension aggregation |
| CTA async scoring | M | 202 Accepted pattern, background job, result notification |
| Radar chart (RIASEC) | M | Hexagonal visualization component |
| OCEAN bar chart (BFPI) | S | Horizontal bar chart with benchmark overlay |
| Comparison view | M | Side-by-side candidate comparison |
| Blind screening mode | S | Toggle candidate names in results list |
| Threshold justification field | S | Recruiter audit trail for thresholds |
| Webcam proctoring (opt-in) | L | Extend existing MediaPipe/ProctorLog pattern |

---

### Phase 3 — Analytics and Norming (Sprint 5–6, ~4 weeks)

| Task | Effort | Description |
|---|---|---|
| Adverse impact for inventory | M | Extend BiasReport with inventory source |
| In-platform norm accumulation | M | As sessions accumulate, begin tracking internal norms |
| Battery analytics dashboard | M | Completion rates, score distributions, time-on-task |
| Candidate-facing feedback report | L | Optional: send candidate their scores post-decision |
| ATS webhook integration | L | Push inventory results to Greenhouse/Lever via webhook |
| Extended time accommodations UI | S | Recruiter sets timeLimitMultiplier per session |
| Internal norm transition | M | When N ≥ 300, switch to internal norms with disclosure |

---

## 11. Open Questions

These decisions need product/stakeholder input before implementation begins.

| # | Question | Options | Recommendation |
|---|---|---|---|
| 1 | Do we build our own item bank or license one? | Build (full control, slower), License (faster, costly) | Build for Phase 1 using published/adapted content; license for Phase 3 if needed |
| 2 | Do candidates see their own scores? | No (Phase 1), Yes with recruiter permission (Phase 2), Always | No in Phase 1; recruiter-controlled in Phase 2 |
| 3 | Should RIASEC use Likert or forced-choice? | Likert (easier), Forced-choice (more valid) | Likert for v1; forced-choice as v2 option |
| 4 | Which norm group for Phase 1? | US adult (available), SEA/Indonesia (not available), EU adult | US adult with clear disclosure; commission Indonesian study in Phase 3 |
| 5 | Should CTA use AI scoring or human scoring? | AI (scalable, novel), Human (credible, slow) | AI scoring with human review flag; disclose prominently |
| 6 | How do we handle candidates who retake tests? | Block (strict), Allow with score averaging, Allow latest wins | Block for cognitive tests (fairness); allow for RIASEC/BFPI (not speeded) |
| 7 | Are inventory results visible to EVALUATOR role? | Yes, No | No — evaluators see interview scores only; recruiters see inventory results |
| 8 | Do we charge per-session credits for inventory? | Yes (like AI interviews), No (bundle), Tiered | Yes — inventory credits separate from AI interview credits; disclosed in subscription |

---

*This document is a living specification. Update when implementation decisions are made.*
*Link to related specs: `async-video-spec.md`, `sync-ai-interview-spec.md`*
