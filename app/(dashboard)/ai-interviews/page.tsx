import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bot, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type AIEvaluation = {
  overallScore: number;
  recommendation: "advance" | "hold" | "reject";
  summary: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  advance: "bg-green-100 text-green-700",
  hold: "bg-amber-100 text-amber-700",
  reject: "bg-red-100 text-red-700",
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-2 w-5 rounded-sm ${n <= score ? "bg-indigo-500" : "bg-slate-200"}`}
        />
      ))}
      <span className="text-xs font-medium text-slate-700 ml-0.5">{score}/5</span>
    </div>
  );
}

export default async function AIInterviewsPage() {
  const user = await requireAuth();

  const sessions = await prisma.aIInterviewSession.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      status: true,
      totalQuestions: true,
      currentQuestion: true,
      aiEvaluation: true,
      inviteToken: true,
      startedAt: true,
      completedAt: true,
      durationSeconds: true,
      createdAt: true,
      assessment: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const inProgress = sessions.filter((s) => s.status === "in_progress").length;
  const pending = sessions.filter((s) => s.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Synchronous AI-powered interviews — candidates speak with an AI interviewer in real time.
          </p>
        </div>
        <Button asChild className="btn-brand-gradient border-0">
          <Link href="/ai-interviews/new">
            <Plus className="h-4 w-4 mr-2" /> Create Interview
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", value: total, icon: Bot, color: "text-indigo-500" },
            { label: "Pending", value: pending, icon: AlertCircle, color: "text-slate-500" },
            { label: "In Progress", value: inProgress, icon: Clock, color: "text-amber-500" },
            { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <div className={`flex items-center gap-2 text-sm mb-1 ${color}`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <Card className="py-16 text-center">
          <CardContent>
            <Bot className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No AI interviews yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an AI interview session and send the link to a candidate.
            </p>
            <Button asChild className="btn-brand-gradient border-0">
              <Link href="/ai-interviews/new">
                <Plus className="h-4 w-4 mr-2" /> Create Interview
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session list */}
      <div className="grid gap-3">
        {sessions.map((session) => {
          const evaluation = session.aiEvaluation as AIEvaluation | null;
          const candidateLabel = session.candidateName ?? session.candidateEmail ?? "Anonymous Candidate";

          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        {candidateLabel}
                      </CardTitle>
                      <Badge
                        className={`text-xs font-medium ${STATUS_STYLES[session.status] ?? ""}`}
                        variant="secondary"
                      >
                        {session.status.replace("_", " ")}
                      </Badge>
                      {evaluation?.recommendation && (
                        <Badge
                          className={`text-xs font-medium ${RECOMMENDATION_STYLES[evaluation.recommendation] ?? ""}`}
                          variant="secondary"
                        >
                          {evaluation.recommendation}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.assessment ? `${session.assessment.title} · ` : ""}
                      {session.totalQuestions} questions ·{" "}
                      {formatDistanceToNow(session.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/ai-interviews/${session.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardHeader>

              {evaluation && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4">
                    <ScoreBar score={evaluation.overallScore} />
                    {session.durationSeconds && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(session.durationSeconds / 60)}m
                      </span>
                    )}
                  </div>
                  {evaluation.summary && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                      {evaluation.summary}
                    </p>
                  )}
                </CardContent>
              )}

              {!evaluation && session.status !== "completed" && (
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    {session.status === "pending" ? (
                      <span>
                        Invite link:{" "}
                        <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 text-xs">
                          /ai-interview/{session.inviteToken}
                        </code>
                      </span>
                    ) : (
                      <span>
                        Question {session.currentQuestion} of {session.totalQuestions} completed
                      </span>
                    )}
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
