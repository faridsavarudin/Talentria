import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import type { InterviewStatus, PanelRole } from "@prisma/client";
import { InterviewStatusActions } from "@/components/interviews/interview-status-actions";

const STATUS_COLORS: Record<InterviewStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_advance: "Strong Advance",
  advance: "Advance",
  hold: "Hold",
  decline: "Decline",
};

const RECOMMENDATION_COLORS: Record<string, string> = {
  strong_advance: "bg-green-100 text-green-700",
  advance: "bg-teal-100 text-teal-700",
  hold: "bg-yellow-100 text-yellow-700",
  decline: "bg-red-100 text-red-700",
};

type PageParams = Promise<{ id: string }>;

export default async function InterviewDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const interview = await prisma.interview.findFirst({
    where: { id, assessment: { organizationId: user.organizationId } },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          pipelineStage: true,
          resumeUrl: true,
        },
      },
      assessment: {
        select: {
          id: true,
          title: true,
          jobTitle: true,
          department: true,
          _count: { select: { questions: true } },
        },
      },
      panels: {
        include: {
          evaluator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      evaluations: {
        include: {
          evaluator: { select: { id: true, name: true } },
          question: {
            select: {
              id: true,
              content: true,
              type: true,
              order: true,
              competency: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { question: { order: "asc" } },
      },
      _count: { select: { evaluations: true, panels: true } },
    },
  });

  if (!interview) notFound();

  const isCurrentUserOnPanel = interview.panels.some(
    (p) => p.evaluatorId === user.id
  );
  const isAdminOrRecruiter =
    user.role === "ADMIN" || user.role === "RECRUITER";
  const canViewScores = isAdminOrRecruiter || interview.status === "COMPLETED";

  // Group evaluations by evaluator
  const evalsByEvaluator = new Map<
    string,
    { name: string; count: number; totalQuestions: number }
  >();
  const totalQuestions = interview.assessment._count.questions;
  for (const panel of interview.panels) {
    const evCount = interview.evaluations.filter(
      (e) => e.evaluatorId === panel.evaluatorId
    ).length;
    evalsByEvaluator.set(panel.evaluatorId, {
      name: panel.evaluator.name ?? panel.evaluator.email,
      count: evCount,
      totalQuestions,
    });
  }

  // Group scores by question (for score summary)
  const scoresByQuestion = new Map<
    string,
    { content: string; competency: string; scores: number[]; avgScore: number }
  >();
  if (canViewScores) {
    for (const ev of interview.evaluations) {
      const existing = scoresByQuestion.get(ev.questionId);
      if (existing) {
        existing.scores.push(ev.score);
        existing.avgScore =
          existing.scores.reduce((a, b) => a + b, 0) / existing.scores.length;
      } else {
        scoresByQuestion.set(ev.questionId, {
          content: ev.question.content,
          competency: ev.question.competency.name,
          scores: [ev.score],
          avgScore: ev.score,
        });
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/interviews">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">Interviews</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {interview.candidate.name}
            </h1>
            <Badge
              className={STATUS_COLORS[interview.status] + " border-0"}
            >
              {STATUS_LABELS[interview.status]}
            </Badge>
            {interview.recommendation && (
              <Badge
                className={
                  (RECOMMENDATION_COLORS[interview.recommendation] ??
                    "bg-gray-100 text-gray-700") + " border-0"
                }
              >
                {RECOMMENDATION_LABELS[interview.recommendation] ??
                  interview.recommendation}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {interview.assessment.title} · {interview.assessment.jobTitle}
          </p>
          {interview.scheduledAt && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(interview.scheduledAt))}
            </p>
          )}
        </div>

        <InterviewStatusActions
          interviewId={interview.id}
          currentStatus={interview.status}
          isOnPanel={isCurrentUserOnPanel}
          isAdminOrRecruiter={isAdminOrRecruiter}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Candidate info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href={`/candidates/${interview.candidate.id}`}
                className="font-medium hover:underline"
              >
                {interview.candidate.name}
              </Link>
              <p className="text-muted-foreground">{interview.candidate.email}</p>
              {interview.candidate.phone && (
                <p className="text-muted-foreground">
                  {interview.candidate.phone}
                </p>
              )}
              {interview.candidate.resumeUrl && (
                <a
                  href={interview.candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs"
                >
                  View Resume
                </a>
              )}
            </CardContent>
          </Card>

          {/* Assessment info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href={`/assessments/${interview.assessment.id}`}
                className="font-medium hover:underline"
              >
                {interview.assessment.title}
              </Link>
              <p className="text-muted-foreground">
                {interview.assessment.jobTitle}
              </p>
              {interview.assessment.department && (
                <p className="text-muted-foreground">
                  {interview.assessment.department}
                </p>
              )}
              <p className="text-muted-foreground">
                {interview.assessment._count.questions} questions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Panel Members */}
          <Card>
            <CardHeader>
              <CardTitle>Panel Members</CardTitle>
              <CardDescription>
                Evaluation completion status per evaluator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {interview.panels.map((panel) => {
                const evalInfo = evalsByEvaluator.get(panel.evaluatorId);
                const count = evalInfo?.count ?? 0;
                const isComplete = count >= totalQuestions && totalQuestions > 0;
                return (
                  <div
                    key={panel.evaluatorId}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(
                          panel.evaluator.name ?? panel.evaluator.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {panel.evaluator.name ?? panel.evaluator.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {panel.evaluator.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={panel.role} />
                      {isComplete ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {count}/{totalQuestions}
                        </span>
                      )}
                    </div>
                    {/* Evaluate link for current user */}
                    {panel.evaluatorId === user.id &&
                      (interview.status === "SCHEDULED" ||
                        interview.status === "IN_PROGRESS") && (
                        <Link href={`/interviews/${interview.id}/evaluate`}>
                          <Button size="sm" className="h-7 text-xs">
                            Evaluate
                          </Button>
                        </Link>
                      )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Score Summary — visible to admin/recruiter or after completion */}
          {canViewScores && scoresByQuestion.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Score Summary</CardTitle>
                <CardDescription>
                  Average scores across all panel members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from(scoresByQuestion.entries()).map(
                  ([qId, data]) => (
                    <div key={qId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-xs text-muted-foreground">
                            {data.competency}
                          </p>
                          <p className="font-medium truncate">{data.content}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <ScoreBar score={data.avgScore} />
                          <span className="text-sm font-bold w-8 text-right">
                            {data.avgScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {interview.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Interview Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{interview.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function RoleBadge({ role }: { role: PanelRole }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
        role === "LEAD"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {role}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 5) * 100);
  const color =
    score >= 4
      ? "bg-green-500"
      : score >= 3
      ? "bg-yellow-500"
      : "bg-red-500";
  return (
    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
