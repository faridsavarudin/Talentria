import Link from "next/link";
import { Plus, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getInitials, formatDate } from "@/lib/utils";
import type { PipelineStage } from "@prisma/client";
import { CandidatesSearchBar } from "@/components/candidates/candidates-search-bar";
import { CandidatesStageFilter } from "@/components/candidates/candidates-stage-filter";
import { CandidateRowActions } from "@/components/candidates/candidate-row-actions";

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

type SearchParams = Promise<{
  search?: string;
  stage?: string;
}>;

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireAuth();
  const { search, stage } = await searchParams;

  const validStages: PipelineStage[] = [
    "APPLIED",
    "SCREENING",
    "ASSESSMENT",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ];
  const stageFilter =
    stage && validStages.includes(stage as PipelineStage)
      ? (stage as PipelineStage)
      : undefined;

  const where = {
    organizationId: user.organizationId,
    ...(stageFilter && { pipelineStage: stageFilter }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [candidates, stageCounts] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: { lastActivityAt: "desc" },
      take: 50,
      include: {
        _count: { select: { interviews: true } },
        interviews: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            assessment: { select: { id: true, title: true } },
          },
        },
      },
    }),
    prisma.candidate.groupBy({
      by: ["pipelineStage"],
      where: { organizationId: user.organizationId },
      _count: true,
    }),
  ]);

  const stageCountMap = Object.fromEntries(
    stageCounts.map((s) => [s.pipelineStage, s._count])
  ) as Partial<Record<PipelineStage, number>>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            Manage candidates across your hiring pipeline.
          </p>
        </div>
        <Link href="/candidates/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </Link>
      </div>

      {/* Search + Stage Filter (client components for URL navigation) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <CandidatesSearchBar defaultValue={search} />
        <CandidatesStageFilter
          activeStage={stage}
          stageCounts={stageCountMap}
          stageLabels={STAGE_LABELS}
        />
      </div>

      {/* Candidates Table */}
      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No candidates found</h3>
            <p className="mb-6 text-muted-foreground">
              {search || stageFilter
                ? "Try adjusting your search or filter."
                : "Add your first candidate to get started."}
            </p>
            {!search && !stageFilter && (
              <Link href="/candidates/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Candidate
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                    Stage
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                    Interviews
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                    Last Assessment
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground xl:table-cell">
                    Last Activity
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/candidates/${candidate.id}`}
                            className="font-medium hover:underline"
                          >
                            {candidate.name}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {candidate.email}
                          </p>
                          {candidate.phone && (
                            <p className="truncate text-xs text-muted-foreground">
                              {candidate.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge
                        className={
                          STAGE_COLORS[candidate.pipelineStage] +
                          " border-0 text-xs"
                        }
                      >
                        {STAGE_LABELS[candidate.pipelineStage]}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="font-medium">
                        {candidate._count.interviews}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {candidate.interviews[0] ? (
                        <Link
                          href={`/assessments/${candidate.interviews[0].assessment.id}`}
                          className="hover:underline"
                        >
                          <span className="truncate text-xs text-muted-foreground">
                            {candidate.interviews[0].assessment.title}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(candidate.lastActivityAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CandidateRowActions
                        candidateId={candidate.id}
                        candidateName={candidate.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
