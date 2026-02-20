"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronDown, ChevronUp, Check, X, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AiCreditsDisplay } from "../../_components/AiCreditsDisplay";

// ─── Types ────────────────────────────────────────────────────────────────────

type RubricLevel = {
  level: number;
  label: string;
  description: string;
  behavioralAnchors: string[];
};

type GeneratedQuestion = {
  content: string;
  type: "BEHAVIORAL" | "SITUATIONAL" | "TECHNICAL";
  rubricLevels: RubricLevel[];
};

type GeneratedCompetency = {
  name: string;
  description: string;
  questions: GeneratedQuestion[];
};

type GeneratedAssessment = {
  competencies: GeneratedCompetency[];
};

type ReviewItem = {
  competencyName: string;
  competencyDescription: string;
  competencyId?: string; // assigned after competency is created
  question: GeneratedQuestion;
  accepted: boolean | null; // null = pending, true = accepted, false = skipped
};

type Props = {
  assessmentId: string;
  jobTitle: string;
  jobDescription: string;
  department?: string | null;
  existingCompetencies: { id: string; name: string }[];
  onComplete: () => void;
};

// ─── Streaming skeleton ────────────────────────────────────────────────────────

function StreamingSkeleton({ text }: { text: string }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Generating with AI</span>
        <span className="flex gap-0.5">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </div>
      {/* Streaming text preview (truncated) */}
      {text.length > 0 && (
        <div className="rounded-lg bg-violet-50 border border-violet-100 p-3 max-h-48 overflow-hidden relative">
          <pre className="text-xs text-violet-900 whitespace-pre-wrap break-all font-mono leading-relaxed">
            {text.slice(-800)}
          </pre>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-violet-50 to-transparent" />
        </div>
      )}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-4 w-4 rounded-full bg-violet-100 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded bg-violet-100 w-3/4" />
              <div className="h-3 rounded bg-violet-50 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Question review card ──────────────────────────────────────────────────────

function ReviewCard({
  item,
  index,
  onAccept,
  onSkip,
}: {
  item: ReviewItem;
  index: number;
  onAccept: (index: number) => void;
  onSkip: (index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const typeColors: Record<string, string> = {
    BEHAVIORAL: "bg-blue-100 text-blue-700",
    SITUATIONAL: "bg-purple-100 text-purple-700",
    TECHNICAL: "bg-orange-100 text-orange-700",
  };

  return (
    <div
      className={`rounded-lg border transition-all ${
        item.accepted === true
          ? "border-green-200 bg-green-50/40"
          : item.accepted === false
          ? "border-gray-200 bg-gray-50/40 opacity-60"
          : "border-border bg-white"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Competency label */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {item.competencyName}
            </p>

            {/* Question text */}
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              {item.question.content}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={`${typeColors[item.question.type] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}
              >
                {item.question.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {item.question.rubricLevels.length} rubric levels
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {item.accepted === null && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => onSkip(index)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Skip
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onAccept(index)}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Accept
                </Button>
              </>
            )}
            {item.accepted === true && (
              <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                <Check className="h-3 w-3" />
                Accepted
              </Badge>
            )}
            {item.accepted === false && (
              <Badge className="bg-gray-100 text-gray-500 border-0 gap-1">
                <X className="h-3 w-3" />
                Skipped
              </Badge>
            )}
          </div>
        </div>

        {/* Rubric toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {expanded ? "Hide rubric" : "Preview rubric"}
        </button>
      </div>

      {/* Rubric levels */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-2">
          {item.question.rubricLevels.map((rl) => (
            <div
              key={rl.level}
              className="flex items-start gap-3 text-xs"
            >
              <span
                className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  rl.level === 5
                    ? "bg-green-100 text-green-700"
                    : rl.level === 4
                    ? "bg-blue-100 text-blue-700"
                    : rl.level === 3
                    ? "bg-yellow-100 text-yellow-700"
                    : rl.level === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {rl.level}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-700">{rl.label}: </span>
                <span className="text-muted-foreground">{rl.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AiGeneratePanel({
  assessmentId,
  jobTitle,
  jobDescription,
  department,
  existingCompetencies,
  onComplete,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "streaming" | "review" | "saving" | "done">("idle");
  const [streamText, setStreamText] = useState("");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [creditRefresh, setCreditRefresh] = useState(0);
  const [saveProgress, setSaveProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setStreamText("");
    setPhase("streaming");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/generate-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          department,
          competencies: existingCompetencies.map((c) => c.name),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setError("No AI credits remaining. Please upgrade your plan.");
        } else {
          setError(errData.error ?? "Failed to generate assessment");
        }
        setPhase("idle");
        return;
      }

      if (!res.body) {
        setError("No response body received");
        setPhase("idle");
        return;
      }

      // Read the stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamText(accumulated);
      }

      // Parse the completed JSON
      const jsonStr = accumulated.trim();
      const parsed: GeneratedAssessment = JSON.parse(jsonStr);

      // Flatten into review items
      const items: ReviewItem[] = [];
      for (const comp of parsed.competencies) {
        for (const q of comp.questions) {
          items.push({
            competencyName: comp.name,
            competencyDescription: comp.description,
            question: q,
            accepted: null,
          });
        }
      }

      setCreditRefresh((v) => v + 1);
      setReviewItems(items);
      setPhase("review");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Generation error:", err);
      setError("Something went wrong during generation. Please try again.");
      setPhase("idle");
    }
  }, [jobTitle, jobDescription, department, existingCompetencies]);

  const handleAcceptAll = () => {
    setReviewItems((items) =>
      items.map((item) => ({ ...item, accepted: item.accepted === null ? true : item.accepted }))
    );
  };

  const handleAccept = (index: number) => {
    setReviewItems((items) =>
      items.map((item, i) => (i === index ? { ...item, accepted: true } : item))
    );
  };

  const handleSkip = (index: number) => {
    setReviewItems((items) =>
      items.map((item, i) => (i === index ? { ...item, accepted: false } : item))
    );
  };

  const handleSaveAccepted = useCallback(async () => {
    const accepted = reviewItems.filter((item) => item.accepted === true);
    if (accepted.length === 0) {
      toast.info("No questions accepted. Select at least one question to save.");
      return;
    }

    setPhase("saving");

    // Group accepted items by competency name
    const competencyMap = new Map<
      string,
      { description: string; items: ReviewItem[] }
    >();

    for (const item of accepted) {
      if (!competencyMap.has(item.competencyName)) {
        competencyMap.set(item.competencyName, {
          description: item.competencyDescription,
          items: [],
        });
      }
      competencyMap.get(item.competencyName)!.items.push(item);
    }

    const totalQuestions = accepted.length;
    let savedQuestions = 0;
    setSaveProgress({ done: 0, total: totalQuestions });

    try {
      for (const [competencyName, { description, items }] of competencyMap) {
        // Check if competency already exists
        const existing = existingCompetencies.find(
          (c) => c.name.toLowerCase() === competencyName.toLowerCase()
        );

        let competencyId: string;

        if (existing) {
          competencyId = existing.id;
        } else {
          // Create new competency
          const compRes = await fetch(
            `/api/assessments/${assessmentId}/competencies`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: competencyName, description }),
            }
          );

          if (!compRes.ok) {
            throw new Error(`Failed to create competency: ${competencyName}`);
          }

          const compData = await compRes.json();
          competencyId = compData.id;
        }

        // Save each accepted question
        for (const item of items) {
          const qRes = await fetch(
            `/api/assessments/${assessmentId}/questions`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: item.question.content,
                type: item.question.type,
                competencyId,
                rubricLevels: item.question.rubricLevels.map((rl) => ({
                  level: rl.level,
                  label: rl.label,
                  description: rl.description,
                  behavioralAnchors: rl.behavioralAnchors,
                })),
              }),
            }
          );

          if (!qRes.ok) {
            throw new Error(`Failed to save question for ${competencyName}`);
          }

          savedQuestions++;
          setSaveProgress({ done: savedQuestions, total: totalQuestions });
        }
      }

      toast.success(
        `${savedQuestions} question${savedQuestions !== 1 ? "s" : ""} added to assessment`
      );
      setPhase("done");
      router.refresh();
      onComplete();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save some questions. Please try again.");
      setPhase("review");
    }
  }, [reviewItems, assessmentId, existingCompetencies, router, onComplete]);

  const acceptedCount = reviewItems.filter((i) => i.accepted === true).length;
  const pendingCount = reviewItems.filter((i) => i.accepted === null).length;

  // ── IDLE phase ─────────────────────────────────────────────────────────────

  if (phase === "idle" || phase === "done") {
    return (
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-slate-800">Generate with AI</h3>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use Claude to generate competencies, interview questions, and full 5-level BARS rubrics
              based on the job description.
            </p>
          </div>
          <AiCreditsDisplay refreshSignal={creditRefresh} />
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleGenerate}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Assessment
          </Button>
        </div>
      </div>
    );
  }

  // ── STREAMING phase ─────────────────────────────────────────────────────────

  if (phase === "streaming") {
    return (
      <div className="rounded-xl border border-violet-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-violet-50/50">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-slate-800">AI Generation in Progress</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-red-600"
            onClick={() => {
              abortRef.current?.abort();
              setPhase("idle");
            }}
          >
            Cancel
          </Button>
        </div>
        <StreamingSkeleton text={streamText} />
      </div>
    );
  }

  // ── SAVING phase ────────────────────────────────────────────────────────────

  if (phase === "saving") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm font-medium text-green-800">
          Saving questions... {saveProgress.done}/{saveProgress.total}
        </p>
        <div className="w-full max-w-xs bg-green-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: saveProgress.total > 0
                ? `${(saveProgress.done / saveProgress.total) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>
    );
  }

  // ── REVIEW phase ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Review header */}
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4">
        <div>
          <h3 className="font-semibold text-slate-800">Review Generated Content</h3>
          <p className="text-sm text-muted-foreground">
            {reviewItems.length} questions generated across{" "}
            {new Set(reviewItems.map((i) => i.competencyName)).size} competencies.
            Accept the ones you want to add.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-green-700">{acceptedCount}</span> accepted
            {pendingCount > 0 && (
              <>
                {" "}· <span className="font-semibold">{pendingCount}</span> pending
              </>
            )}
          </div>
          {pendingCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleAcceptAll}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Accept All
            </Button>
          )}
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            disabled={acceptedCount === 0}
            onClick={handleSaveAccepted}
          >
            <Check className="h-3.5 w-3.5" />
            Save {acceptedCount > 0 ? `${acceptedCount} ` : ""}Question{acceptedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      {/* Regenerate link */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Not satisfied? Generation uses 1 AI credit.
        </p>
        <button
          onClick={() => {
            setReviewItems([]);
            setPhase("idle");
          }}
          className="text-xs text-violet-600 hover:underline"
        >
          Regenerate
        </button>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {reviewItems.map((item, index) => (
          <ReviewCard
            key={`${item.competencyName}-${index}`}
            item={item}
            index={index}
            onAccept={handleAccept}
            onSkip={handleSkip}
          />
        ))}
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 rounded-xl border border-green-200 bg-white shadow-lg p-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-green-700">{acceptedCount}</span> question
          {acceptedCount !== 1 ? "s" : ""} selected
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPhase("idle")}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={acceptedCount === 0}
            onClick={handleSaveAccepted}
          >
            Save Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
