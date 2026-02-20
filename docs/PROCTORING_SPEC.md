# AssInt Assessment Inventory — Proctoring Specification

**Version:** 1.0
**Date:** February 2026
**Author:** Assessment Expert Agent
**Status:** Draft — Ready for Engineering Review
**Applies to:** All instruments in the Assessment Inventory module (`/test/[token]/*`)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [What to Monitor and Why](#2-what-to-monitor-and-why)
3. [Severity Levels](#3-severity-levels)
4. [Per-Instrument Thresholds](#4-per-instrument-thresholds)
5. [Proctor Report for Recruiters](#5-proctor-report-for-recruiters)
6. [Integrity Score Calculation](#6-integrity-score-calculation)
7. [Candidate Communication](#7-candidate-communication)
8. [Phase 2 — Optional Enhanced Proctoring](#8-phase-2--optional-enhanced-proctoring)
9. [Data Model and Storage](#9-data-model-and-storage)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. Design Philosophy

Proctoring in psychometric assessments is a tension management exercise: too little monitoring enables coaching and cheating, which degrades measurement validity; too much monitoring creates anxiety, candidate drop-off, and legal exposure. This spec resolves that tension through a set of explicit principles.

### 1.1 Core Principles

**1. Proctoring is for signal, not surveillance.** The goal is to flag sessions that warrant human review — not to automatically reject candidates or accuse them of cheating. Every proctoring event is a data point that feeds a recruiter recommendation, never an automatic disqualification trigger.

**2. Transparency with candidates.** Candidates are told upfront exactly what is monitored. No hidden collection. Monitoring that is disclosed and consented to is both legally sounder and psychometrically preferable — it shifts candidate behavior toward genuine effort rather than gaming the monitoring system.

**3. The instrument is the primary integrity tool.** Good test design (item randomization, large item banks, time pressure calibrated to prevent look-up) reduces cheating more effectively than any proctoring technology. Proctoring catches the margins.

**4. Severity must be proportional.** A candidate who switches tabs once during a 35-minute test is not equivalent to a candidate who pastes clipboard content into every open-ended item. The system must distinguish meaningfully.

**5. Accommodate without compromising integrity.** Candidates with extended-time accommodations must not have stricter per-item thresholds applied. The system adjusts thresholds dynamically based on `timeLimitMultiplier`.

**6. Adverse impact from proctoring is real.** Minority candidates and international candidates are more likely to be flagged for environmental factors (internet drops, shared-space interruptions) that are indistinguishable from intentional cheating. Recruiters are trained to treat proctoring data as context, not verdict.

---

## 2. What to Monitor and Why

### 2.1 Tab/Window Switching (Page Visibility API)

**What it is:** The browser's `Page Visibility API` (`document.visibilityState`) fires a `visibilitychange` event when the candidate navigates away from the test tab — switching to another browser tab, opening a new window, minimizing the browser, or switching applications.

**Why it matters:** Tab switching is the primary vector for cognitive test cheating. For timed MCQ tests (CAT, VRA, ART), a candidate can screenshot a question, switch to Google or a calculator, find the answer, and return. This inflates scores in ways that damage predictive validity.

**What constitutes what:**

| Event Pattern | Classification | Rationale |
|---|---|---|
| Tab invisible for < 3 seconds, once | Info | Accidental misclick, OS notification, muscle memory |
| Tab invisible for 3–15 seconds, once | Warning | Possible distraction; may be intentional |
| Tab invisible for > 15 seconds, once | Violation | Sufficient time to look up an answer on most items |
| Tab invisible for any duration, 3+ times | Violation | Pattern indicates intent regardless of duration |
| Tab invisible during non-timed instruments (BFPI, RIASEC) | Info only | Not speeded; look-up is less meaningful |
| Tab switch immediately after question advance | Warning | Indicates preparation — switched before question even rendered |

**Implementation:** Register `visibilitychange` event listener on mount. Log: `{ type: "tab_switch", visibleAt: timestamp, hiddenAt: timestamp, durationMs: number, itemKey: string, instrumentType: string }`. Send to `POST /api/test/[token]/proctor-event` on visibility restore.

**Do not block or freeze the timer** when a tab switch occurs. Timer continues. This is intentional — freezing the timer on tab switch creates an incentive to switch tabs to pause the clock.

---

### 2.2 Copy-Paste Attempts (Open-Ended Items — CTA Only)

**What it is:** Clipboard paste events (`paste` event listener on textarea elements) and programmatic copy events (`copy` event on the document during test session).

**Why it matters:** The Creative Thinking Assessment (CTA) uses open-ended text responses that AI-scores for fluency, flexibility, originality, and elaboration. A candidate who pastes a ChatGPT-generated response inflates all four dimensions fraudulently. This is the most material integrity risk for the CTA instrument specifically.

**What constitutes what:**

| Event | Classification | Rationale |
|---|---|---|
| Paste event on any CTA open-ended textarea | Violation | Strongly suggests external AI or pre-written content |
| Paste event on a non-CTA item (e.g. accidentally triggered) | Info | MCQ items have no textarea; event can only fire if candidate clicked background |
| Copy event (text selected + Ctrl+C / Cmd+C) on question text | Info | Candidate copying question to external tool — monitor but not actionable alone |
| Copy event 3+ times on question text | Warning | Pattern suggests external tool usage |

**Implementation:** On each `<textarea>` for CTA open-ended items, attach `onPaste` handler that: (a) logs the event with item key, (b) does NOT prevent the paste action (preventing paste would silently corrupt the candidate experience), (c) records a flag in `InventoryProctorLog`. Recruiters see "clipboard paste detected on item CTA_ALT_001" in the event log.

**Do not use clipboard content inspection.** Reading clipboard content is legally restricted in most jurisdictions and is a significant privacy overreach for a hiring tool. Log the event occurrence only.

---

### 2.3 Clipboard Access Attempts (programmatic)

**What it is:** Detection of JavaScript clipboard API calls (`navigator.clipboard.readText()`) from the page context. This catches scenarios where a browser extension or injected script attempts to read clipboard content programmatically.

**Why it matters:** This is distinct from manual paste — it represents tooling. A candidate using an AI assistant browser extension may trigger this vector.

**What constitutes what:**

| Event | Classification |
|---|---|
| `navigator.clipboard.readText()` called once | Warning |
| `navigator.clipboard.readText()` called 3+ times | Violation |

**Implementation:** Intercept `navigator.clipboard.readText` on page load by wrapping it:
```javascript
const originalRead = navigator.clipboard.readText.bind(navigator.clipboard);
navigator.clipboard.readText = async () => {
  logProctorEvent({ type: 'clipboard_read_attempt', itemKey: currentItemKey });
  return originalRead(); // do not block — just log
};
```

This is browser-side only and can be bypassed by sufficiently technical candidates, but it covers the vast majority of tooling scenarios.

---

### 2.4 Time-per-Question Analysis

**What it is:** The time a candidate spends on each individual item, derived from `timeOnItemMs` stored in `ItemResponse`. This is logged server-side at item submission time — the client sends the `respondedAt` timestamp and the server compares against `instrumentSession.startedAt` and prior item timestamps.

**Why it matters (two directions):**

- **Suspiciously fast responses** on cognitively demanding items (CAT abstract reasoning, ART logical grouping) suggest the candidate has seen the item before (item exposure), is guessing rapidly rather than attempting, or is using an external tool and pasting answers.
- **Suspiciously slow responses** on a timed test suggest the candidate has paused (possibly looking something up) or is copying the question to an external tool.

Fast responses are a validity signal (score may be inflated); slow responses are an integrity signal (possible external aid). Both are flagged at different thresholds.

Full thresholds by instrument are specified in Section 4.

**Implementation:** On each item submission (`POST /api/test/[token]/[slug]/response`), compute `timeOnItemMs = now - previousItemSubmittedAt`. Store in `ItemResponse`. After instrument submission, run the threshold analysis server-side and write any violations to `InventoryProctorLog`.

---

### 2.5 Full-Screen Exit Detection (Phase 2)

**What it is:** Using the Fullscreen API (`document.fullscreenElement`) to detect when a candidate exits full-screen mode. Phase 1 prompts candidates to enter full-screen mode but does not enforce it. Phase 2 (opt-in per battery) enforces it.

**Phase 1 behavior:** On test start, show a prompt: "For the best experience, we recommend entering full-screen mode. This also helps maintain your focus." Provide [Enter Full Screen] button. If candidate declines, log `fullscreen_declined` as Info. Not enforced.

**Phase 2 behavior (opt-in):** Battery-level setting `enforceFullscreen: true`. If candidate exits full-screen during a timed instrument: trigger Warning (first exit) or Violation (second+ exit). Show an in-test banner. Timer continues.

**Implementation note for Phase 2:** `document.addEventListener('fullscreenchange', handler)`. On exit: log event, show overlay warning, require candidate to re-enter full-screen via button before continuing.

---

### 2.6 Webcam Snapshots (Phase 2, with explicit consent)

**What it is:** Periodic still-image captures from the candidate's webcam during timed instruments. Not video recording — single frame captures at configurable intervals (default: every 90 seconds).

**Why it matters:** Confirms a person is present at the terminal, and that the same person is present throughout. Primarily relevant for high-stakes CAT/ART batteries.

**Consent requirement:** This is an opt-in feature at both the battery level (recruiter enables it) and the candidate level (candidate must explicitly consent at the start of the session with a clear explanation). Candidates who decline webcam consent should be able to complete the battery without webcam. The recruiter is informed that webcam was declined — this is not a disqualification condition.

**What is captured and stored:**
- Still JPEG frame (not video stream)
- Timestamp
- Instrument and item number at time of capture
- Stored in Vercel Blob with organization-scoped path, time-limited access URL
- Deleted after 90 days unless recruiter explicitly retains

**What is NOT done with captures:**
- No facial recognition
- No identity matching against photo ID
- No automated analysis of facial expression or emotion
- No captures outside of explicitly disclosed and consented-to timed sessions

**Phase 2 implementation:** MediaDevices API (`getUserMedia`), same pattern as async video interviews. Face presence detection using MediaPipe (already in codebase for async video) at 1 frame per 90 seconds rather than 1 fps.

---

### 2.7 Browser Resize Events

**What it is:** Significant browser window resize events during a test session (`window.resize` listener with debounce).

**Why it matters:** Candidates may resize the browser window to a narrow strip to view an external tool alongside the test. This is a weak signal on its own but correlates with tab switching patterns.

**What constitutes what:**

| Event | Classification |
|---|---|
| Window width reduced by > 40% and maintained for > 10 seconds | Info |
| Window width reduced by > 40% AND tab switches also logged | Warning (cumulative) |

**Implementation:** Debounced `resize` listener (500ms). Log only if width reduction exceeds 40% of original width. Not shown to candidates; logged silently.

---

### 2.8 Internet Connectivity Loss

**What it is:** Detection of offline state via `window.addEventListener('offline', handler)`.

**Why it matters:** Connectivity loss can indicate VPN toggling (a cheating vector) or a legitimate network interruption (common for candidates in emerging markets or poor connectivity areas). Context matters enormously here.

**What constitutes what:**

| Event | Classification | Note |
|---|---|---|
| Single connectivity loss < 30 seconds, test resumes cleanly | Info | Likely genuine network issue |
| Connectivity loss > 30 seconds | Info | Log duration; note in proctor report |
| Connectivity loss co-occurring with tab switch events | Warning | Pattern may indicate VPN or proxy switching |

**Candidate experience:** On offline detection, show a non-alarming banner: "It looks like you've lost your internet connection. Your progress is saved. The test will continue when you reconnect." Timer pauses for connectivity loss if the session cannot sync to the server. This is a fairness accommodation, not a cheating enable — connectivity loss is a test-irrelevant factor.

---

## 3. Severity Levels

The system uses a three-tier severity classification. All events are logged regardless of severity. Severity determines candidate notification and recruiter escalation behavior.

### 3.1 Info

**Definition:** Events that are logged for pattern analysis but do not require candidate notification or immediate recruiter attention. These become meaningful only in aggregate or when combined with higher-severity events.

**Logged to:** `InventoryProctorLog` with `severity: "INFO"`
**Shown to candidate:** No
**Shown to recruiter:** Yes, in the full event log (collapsed by default)
**Effect on integrity score:** Minor deduction (see Section 6)

**Examples of Info events:**
- Single tab switch with duration < 3 seconds
- Full-screen declined at test start
- Browser window resized by > 40% (once, no pattern)
- Single offline event < 30 seconds
- Copy event on question text (once)
- Single item response time slightly below the minimum threshold (within 20% of threshold)

---

### 3.2 Warning

**Definition:** Events that are unusual enough to warrant a candidate-facing notice and are logged prominently for recruiter review. These do not on their own constitute an integrity finding, but they are noted in the proctor report.

**Logged to:** `InventoryProctorLog` with `severity: "WARNING"`
**Shown to candidate:** Yes — a non-alarming, non-accusatory banner (see Section 7.2)
**Shown to recruiter:** Yes — in the event log, highlighted in amber
**Effect on integrity score:** Moderate deduction (see Section 6)

**Examples of Warning events:**
- Tab switch with duration 3–15 seconds (once)
- Tab switch immediately after question advance
- Copy event on question text 3+ times
- `navigator.clipboard.readText()` called once
- Connectivity loss co-occurring with tab switch
- Multiple item responses below the minimum per-item time threshold in the same sub-scale (3+ items in same sub-scale flagged fast)
- Phase 2: First full-screen exit during timed instrument

---

### 3.3 Violation

**Definition:** Events that individually constitute a material integrity concern. These are escalated to the recruiter with a recommendation to review the session. Multiple Warning events within a session can also escalate to Violation status.

**Logged to:** `InventoryProctorLog` with `severity: "VIOLATION"`
**Shown to candidate:** Yes — a firmer notice that the session may be reviewed (see Section 7.3)
**Shown to recruiter:** Yes — prominently flagged in amber/red in the proctor report; triggers "Review recommended" or "Integrity concern" recommendation
**Effect on integrity score:** Significant deduction (see Section 6)

**Examples of Violation events:**
- Tab switch with duration > 15 seconds (any single instance)
- Tab switch pattern: 3 or more tab switches during a single timed instrument
- Paste event on any CTA open-ended textarea
- `navigator.clipboard.readText()` called 3+ times
- Total instrument completion time suspiciously faster than the minimum credible completion time (see Section 4)
- Phase 2: Multiple full-screen exits during a single instrument

**Auto-escalation rule:** Two or more Warning events in the same instrument session automatically elevate the session to "Integrity concern" status, even if no individual Violation was logged.

---

## 4. Per-Instrument Thresholds

### 4.1 Cognitive Ability Test (CAT) — 48 items, 35 minutes

**Speeded instrument.** Timer strictly enforced. Highest cheating vulnerability due to correct answers being verifiable.

**Sub-scale: Verbal Reasoning (16 items, 10 minutes)**

| Threshold Type | Value | Classification |
|---|---|---|
| Minimum credible time per item | 15 seconds | Below = Info (1 item), Warning (3+ items) |
| Suspiciously fast item threshold | < 8 seconds | Below = Warning (1 item), Violation (3+ items) |
| Maximum credible total sub-scale time | 600 seconds (10 min, timer enforced) | N/A — hard cutoff |
| Minimum credible total sub-scale time | 90 seconds (< 5.6 sec/item average) | Below = Violation — impossible to read and answer 16 items this fast |

**Most vulnerable item types:** Word analogies (verifiable in under 3 seconds via external tool), reading comprehension inference (cannot be outsourced quickly — 15-second minimum is more meaningful here).

**Sub-scale: Numerical Reasoning (16 items, 15 minutes)**

| Threshold Type | Value | Classification |
|---|---|---|
| Minimum credible time per item | 20 seconds | Below = Info (1 item), Warning (3+ items) |
| Suspiciously fast item threshold | < 10 seconds | Below = Warning (1 item), Violation (3+ items) |
| Minimum credible total sub-scale time | 120 seconds (< 7.5 sec/item average) | Below = Violation |

**Most vulnerable item types:** Number series (pattern can be described to AI verbally), ratio/percentage calculation (calculator usage almost undetectable — time threshold is the only signal).

**Sub-scale: Abstract Reasoning (16 items, 10 minutes)**

| Threshold Type | Value | Classification |
|---|---|---|
| Minimum credible time per item | 12 seconds | Below = Info (1 item), Warning (3+ items) |
| Suspiciously fast item threshold | < 6 seconds | Below = Warning (1 item), Violation (3+ items) |
| Minimum credible total sub-scale time | 80 seconds (< 5 sec/item average) | Below = Violation |

**Most vulnerable item types:** Matrix reasoning (visual, hard to outsource quickly — lower cheating risk than verbal/numerical). Series completion (can be described verbally to AI — moderate risk).

**Overall CAT thresholds:**

| Threshold Type | Value | Classification |
|---|---|---|
| Minimum credible total test time | 5 minutes (300 seconds) | Below = Violation — physically impossible |
| Score + time anomaly flag | Score ≥ 85th percentile AND total time < 50% of limit | Integrity concern — note in report |

---

### 4.2 Verbal Reasoning Assessment (VRA) — 24 items, 20 minutes

**Speeded instrument.** Includes 250-word passages candidates can reference.

| Threshold Type | Value | Classification |
|---|---|---|
| Minimum credible time per passage inference item | 25 seconds | Below = Info (1 item), Warning (3+ items) |
| Suspiciously fast threshold (passage inference) | < 12 seconds | Below = Warning (1 item), Violation (3+ items) |
| Minimum credible time for vocabulary/completion items | 10 seconds | Below = Info |
| Suspiciously fast threshold (vocabulary/completion) | < 5 seconds | Below = Warning |
| Minimum credible time for argument analysis items | 20 seconds | Below = Info |
| Minimum credible total test time | 3 minutes (180 seconds) | Below = Violation |
| Score + time anomaly flag | Score ≥ 80th percentile AND time < 40% of limit | Integrity concern |

**Most vulnerable item types:** Vocabulary in context (4 options, verifiable instantly with a dictionary lookup or AI), argument analysis (describable in text to AI quickly). Passage inference items are the most cheat-resistant — the passage itself is shown in the interface, providing reading time that creates a natural floor.

---

### 4.3 Analytical Reasoning Test (ART) — 30 items, 25 minutes

**Speeded instrument.** Closest to LSAT/GMAT format — items can be solved by AI very quickly if the candidate describes them.

| Threshold Type | Value | Classification |
|---|---|---|
| Minimum credible time per item — deductive syllogism | 15 seconds | Below = Info |
| Minimum credible time per item — logical grouping (scheduling) | 30 seconds | Below = Info; these are multi-constraint problems that cannot be processed in < 30 sec |
| Suspiciously fast threshold — logical grouping | < 15 seconds | Below = Warning (1 item), Violation (3+ items) |
| Minimum credible time per item — argument structure | 20 seconds | Below = Info |
| Minimum credible time per item — data sufficiency | 18 seconds | Below = Info |
| Minimum credible time per item — causal reasoning | 20 seconds | Below = Info |
| Minimum credible total test time | 4 minutes (240 seconds) | Below = Violation |
| Score + time anomaly flag | Score ≥ 80th percentile AND time < 45% of limit | Integrity concern |

**Most vulnerable item types:** Deductive syllogisms (classic logic — AI is exceptional at these, and a candidate can type the syllogism in seconds). Logical grouping / scheduling problems are the most cheat-resistant — they require significant problem setup to communicate externally and typically take 60–90 seconds even for high performers.

---

### 4.4 Creative Thinking Assessment (CTA) — 18 items, 25 minutes (not strictly enforced per item)

**Not a speeded instrument — but the overall timer is enforced.** The primary vulnerability is AI-generated content for open-ended items, not item lookup.

| Threshold Type | Value | Classification |
|---|---|---|
| Open-ended item: minimum credible response time | 30 seconds | Below = Warning — insufficient time to generate even basic responses |
| Open-ended item: suspiciously fast threshold | < 15 seconds | Below = Violation — nearly impossible to type a meaningful divergent response |
| MCQ items: minimum credible time | 8 seconds | Below = Info |
| MCQ items: suspiciously fast threshold | < 3 seconds | Below = Warning |
| Open-ended item: suspiciously long response length relative to time | > 300 words in < 60 seconds | Flag for AI generation review (words-per-minute > 300 is not human typing) |
| Paste event on any open-ended textarea | Regardless of time | Violation — see Section 2.2 |

**AI content detection note:** Time-on-item is a supplementary signal for CTA. The primary AI content signal comes from the Claude scoring process itself. Claude is instructed to flag responses where the fluency, vocabulary complexity, and internal coherence suggest AI generation. This is noted in `aiScoringData.flags`. Recruiter sees: "AI scorer flagged response on item CTA_ALT_002 as potentially AI-generated. Human review recommended."

**Words-per-minute anomaly implementation:** Calculate `wpm = (responseWordCount / timeOnItemSeconds) × 60`. If `wpm > 300` on any open-ended item, log as Warning. If paste event also detected on same item, escalate to Violation.

---

### 4.5 RIASEC Career Interest Inventory — 66 items, 15 minutes (not enforced)

**Not a speeded instrument.** Not a cognitive test. Cheating in the traditional sense is not meaningful — a candidate gaming RIASEC is selecting the interests they want to project, which is a validity concern but not an integrity concern in the same way.

| Threshold Type | Value | Classification |
|---|---|---|
| Total completion time < 2 minutes for 66 items | Info | Extremely fast may indicate random responding |
| Total completion time < 1 minute | Warning — random responding likely | Flag for "response pattern quality" review |
| Standard deviation of responses < 0.5 across all items (all same rating) | Warning — acquiescent or random responding | Already handled by response pattern validity check |
| Tab switches during RIASEC | Info only | Not timed; tab switching is low-risk |

**Primary integrity tool for RIASEC:** Response pattern analysis (built into RIASEC scoring), not proctoring events. The proctoring system logs tab events but does not escalate them for this instrument.

---

### 4.6 Big Five Personality Inventory (BFPI) — 60 items, 12 minutes (not enforced)

Same logic as RIASEC — not speeded, cheating is manifest as faking (selecting socially desirable answers), not as looking up correct answers.

| Threshold Type | Value | Classification |
|---|---|---|
| Total completion time < 90 seconds for 60 items | Warning — random responding likely | |
| All items rated 1 or all rated 5 | Violation — extreme responding | |
| Tab switches during BFPI | Info only | |

**Primary integrity tool for BFPI:** Validity scales (acquiescence index, inconsistency index) built into scoring, not proctoring events.

---

### 4.7 Extended-Time Accommodations — Threshold Adjustment

When `timeLimitMultiplier > 1.0` is set on a candidate session, **all per-item and total-time thresholds scale proportionally:**

```
adjusted_threshold = base_threshold × timeLimitMultiplier
```

**Example:** CAT Numerical minimum credible time per item = 20 seconds. Candidate has 1.5x accommodation. Adjusted minimum = 30 seconds.

This adjustment is automatic and happens at threshold evaluation time, not at data capture time. Raw `timeOnItemMs` data is always stored as-is.

---

## 5. Proctor Report for Recruiters

### 5.1 Location in Recruiter UI

The proctor report is accessible from:
- The candidate detail view in the battery results dashboard (`/inventory/[id]/results/[sessionId]`)
- A dedicated tab: "Integrity Report"

### 5.2 Overall Integrity Score

A single 0–100 score that summarizes the session's integrity profile. Displayed prominently at the top of the Integrity Report tab.

**Score display:**
```
┌──────────────────────────────────────────────────────────┐
│  INTEGRITY SCORE                                          │
│                                                          │
│  92 / 100                                                │
│  ████████████████████████████████████░░  No concerns     │
│                                                          │
│  2 events logged   ·   0 violations   ·   2 info items   │
└──────────────────────────────────────────────────────────┘
```

Score color coding:
- 80–100: Green — "No concerns"
- 60–79: Amber — "Review recommended"
- 0–59: Red — "Integrity concern"

### 5.3 Event Log Table

A full chronological log of all proctoring events, shown in a table below the integrity score.

**Columns:** Timestamp | Instrument | Item | Event Type | Duration/Detail | Severity

**Example:**

| Timestamp | Instrument | Item | Event Type | Detail | Severity |
|---|---|---|---|---|---|
| 10:14:32 | CAT — Verbal | V-007 | Tab switch | Duration: 2.1 sec | Info |
| 10:22:18 | CAT — Numerical | N-003 | Tab switch | Duration: 18.4 sec | Violation |
| 10:22:36 | CAT — Numerical | N-003 | Fast response | Time on item: 4 sec (min: 20 sec) | Warning |
| 10:41:05 | CTA | CTA_ALT_002 | Paste detected | Clipboard paste on open-ended item | Violation |

Default view: Filter shows Warning + Violation only. Recruiter can expand to show all (including Info).

**Export:** "Download Event Log (CSV)" button. Exported log includes all fields including session metadata.

### 5.4 Recommendation

A plain-English recommendation displayed below the integrity score and above the event log:

| Recommendation | Trigger Condition | Display |
|---|---|---|
| "No concerns" | Integrity score 80–100 AND no Violations | Green chip |
| "Review recommended" | Integrity score 60–79 OR one Warning that is not Auto-Escalated | Amber chip |
| "Integrity concern" | Integrity score < 60 OR any Violation event | Red chip |

**Recommendation text examples:**

"No concerns — This session's event log shows no significant integrity issues. The candidate completed the assessment under normal conditions."

"Review recommended — One significant event was logged during this session: a tab switch lasting 18 seconds during the Numerical Reasoning sub-scale. This may have been a genuine distraction. We recommend reviewing the candidate's score in context of this event before making a decision."

"Integrity concern — This session shows multiple integrity events including a clipboard paste on a Creative Thinking open-ended item and 3 tab switches during the Cognitive Ability Test. We strongly recommend manual review before advancing this candidate."

### 5.5 Recruiter Guidance Note

A collapsed info panel below the recommendation (expandable):

"Assessment integrity events are signals, not verdicts. False positives are common — candidates may switch tabs because of a notification, a pet, or a child. We recommend treating this data as context that informs your judgment rather than a decision trigger. Never reject a candidate solely on proctoring data without considering: the instrument involved, the number of events, the candidate's actual score, and any external factors they may have disclosed."

---

## 6. Integrity Score Calculation

The integrity score starts at 100 and deducts points based on events logged.

### 6.1 Deduction Table

| Event Type | Severity | Deduction per Event | Notes |
|---|---|---|---|
| Tab switch < 3 sec | Info | 1 point | Capped at 3 points total for tab-switch Info events |
| Tab switch 3–15 sec | Warning | 8 points | |
| Tab switch > 15 sec | Violation | 15 points | |
| Tab switch pattern (3+ in one instrument) | Violation | 20 points (flat) | Applied once per instrument, not per additional switch |
| Fast response — Info band | Info | 0.5 points per item | Capped at 5 points total for fast-response Info |
| Fast response — Warning band | Warning | 3 points per item | Capped at 15 points total for fast-response Warning |
| Fast response — Violation band | Violation | 10 points per item | Uncapped |
| Minimum total time — Violation | Violation | 25 points | |
| Score + time anomaly flag | Info | 5 points | |
| Paste event (CTA) | Violation | 20 points per item | |
| clipboard.readText() — Warning | Warning | 8 points | |
| clipboard.readText() — Violation | Violation | 15 points | |
| Copy event on question — Info | Info | 1 point | |
| Copy event on question — Warning | Warning | 5 points | |
| Browser resize anomaly | Info | 2 points | |
| Connectivity loss + tab switch | Warning | 5 points (additive) | |
| WPM anomaly (CTA) | Warning | 8 points | |
| Random responding (RIASEC/BFPI) | Warning | 10 points | |

### 6.2 Score Floor

The integrity score cannot go below 0. It is capped at 100.

### 6.3 Non-Timed Instruments

For RIASEC and BFPI, tab switches do not contribute to deductions. Only random-responding signals apply.

### 6.4 Instrument Weighting

Deductions from higher-stakes instruments carry more weight in the final score. If multiple instruments are in the battery, the integrity score is a weighted average where:
- CAT: weight 40%
- ART: weight 30%
- VRA: weight 20%
- CTA: weight 10%
- RIASEC/BFPI: weight 0% (their events can still trigger deductions if extreme)

If only some instruments are in a battery, weights are redistributed proportionally among included instruments.

### 6.5 Auto-Escalation Rule

Regardless of numeric integrity score, if **2 or more Warning events occur in the same instrument session**, the recommendation automatically escalates to at least "Review recommended."

If **any Violation event is logged**, the recommendation automatically escalates to at least "Integrity concern" regardless of the numeric score.

---

## 7. Candidate Communication

### 7.1 Pre-Test Notice (Before Starting)

Shown on the battery welcome page (`/test/[token]`) before the candidate clicks "Begin Assessment."

**Heading:** "A note about this assessment"

**Body text:**
> "To maintain the fairness of this assessment for all candidates, we log basic session data including tab switches, time spent on each question, and clipboard paste events during open-ended questions. This information is reviewed by the hiring team only if your session shows unusual patterns.
>
> We do not record your screen, access your files, or monitor your camera unless you've explicitly enabled webcam proctoring (you'll see a separate consent step if so).
>
> Taking the assessment in a quiet space with a stable internet connection will give you the best experience and result."

**Tone guidance:** Honest, non-intimidating, informative. The goal is to set expectations, not to make candidates feel surveilled. Do not use words like "cheating," "fraud," or "suspicious."

---

### 7.2 In-Test Warning Message (Warning Severity Events)

Displayed as a non-blocking banner at the top of the test page. Does not stop the timer. Dismissable after 5 seconds.

**Example — Tab switch warning:**

> "We noticed you left this tab briefly. Please stay on this page to ensure your results are counted accurately. Your progress is saved."

**Example — Clipboard copy pattern warning:**

> "Please complete this assessment without using external resources. This helps ensure your results accurately reflect your abilities."

**Design:** Amber banner (`bg-amber-50 border border-amber-200 text-amber-800`). Icon: information circle. Not alarming in color or tone. Auto-dismisses after 8 seconds if not manually dismissed.

---

### 7.3 Violation Notice (Violation Severity Events)

Displayed as a modal overlay (not dismissable for 10 seconds, then must click to confirm).

**Example — Paste detected:**

> "We detected a clipboard paste in your open-ended response. This assessment is designed to measure your own ideas. Pasting external content affects the accuracy of your results.
>
> Your response has been saved. Please continue the assessment by sharing your own thoughts."

**Example — Tab switch Violation (> 15 seconds or 3+ switches):**

> "Your session shows multiple tab switches during a timed section. Please keep this tab active for the remainder of the assessment. The hiring team may be notified of this activity as part of your session review."

**Design:** Modal with white background, amber header, red information icon for paste events. The language for the paste version is firmer but still non-accusatory. The tab switch version explicitly informs the candidate that the hiring team may see this — this is both honest and a deterrent for continued behavior.

**What NOT to say:**
- "We know you were cheating" — accusatory and legally problematic
- "Your assessment has been disqualified" — we do not auto-disqualify
- "This activity has been reported to authorities" — absurd and damaging
- "Further violations will result in test termination" — we do not terminate tests

---

### 7.4 Post-Test Completion Message

Standard completion screen (`/test/[token]/complete`) — no special proctoring language unless the session had Violation-level events.

**Standard completion (no violations):**
No proctoring-specific text. See the standard completion screen copy in the Assessment Inventory spec (Section 5.2).

**Completion with Violation events:**

Add a single line below the standard "Thank you" text:

> "Note: Some activity during your session has been flagged for review. A member of the hiring team will follow up if they have any questions."

**Tone:** Matter-of-fact. The candidate already received in-test notices. The post-test note is just confirmation, not escalation.

---

## 8. Phase 2 — Optional Enhanced Proctoring

This section describes features not included in Phase 1 but specified for future implementation. Phase 2 features are all opt-in at the battery level and require additional candidate consent.

### 8.1 Full-Screen Enforcement

**Battery setting:** `enforceFullscreen: true` (default: false)

**Behavior:**
1. Test start: Require candidate to enter full-screen before beginning any timed instrument. Show button "Enter Full Screen to Begin."
2. Full-screen exit during timed instrument: Immediately show Violation notice modal (see Section 7.3). Require re-entry before continuing.
3. Timer behavior: Timer pauses for up to 60 seconds during the full-screen exit event. If candidate does not re-enter within 60 seconds, timer resumes regardless (prevents gaming by staying outside full-screen indefinitely).
4. Maximum enforcement actions: After 3 full-screen exits in one instrument, the instrument is marked complete with items answered and remaining items unresponded. Recruiter sees "Session ended — repeated full-screen exit" in the proctor report.

### 8.2 Webcam Proctoring

**Battery setting:** `webcamProctoring: true` (default: false)

**Consent flow:**
1. Separate consent step before the first timed instrument
2. Explicit consent checkbox with clear disclosure of: what is captured, how long it is stored, who has access, the option to decline
3. Candidates who decline are allowed to proceed; recruiter is notified of decline (not a rejection trigger)

**Capture schedule:** One still-frame capture every 90 seconds during timed instruments only. Never during RIASEC, BFPI, or between-section breaks.

**Storage:** Vercel Blob, organization-scoped, 90-day retention, then deleted. Time-limited presigned URL for recruiter access (24-hour link validity).

**Face detection:** MediaPipe WASM (existing in codebase). If no face detected in 3 consecutive captures (i.e., 4.5 minutes), log a Warning event: "No face detected during [instrument] from [time] to [time]."

**What recruiters see:** A "Webcam Snapshots" section in the Integrity Report tab showing a thumbnail gallery with timestamps. Clicking a thumbnail shows the full-size capture. A "Face detected" or "No face detected" label accompanies each thumbnail.

**What is NOT done:** No automated facial recognition, no identity matching, no biometric storage, no analysis of facial expressions, no real-time streaming to any human reviewer.

### 8.3 IP and Geolocation Logging (Phase 1.5 — lightweight)

IP address is already logged at session creation. Phase 1.5 additions:

- Geolocation lookup (country/city, not precise coordinates) on session start
- Flag if IP geolocation does not match the candidate's declared location (if declared)
- Flag if the same IP address completes multiple sessions for the same battery (cheating syndicate pattern)
- VPN/proxy detection via IP reputation API (flag as Info — VPNs are commonly used for legitimate privacy reasons)

These are Info-level signals only. Never escalated to Violation without additional supporting events.

---

## 9. Data Model and Storage

### 9.1 InventoryProctorLog Schema

```prisma
model InventoryProctorLog {
  id                  String   @id @default(cuid())
  candidateSessionId  String
  instrumentSessionId String?  // null for battery-level events (e.g., IP logging)
  eventType           String   // see enum below
  severity            String   // "INFO" | "WARNING" | "VIOLATION"
  eventData           Json?    // structured detail per event type
  itemKey             String?  // which item was active when event occurred
  occurredAt          DateTime @default(now())

  candidateSession    CandidateInventorySession @relation(...)
  instrumentSession   InstrumentSession?        @relation(...)

  @@index([candidateSessionId])
  @@index([instrumentSessionId])
}
```

### 9.2 Event Type Enum Values

```
tab_switch
clipboard_paste
clipboard_read_attempt
clipboard_copy_pattern
fast_response_item
slow_response_item
minimum_time_violation
score_time_anomaly
wpm_anomaly
browser_resize
connectivity_loss
fullscreen_exit          (Phase 2)
fullscreen_declined      (Phase 2)
webcam_no_face           (Phase 2)
webcam_declined          (Phase 2)
random_responding        (RIASEC/BFPI validity)
ip_geolocation_mismatch  (Phase 1.5)
vpn_detected             (Phase 1.5)
duplicate_ip             (Phase 1.5)
```

### 9.3 Integrity Score Storage

The computed integrity score and recommendation are stored on `CandidateInventorySession` as denormalized fields, recomputed on each new proctoring event:

```prisma
// Add to CandidateInventorySession:
integrityScore        Int?     // 0-100, computed field
integrityRecommend    String?  // "NO_CONCERNS" | "REVIEW_RECOMMENDED" | "INTEGRITY_CONCERN"
integrityComputedAt   DateTime?
```

Recompute trigger: any write to `InventoryProctorLog` for this session. Computation runs server-side synchronously (the scoring algorithm is O(n) over logged events and takes < 5ms).

---

## 10. Implementation Notes

### 10.1 Client-Side Event Capture

All client-side event listeners are registered in a custom React hook: `useProctoring(instrumentType, currentItemKey, timeLimitMultiplier)`.

This hook:
- Registers and cleans up all event listeners on mount/unmount
- Buffers events locally for up to 3 seconds (to batch network calls)
- Sends events via `POST /api/test/[token]/proctor-event` (unauthenticated — token is the auth)
- Handles offline gracefully: queue events locally in `sessionStorage` and flush on reconnect

### 10.2 Server-Side Processing

On `POST /api/test/[token]/proctor-event`:
1. Validate token, resolve session
2. Insert `InventoryProctorLog` record
3. Recompute integrity score using the scoring algorithm (see Section 6)
4. Update `CandidateInventorySession.integrityScore` and `integrityRecommend`
5. Return 200 with `{ received: true }` — no need to return computed score to client

### 10.3 Per-Item Time Logging

`timeOnItemMs` is computed server-side, not trusted from the client. The client sends `respondedAt` timestamp, and the server computes:
```
timeOnItemMs = respondedAt - max(instrumentSession.startedAt, previousItem.respondedAt)
```

This prevents clients from manipulating per-item time by sending false timestamps.

### 10.4 Rate Limiting on Proctor Event Endpoint

Limit to 60 events per minute per session token. Excess events are dropped silently. This prevents abusive clients from flooding the proctor log.

### 10.5 Privacy and Data Governance

- All proctoring data is organization-scoped and subject to the same data retention policies as other candidate data
- Candidates may request deletion of their proctoring data under GDPR/PDPA; deletion of `InventoryProctorLog` records cascades from `CandidateInventorySession` deletion
- Recruiters in the EVALUATOR role do not have access to the Integrity Report tab — only RECRUITER and ADMIN roles
- Proctoring data is never used for automated rejection — it is an advisory input to human decision-making

---

*This specification covers Phase 1 monitoring for the AssInt Assessment Inventory module.*
*Phase 2 (full-screen enforcement, webcam proctoring) should be specced in detail before implementation.*
*Link to related specs: `ASSESSMENT_INVENTORY_SPEC.md`, `async-video-spec.md`*
