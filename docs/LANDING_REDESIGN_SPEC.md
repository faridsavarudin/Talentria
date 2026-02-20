# AssInt Landing Page — Complete Visual Redesign Specification

**Version:** 1.0
**Date:** 2026-02-20
**Status:** Ready for Implementation
**Audience:** Frontend developer implementing the redesign

---

## 1. Design Direction & Rationale

### The Problem With the Current Design

The current landing page commits three cardinal sins of SaaS visual design:

1. **Indigo-to-violet gradient everything.** This palette is now synonymous with "AI startup template." Every Tailwind SaaS kit ships with it. When your product is about eliminating bias and establishing trust, looking indistinguishable from a chatbot tool undermines the message.

2. **Centered hero + icon grid features.** The most overused landing page structure in existence. It signals "we used a template" before the visitor reads a single word.

3. **Decorative blobs as depth.** Blurry circular gradients were novel in 2021. They now communicate low design investment.

### The Design Thesis

AssInt is fundamentally about **trust, rigor, and human judgment augmented by data.** The visual language should feel like a well-designed research institution or a thoughtful consultancy — not a consumer AI product. Think: the visual seriousness of Stripe's documentation, the editorial confidence of Notion's 2022 rebrand, the warmth of a good financial advisory brand.

The new palette and layout should communicate:
- **Authority without coldness** — this handles compliance and legal defensibility
- **Human-centered** — real people are evaluated here; candidates are not data points
- **Precision** — numbers, reliability scores, and statistical methods are the product
- **Craft** — small teams built this carefully; it's not a feature factory

### Mood Reference

- **Stripe Press** (editorial gravity, generous whitespace, bold type)
- **Linear** (tight layout density, high information value, neutral-warm palette)
- **Pitch** (large type, strong geometry, editorial section breaks)
- **Almanac.io** (HR SaaS that looks thoughtful, not corporate)

---

## 2. Color System

### 2.1 New Brand Palette — "Slate & Amber"

The new primary color is **warm amber-gold**, supported by **deep charcoal** and **warm off-white**. This palette is rare in the HR SaaS space (which skews blue/purple), immediately distinctive, and semantically appropriate — gold connotes quality judgment, charcoal connotes authority and precision.

```
┌─────────────────────────────────────────────────────────┐
│  PRIMITIVE PALETTE                                       │
│                                                         │
│  Charcoal  #1C1917  ████  Deep, warm dark (not cold)   │
│  Charcoal2 #292524  ████  Slightly lifted dark          │
│  Stone-100 #F5F5F4  ████  Warm off-white (not clinical) │
│  Stone-200 #E7E5E4  ████  Warm light border             │
│  Stone-500 #78716C  ████  Mid warm grey                 │
│  Stone-700 #44403C  ████  Dark warm grey                │
│                                                         │
│  Amber-400 #FBBF24  ████  Brand primary light           │
│  Amber-500 #F59E0B  ████  Brand primary base            │
│  Amber-600 #D97706  ████  Brand primary dark (CTAs)     │
│  Amber-700 #B45309  ████  Brand primary pressed         │
│                                                         │
│  Cream     #FAFAF9  ████  Page background               │
│  White     #FFFFFF  ████  Card / surface                │
│                                                         │
│  Supporting:                                            │
│  Teal-600  #0D9488  ████  ICC/analytics accent          │
│  Rose-600  #E11D48  ████  Bias / alert states           │
│  Green-600 #16A34A  ████  Success / hired states        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Semantic Token Definitions

Add these to `:root` in `/Users/farid/kerja/assint/app/globals.css`, replacing the existing brand block:

```css
/* ── New brand tokens (replaces indigo brand) ── */
--brand:               #D97706;   /* amber-600 — primary CTA color */
--brand-light:         #FBBF24;   /* amber-400 — highlights */
--brand-foreground:    #FFFFFF;   /* text on brand bg */
--brand-muted:         #FEF3C7;   /* amber-100 — tinted backgrounds */
--brand-border:        #FDE68A;   /* amber-200 — tinted borders */

--surface:             #FAFAF9;   /* cream — page background */
--surface-raised:      #FFFFFF;   /* white — card surface */
--surface-sunken:      #F5F5F4;   /* stone-100 — recessed sections */

--ink:                 #1C1917;   /* charcoal — primary text */
--ink-secondary:       #78716C;   /* stone-500 — body / captions */
--ink-tertiary:        #A8A29E;   /* stone-400 — placeholders */

--edge:                #E7E5E4;   /* stone-200 — borders */
--edge-strong:         #D6D3D1;   /* stone-300 — stronger borders */

--hero-bg:             #1C1917;   /* dark charcoal for hero section */
--hero-surface:        #292524;   /* slightly lifted in hero */
--hero-edge:           #44403C;   /* stone-700 — borders in dark hero */
--hero-muted:          #78716C;   /* text muted in dark hero */

/* ── Functional: keep existing score/stage/icc/bias tokens unchanged ── */
/* Score tokens: --score-1 through --score-5 — no change */
/* Stage tokens: --stage-applied through --stage-rejected — no change */
/* ICC tokens: --icc-poor through --icc-excellent — no change */
/* Bias tokens: --bias-none, --bias-monitor, --bias-adverse — no change */
```

### 2.3 CSS Custom Utilities to Add

Add these to `@layer utilities` in globals.css:

```css
/* ── Amber brand button ── */
.btn-amber {
  background: #D97706;
  color: #FFFFFF;
  transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
}
.btn-amber:hover {
  background: #B45309;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px 0 rgb(217 119 6 / 0.35);
}
.btn-amber:active {
  transform: translateY(0);
  box-shadow: none;
}

