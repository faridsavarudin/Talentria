import Link from "next/link";
import { CalendarPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import type { InterviewStatus } from "@prisma/client";
import { InterviewsStatusFilter } from "@/components/interviews/interviews-status-filter";

const STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<InterviewStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

type SearchParams = Promise<{ status?: string }>;

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireAuth();
  const { status } = await searchParams;

  const validStatuses: InterviewStatus[] = [
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];
  const statusFilter =
    status && validStatuses.includes(status as InterviewStatus)
      ? (status as InterviewStatus)
      : undefined;

  const interviews = await prisma.interview.findMany({
    where: {
      assessment: { organizationId: user.organizationId },
      ...(statusFilter && { status: statusFilter }),
    },
    orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      assessment: { select: { id: true, title: true, jobTitle: true } },
      panels: {
        include: {
          evaluator: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      _count: { select: { evaluations: true } },
    },
  });

  const statusCounts = await prisma.interview.groupBy({
    by: ["status"],
    where: { assessment: { organizationId: user.organizationId } },
    _count: true,
  });

  const statusCountMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  ) as Partial<Record<InterviewStatus, number>>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Manage and track all scheduled interviews.
          </p>
        </div>
        <Link href="/interviews/new">
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <InterviewsStatusFilter
        activeStatus={status}
        statusCounts={statusCountMap}
        statusLabels={STATUS_LABELS}
      />

      {/* Interview List */}
      {interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No interviews found</h3>
            <p className="mb-6 text-muted-foreground">
              {statusFilter
                ? "No interviews match this filter."
                : "Schedule your first interview to get started."}
            </p>
            {!statusFilter && (
              <Link href="/interviews/new">
                <Button>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <Link key={interview.id} href={`/interviews/${interview.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Candidate + Assessment */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getInitials(interview.candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {interview.candidate.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {interview.assessment.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {interview.assessment.jobTitle}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Panel + Date */}
                    <div className="flex flex-col gap-1 text-sm sm:text-right">
                      {interview.panels.length > 0 && (
                        <p className="text-muted-foreground text-xs">
                          Panel:{" "}
                          {interview.panels
                            .map(
                              (p) => p.evaluator.name ?? p.evaluator.email
                            )
                            .join(", ")}
                        </p>
                      )}
                      {interview.scheduledAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(interview.scheduledAt))}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {interview._count.evaluations} evaluation
                        {interview._count.evaluations !== 1 ? "s" : ""} submitted
                      </p>
                    </div>

                    {/* Right: Status */}
                    <Badge
                      className={
                        STATUS_COLORS[interview.status] + " border-0 shrink-0"
                      }
                    >
                      {STATUS_LABELS[interview.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
