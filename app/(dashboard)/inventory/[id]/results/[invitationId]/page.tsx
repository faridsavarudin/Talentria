import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Clock, User, ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { InventoryTestType, ProctorSeverity } from "@prisma/client";

const TEST_LABELS: Record<InventoryTestType, string> = {
  RIASEC: "RIASEC Career Interests",
  COGNITIVE: "Cognitive Ability",
  VRA: "Verbal & Abstract Reasoning",
  CREATIVE_THINKING: "Creative Thinking",
  ANALYTICAL_REASONING: "Analytical Reasoning",
  BIG_FIVE: "Big Five Personality",
};

const TEST_COLORS: Record<InventoryTestType, string> = {
  RIASEC: "bg-violet-100 text-violet-700 border-violet-200",
  COGNITIVE: "bg-blue-100 text-blue-700 border-blue-200",
  VRA: "bg-amber-100 text-amber-700 border-amber-200",
  CREATIVE_THINKING: "bg-pink-100 text-pink-700 border-pink-200",
  ANALYTICAL_REASONING: "bg-green-100 text-green-700 border-green-200",
  BIG_FIVE: "bg-slate-100 text-slate-700 border-slate-200",
};

// ── RIASEC hexagon-like bar chart (inline SVG) ─────────────────────────────

const RIASEC_DIMENSION_LABELS: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

const RIASEC_COLORS: Record<string, string> = {
  R: "#6366f1",
  I: "#0ea5e9",
  A: "#ec4899",
  S: "#22c55e",
  E: "#f59e0b",
  C: "#64748b",
};

