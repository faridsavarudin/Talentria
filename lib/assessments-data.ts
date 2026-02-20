// ── Assessment Library static data ───────────────────────────────────────────
// Used by /assessments-library (list) and /assessments-library/[slug] (detail).
// No database involved — pure static content.

export type AssessmentColor =
  | "violet"
  | "blue"
  | "amber"
  | "green"
  | "pink"
  | "indigo";

export type AssessmentCategory =
  | "Interest"
  | "Cognitive"
  | "Reasoning"
  | "Personality";

export interface AssessmentDimension {
  name: string;
  desc: string;
}

export interface AssessmentFaqItem {
  q: string;
  a: string;
}

export interface Assessment {
  slug: string;
  name: string;
  category: AssessmentCategory;
  tagline: string;
  duration: string;
  questions: string;
  jobLevel: string;
  color: AssessmentColor;
  dimensions: AssessmentDimension[];
  whyUseIt: string[];
  whoIsItFor: string[];
  howItWorks: string[];
  faq: AssessmentFaqItem[];
}

export const ASSESSMENTS: Record<string, Assessment> = {
  riasec: {
    slug: "riasec",
    name: "RIASEC Interest Profiler",
    category: "Interest",
    tagline: "Match candidates to roles where they'll naturally thrive",
    duration: "20 min",
    questions: "54 items",
    jobLevel: "All levels",
    color: "violet",
    dimensions: [
      { name: "Realistic", desc: "Preference for hands-on, technical work" },
      {
        name: "Investigative",
        desc: "Analytical and scientific problem-solving orientation",
      },
      {
        name: "Artistic",
        desc: "Creative expression and unstructured environments",
      },
      {
        name: "Social",
        desc: "Helping, teaching, and interpersonal interaction",
      },
      {
        name: "Enterprising",
        desc: "Leadership, persuasion, and business orientation",
      },
      {
        name: "Conventional",
        desc: "Structure, data, and detail-oriented work",
      },
    ],
    whyUseIt: [
      "Predict job satisfaction and reduce early turnover",
      "Identify candidates whose interests align with role demands",
      "Build teams with complementary interest profiles",
      "Supports career development and internal mobility decisions",
    ],
    whoIsItFor: [
      "HR teams screening for role-interest alignment",
      "Talent acquisition teams reducing 90-day attrition",
      "Workforce planning and internal mobility programs",
      "Graduate recruitment and early-career hiring",
    ],
    howItWorks: [
      "Candidate receives a secure link via email — no app download needed",
      "54 forced-choice items are presented across six interest domains",
      "Responses are scored and converted into a three-letter Holland Code",
      "A role-fit report is generated and available in your dashboard within seconds",
    ],
    faq: [
      {
        q: "Is RIASEC scientifically validated?",
        a: "Yes. Holland's theory is one of the most extensively researched models in vocational psychology with decades of peer-reviewed evidence.",
      },
      {
        q: "Can candidates fake the results?",
        a: "RIASEC uses forced-choice and comparative formats that are more resistant to social desirability bias than simple rating scales.",
      },
      {
        q: "How should RIASEC scores be interpreted?",
        a: "Results produce a three-letter Holland code (e.g. SEC, IRE) representing the candidate's dominant interest areas, used for role matching.",
      },
      {
        q: "Is it suitable for all industries?",
        a: "Yes — RIASEC has been validated across industries from technology and finance to healthcare and manufacturing.",
      },
    ],
  },

  "cognitive-ability": {
    slug: "cognitive-ability",
    name: "Cognitive Ability Test",
    category: "Cognitive",
    tagline:
      "The single strongest predictor of job performance across all roles",
    duration: "30 min",
    questions: "40 items",
    jobLevel: "All levels",
    color: "blue",
    dimensions: [
      {
        name: "Verbal Reasoning",
        desc: "Ability to understand and reason with written information",
      },
      {
        name: "Numerical Reasoning",
        desc: "Working with numbers, data, and quantitative relationships",
      },
      {
        name: "Abstract Reasoning",
        desc: "Pattern recognition and logical inference from non-verbal stimuli",
      },
    ],
    whyUseIt: [
      "Strongest single predictor of training success and job performance (Schmidt & Hunter, 1998)",
      "Identifies candidates who can learn quickly and adapt to complex tasks",
      "Reduces bias vs. unstructured interviews by focusing on capability",
      "Provides IST-equivalent score for cross-candidate comparison",
    ],
    whoIsItFor: [
      "Organisations hiring for complex, knowledge-intensive roles",
      "Talent teams that need objective, defensible screening decisions",
      "HR teams replacing credential-based screening with capability-based screening",
      "Companies in finance, consulting, technology, and operations",
    ],
    howItWorks: [
      "Candidate receives a timed assessment link with clear instructions",
      "40 multiple-choice items span verbal, numerical, and abstract reasoning",
      "Adaptive timing ensures consistent test conditions across all candidates",
      "Scores are normed against a Southeast Asian working-age population and reported as percentiles",
    ],
    faq: [
      {
        q: "What does g-factor measure?",
        a: "General cognitive ability (g) reflects the underlying capacity to learn, reason, and solve novel problems — predictive across virtually every job type.",
      },
      {
        q: "How long does the test take?",
        a: "30 minutes maximum, with a recommended pace of about 45 seconds per question.",
      },
      {
        q: "Is it fair across different educational backgrounds?",
        a: "The test is designed with culturally neutral stimuli and has been norm-referenced on diverse Southeast Asian populations.",
      },
      {
        q: "What score threshold should I use for hiring?",
        a: "Thresholds depend on role complexity. Our platform provides role-specific benchmarks and percentile comparisons.",
      },
    ],
  },

  vra: {
    slug: "vra",
    name: "Verbal & Abstract Reasoning (VRA)",
    category: "Reasoning",
    tagline: "Assess how candidates process language and solve abstract problems",
    duration: "25 min",
    questions: "48 items",
    jobLevel: "Mid to Senior",
    color: "amber",
    dimensions: [
      {
        name: "Verbal Comprehension",
        desc: "Extracting meaning, inference, and relationships from text",
      },
      {
        name: "Abstract Problem Solving",
        desc: "Identifying patterns and rules in non-verbal sequences",
      },
    ],
    whyUseIt: [
      "Predicts performance in roles requiring strong communication and analysis",
      "Identifies candidates who can handle ambiguity and novel problems",
      "Separates language fluency from pure reasoning ability",
      "Ideal for roles in consulting, law, policy, and senior management",
    ],
    whoIsItFor: [
      "Consultants, lawyers, and policy professionals",
      "HR business partners and senior generalists",
      "Finance and strategy analysts",
      "Senior management and leadership candidates",
    ],
    howItWorks: [
      "Assessment is delivered via secure browser link, available in English and Bahasa Indonesia",
      "Two independently timed sections: verbal comprehension and abstract reasoning",
      "Items are calibrated for mid-to-senior role complexity",
      "Separate sub-scores allow targeted interpretation for different competency profiles",
    ],
    faq: [
      {
        q: "How is VRA different from the Cognitive Ability Test?",
        a: "VRA focuses specifically on verbal and abstract dimensions, making it more suitable for senior roles where these capabilities are critical.",
      },
      {
        q: "Does language proficiency affect scores?",
        a: "The verbal section is available in both English and Bahasa Indonesia. Abstract reasoning is language-neutral.",
      },
      {
        q: "What job roles benefit most from VRA?",
        a: "Consultants, lawyers, HR business partners, finance analysts, and senior managers.",
      },
    ],
  },

  "analytical-reasoning": {
    slug: "analytical-reasoning",
    name: "Analytical Reasoning Test",
    category: "Reasoning",
    tagline: "Identify candidates who think clearly under structured complexity",
    duration: "25 min",
    questions: "36 items",
    jobLevel: "Mid to Senior",
    color: "green",
    dimensions: [
      {
        name: "Logical Deduction",
        desc: "Drawing valid conclusions from given premises",
      },
      {
        name: "Critical Thinking",
        desc: "Evaluating arguments and identifying assumptions",
      },
      {
        name: "Structured Problem Analysis",
        desc: "Breaking complex problems into systematic steps",
      },
    ],
    whyUseIt: [
      "Critical for roles involving data interpretation, strategy, and decision-making",
      "Predicts performance in technical and analytical job families",
      "Reduces reliance on credentials — focuses on demonstrated thinking ability",
      "Correlates strongly with MBA-level analytical coursework performance",
    ],
    whoIsItFor: [
      "Data analysts and business intelligence professionals",
      "Strategy and management consulting candidates",
      "Product managers and technical leads",
      "Finance, audit, and risk management professionals",
    ],
    howItWorks: [
      "36 structured items delivered in a timed, proctored environment",
      "Each item presents a scenario with premises, and candidates select the most defensible conclusion",
      "Scores are reported as raw count, percentage, and a labeled band",
      "A detailed breakdown by reasoning sub-type helps pinpoint specific strengths",
    ],
    faq: [
      {
        q: "Is this test suitable for non-technical roles?",
        a: "Yes. Analytical reasoning is valuable for any role requiring structured thinking — not just engineering or data science.",
      },
      {
        q: "How is it scored?",
        a: "Each item has one correct answer. Scores are reported as raw correct count, percentage, and a band label (Developing, Average, Above Average, High).",
      },
    ],
  },

  "creative-thinking": {
    slug: "creative-thinking",
    name: "Creative Thinking Assessment",
    category: "Cognitive",
    tagline:
      "Find candidates who generate original ideas and see beyond the obvious",
    duration: "20 min",
    questions: "32 items",
    jobLevel: "All levels",
    color: "pink",
    dimensions: [
      {
        name: "Fluency",
        desc: "Generating a large quantity of relevant ideas",
      },
      {
        name: "Flexibility",
        desc: "Producing ideas across diverse categories",
      },
      {
        name: "Originality",
        desc: "Generating novel, unexpected ideas",
      },
      {
        name: "Elaboration",
        desc: "Developing and refining ideas with detail",
      },
    ],
    whyUseIt: [
      "Identifies high-potential candidates for innovation-driven roles",
      "Predicts performance in product, design, marketing, and R&D teams",
      "Measures creative capacity beyond self-reported openness to experience",
      "Supports building diverse teams with complementary thinking styles",
    ],
    whoIsItFor: [
      "Product designers and UX researchers",
      "Marketing and brand strategy professionals",
      "R&D and innovation team candidates",
      "Content creators, copywriters, and creative directors",
    ],
    howItWorks: [
      "32 open-ended and scenario-based prompts presented in a relaxed, time-generous format",
      "Responses are scored using divergent thinking rubrics across four dimensions",
      "AI scoring surfaces originality signals that manual review often misses",
      "Results include a creativity profile with actionable behavioral indicators",
    ],
    faq: [
      {
        q: "Can creativity really be measured?",
        a: "Yes. Divergent thinking — the cognitive process underlying creativity — has been reliably measured since Guilford's Structure of Intellect model (1956).",
      },
      {
        q: "Is higher always better?",
        a: "Not necessarily. Very high originality without elaboration may indicate impractical ideation. The best insight comes from the full profile.",
      },
    ],
  },

  "big-five-personality": {
    slug: "big-five-personality",
    name: "Big Five Personality",
    category: "Personality",
    tagline:
      "The world's most validated personality model for predicting workplace behavior",
    duration: "35 min",
    questions: "104 items",
    jobLevel: "All levels",
    color: "indigo",
    dimensions: [
      {
        name: "Openness",
        desc: "Intellectual curiosity and receptiveness to new experiences",
      },
      {
        name: "Conscientiousness",
        desc: "Organization, dependability, and goal-directedness",
      },
      {
        name: "Extraversion",
        desc: "Social energy, assertiveness, and positive affect",
      },
      {
        name: "Agreeableness",
        desc: "Cooperativeness, trust, and interpersonal harmony",
      },
      {
        name: "Neuroticism",
        desc: "Emotional reactivity and sensitivity to stress",
      },
    ],
    whyUseIt: [
      "Backed by 60+ years of research across 50+ countries",
      "Conscientiousness is the personality trait most strongly linked to job performance",
      "Identifies job fit at role and team level across all industries",
      "Includes response bias detection to flag inauthentic responding",
    ],
    whoIsItFor: [
      "HR teams assessing cultural and role fit",
      "Leadership development and succession planning programs",
      "Sales, customer success, and client-facing role hiring",
      "Any team where interpersonal dynamics and work style matter",
    ],
    howItWorks: [
      "104 Likert-scale items assess each of the five personality dimensions",
      "A social desirability scale runs in parallel to detect response bias",
      "Scores are normed against a working-age population and reported as percentiles",
      "Output includes a narrative summary, trait profiles, and a job-fit indicator per role type",
    ],
    faq: [
      {
        q: "Is the Big Five the same as MBTI?",
        a: "No. Big Five (Five Factor Model) is empirically derived from factor analysis of personality data. MBTI is typological and lacks the same level of predictive validity for job performance.",
      },
      {
        q: "Can candidates fake the test?",
        a: "The assessment includes a social desirability / response bias scale. Candidates flagged for extreme response bias are noted in the report.",
      },
      {
        q: "Does personality predict performance?",
        a: "Conscientiousness consistently predicts performance across job types. Other traits predict performance in specific contexts (e.g. Extraversion for sales).",
      },
      {
        q: "How are results reported?",
        a: "Each trait is scored on a percentile scale relative to a working-age norm group, with behavioral indicators and a job fit summary.",
      },
    ],
  },
};

