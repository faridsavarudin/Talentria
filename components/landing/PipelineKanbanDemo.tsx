import { GanttChartSquare } from "lucide-react";

const COLUMNS = [
  {
    id: "applied",
    label: "Applied",
    borderColor: "border-stone-500",
    headerColor: "text-stone-400",
    accent: "#A8A29E",
  },
  {
    id: "screening",
    label: "Screening",
    borderColor: "border-amber-500",
    headerColor: "text-amber-400",
    accent: "#F59E0B",
  },
  {
    id: "interview",
    label: "Interview",
    borderColor: "border-teal-500",
    headerColor: "text-teal-400",
    accent: "#0D9488",
  },
  {
    id: "offer",
    label: "Offer",
    borderColor: "border-green-500",
    headerColor: "text-green-400",
    accent: "#16A34A",
  },
];

type Candidate = {
  initials: string;
  name: string;
  role: string;
  assessment: string;
  score: number | null;
  tag: string;
  tagColor: string;
  time: string;
  avatarBg: string;
};

const CARDS: Record<string, Candidate[]> = {
  applied: [
    {
      initials: "SC",
      name: "Sarah Chen",
      role: "Product Designer · Figma",
      assessment: "Senior UX Role",
      score: null,
      tag: "New",
      tagColor: "bg-stone-700 text-stone-300",
      time: "2 hours ago",
      avatarBg: "bg-amber-600",
    },
    {
      initials: "JO",
      name: "James Okafor",
      role: "Frontend Eng · Meta",
      assessment: "React Engineer",
      score: null,
      tag: "New",
      tagColor: "bg-stone-700 text-stone-300",
      time: "5 hours ago",
      avatarBg: "bg-stone-600",
    },
    {
      initials: "PK",
      name: "Priya Krishnan",
      role: "PM · Notion",
      assessment: "Product Manager",
      score: null,
      tag: "New",
      tagColor: "bg-stone-700 text-stone-300",
      time: "1 day ago",
      avatarBg: "bg-teal-700",
    },
  ],
  screening: [
    {
      initials: "MW",
      name: "Marcus Williams",
      role: "Data Scientist · Google",
      assessment: "DS — ML Track",
      score: 3.8,
      tag: "AI Screened",
      tagColor: "bg-amber-900/60 text-amber-300",
      time: "1 day ago",
      avatarBg: "bg-stone-500",
    },
    {
      initials: "ER",
      name: "Elena Rodriguez",
      role: "Senior Eng · Stripe",
      assessment: "Backend Engineer",
      score: 4.1,
      tag: "AI Screened",
      tagColor: "bg-amber-900/60 text-amber-300",
      time: "2 days ago",
      avatarBg: "bg-amber-700",
    },
  ],
  interview: [
    {
      initials: "AT",
      name: "Alex Turner",
      role: "Engineering Lead · Shopify",
      assessment: "Staff Engineer",
      score: 4.6,
      tag: "Scheduled",
      tagColor: "bg-teal-900/60 text-teal-300",
      time: "3 days ago",
      avatarBg: "bg-teal-600",
    },
    {
      initials: "NP",
      name: "Nina Patel",
      role: "Design Lead · Airbnb",
      assessment: "Senior UX Role",
      score: 4.3,
      tag: "Scheduled",
      tagColor: "bg-teal-900/60 text-teal-300",
      time: "3 days ago",
      avatarBg: "bg-stone-600",
    },
    {
      initials: "DK",
      name: "Daniel Kim",
      role: "ML Engineer · OpenAI",
      assessment: "DS — ML Track",
      score: 4.8,
      tag: "ICC: 0.92",
      tagColor: "bg-blue-900/60 text-blue-300",
      time: "4 days ago",
      avatarBg: "bg-amber-600",
    },
  ],
  offer: [
    {
      initials: "LM",
      name: "Layla Martinez",
      role: "PM · Notion",
      assessment: "Product Manager",
      score: 4.9,
      tag: "Offer Sent",
      tagColor: "bg-green-900/60 text-green-300",
      time: "1 week ago",
      avatarBg: "bg-teal-700",
    },
    {
      initials: "TN",
      name: "Tom Nguyen",
      role: "Senior Eng · Linear",
      assessment: "Backend Engineer",
      score: 4.7,
      tag: "Negotiating",
      tagColor: "bg-green-900/60 text-green-300",
      time: "1 week ago",
      avatarBg: "bg-stone-500",
    },
  ],
};

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-1.5 w-3 rounded-sm ${n <= filled ? "bg-amber-400" : "bg-stone-600"}`}
        />
      ))}
      <span className="ml-1.5 text-[10px] font-semibold text-stone-400">{score.toFixed(1)}</span>
    </div>
  );
}

function CandidateCard({ card }: { card: Candidate }) {
  return (
    <div className="rounded-xl border border-stone-700/60 bg-stone-800/80 p-3 space-y-2 hover:border-stone-600 transition-colors">
      <div className="flex items-start gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${card.avatarBg}`}>
          {card.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-stone-100 truncate">{card.name}</p>
          <p className="text-[11px] text-stone-400 truncate">{card.role}</p>
        </div>
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500 truncate">
        {card.assessment}
      </p>
      {card.score !== null && <ScoreDots score={card.score} />}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${card.tagColor}`}>
          {card.tag}
        </span>
        <span className="text-[10px] text-stone-600">{card.time}</span>
      </div>
    </div>
  );
}

export function PipelineKanbanDemo() {
  return (
    <section className="py-24 sm:py-32 bg-stone-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading — left-aligned, editorial */}
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-3">
            Kanban Pipeline
          </p>
          <h2 className="text-4xl font-extrabold text-stone-900 tracking-tight">
            Every candidate, always visible.
          </h2>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl">
            Scores, evaluator agreement, and AI assessments surface directly on each card.
            No spreadsheets. No status meetings.
          </p>
        </div>

        {/* Dark kanban board */}
        <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/30 border border-stone-700">
          {/* Browser chrome */}
          <div className="flex h-9 items-center gap-1.5 border-b border-stone-700 bg-stone-900 px-4 shrink-0">
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
            <div className="ml-4 h-4 flex-1 max-w-xs rounded bg-stone-700/80" />
          </div>

          {/* Board */}
          <div className="bg-[#0f1117] p-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <GanttChartSquare className="h-4 w-4 text-stone-400" />
                <span className="text-sm font-semibold text-stone-200">Hiring Pipeline</span>
                <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full border border-stone-700">
                  Senior Engineering — Q1 2025
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {["All stages", "Filters", "Group by"].map((t) => (
                  <span key={t} className="text-[10px] text-stone-500 bg-stone-800 border border-stone-700 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 overflow-x-auto">
              {COLUMNS.map((col) => (
                <div key={col.id} className="space-y-2 min-w-[200px]">
                  <div className={`flex items-center justify-between px-1 pb-2 border-b-2 ${col.borderColor}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${col.headerColor}`}>
                      {col.label}
                    </span>
                    <span
                      className="text-[11px] font-semibold rounded-full px-1.5 py-0.5"
                      style={{ backgroundColor: `${col.accent}22`, color: col.accent }}
                    >
                      {CARDS[col.id].length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {CARDS[col.id].map((card) => (
                      <CandidateCard key={card.name} card={card} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-stone-500">
          {[
            { dot: "bg-amber-400", label: "AI interview scores on every card" },
            { dot: "bg-teal-400", label: "ICC shown per evaluator pair" },
            { dot: "bg-rose-400", label: "Bias flags surface automatically" },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
