import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";
import { CheckCircle2, Clock, Eye, User, Brain, ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AiScoreButton } from "@/components/async-interviews/ai-score-button";

// ── Proctoring helpers ─────────────────────────────────────────────────────────

const PROCTOR_DEDUCTIONS: Record<string, number> = {
  tab_switch: 5,
  window_blur: 3,
  copy_paste_attempt: 25,
  devtools_open: 30,
  fullscreen_exit: 8,
  no_face_detected: 10,
  multiple_faces: 20,
};

function calcIntegrityScore(logs: { eventType: string }[]): number {
  let deductions = 0;
  for (const log of logs) {
    deductions += PROCTOR_DEDUCTIONS[log.eventType] ?? 5;
  }
  return Math.max(0, 100 - deductions);
}

function IntegrityBadge({ score, count }: { score: number; count: number }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
        <ShieldCheck className="h-3 w-3" />
        Clean
      </span>
    );
  }
  if (score >= 80) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
        <ShieldCheck className="h-3 w-3" />
        {score} / 100
      </span>
    );
  }
  if (score >= 60) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <ShieldAlert className="h-3 w-3" />
        {score} / 100
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
      <ShieldOff className="h-3 w-3" />
      {score} / 100
    </span>
  );
}

export default async function AsyncInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();

  const interview = await prisma.asyncInterview.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      assessment: { include: { questions: { orderBy: { order: "asc" } } } },
      invitations: {
        orderBy: { createdAt: "desc" },
        include: {
          responses: {
            include: { question: { select: { content: true, type: true } } },
            orderBy: { submittedAt: "desc" },
          },
          proctorLogs: {
            select: { eventType: true, occurredAt: true },
            orderBy: { occurredAt: "asc" },
          },
        },
      },
    },
  });

  if (!interview) notFound();

  const totalInvites = interview.invitations.length;
  const completedInvites = interview.invitations.filter((i) => i.completedAt).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{interview.title}</h1>
          <Badge variant="secondary">{interview.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {interview.assessment.title} · {totalInvites} invited · {completedInvites} completed
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Invited", value: totalInvites, icon: User },
          {
            label: "Opened",
            value: interview.invitations.filter((i) => i.openedAt).length,
            icon: Eye,
          },
          { label: "Completed", value: completedInvites, icon: CheckCircle2 },
          { label: "Time / Q", value: `${interview.timeLimitSeconds}s`, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidate responses */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Candidate Responses</h2>
        {interview.invitations.length === 0 && (
          <p className="text-sm text-muted-foreground">No invites sent yet.</p>
        )}

        {interview.invitations.map((invite) => {
          const integrityScore = calcIntegrityScore(invite.proctorLogs);
          const proctorCount = invite.proctorLogs.length;
          return (
          <Card key={invite.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {invite.completedAt
                      ? `Completed ${formatDistanceToNow(invite.completedAt, { addSuffix: true })}`
                      : invite.openedAt
                      ? `Opened ${formatDistanceToNow(invite.openedAt, { addSuffix: true })}`
                      : "Not opened yet"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {invite.completedAt && (
                    <IntegrityBadge score={integrityScore} count={proctorCount} />
                  )}
                  <Badge
                    variant="secondary"
                    className={
                      invite.completedAt
                        ? "bg-green-100 text-green-700"
                        : invite.openedAt
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {invite.completedAt ? "Completed" : invite.openedAt ? "In Progress" : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Proctor event summary */}
              {invite.completedAt && proctorCount > 0 && (
                <div className="mt-2 rounded-md bg-stone-50 border border-stone-100 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Integrity Events</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      invite.proctorLogs.reduce<Record<string, number>>((acc, l) => {
                        acc[l.eventType] = (acc[l.eventType] ?? 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-white border border-stone-200 rounded px-1.5 py-0.5"
                      >
                        {type.replace(/_/g, " ")} × {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>

            {invite.responses.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {invite.responses.map((response) => {
                    const insights = response.aiInsights as Record<string, unknown> | null;
                    return (
                      <div key={response.id} className="rounded-lg border bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-0.5">
                              {response.question.type}
                            </p>
                            <p className="text-sm text-slate-700 line-clamp-2">
                              {response.question.content}
                            </p>
                            {typeof insights?.rationale === "string" && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {insights.rationale}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {response.aiSuggestedScore ? (
                              <div className="flex items-center gap-1.5">
                                <Brain className="h-3 w-3 text-violet-500" />
                                <ScoreBadge score={response.aiSuggestedScore as 1|2|3|4|5} size="sm" />
                              </div>
                            ) : (
                              <AiScoreButton responseId={response.id} />
                            )}
                            {response.evaluatorScore && (
                              <ScoreBadge score={response.evaluatorScore as 1|2|3|4|5} showLabel size="sm" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
          );
        })}
      </div>
    </div>
  );
}