// Ordered list for consistent display
export const ASSESSMENT_SLUGS = [
  "riasec",
  "cognitive-ability",
  "vra",
  "analytical-reasoning",
  "creative-thinking",
  "big-five-personality",
] as const;

export type AssessmentSlug = (typeof ASSESSMENT_SLUGS)[number];

export const ASSESSMENT_LIST: Assessment[] = ASSESSMENT_SLUGS.map(
  (slug) => ASSESSMENTS[slug]
);

// ── Color utility maps ────────────────────────────────────────────────────────

export const COLOR_MAP: Record<
  AssessmentColor,
  {
    badge: string;
    badgeBorder: string;
    iconBg: string;
    iconText: string;
    accent: string;
    accentText: string;
    ring: string;
    dot: string;
  }
> = {
  violet: {
    badge: "bg-violet-50",
    badgeBorder: "border-violet-200",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    accent: "bg-violet-600",
    accentText: "text-violet-600",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
  },
  blue: {
    badge: "bg-blue-50",
    badgeBorder: "border-blue-200",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    accent: "bg-blue-600",
    accentText: "text-blue-600",
    ring: "ring-blue-200",
    dot: "bg-blue-500",
  },
  amber: {
    badge: "bg-amber-50",
    badgeBorder: "border-amber-200",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    accent: "bg-amber-600",
    accentText: "text-amber-600",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  green: {
    badge: "bg-green-50",
    badgeBorder: "border-green-200",
    iconBg: "bg-green-100",
    iconText: "text-green-700",
    accent: "bg-green-600",
    accentText: "text-green-600",
    ring: "ring-green-200",
    dot: "bg-green-500",
  },
  pink: {
    badge: "bg-pink-50",
    badgeBorder: "border-pink-200",
    iconBg: "bg-pink-100",
    iconText: "text-pink-700",
    accent: "bg-pink-600",
    accentText: "text-pink-600",
    ring: "ring-pink-200",
    dot: "bg-pink-500",
  },
  indigo: {
    badge: "bg-indigo-50",
    badgeBorder: "border-indigo-200",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    accent: "bg-indigo-600",
    accentText: "text-indigo-600",
    ring: "ring-indigo-200",
    dot: "bg-indigo-500",
  },
};

// Abbreviated label used on icon badges
export const ICON_LABEL: Record<string, string> = {
  riasec: "RI",
  "cognitive-ability": "CA",
  vra: "VR",
  "analytical-reasoning": "AR",
  "creative-thinking": "CT",
  "big-five-personality": "B5",
};