/* ── Hero dark section ── */
.hero-dark {
  background-color: #1C1917;
}

/* ── Hairline rule (used as section dividers) ── */
.rule-warm {
  border-color: #E7E5E4;
}

/* ── Stat number style ── */
.stat-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  letter-spacing: -0.03em;
}

/* ── Feature section offset stripe (alternating) ── */
.section-stripe {
  background-color: #FAFAF9;
}

/* ── Section stripe dark variant ── */
.section-stripe-dark {
  background-color: #1C1917;
}

/* ── Wordmark style for social proof logos ── */
.wordmark {
  font-weight: 700;
  letter-spacing: -0.04em;
  font-size: 1.125rem;
  color: #A8A29E;
  transition: color 0.15s ease;
}
.wordmark:hover {
  color: #78716C;
}

/* ── Amber underline accent for section headings ── */
.heading-accent::after {
  content: '';
  display: block;
  width: 2.5rem;
  height: 3px;
  background: #D97706;
  margin-top: 0.75rem;
  border-radius: 2px;
}

/* ── Kanban demo container — keep current dark styling ── */
/* No changes to .glass-card — still used in dashboard mockup */
```

---

## 3. Typography System

### 3.1 Font Stack

The Inter font is already loaded. **Do not add a new typeface dependency.** Instead, use Inter's full weight range more intentionally. The current design underuses contrast between weights and sizes.

```
Font family:  Inter (already loaded via --font-inter)
Fallback:     system-ui, -apple-system, sans-serif

