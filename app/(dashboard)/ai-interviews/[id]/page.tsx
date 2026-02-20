import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bot,
  Clock,
  User,
  Mail,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Copy,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type AIEvaluation = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: "advance" | "hold" | "reject";
};

type TranscriptEntry = {
  role: "user" | "assistant";
  content: string;
  questionIndex?: number;
};

const RECOMMENDATION_CONFIG = {
  advance: { label: "Advance", icon: ThumbsUp, style: "bg-green-100 text-green-800 border-green-200" },
  hold: { label: "Hold", icon: Minus, style: "bg-amber-100 text-amber-800 border-amber-200" },
  reject: { label: "Reject", icon: ThumbsDown, style: "bg-red-100 text-red-800 border-red-200" },
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-3 w-8 rounded ${n <= score ? "bg-indigo-500" : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default async function AIInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();

  const session = await prisma.aIInterviewSession.findFirst({
    where: { id, organizationId: user.organizationId },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      status: true,
      totalQuestions: true,
      currentQuestion: true,
      inviteToken: true,
      aiEvaluation: true,
      transcript: true,
      startedAt: true,
      completedAt: true,
      durationSeconds: true,
      createdAt: true,
      assessment: { select: { id: true, title: true } },
    },
  });

  if (!session) notFound();

  const evaluation = session.aiEvaluation as AIEvaluation | null;
  const transcript = session.transcript as TranscriptEntry[];
  const candidateLabel = session.candidateName ?? session.candidateEmail ?? "Anonymous Candidate";
  const recommendationConfig = evaluation?.recommendation
    ? RECOMMENDATION_CONFIG[evaluation.recommendation]
    : null;
  const RecommendationIcon = recommendationConfig?.icon;

  const interviewUrl = `/ai-interview/${session.inviteToken}`;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-0.5">
          <Link href="/ai-interviews"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{candidateLabel}</h1>
            <Badge
              className={`text-xs font-medium ${STATUS_STYLES[session.status] ?? ""}`}
              variant="secondary"
            >
              {session.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {session.assessment ? `${session.assessment.title} · ` : ""}
            Created {formatDistanceToNow(session.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Candidate info + invite link */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            {session.candidateName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{session.candidateName}</span>
              </div>
            )}
            {session.candidateEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{session.candidateEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span>{session.totalQuestions} questions</span>
            </div>
            {session.durationSeconds && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{Math.round(session.durationSeconds / 60)} min duration</span>
              </div>
            )}
            {session.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Completed {format(session.completedAt, "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Interview Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <code className="block bg-slate-50 border rounded px-3 py-2 text-xs text-slate-700 break-all">
              {interviewUrl}
            </code>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={interviewUrl} target="_blank">
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Open Interview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Evaluation */}
      {evaluation ? (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">AI Evaluation</h2>

          {/* Score + recommendation row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {evaluation.overallScore}<span className="text-base text-muted-foreground font-normal">/5</span>
                  </span>
                </div>
                <ScoreBar score={evaluation.overallScore} />
                <p className="text-sm text-slate-700 leading-relaxed">{evaluation.summary}</p>
              </CardContent>
            </Card>

            <Card
              className={`border ${recommendationConfig?.style ?? "bg-slate-50"}`}
            >
              <CardContent className="pt-4 flex flex-col items-center justify-center h-full gap-2">
                {RecommendationIcon && (
                  <RecommendationIcon className="h-8 w-8" />
                )}
                <span className="text-lg font-bold">{recommendationConfig?.label}</span>
                <span className="text-xs text-muted-foreground">Recommendation</span>
              </CardContent>
            </Card>
          </div>

          {/* Strengths + improvements */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                  {evaluation.strengths.length === 0 && (
                    <li className="text-sm text-muted-foreground">—</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                  <TrendingDown className="h-4 w-4" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {evaluation.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                  {evaluation.improvements.length === 0 && (
                    <li className="text-sm text-muted-foreground">—</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        session.status !== "completed" && (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="py-8 text-center">
              <Bot className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {session.status === "pending"
                  ? "Waiting for the candidate to start the interview."
                  : "Interview in progress — evaluation will appear when completed."}
              </p>
            </CardContent>
          </Card>
        )
      )}

      {/* Transcript */}
      {transcript && transcript.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Interview Transcript</h2>
          <div className="space-y-3">
            {transcript.map((entry, i) => (
              <div
                key={i}
                className={`flex gap-3 ${entry.role === "assistant" ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-xs font-bold ${
                    entry.role === "assistant"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {entry.role === "assistant" ? "AI" : "C"}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    entry.role === "assistant"
                      ? "bg-indigo-50 text-slate-800 rounded-tl-sm"
                      : "bg-slate-100 text-slate-800 rounded-tr-sm"
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
