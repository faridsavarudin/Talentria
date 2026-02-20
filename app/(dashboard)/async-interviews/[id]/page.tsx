import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";
import { CheckCircle2, Clock, Eye, User, Brain } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AiScoreButton } from "@/components/async-interviews/ai-score-button";

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

        {interview.invitations.map((invite) => (
          <Card key={invite.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
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
        ))}
      </div>
    </div>
  );
}
