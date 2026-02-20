"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CalendarPlus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateOption = {
  id: string;
  name: string;
  email: string;
  pipelineStage: string;
};

type AssessmentOption = {
  id: string;
  title: string;
  jobTitle: string;
  department: string | null;
  _count: { questions: number };
};

type EvaluatorOption = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type PanelMember = {
  evaluatorId: string;
  role: "LEAD" | "MEMBER";
  evaluator: EvaluatorOption;
};

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  { label: "Select Candidate" },
  { label: "Select Assessment" },
  { label: "Panel & Schedule" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span
            className={`hidden text-sm sm:block ${
              i === current ? "font-medium" : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div className="h-px w-8 bg-border sm:w-12" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NewInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCandidateId = searchParams.get("candidateId");

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Candidate
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateOption | null>(null);

  // Step 2: Assessment
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentOption | null>(null);

  // Step 3: Panel + Schedule
  const [evaluators, setEvaluators] = useState<EvaluatorOption[]>([]);
  const [loadingEvaluators, setLoadingEvaluators] = useState(false);
  const [evaluatorSearch, setEvaluatorSearch] = useState("");
  const [panelMembers, setPanelMembers] = useState<PanelMember[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");

  // ─── Candidate search ───────────────────────────────────────────────────

  const fetchCandidates = useCallback(async (q: string) => {
    setLoadingCandidates(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      const res = await fetch(`/api/candidates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  const debouncedCandidateSearch = useDebouncedCallback(fetchCandidates, 350);

  useEffect(() => {
    fetchCandidates(candidateSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preselect candidate from query param
  useEffect(() => {
    if (!preselectedCandidateId || candidates.length === 0) return;
    const found = candidates.find((c) => c.id === preselectedCandidateId);
    if (found) {
      setSelectedCandidate(found);
      setStep(1);
    }
  }, [preselectedCandidateId, candidates]);

  // ─── Assessments ─────────────────────────────────────────────────────────

  const fetchAssessments = useCallback(async () => {
    setLoadingAssessments(true);
    try {
      const res = await fetch("/api/assessments?status=ACTIVE");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingAssessments(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1) fetchAssessments();
  }, [step, fetchAssessments]);

  // ─── Evaluators ──────────────────────────────────────────────────────────

  const fetchEvaluators = useCallback(async () => {
    setLoadingEvaluators(true);
    try {
      const res = await fetch("/api/evaluators");
      if (res.ok) {
        const data = await res.json();
        setEvaluators(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingEvaluators(false);
    }
  }, []);

  useEffect(() => {
    if (step === 2) fetchEvaluators();
  }, [step, fetchEvaluators]);

  // ─── Panel helpers ───────────────────────────────────────────────────────

  const addPanelMember = (evaluator: EvaluatorOption) => {
    if (panelMembers.some((p) => p.evaluatorId === evaluator.id)) return;
    const role: "LEAD" | "MEMBER" =
      panelMembers.length === 0 ? "LEAD" : "MEMBER";
    setPanelMembers([...panelMembers, { evaluatorId: evaluator.id, role, evaluator }]);
  };

  const removePanelMember = (evaluatorId: string) => {
    const updated = panelMembers.filter((p) => p.evaluatorId !== evaluatorId);
    // Re-assign LEAD to first member if current LEAD was removed
    if (
      updated.length > 0 &&
      !updated.some((p) => p.role === "LEAD")
    ) {
      updated[0] = { ...updated[0], role: "LEAD" };
    }
    setPanelMembers(updated);
  };

  const toggleRole = (evaluatorId: string) => {
    setPanelMembers(
      panelMembers.map((p) => {
        if (p.evaluatorId === evaluatorId) {
          return { ...p, role: p.role === "LEAD" ? "MEMBER" : "LEAD" };
        }
        // Only one lead at a time: if assigning lead here, demote others
        if (
          panelMembers.find((pm) => pm.evaluatorId === evaluatorId)?.role ===
          "MEMBER"
        ) {
          return { ...p, role: "MEMBER" };
        }
        return p;
      })
    );
  };

  const filteredEvaluators = evaluators.filter((ev) => {
    const q = evaluatorSearch.toLowerCase();
    return (
      !panelMembers.some((p) => p.evaluatorId === ev.id) &&
      ((ev.name ?? "").toLowerCase().includes(q) ||
        ev.email.toLowerCase().includes(q))
    );
  });

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedCandidate || !selectedAssessment || panelMembers.length === 0 || !scheduledAt) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          assessmentId: selectedAssessment.id,
          scheduledAt: new Date(scheduledAt).toISOString(),
          panelMembers: panelMembers.map((p) => ({
            evaluatorId: p.evaluatorId,
            role: p.role,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to schedule interview");
        return;
      }

      toast.success("Interview scheduled successfully");
      router.push(`/interviews/${json.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/interviews">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule Interview
          </h1>
          <p className="text-muted-foreground">
            Set up a structured interview in 3 steps.
          </p>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* ── Step 0: Candidate ─────────────────────────────────────────── */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Candidate</CardTitle>
            <CardDescription>
              Search and select the candidate for this interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={candidateSearch}
                onChange={(e) => {
                  setCandidateSearch(e.target.value);
                  debouncedCandidateSearch(e.target.value);
                }}
              />
            </div>

            {loadingCandidates ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 w-full animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No candidates found.{" "}
                <Link href="/candidates/new" className="text-primary hover:underline">
                  Add one
                </Link>
              </p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCandidate(c)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${
                      selectedCandidate?.id === c.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent"
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {c.pipelineStage}
                    </Badge>
                    {selectedCandidate?.id === c.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                disabled={!selectedCandidate}
                onClick={() => setStep(1)}
              >
                Next: Select Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 1: Assessment ────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Assessment</CardTitle>
            <CardDescription>
              Choose an active assessment for{" "}
              <strong>{selectedCandidate?.name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingAssessments ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : assessments.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No active assessments.{" "}
                <Link href="/assessments/new" className="text-primary hover:underline">
                  Create one
                </Link>{" "}
                and publish it first.
              </p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {assessments.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAssessment(a)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedAssessment?.id === a.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.jobTitle}
                        {a.department ? ` · ${a.department}` : ""} ·{" "}
                        {a._count.questions} question
                        {a._count.questions !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {selectedAssessment?.id === a.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                disabled={!selectedAssessment}
                onClick={() => setStep(2)}
              >
                Next: Panel &amp; Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Panel + Schedule ──────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Panel &amp; Schedule</CardTitle>
            <CardDescription>
              Add evaluators and set the interview date &amp; time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Date/Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">
                Scheduled Date &amp; Time{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Panel Members — selected */}
            {panelMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Panel Members</Label>
                <div className="space-y-1.5">
                  {panelMembers.map((p) => (
                    <div
                      key={p.evaluatorId}
                      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-xs">
                          {getInitials(p.evaluator.name ?? p.evaluator.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {p.evaluator.name ?? p.evaluator.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.evaluator.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRole(p.evaluatorId)}
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                          p.role === "LEAD"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        title="Click to toggle Lead/Member"
                      >
                        {p.role}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePanelMember(p.evaluatorId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluator Search */}
            <div className="space-y-2">
              <Label>Add Evaluators</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search evaluators..."
                  className="pl-10"
                  value={evaluatorSearch}
                  onChange={(e) => setEvaluatorSearch(e.target.value)}
                />
              </div>

              {loadingEvaluators ? (
                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : filteredEvaluators.length === 0 ? (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  {evaluators.length === 0
                    ? "No evaluators found in your organization."
                    : "All evaluators added."}
                </p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {filteredEvaluators.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => addPanelMember(ev)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-xs">
                          {getInitials(ev.name ?? ev.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {ev.name ?? ev.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {ev.email} · {ev.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Candidate: </span>
                <strong>{selectedCandidate?.name}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Assessment: </span>
                <strong>{selectedAssessment?.title}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Panel size: </span>
                <strong>{panelMembers.length} member{panelMembers.length !== 1 ? "s" : ""}</strong>
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                disabled={
                  isSubmitting ||
                  panelMembers.length === 0 ||
                  !scheduledAt
                }
                onClick={handleSubmit}
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
