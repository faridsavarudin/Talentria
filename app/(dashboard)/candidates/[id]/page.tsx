import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  CalendarPlus,
  ExternalLink,
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
import { getInitials, formatDate } from "@/lib/utils";
import type { PipelineStage, InterviewStatus } from "@prisma/client";
import { CandidateStagePicker } from "@/components/candidates/candidate-stage-picker";
import { CandidateNotesEditor } from "@/components/candidates/candidate-notes-editor";

const STAGE_LABELS: Record<PipelineStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  APPLIED: "bg-gray-100 text-gray-700",
  SCREENING: "bg-blue-100 text-blue-700",
  ASSESSMENT: "bg-purple-100 text-purple-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  OFFER: "bg-orange-100 text-orange-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

const STATUS_COLORS: Record<InterviewStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

type PageParams = Promise<{ id: string }>;

export default async function CandidateDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const candidate = await prisma.candidate.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        include: {
          assessment: { select: { id: true, title: true, jobTitle: true } },
          panels: {
            include: {
              evaluator: { select: { id: true, name: true, email: true } },
            },
          },
          _count: { select: { evaluations: true } },
        },
      },
      _count: { select: { interviews: true } },
    },
  });

  if (!candidate) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back Navigation */}
      <div className="flex items-center gap-3">
        <Link href="/candidates">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">Candidates</span>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {candidate.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {candidate.phone}
                </span>
              )}
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Resume
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="mt-2">
              <Badge
                className={
                  STAGE_COLORS[candidate.pipelineStage] + " border-0 text-xs"
                }
              >
                {STAGE_LABELS[candidate.pipelineStage]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CandidateStagePicker
            candidateId={candidate.id}
            currentStage={candidate.pipelineStage}
            stageLabels={STAGE_LABELS}
          />
          <Link href={`/interviews/new?candidateId=${candidate.id}`}>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Notes */}
        <div className="space-y-6 lg:col-span-1">
          <CandidateNotesEditor
            candidateId={candidate.id}
            initialNotes={candidate.notes ?? ""}
          />

          {/* Activity Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Added</span>
                <span className="font-medium">
                  {formatDate(candidate.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Activity</span>
                <span className="font-medium">
                  {formatDate(candidate.lastActivityAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Interviews</span>
                <span className="font-medium">
                  {candidate._count.interviews}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Interview History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interview History</CardTitle>
                  <CardDescription>
                    All interviews for this candidate
                  </CardDescription>
                </div>
                <Link href={`/interviews/new?candidateId=${candidate.id}`}>
                  <Button variant="outline" size="sm">
                    <CalendarPlus className="mr-1.5 h-4 w-4" />
                    Schedule
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {candidate.interviews.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="text-sm">No interviews scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidate.interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/interviews/${interview.id}`}
                              className="font-medium hover:underline truncate"
                            >
                              {interview.assessment.title}
                            </Link>
                            <Badge
                              className={
                                STATUS_COLORS[interview.status] +
                                " border-0 text-xs shrink-0"
                              }
                            >
                              {interview.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {interview.assessment.jobTitle}
                          </p>
                          {interview.scheduledAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Scheduled:{" "}
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }).format(new Date(interview.scheduledAt))}
                            </p>
                          )}
                          {interview.panels.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Panel:{" "}
                              {interview.panels
                                .map((p) => p.evaluator.name ?? p.evaluator.email)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {interview._count.evaluations} evaluation
                            {interview._count.evaluations !== 1 ? "s" : ""}
                          </p>
                          <Link href={`/interviews/${interview.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-7 text-xs"
                            >
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
