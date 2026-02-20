"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Send,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RubricLevel = {
  id: string;
  level: number;
  label: string;
  description: string;
  behavioralAnchors: unknown;
};

type Question = {
  id: string;
  content: string;
  type: string;
  order: number;
  competency: { id: string; name: string };
  rubricLevels: RubricLevel[];
};

type EvalDraft = {
  score: number | null;
  notes: string;
};

type Props = {
  interviewId: string;
  candidateName: string;
  assessmentTitle: string;
  questions: Question[];
  existingEvals: Record<string, { score: number; notes: string }>;
};

const STORAGE_KEY = (interviewId: string) => `eval-draft-${interviewId}`;

// ─── Component ────────────────────────────────────────────────────────────────

export function EvaluationInterface({
  interviewId,
  candidateName,
  assessmentTitle,
  questions,
  existingEvals,
}: Props) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [evals, setEvals] = useState<Record<string, EvalDraft>>(() => {
    // Merge existing DB evals with existingEvals prop
    const initial: Record<string, EvalDraft> = {};
    for (const q of questions) {
      const existing = existingEvals[q.id];
      initial[q.id] = {
        score: existing?.score ?? null,
        notes: existing?.notes ?? "",
      };
    }
    return initial;
  });
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const scoredCount = Object.values(evals).filter(
    (e) => e.score !== null
  ).length;

  // ─── LocalStorage persistence ─────────────────────────────────────────

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(interviewId));
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, EvalDraft>;
        // Merge: localStorage wins over empty, DB wins over localStorage
        setEvals((prev) => {
          const merged: Record<string, EvalDraft> = { ...prev };
          for (const qId of Object.keys(parsed)) {
            const dbHasScore = existingEvals[qId]?.score != null;
            if (!dbHasScore) {
              merged[qId] = parsed[qId];
            }
          }
          return merged;
        });
      }
    } catch {
      // ignore malformed localStorage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Debounced auto-save to localStorage
  const persistDraft = useCallback(
    (updatedEvals: Record<string, EvalDraft>) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(
            STORAGE_KEY(interviewId),
            JSON.stringify(updatedEvals)
          );
        } catch {
          // ignore
        }
      }, 1500);
    },
    [interviewId]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────

  const updateEval = (
    questionId: string,
    field: keyof EvalDraft,
    value: number | string | null
  ) => {
    setEvals((prev) => {
      const updated = {
        ...prev,
        [questionId]: { ...prev[questionId], [field]: value },
      };
      persistDraft(updated);
      return updated;
    });
  };

  const handleSaveProgress = async () => {
    const scored = Object.entries(evals).filter(([, e]) => e.score !== null);
    if (scored.length === 0) {
      toast.info("No scores to save yet");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/interviews/${interviewId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluations: scored.map(([qId, ev]) => ({
            questionId: qId,
            score: ev.score,
            notes: ev.notes || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save progress");
        return;
      }
      toast.success("Progress saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitAll = async () => {
    const allScored = questions.every((q) => evals[q.id]?.score !== null);
    if (!allScored) {
      toast.error("Please score all questions before submitting");
      setIsSubmitOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/interviews/${interviewId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluations: questions.map((q) => ({
            questionId: q.id,
            score: evals[q.id].score,
            notes: evals[q.id].notes || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to submit evaluations");
        return;
      }

      // Clear localStorage draft
      try {
        localStorage.removeItem(STORAGE_KEY(interviewId));
      } catch {
        // ignore
      }

      toast.success("Evaluations submitted successfully");
      router.push(`/interviews/${interviewId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
      setIsSubmitOpen(false);
    }
  };

  const goNext = () => {
    if (currentIdx < totalQuestions - 1) setCurrentIdx(currentIdx + 1);
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          This assessment has no questions.
        </p>
      </div>
    );
  }

  const currentEval = evals[currentQuestion.id] ?? { score: null, notes: "" };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-0 overflow-hidden rounded-lg border bg-background shadow-sm">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{candidateName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {assessmentTitle}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-sm font-medium">
            <span className="text-primary">{scoredCount}</span>
            <span className="text-muted-foreground">/{totalQuestions}</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}
              scored
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProgress}
            disabled={isSaving}
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsSubmitOpen(true)}
            disabled={scoredCount < totalQuestions}
            title={
              scoredCount < totalQuestions
                ? "Score all questions to submit"
                : "Submit all evaluations"
            }
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Submit All
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Question sidebar ──────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r lg:block">
          <div className="p-2 space-y-0.5">
            {questions.map((q, i) => {
              const ev = evals[q.id];
              const isScored = ev?.score !== null;
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  className={cn(
                    "w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                    isCurrent
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  {isScored ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className="line-clamp-3">
                    <span className="font-medium">Q{i + 1}.</span>{" "}
                    {q.competency.name}
                  </span>
                  {isScored && ev.score && (
                    <span className="ml-auto shrink-0 font-semibold">
                      {ev.score}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Main: Question + Rubric ─────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {/* Question header */}
          <div className="border-b px-5 py-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span>·</span>
              <span>{currentQuestion.competency.name}</span>
              <span>·</span>
              <span>{currentQuestion.type}</span>
            </div>
            <p className="text-base font-medium leading-relaxed">
              {currentQuestion.content}
            </p>
          </div>

          {/* Rubric levels */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Select a rubric level:
            </p>
            <div className="grid gap-3 sm:grid-cols-1">
              {currentQuestion.rubricLevels.length > 0 ? (
                currentQuestion.rubricLevels.map((rubric) => (
                  <RubricCard
                    key={rubric.id}
                    rubric={rubric}
                    isSelected={currentEval.score === rubric.level}
                    onSelect={() =>
                      updateEval(currentQuestion.id, "score", rubric.level)
                    }
                  />
                ))
              ) : (
                // No rubric defined — show plain score buttons
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        updateEval(currentQuestion.id, "score", n)
                      }
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-bold transition-all",
                        currentEval.score === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/20 hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5 mt-2">
              <label className="text-sm font-medium">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                rows={3}
                value={currentEval.notes}
                onChange={(e) =>
                  updateEval(currentQuestion.id, "notes", e.target.value)
                }
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Observations, specific examples, or supporting evidence..."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t px-5 py-3 flex items-center justify-between shrink-0">
            {/* Mobile question indicator */}
            <div className="flex gap-1 lg:hidden">
              {questions.map((q, i) => {
                const isScored = evals[q.id]?.score !== null;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      i === currentIdx
                        ? "bg-primary"
                        : isScored
                        ? "bg-green-400"
                        : "bg-muted-foreground/30"
                    )}
                    aria-label={`Question ${i + 1}`}
                  />
                );
              })}
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={currentIdx === 0}
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Previous
              </Button>
              {currentIdx < totalQuestions - 1 ? (
                <Button size="sm" onClick={goNext}>
                  Save &amp; Next
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsSubmitOpen(true)}
                  disabled={scoredCount < totalQuestions}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Submit All
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Confirm Submit Dialog ─────────────────────────────────────── */}
      <AlertDialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit All Evaluations?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to submit{" "}
              <strong>{scoredCount} evaluation{scoredCount !== 1 ? "s" : ""}</strong>{" "}
              for <strong>{candidateName}</strong>. Once submitted, your
              scores will be recorded. You can still update individual
              scores later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="bg-primary"
            >
              {isSubmitting ? "Submitting..." : "Submit Evaluations"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Rubric Card ─────────────────────────────────────────────────────────────

type RubricCardProps = {
  rubric: RubricLevel;
  isSelected: boolean;
  onSelect: () => void;
};

function RubricCard({ rubric, isSelected, onSelect }: RubricCardProps) {
  const anchors = Array.isArray(rubric.behavioralAnchors)
    ? (rubric.behavioralAnchors as string[])
    : [];

  const levelColors = [
    "",
    "border-red-200 hover:border-red-400 data-[selected=true]:border-red-500 data-[selected=true]:bg-red-50",
    "border-orange-200 hover:border-orange-400 data-[selected=true]:border-orange-500 data-[selected=true]:bg-orange-50",
    "border-yellow-200 hover:border-yellow-400 data-[selected=true]:border-yellow-500 data-[selected=true]:bg-yellow-50",
    "border-teal-200 hover:border-teal-400 data-[selected=true]:border-teal-500 data-[selected=true]:bg-teal-50",
    "border-green-200 hover:border-green-400 data-[selected=true]:border-green-500 data-[selected=true]:bg-green-50",
  ];

  const scoreColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-teal-500",
    "bg-green-500",
  ];

  return (
    <button
      type="button"
      data-selected={isSelected}
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border-2 p-3 text-left transition-all",
        levelColors[rubric.level] ?? "border-muted hover:border-primary/40",
        isSelected && "ring-2 ring-offset-1 ring-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
            scoreColors[rubric.level] ?? "bg-muted-foreground"
          )}
        >
          {rubric.level}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{rubric.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {rubric.description}
          </p>
          {anchors.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {anchors.map((anchor, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-primary/60 shrink-0">•</span>
                  {anchor}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isSelected && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-1" />
        )}
      </div>
    </button>
  );
}