function RiasecChart({ scores }: { scores: Record<string, number> }) {
  const keys = ["R", "I", "A", "S", "E", "C"];
  const max = Math.max(...keys.map((k) => scores[k] ?? 0), 1);

  return (
    <div className="space-y-2">
      {keys.map((k) => {
        const val = scores[k] ?? 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={k} className="flex items-center gap-3">
            <span className="w-6 text-xs font-bold text-slate-500">{k}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: RIASEC_COLORS[k] ?? "#6366f1",
                }}
              />
            </div>
            <span className="w-6 text-xs text-right text-slate-700 font-medium">
              {val}
            </span>
          </div>
        );
      })}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {keys.map((k) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: RIASEC_COLORS[k] }}
            />
            <span>
              <strong>{k}</strong> — {RIASEC_DIMENSION_LABELS[k]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Score bar (generic) ───────────────────────────────────────────────────────

function ScoreBar({
  label,
  value,
  max,
  color = "bg-indigo-500",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = Math.min(Math.round((value / Math.max(max, 1)) * 100), 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">
          {value} / {max}
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Per-test result card renderer ─────────────────────────────────────────────

function TestResultCard({
  testType,
  rawScores,
  bandLabel,
  aiSummary,
}: {
  testType: InventoryTestType;
  rawScores: Record<string, number>;
  bandLabel: string | null;
  aiSummary: string | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{TEST_LABELS[testType]}</CardTitle>
          {bandLabel && (
            <Badge
              variant="secondary"
              className={`text-xs font-semibold ${TEST_COLORS[testType]}`}
            >
              {bandLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RIASEC */}
        {testType === "RIASEC" && (
          <>
            <p className="text-sm text-muted-foreground">
              Top Holland code:{" "}
              <strong className="text-slate-900">{bandLabel ?? "—"}</strong>
            </p>
            <RiasecChart scores={rawScores} />
          </>
        )}

        {/* Cognitive */}
        {testType === "COGNITIVE" && (
          <div className="space-y-3">
            <ScoreBar
              label="Correct Answers"
              value={rawScores.correct ?? 0}
              max={rawScores.total ?? 1}
              color="bg-blue-500"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Percentile:</span>
              <span className="font-semibold text-slate-900">
                {rawScores.percentile ?? "—"}th
              </span>
            </div>
          </div>
        )}

        {/* VRA */}
        {testType === "VRA" && (
          <div className="space-y-3">
            <ScoreBar
              label="Verbal Reasoning"
              value={rawScores.verbal ?? 0}
              max={Math.max(rawScores.total ?? 1, 1)}
              color="bg-amber-500"
            />
            <ScoreBar
              label="Abstract Reasoning"
              value={rawScores.abstract ?? 0}
              max={Math.max(rawScores.total ?? 1, 1)}
              color="bg-amber-400"
            />
            <div className="text-sm text-muted-foreground">
              Total:{" "}
              <strong className="text-slate-900">{rawScores.total ?? 0}</strong>
            </div>
          </div>
        )}

        {/* Analytical Reasoning */}
        {testType === "ANALYTICAL_REASONING" && (
          <div className="space-y-3">
            <ScoreBar
              label="Correct Answers"
              value={rawScores.correct ?? 0}
              max={rawScores.total ?? 1}
              color="bg-green-500"
            />
            <div className="text-sm text-muted-foreground">
              Accuracy:{" "}
              <strong className="text-slate-900">
                {rawScores.total
                  ? Math.round(
                      ((rawScores.correct ?? 0) / rawScores.total) * 100
                    )
                  : 0}
                %
              </strong>
            </div>
          </div>
        )}

        {/* Creative Thinking */}
        {testType === "CREATIVE_THINKING" && (
          <div className="space-y-3">
            {["fluency", "flexibility", "originality", "elaboration"].map(
              (dim) => (
                <ScoreBar
                  key={dim}
                  label={dim.charAt(0).toUpperCase() + dim.slice(1)}
                  value={rawScores[dim] ?? 0}
                  max={25}
                  color="bg-pink-500"
                />
              )
            )}
            <div className="text-sm text-muted-foreground">
              Total:{" "}
              <strong className="text-slate-900">{rawScores.total ?? 0}</strong>{" "}
              / 100
            </div>
          </div>
        )}

        {/* Big Five */}
        {testType === "BIG_FIVE" && (
          <div className="space-y-3">
            {[
              { key: "O", label: "Openness" },
              { key: "C", label: "Conscientiousness" },
              { key: "E", label: "Extraversion" },
              { key: "A", label: "Agreeableness" },
              { key: "N", label: "Neuroticism" },
            ].map(({ key, label }) => (
              <ScoreBar
                key={key}
                label={label}
                value={rawScores[key] ?? 0}
                max={50}
                color="bg-slate-500"
              />
            ))}
          </div>
        )}

        {/* AI narrative */}
        {aiSummary && (
          <div className="rounded-lg border bg-indigo-50 p-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1.5">
              <Brain className="h-3.5 w-3.5" />
              AI Narrative
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InvitationResultsPage({
  params,
}: {
  params: Promise<{ id: string; invitationId: string }>;
}) {
  const { id, invitationId } = await params;
  const user = await requireAuth();

  // Ensure battery belongs to org
  const battery = await prisma.inventoryBattery.findFirst({
    where: { id, organizationId: user.organizationId },
    select: { id: true, title: true },
  });
  if (!battery) notFound();

  const invitation = await prisma.inventoryInvitation.findFirst({
    where: { id: invitationId, batteryId: id },
    include: {
      results: {
        orderBy: { completedAt: "asc" },
      },
      proctorEvents: {
        select: { eventType: true, severity: true, occurredAt: true, itemIndex: true },
        orderBy: { occurredAt: "asc" },
      },
    },
  });
  if (!invitation) notFound();

  const durationMinutes =
    invitation.startedAt && invitation.completedAt
      ? Math.round(
          (invitation.completedAt.getTime() - invitation.startedAt.getTime()) /
            60000
        )
      : null;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/inventory/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Result Detail</h1>
          <p className="text-sm text-muted-foreground">{battery.title}</p>
        </div>
      </div>

      {/* Candidate info card */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Candidate</p>
                <p className="text-sm font-medium text-slate-900">
                  {invitation.candidateName ?? invitation.candidateEmail ?? "—"}
                </p>
              </div>
            </div>
            {invitation.candidateName && invitation.candidateEmail && (
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-slate-900">
                  {invitation.candidateEmail}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm text-slate-900">
                {invitation.completedAt
                  ? format(invitation.completedAt, "d MMM yyyy, HH:mm")
                  : "—"}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium text-slate-900">
                  {durationMinutes !== null ? `${durationMinutes} min` : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No results yet */}
      {invitation.results.length === 0 && (
        <Card className="py-10 text-center">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No test results submitted yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Per-test result cards */}
      <div className="space-y-4">
        {invitation.results.map((result) => (
          <TestResultCard
            key={result.id}
            testType={result.testType}
            rawScores={result.rawScores as Record<string, number>}
            bandLabel={result.bandLabel}
            aiSummary={result.aiSummary}
          />
        ))}
      </div>

      {invitation.results.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated{" "}
          {formatDistanceToNow(
            invitation.results[invitation.results.length - 1].completedAt,
            { addSuffix: true }
          )}
        </p>
      )}

      {/* ── Integrity / Proctoring Report ── */}
      {(() => {
        const events = invitation.proctorEvents;
        const critical = events.filter((e) => e.severity === ProctorSeverity.VIOLATION).length;
        const warning = events.filter((e) => e.severity === ProctorSeverity.WARNING).length;
        const info = events.filter((e) => e.severity === ProctorSeverity.INFO).length;

        const DEDUCTIONS: Record<string, number> = {
          tab_switch: 5, window_blur: 3, copy_paste_attempt: 25,
          devtools_open: 30, fullscreen_exit: 8, no_face_detected: 10, multiple_faces: 20,
        };
        const integrityScore = Math.max(
          0,
          100 - events.reduce((sum, e) => sum + (DEDUCTIONS[e.eventType as string] ?? 5), 0)
        );

        const riskLevel: "high" | "medium" | "low" = critical > 0 ? "high" : warning >= 2 || info >= 5 ? "medium" : "low";

        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Assessment Integrity</CardTitle>
                {events.length === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    No events
                  </span>
                ) : riskLevel === "high" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    <ShieldOff className="h-3.5 w-3.5" />
                    High risk
                  </span>
                ) : riskLevel === "medium" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Review recommended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Low risk
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score gauge row */}
              <div className="flex items-center gap-6 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{events.length === 0 ? 100 : integrityScore}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">/ 100</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">Integrity Score</p>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${integrityScore >= 80 ? "bg-teal-500" : integrityScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${events.length === 0 ? 100 : integrityScore}%` }}
                    />
                  </div>
                  <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span><strong className="text-rose-600">{critical}</strong> critical</span>
                    <span><strong className="text-amber-600">{warning}</strong> warning</span>
                    <span><strong className="text-slate-500">{info}</strong> info</span>
                  </div>
                </div>
              </div>

              {/* Event log */}
              {events.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Event Log</p>
                  {events.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md bg-slate-50 border border-slate-100 px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            ev.severity === ProctorSeverity.VIOLATION ? "bg-rose-500" :
                            ev.severity === ProctorSeverity.WARNING ? "bg-amber-500" : "bg-slate-400"
                          }`}
                        />
                        <span className="text-xs text-slate-700 capitalize">{(ev.eventType as string).replace(/_/g, " ")}</span>
                        {ev.itemIndex !== null && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">Q{(ev.itemIndex ?? 0) + 1}</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{format(ev.occurredAt, "HH:mm:ss")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No integrity events recorded. Session appears clean.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