The "editorial serif" direction is intentionally rejected here.
Reason: Inter at large sizes with tight tracking reads as genuinely editorial.
Adding a serif creates a font loading penalty and requires careful pairing work.
The goal is not "looks like a editorial magazine" — it's "craft through restraint."
```

### 3.2 Type Scale

```
Role               Size     Weight  Line-height  Tracking   Usage
──────────────────────────────────────────────────────────────────────
display-xl         80px     900     0.95         -0.04em    Hero H1 (desktop)
display-lg         64px     900     0.97         -0.035em   Hero H1 (tablet)
display-md         48px     800     1.05         -0.03em    Hero H1 (mobile)
heading-xl         40px     800     1.1          -0.025em   Section H2 (large)
heading-lg         32px     700     1.15         -0.02em    Section H2 (standard)
heading-md         24px     700     1.2          -0.015em   H3 / feature titles
heading-sm         18px     600     1.3          -0.01em    Card titles
body-lg            18px     400     1.65         0          Long body copy
body-md            16px     400     1.6          0          Standard body
body-sm            14px     400     1.55         0          Captions, meta
label              12px     600     1.4          0.06em     Eyebrow labels (uppercase)
mono               14px     500     1.5          0          Code/data values (tabular)
stat               56px     800     1.0          -0.04em    Hero stat numbers
```

### 3.3 Tailwind Class Mapping

```
display-xl  →  text-[80px] font-black leading-[0.95] tracking-[-0.04em]
display-lg  →  text-6xl font-black leading-[0.97] tracking-[-0.035em]
display-md  →  text-5xl font-extrabold leading-[1.05] tracking-[-0.03em]
heading-xl  →  text-4xl font-extrabold leading-[1.1] tracking-[-0.025em]
heading-lg  →  text-3xl font-bold leading-[1.15] tracking-[-0.02em]
heading-md  →  text-2xl font-bold leading-[1.2] tracking-[-0.015em]
body-lg     →  text-lg font-normal leading-relaxed
body-md     →  text-base font-normal leading-relaxed
label       →  text-xs font-semibold uppercase tracking-[0.06em]
stat        →  text-[56px] font-extrabold leading-none tracking-[-0.04em] tabular-nums
```

### 3.4 Text Color Usage

```
Heading on light bg:   text-stone-900   (#1C1917)
Body on light bg:      text-stone-600   (#78716C)
Caption/meta:          text-stone-400   (#A8A29E)
Heading on dark bg:    text-white
Body on dark bg:       text-stone-300   (#D6D3D1)
Caption on dark bg:    text-stone-500   (#78716C)
Brand accent text:     text-amber-600   (#D97706)
Eyebrow label light:   text-stone-500 uppercase tracking-widest
Eyebrow label dark:    text-amber-400 uppercase tracking-widest
```

---

## 4. Section-by-Section Specifications

---

### Section 1: Header (Navigation)

**Mood:** Minimal authority. Disappears when scrolling, present when needed.

#### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [A logo]  AssInt        Features  Pricing  About        Sign in  [Get started →] │
└─────────────────────────────────────────────────────────────────┘
  ← 64px tall, sticky, bg-white/95 backdrop-blur-sm
  ← border-b border-stone-200 (warmer than slate-100)
```

#### Changes from Current
- Replace indigo logo icon background with **solid amber-600** (#D97706). No gradient.
- Logo mark: Keep the "A" letterform. Container: `rounded-md bg-amber-600 text-white font-black text-sm h-8 w-8`. No gradient.
- "AssInt" wordmark: `text-stone-900 font-bold`. Remove the two-tone indigo color split on "Int". The whole wordmark is one color — charcoal.
- Nav links: `text-stone-600 hover:text-stone-900`. No change in weight.
- "Sign in" button: `text-stone-600 hover:text-stone-900` ghost, no underline on hover, only color shift.
- "Get started" button: `.btn-amber` class. `rounded-md px-4 py-2 text-sm font-semibold`.
- Remove `shadow-indigo-200` from CTA button.

#### Tailwind Classes
```tsx
// Header wrapper
<header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">

// Logo icon
<div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white font-black text-sm">

// Logo wordmark
<span className="text-base font-bold text-stone-900">AssInt</span>

// CTA button
<Button className="btn-amber rounded-md px-4 h-9 text-sm font-semibold border-0 shadow-none">
```

---

### Section 2: Hero

**Mood:** Editorial. Confident. A product that takes its work seriously. Not a feature announcement — a values statement.

**Layout paradigm:** Full-width dark section. Large asymmetric composition. Headline left-anchored, product screenshot right. Stats row sits at the bottom of the hero as a grounding bar.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  bg: #1C1917 (charcoal)              min-height: 100vh on desktop          │
│                                                                            │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────┐   │
│  │                                  │  │                              │   │
│  │  EYEBROW LABEL                   │  │    PRODUCT SCREENSHOT        │   │
│  │  ───────────                     │  │    (Dashboard mockup)        │   │
│  │                                  │  │                              │   │
│  │  Hire people.                    │  │    rounded-2xl border        │   │
│  │  Not assumptions.                │  │    border-stone-700          │   │
│  │                                  │  │    shadow-2xl                │   │
│  │  Body: 18px stone-300            │  │    overflow-hidden           │   │
│  │  120-char max.                   │  │                              │   │
│  │                                  │  │                              │   │
│  │  [Start free trial →]  [Demo]    │  │                              │   │
│  │                                  │  │                              │   │
│  └──────────────────────────────────┘  └──────────────────────────────┘   │
│                                                                            │
│  ┌───────────────── STAT BAR (full width, border-t border-stone-700) ─────┤
│  │   94%              3.2×              0.87               ISO 30405       │
│  │   bias reduction   faster hiring    avg ICC             aligned         │
│  └──────────────────────────────────────────────────────────────────────-─┘
└────────────────────────────────────────────────────────────────────────────┘
```

#### Headline Copy
The new headline prioritizes the emotional outcome, not the technical capability:

**Primary:**
"Hire people.
Not assumptions."

**Sub (body text):**
"AssInt gives your hiring team structured interviews, evaluator calibration, and real-time bias detection — so every decision is fair, consistent, and defensible."

This replaces the current "Make every hire fair and consistent" which is generic benefit language.

#### Eyebrow Label
```
ASSESSMENT INTELLIGENCE PLATFORM
```
Rendered as: `text-amber-400 text-xs font-semibold uppercase tracking-[0.1em]`

No badge/chip. No icon. Just the label with extra letter-spacing. This communicates category, not marketing.

#### CTA Buttons
- Primary: `.btn-amber` — "Start free — no card needed" (remove the generic "trial" framing)
- Secondary: `bg-transparent border border-stone-600 text-stone-200 hover:border-stone-400 hover:text-white` — "See a demo"
- Layout: `flex gap-3 items-center` — side by side, no stacking on desktop

#### Product Screenshot Placement
The existing browser-chrome dashboard mockup from the current hero is adapted here:
- Dark background in the screenshot (`bg-[#0f1117]`) blends naturally with the charcoal hero
- The browser chrome uses `bg-stone-900 border-b border-stone-800`
- The screenshot gets a subtle `ring-1 ring-white/10` instead of `border border-slate-200`
- Apply `transform rotate-[0.5deg]` — a very slight rotation (half a degree) gives it a crafted, non-template feel without being gimmicky
- On mobile: screenshot moves below the text, full width, no rotation

#### Stat Bar
Sits at the bottom of the hero as a full-width `border-t border-stone-800` strip:

```
bg: #292524 (stone-800 equivalent)
padding: py-8 px-container
layout: flex items-center justify-between gap-8
```

Each stat:
```
<div className="flex flex-col items-center">
  <span className="stat-number text-4xl font-extrabold text-white">94%</span>
  <span className="text-xs text-stone-400 mt-1 text-center max-w-[100px] leading-tight">
    reduction in evaluator bias
  </span>
</div>
```

Add a fourth stat for credibility: **"ISO 30405"** / "aligned to hiring standard" — this references the real ISO standard for hiring processes. It signals the product is not aspirational nonsense.

#### Layout: Responsive Breakpoints

```
≥1024px (desktop):  grid grid-cols-[1fr_1fr] gap-16 items-center
                     min-h-screen py-24
                     Headline: text-[72px] (custom, or clamp(48px, 6vw, 80px))

768–1023px (tablet): grid grid-cols-[1fr_1fr] gap-10 items-center
                      py-20
                      Headline: text-5xl

<768px (mobile):     flex flex-col gap-10
                     py-16
                     Headline: text-4xl
                     Screenshot: full width, no rotation
                     Stat bar: grid grid-cols-2 gap-y-6
```

#### Decorative Elements
- **No blobs.** None.
- Subtle grid overlay: A 40px repeating grid pattern at 3% opacity on the dark background communicates precision. Implementation:
  ```css
  .hero-grid-overlay {
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  ```
  Apply as `aria-hidden` absolutely positioned overlay, `pointer-events-none`.
- One amber horizontal accent line: `<div className="w-12 h-0.5 bg-amber-500 mb-8" />` above the headline. This is the sole "decoration" — everything else is earned by content.

---

### Section 3: Social Proof

**Mood:** Credibility bar. Understated. No fanfare — just names.

**Layout:** Full-width warm strip between hero and features.

```
┌────────────────────────────────────────────────────────────────────┐
│  bg: #F5F5F4 (stone-100)   border-y border-stone-200   py-8       │
│                                                                    │
│  Trusted by people-first companies                                 │
│  (text-xs uppercase tracking-widest text-stone-400)               │
│                                                                    │
│  ACME CORP    VERITAS HR    TALENTEDGE    RECRUIT.AI    HIREFAST   │
│  ─────────    ──────────    ──────────    ─────────     ────────   │
│   (wordmark style — large, grey, no logos, heavy tracking)         │
└────────────────────────────────────────────────────────────────────┘
```

#### Wordmark Rendering
Each company name is rendered as a styled wordmark — heavy weight, tight tracking, muted grey — not plain text. The visual effect communicates "company logo placeholder" without requiring actual logo SVGs.

```tsx
<span
  className="text-lg font-bold tracking-[-0.05em] text-stone-300
             hover:text-stone-500 transition-colors duration-200
             cursor-default select-none"
>
  TALENTEDGE
</span>
```

The ALL CAPS + tight tracking is the wordmark character. This is a deliberate design choice — it reads as logos even though it's text.

#### Layout
```
flex flex-wrap items-center justify-center gap-x-12 gap-y-4
```

Dividers between logos: a `1px h-5 bg-stone-300` vertical line between items on desktop (use `divide-x divide-stone-200` on a flex container, or add spans manually).

---

### Section 4: Features

**Mood:** Deep and substantive. This is not a feature checklist — it's a product tour.

**Breaking the icon grid completely.** Instead: **alternating left/right full-width feature sections.** Each feature gets an entire horizontal band with substantial vertical rhythm.

#### Layout Pattern

```
Feature A — Left text, Right visual
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────┐  ┌────────────────────────┐
│  LABEL                    │  │                        │
│  ─────                    │  │   FEATURE VISUAL       │
│  Heading                  │  │   (UI mockup, diagram, │
│  (40px, charcoal)         │  │    or data viz)        │
│                           │  │                        │
│  Body (18px, stone-600)   │  │   bg: stone-100        │
│  2–3 sentences.           │  │   rounded-2xl          │
│                           │  │   border-stone-200     │
│  ● Proof point one        │  │   min-h-[320px]        │
│  ● Proof point two        │  │                        │
│  ● Proof point three      │  │                        │
│                           │  │                        │
└───────────────────────────┘  └────────────────────────┘

Feature B — Right text, Left visual (reversed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Visual]  |  [Text]
```

#### Section Entry
Remove the centered badge + H2 section header. Instead, the section opens with a full-width editorial statement anchored left:

```
WHAT ASSINT DOES
────────────────────────── (amber line)
Six tools. One defensible hire.
```

`text-4xl font-extrabold text-stone-900 tracking-tight max-w-lg`

This sits above the feature rows with `mb-20`.

#### The Six Features, Redesigned

Each feature block uses `py-20 sm:py-28` with `max-w-7xl container`.

**Feature 1 — Assessment Builder**
- Section bg: `bg-white`
- Layout: text left, visual right
- Visual: A simplified rendering of the question builder UI — show a job description input at top, three generated questions below with competency labels. Use `bg-stone-50 rounded-xl border border-stone-200 p-6` as the visual container. All elements are styled div mockups (no real component).
- Label: `ASSESSMENT BUILDER` in amber-600
- Headline: "Turn a job description into 20 calibrated questions."
- Body: "Paste any job posting. AssInt's AI maps it to competencies and generates behavioral questions with BARS anchors and scoring rubrics — in under 60 seconds."
- Proof points: "Competency-mapped questions", "BARS scoring rubrics", "Customizable before sending"

**Feature 2 — Evaluator Calibration**
- Section bg: `bg-stone-50` (alternating stripe)
- Layout: text right, visual left (reversed)
- Visual: Gamified calibration score screen — show a radial score indicator (can be a styled div with a circular progress metaphor), calibration % badge, three evaluator name rows with individual ICC scores.
- Label: `CALIBRATION TRAINING` in amber-600
- Headline: "Your interviewers need practice. Not on real candidates."
- Body: "Before the first real interview, evaluators complete calibration exercises on anonymized cases. Only certified evaluators score candidates."

**Feature 3 — Bias Detection**
- Section bg: `bg-white`
- Layout: text left, visual right
- Visual: A styled table mockup with three demographic rows, rate columns, 4/5ths ratios highlighted in red/green — the adverse impact analysis report, simplified. This is the most visually complex and most valuable thing to show — it's unique to AssInt.
- Label: `BIAS DETECTION` in rose-600 (not amber — bias alerts use rose)
- Headline: "See adverse impact before it becomes a lawsuit."
- Body: "Automated 4/5ths rule analysis across protected groups. Flagged at the question level and the evaluator level — not just at the hiring decision."

**Feature 4 — ICC Analytics**
- Section bg: `bg-stone-50`
- Layout: text right, visual left
- Visual: A simplified ICC gauge component — the existing `IccGauge` design adapted as a static mockup. Show three evaluator pairs with different ICC values, one in red, one amber, one green.
- Label: `RELIABILITY ANALYTICS` in teal-600
- Headline: "Know which evaluators you can trust — and which need coaching."
- Body: "Inter-rater reliability (ICC) tracked in real time. When two evaluators diverge, AssInt surfaces it before a decision is locked."

**Feature 5 — AI Co-Pilot**
- Section bg: `bg-white`
- Layout: text left, visual right
- Visual: A chat-bubble style mockup showing AI-suggested question follow-ups in response to a candidate's answer. Keep it minimal — just 2–3 bubbles.
- Label: `AI CO-PILOT` in amber-600
- Headline: "The evaluator's silent second opinion."
- Body: "While your interviewer talks, AssInt suggests follow-up questions, flags gaps in coverage, and proposes preliminary scores. The human always decides."

**Feature 6 — Kanban Pipeline**
- This feature is skipped in the feature section — it gets its own dedicated demo section (Section 5 / PipelineKanbanDemo). Do not duplicate it here.

#### Responsive Behavior
```
≥1024px:  grid grid-cols-2 gap-16 items-center (alternating)
768–1023px: grid grid-cols-2 gap-10 items-center (alternating)
<768px:   flex flex-col gap-10 (text always first, visual second)
          No alternation on mobile — always text-then-visual
```

---

### Section 5: Pipeline Demo (PipelineKanbanDemo)

**Keep the existing dark kanban component.** It is the strongest visual in the current design. Apply the following refinements only:

#### Refinements

1. **Section background:** Change from `bg-white` to `bg-stone-50`. The dark kanban board reads better floating on warm off-white than pure white.

2. **Section heading:** Remove the amber badge chip. Replace with:
   ```tsx
   <div>
     <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-3">
       KANBAN PIPELINE
     </p>
     <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight">
       Every candidate, always visible.
     </h2>
   </div>
   ```
   Left-aligned (not centered). This is editorial, not decorational.

3. **Score dots accent color:** Change from `bg-indigo-400` to `bg-amber-400` for filled dots. Unfilled dots: `bg-stone-600`.

4. **Column header colors:** Update to new palette:
   - Applied: `border-stone-500 text-stone-400`
   - Screening: `border-amber-500 text-amber-400`
   - Interview: `border-teal-500 text-teal-400`
   - Offer: `border-green-500 text-green-400`

5. **Caption row below the board:** Replace indigo dot with amber:
   - `bg-amber-400` for AI interview scores
   - Keep `bg-teal-400` for ICC
   - Keep `bg-rose-400` for bias flags (was amber, change to rose for accuracy)

6. **Board container:** No structural changes. Keep `bg-[#0f1117]`, the browser chrome, and the column layout exactly as-is.

---

### Section 6: AI Interview CTA (PracticeInterviewDemo)

**Mood:** Dramatic entry point. This should feel like stepping through a door — not clicking a button.

**The current section is too safe.** "Start Practice Interview" is the call to action you'd write if you were afraid. Redesign this section to feel like an invitation to something meaningful.

#### New Layout

Replace the current two-column mock with a **full-width dark immersive section:**

```
bg: #1C1917 (charcoal — matches hero)

┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                                                                    │
│  EYEBROW: TRY IT NOW — NO ACCOUNT NEEDED                         │
│                                                                    │
│  What would you say                                                │
│  if the job started                                                │
│  today?                                                            │
│                                                                    │
│  Body: A 4-question AI-conducted interview.                        │
│  No scheduling. No judgment. Just practice.                        │
│                                                                    │
│  ┌────────────────────────────────────────┐                       │
│  │  LIVE  ●  AI Interviewer               │                       │
│  │  ────────────────────────────────────  │                       │
│  │  "Tell me about yourself and your..."  │                       │
│  │                                        │                       │
│  │  [Microphone waveform animation]       │                       │
│  │                                        │
│  └────────────────────────────────────────┘                       │
│                                                                    │
│  [Begin interview →]          (large, amber button)               │
│                                                                    │
│  No video saved  ·  No account  ·  Browser only  ·  Free         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Typography for Hero Headline
```
"What would you say
if the job started
today?"
```

- Size: `text-5xl sm:text-6xl lg:text-7xl`
- Weight: `font-black`
- Tracking: `tracking-tight`
- Color: `text-white`
- Layout: Left-aligned, not centered. Centered type says "announcement." Left-aligned says "conversation."
- Line breaks are intentional — put `<br />` tags or use `whitespace-pre-line` with newlines

#### UI Preview Card
Simplified version of the current mock — remove the two-column split. Replace with a single horizontal "interview in progress" card:

```
bg: #292524 (stone-800 equiv)
border: 1px solid #44403C
border-radius: 16px
padding: 24px
max-width: 540px
margin: 48px auto OR margin: 48px 0 (left-aligned if headline is left-aligned)

Contents:
- Top row: Red dot + "LIVE" label (existing animate-pulse, keep it)
- AI avatar row: The gradient AI circle, label "AI Interviewer", waveform bars
  - Change avatar from indigo gradient to: bg-amber-500/20 border border-amber-500/40 text-amber-400
  - Waveform bars: bg-amber-400 instead of bg-indigo-400
- Question preview: bg-stone-900 rounded-xl p-4 text-stone-200 text-base
- No CTA inside the card — the main CTA is below the card
```

#### CTA Button (full redesign)
```tsx
<Link href="/demo">
  <button className="
    inline-flex items-center gap-3
    bg-amber-500 hover:bg-amber-400
    text-stone-900 font-bold text-lg
    px-8 py-4 rounded-xl
    transition-all duration-200
    hover:translate-y-[-2px]
    hover:shadow-[0_8px_24px_rgba(245,158,11,0.4)]
    group
  ">
    <Mic className="h-5 w-5" />
    Begin your interview
    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
  </button>
</Link>
```

Note the button label change: "Begin your interview" — not "Start Practice Interview." The word "practice" makes it feel trivial and toy-like. The phrase "Begin your interview" treats the candidate with seriousness even in a demo context.

#### Trust Signals Row
Keep the existing `No account required / No video saved / Runs in browser / Results instantly` row but restyle:

```tsx
<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500">
  {["No account required", "No video saved", "Runs in your browser", "Results in 60 seconds"].map((s, i) => (
    <Fragment key={s}>
      {i > 0 && <span className="text-stone-700">·</span>}
      <span>{s}</span>
    </Fragment>
  ))}
</div>
```

#### Questions Preview (optional, below trust signals)
Replace the chevron list with a subtle numbered list:

```tsx
<div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-lg">
  {DEMO_QUESTIONS.map((q, i) => (
    <div key={i} className="flex items-start gap-3">
      <span className="text-xs font-bold text-amber-500 mt-0.5 tabular-nums">
        {String(i + 1).padStart(2, '0')}
      </span>
      <p className="text-sm text-stone-400">{q}</p>
    </div>
  ))}
</div>
```

---

### Section 7: How It Works (Steps)

**Keep the 3-step structure.** Redesign the visual treatment.

**Current problem:** Indigo gradient squares for step numbers look like every SaaS "3 easy steps" section.

#### New Treatment

Replace gradient squares with large typographic step numbers:

```
bg: bg-white

┌──────────────────────────────────────────────────────────────────┐
│  HOW IT WORKS                                                    │
│  From zero to certified hiring process in one afternoon.         │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐│
│  │                  │  │                  │  │                  ││
│  │  01              │  │  02              │  │  03              ││
│  │  ──              │  │  ──              │  │  ──              ││
│  │  Build your      │  │  Calibrate your  │  │  Analyze and     ││
│  │  assessment      │  │  evaluators      │  │  decide          ││
│  │                  │  │                  │  │                  ││
│  │  Body text...    │  │  Body text...    │  │  Body text...    ││
│  │                  │  │                  │  │                  ││
│  └──────────────────┘  └──────────────────┘  └──────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

Step numbers:
```tsx
<span className="text-7xl font-black text-stone-100 leading-none tabular-nums select-none">
  01
</span>
```

The `text-stone-100` makes them large but recessive — they anchor the layout without competing with the heading.

Step heading: `text-xl font-bold text-stone-900 mt-3 mb-2`

Divider between number and heading: `w-8 h-0.5 bg-amber-500 mt-2 mb-4`

Connector lines between steps (desktop only): A horizontal dashed line `border-t border-dashed border-stone-200` at the midpoint of the step numbers, `aria-hidden`. This implies sequence without being heavy-handed.

---

### Section 8: Pricing

**Mood:** Clear, honest, unapologetic. No gradient card for the featured plan.

#### New Pricing Card Layout

**The most important change:** Remove the `bg-gradient-to-b from-indigo-600 to-violet-700` featured card. It reads as desperate. Replace with a `border-2 border-amber-500` outline treatment on the featured card against a white background.

```
bg: bg-stone-50 (section)

┌─────────────────┐   ┌──────────────────────────────┐   ┌─────────────────┐
│  Free           │   │  Starter          ★ Popular  │   │  Professional   │
│                 │   │  ──────────────────────────  │   │                 │
│  $0             │   │  $49/mo                      │   │  $149/mo        │
│  forever        │   │                              │   │                 │
│                 │   │  border-2 border-amber-500   │   │                 │
│  border-stone   │   │  shadow-lg                   │   │  border-stone   │
│  bg-white       │   │  bg-white                    │   │  bg-white       │
│                 │   │  scale-[1.02]                │   │                 │
└─────────────────┘   └──────────────────────────────┘   └─────────────────┘
```

#### Featured Card Treatment
```tsx
// Featured card
<div className="
  relative flex flex-col rounded-2xl p-7 bg-white
  border-2 border-amber-500
  shadow-[0_0_0_4px_rgb(245_158_11_/_0.12)]
  scale-[1.02]
">
  {/* Most popular badge — repositioned */}
  <div className="absolute -top-3 left-6">
    <span className="inline-flex items-center gap-1.5 rounded-full
                     bg-amber-500 text-stone-900
                     px-3 py-1 text-xs font-bold tracking-wide">
      Most popular
    </span>
  </div>
```

#### Non-Featured Card
```tsx
<div className="
  relative flex flex-col rounded-2xl p-7 bg-white
  border border-stone-200
  shadow-sm
">
```

#### Checkmark Color
All three cards: `text-amber-500` for checkmarks (consistent, not `text-indigo-500`).

#### Price Typography
```tsx
<span className="text-4xl font-extrabold text-stone-900 tabular-nums">
  $49
</span>
<span className="text-sm text-stone-500 ml-1">/ month</span>
```

#### CTA Buttons in Cards

- Free plan: `variant="outline"` with `border-stone-300 text-stone-700 hover:bg-stone-50`
- Featured (Starter): `.btn-amber` full width
- Professional: `variant="outline"` with `border-stone-300 text-stone-700 hover:bg-stone-50`

Do not use `btn-brand-gradient` anywhere in the pricing section.

#### Section Header
```tsx
<div className="mb-16">
  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-3">
    PRICING
  </p>
  <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight">
    Simple pricing.<br />No surprises.
  </h2>
  <p className="mt-4 text-lg text-stone-600 max-w-md">
    Start free. Upgrade when your team needs more. Cancel anytime.
  </p>
</div>
```

Left-aligned, not centered. Matches the editorial voice established in Features.

---

### Section 9: Final CTA Banner

**Current:** Indigo gradient banner. Looks like the hero, which weakens both.

**New approach:** A full-bleed charcoal section (same as hero) with a single strong statement and one primary CTA.

```
bg: #1C1917 (charcoal)
py-28 sm:py-36

┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  The fair hire                                                     │
│  starts here.                                                      │
│                      (text-5xl sm:text-6xl font-black text-white) │
│                                                                    │
│  [Start for free →]                                                │
│  (btn-amber, large, w-auto)                                        │
│                                                                    │
│  Already have an account? Sign in                                  │
│  (text-stone-400, inline link text-stone-300 underline)            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

No rounded card container (the current `mx-4 rounded-3xl` pattern). This section bleeds edge to edge — it's a statement, not a callout box.

The amber horizontal line accent appears above the headline (same treatment as hero).

---

### Section 10: Footer

**Mood:** Clean, functional, warm. Not an afterthought.

**Changes:**
- Background: `bg-stone-900` (dark footer for contrast after the dark CTA section — they should feel connected)
- Text: `text-stone-400` for body, `text-stone-200` for heading
- Logo icon: `bg-amber-600` (consistent with header)
- Logo wordmark: `text-white`
- Link hover: `text-stone-200`
- Column headers: `text-xs uppercase tracking-[0.1em] text-stone-600`
- Divider: `border-stone-800`
- Copyright line: `text-stone-600`
- Tagline: `text-stone-500` — "Built for fair hiring." (keep — it's good)

Section columns remain the same (Product, Company, Legal).

---

## 5. Global Layout Tokens

### Container
All sections use the same container:
```tsx
<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

### Section Vertical Rhythm
```
Standard section:   py-24 sm:py-32
Tight section:      py-16 sm:py-20
Hero:               pt-24 pb-0 sm:pt-32 (stat bar handles bottom)
CTA banner:         py-28 sm:py-36
Footer:             py-16
```

### Border Radius
```
Cards:              rounded-2xl  (standard, 16px)
Buttons:            rounded-md   (8px — tighter than current rounded-full for primary CTA)
Chips/badges:       rounded-full (keep for small labels)
Feature visuals:    rounded-xl   (12px)
```

The current mixing of `rounded-full` buttons and other shapes creates visual inconsistency. Moving primary CTAs to `rounded-md` makes them look more like a product tool and less like a consumer app.

---

## 6. Animation & Motion

**Principle:** Motion is functional, not decorative. Every animation serves cognition.

```
Page scroll reveals:  No. Do not add scroll-triggered animations.
                      They're distracting and often break accessibility
                      (prefers-reduced-motion). Keep content fully visible.

Button hover:         translateY(-1px) + shadow transition
                      Duration: 150ms, easing: ease

Nav scroll:           backdrop-blur already present — keep

CTA arrow:            translateX(4px) on parent hover — keep
                      Duration: 200ms, easing: ease

Waveform bars:        Keep the static waveform in interview demo.
                      Do not add animation — it implies the demo is live
                      when it is not, which is deceptive UX.

Score dots:           No animation — they're static mockups

LIVE indicator:       Keep animate-pulse on the red dot — it's semantic
                      (communicates "recording active")
```

---

## 7. Accessibility Requirements

These apply across the entire landing page:

| Requirement | Implementation |
|---|---|
| WCAG 1.4.3 contrast (AA) | Amber-600 (#D97706) on white: 3.1:1 — **FAILS AA for normal text.** Use amber-700 (#B45309) on white for text. Amber-500 on stone-900 passes at 6.8:1. |
| Amber on dark (hero) | Amber-400 (#FBBF24) on #1C1917: contrast 8.9:1 — passes AAA |
| Focus rings | Add `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2` to all interactive elements |
| Touch targets | All buttons minimum 44x44px. The `h-9` header button (36px) is borderline — add `py-2.5` to reach 40px or use `h-11` |
| Screen reader | Remove decorative dividers from tab order: `aria-hidden="true"` on bullet separators and decorative lines |
| Reduced motion | Wrap transitions in `@media (prefers-reduced-motion: reduce)` — disable hover transforms and all non-semantic transitions |
| Heading hierarchy | Verify one H1 per page (hero). Section headings use H2. Feature titles use H3. No skipped levels. |
| Alt text | All UI mockup containers: `aria-label="[Feature name] interface preview" role="img"` |

**Critical contrast fix:** The current `btn-brand-gradient` uses `#6366f1` which at small sizes on white is marginal. The new `.btn-amber` must use `bg-amber-600` (#D97706) only for large button backgrounds, never for small text. For text labels referring to the brand, always use `text-amber-700` (#B45309) on white backgrounds.

---

## 8. Removal Checklist

The following elements must be removed or replaced:

| Remove | Replace With |
|---|---|
| `hero-gradient` CSS class (radial indigo blobs) | `hero-dark` + `hero-grid-overlay` |
| All `bg-gradient-to-r from-indigo-600 to-violet-600` | Removed entirely. No gradient text anywhere. |
| All `bg-gradient-to-br from-indigo-500 to-violet-600` on icons and buttons | `bg-amber-600` solid |
| Decorative `blur-3xl` circular divs | None. No replacement. |
| `btn-brand-gradient` CSS class | Keep in globals.css for app interior, but do not use on landing page |
| Centered section headers with badge chips | Left-aligned eyebrow label + heading |
| `text-indigo-600` heading accent spans | `text-amber-600` or no color accent (plain charcoal) |
| The Sparkles icon on badges | Remove entirely. No sparkle icons anywhere on landing. |
| `from-indigo-600 to-violet-700` featured pricing card | White card with amber border treatment |
| The `hero-gradient` section wrapper | Dark charcoal section |

---

## 9. File Change Summary

### `/Users/farid/kerja/assint/app/globals.css`
- Add new brand token variables under `:root` (Section 2.2 above)
- Add new utility classes (Section 2.3 above): `.btn-amber`, `.hero-dark`, `.hero-grid-overlay`, `.wordmark`, `.heading-accent`, `.stat-number`, `.rule-warm`
- Do not remove `.btn-brand-gradient`, `.glass-card` — used in dashboard app interior

### `/Users/farid/kerja/assint/app/page.tsx`
- Full structural redesign per this spec
- Remove `FEATURES` array grid pattern; replace with alternating feature sections
- Update `COMPANIES` wordmark rendering
- Update `HERO_STATS` to include ISO stat
- Update `PRICING` card layout (no gradient featured card)
- Update all color references from indigo to amber/stone

### `/Users/farid/kerja/assint/components/landing/PipelineKanbanDemo.tsx`
- Update section background, heading style, score dot colors, column accent colors
- No structural changes to the kanban board itself

### `/Users/farid/kerja/assint/components/landing/PracticeInterviewDemo.tsx`
- Full layout redesign: dark section, large editorial headline, single-column interview card
- Update AI avatar styling: amber instead of indigo
- Restyle CTA button: amber, `Begin your interview`
- Restyle question preview: numbered list with amber numbers

---

## 10. Implementation Priority Order

Implement in this order to maintain a releasable state at each step:

1. **Color tokens** — Add CSS variables to globals.css (5 min, zero visual risk)
2. **Utility classes** — Add `.btn-amber` and other utilities (5 min)
3. **Header** — Update logo, button color (10 min, isolated)
4. **Pricing** — Update card treatment (15 min, self-contained section)
5. **Social proof** — Update wordmark rendering (10 min)
6. **Hero** — Full redesign: dark section, split layout, stat bar (45 min — highest impact)
7. **Features** — Replace grid with alternating sections (60 min — most work)
8. **PipelineKanbanDemo** — Minor updates (15 min)
9. **PracticeInterviewDemo** — Layout redesign (30 min)
10. **CTA Banner** — Replace gradient with dark section (15 min)
11. **Footer** — Dark footer treatment (15 min)
12. **How it works** — Typographic step numbers (15 min)

Total estimated implementation time: **4–5 hours** for a single experienced Next.js/Tailwind developer.

---

## 11. Design Rationale Summary

| Decision | Rationale |
|---|---|
| Charcoal hero, not gradient | Dark + warm is rare in HR SaaS. Creates immediate visual differentiation. Amber on charcoal is high-contrast and distinctive. |
| Amber as brand primary | Not used by any major HR/ATS competitor (they use blue, indigo, or green). Amber = quality judgment, precision, earned trust. |
| No gradient text | Gradient text on headings is overused to signal "AI." We want to signal "serious tool." |
| Left-aligned section headers | Editorial rhythm. Centered text says "template." Left-aligned says "voice." |
| Alternating feature sections | Forces more content per feature. Gives each feature visual space proportional to its complexity. Removes the "12-feature grid that nobody reads" problem. |
| Wordmarks instead of logo placeholders | Honest about being placeholder content. Styled to look intentional, not like missing assets. |
| `rounded-md` CTAs not `rounded-full` | Pill buttons feel consumer/social. Rounded rectangle buttons feel product/B2B. |
| "Begin your interview" not "Start Practice Interview" | Language that respects the user's context. Candidates under hiring pressure respond to gravitas, not casualness. |
| Dark footer connecting to dark CTA | Creates a visual bracket with the dark hero. The page begins and ends dark — the content in between is the "bright" product story. |
| No scroll animations | Accessibility. Cognitive focus. `prefers-reduced-motion` compliance without having to write exception rules. |
