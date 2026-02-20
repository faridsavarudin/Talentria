import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./_components/KanbanBoard";
import type { PipelineStage } from "@prisma/client";

export const metadata = {
  title: "Pipeline | Kaleo",
};

const PAGE_LIMIT = 15;

const BOARD_STAGES: PipelineStage[] = [
  "APPLIED",
  "SCREENING",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

export type CandidateWithInfo = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pipelineStage: PipelineStage;
  lastActivityAt: Date;
  createdAt: Date;
  _count: { interviews: number };
};

export type ColumnData = {
  candidates: CandidateWithInfo[];
  total: number;
};

export type InitialBoardData = Record<string, ColumnData>;

export default async function PipelinePage() {
  const user = await requireAuth();

  // Fetch first page + total count for each stage in parallel
  const stageResults = await Promise.all(
    [...BOARD_STAGES, "REJECTED" as PipelineStage].map(async (stage) => {
      const [candidates, total] = await Promise.all([
        prisma.candidate.findMany({
          where: { organizationId: user.organizationId, pipelineStage: stage },
          orderBy: { lastActivityAt: "desc" },
          take: PAGE_LIMIT,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            pipelineStage: true,
            lastActivityAt: true,
            createdAt: true,
            _count: { select: { interviews: true } },
          },
        }),
        prisma.candidate.count({
          where: { organizationId: user.organizationId, pipelineStage: stage },
        }),
      ]);
      return { stage, candidates, total };
    })
  );

  const initialData: InitialBoardData = {};
  for (const { stage, candidates, total } of stageResults) {
    initialData[stage] = { candidates, total };
  }

  const totalActive = BOARD_STAGES.reduce(
    (acc, s) => acc + (initialData[s]?.total ?? 0),
    0
  );
  const totalAll = totalActive + (initialData["REJECTED"]?.total ?? 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hiring Pipeline
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag candidates between stages to update their progress.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{totalAll}</span>{" "}
            total
          </span>
          <span>
            <span className="font-semibold text-foreground">{totalActive}</span>{" "}
            active
          </span>
        </div>
      </div>

      <KanbanBoard initialData={initialData} pageLimit={PAGE_LIMIT} />
    </div>
  );
}
