"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "./CandidateCard";
import type { PipelineStage } from "@prisma/client";
import type { CandidateWithInfo } from "../page";

const COLUMN_CONFIG: Record<
  string,
  { label: string; color: string; headerBg: string; dotColor: string }
> = {
  APPLIED: {
    label: "Applied",
    color: "bg-gray-100 text-gray-700",
    headerBg: "bg-gray-50 border-gray-200",
    dotColor: "bg-gray-400",
  },
  SCREENING: {
    label: "Screening",
    color: "bg-blue-100 text-blue-700",
    headerBg: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-400",
  },
  ASSESSMENT: {
    label: "Assessment",
    color: "bg-purple-100 text-purple-700",
    headerBg: "bg-purple-50 border-purple-200",
    dotColor: "bg-purple-400",
  },
  INTERVIEW: {
    label: "Interview",
    color: "bg-yellow-100 text-yellow-700",
    headerBg: "bg-yellow-50 border-yellow-200",
    dotColor: "bg-yellow-400",
  },
  OFFER: {
    label: "Offer",
    color: "bg-orange-100 text-orange-700",
    headerBg: "bg-orange-50 border-orange-200",
    dotColor: "bg-orange-400",
  },
  HIRED: {
    label: "Hired",
    color: "bg-green-100 text-green-700",
    headerBg: "bg-green-50 border-green-200",
    dotColor: "bg-green-400",
  },
};

type Props = {
  stage: PipelineStage | string;
  candidates: CandidateWithInfo[];
  /** Server-side total (may be larger than candidates.length when paginated) */
  totalCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onStageUpdated: () => void;
};

export function KanbanColumn({
  stage,
  candidates,
  totalCount,
  hasMore,
  loadingMore,
  onLoadMore,
  onStageUpdated,
}: Props) {
  const config = COLUMN_CONFIG[stage] ?? {
    label: stage,
    color: "bg-gray-100 text-gray-700",
    headerBg: "bg-gray-50 border-gray-200",
    dotColor: "bg-gray-400",
  };

  const hiddenCount = totalCount - candidates.length;

  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-xl border bg-muted/30">
      {/* Column header — shows true total from server */}
      <div
        className={`flex items-center justify-between rounded-t-xl border-b px-3 py-2.5 ${config.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
          <span className="text-sm font-semibold text-slate-800">
            {config.label}
          </span>
        </div>
        <Badge className={`${config.color} border-0 text-xs font-semibold px-2`}>
          {totalCount}
        </Badge>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex flex-col gap-2 p-2 min-h-[120px] flex-1 overflow-y-auto
              transition-colors duration-150
              ${snapshot.isDraggingOver ? "bg-blue-50/60" : ""}
            `}
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            {candidates.length === 0 && !snapshot.isDraggingOver ? (
              <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <p className="text-xs text-muted-foreground">Drop here</p>
              </div>
            ) : null}

            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={index}
                onStageUpdated={onStageUpdated}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Show more / loading indicator */}
      {(hasMore || loadingMore) && (
        <div className="border-t border-border/50 px-2 py-2">
          <button
            disabled={loadingMore}
            onClick={onLoadMore}
            className="
              w-full flex items-center justify-center gap-1.5
              rounded-lg py-1.5 text-xs font-medium text-muted-foreground
              hover:bg-muted hover:text-foreground
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading…
              </>
            ) : (
              `Show more (${hiddenCount} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
