"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KanbanColumn } from "./KanbanColumn";
import { updateCandidateStage } from "@/app/actions/pipeline";
import { toast } from "sonner";
import type { PipelineStage } from "@prisma/client";
import type { InitialBoardData, CandidateWithInfo } from "../page";

const BOARD_STAGES: PipelineStage[] = [
  "APPLIED",
  "SCREENING",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

// Per-column runtime state: visible candidates + pagination metadata
type ColumnState = {
  candidates: CandidateWithInfo[];
  total: number;
  page: number;
  loadingMore: boolean;
};

type ColumnsState = Record<string, ColumnState>;

type Props = {
  initialData: InitialBoardData;
  pageLimit: number;
};

function buildInitialColumns(
  initialData: InitialBoardData,
  stages: PipelineStage[]
): ColumnsState {
  const cols: ColumnsState = {};
  for (const stage of stages) {
    const d = initialData[stage];
    cols[stage] = {
      candidates: d?.candidates ?? [],
      total: d?.total ?? 0,
      page: 1,
      loadingMore: false,
    };
  }
  // Rejected
  const rej = initialData["REJECTED"];
  cols["REJECTED"] = {
    candidates: rej?.candidates ?? [],
    total: rej?.total ?? 0,
    page: 1,
    loadingMore: false,
  };
  return cols;
}

export function KanbanBoard({ initialData, pageLimit }: Props) {
  const [columns, setColumns] = useState<ColumnsState>(() =>
    buildInitialColumns(initialData, BOARD_STAGES)
  );

  const [rejectedOpen, setRejectedOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Load more candidates for a single column ─────────────────────────────
  const handleLoadMore = useCallback(
    async (stage: string) => {
      const col = columns[stage];
      if (!col || col.loadingMore) return;

      const nextPage = col.page + 1;

      setColumns((prev) => ({
        ...prev,
        [stage]: { ...prev[stage]!, loadingMore: true },
      }));

      try {
        const res = await fetch(
          `/api/pipeline?stage=${encodeURIComponent(stage)}&page=${nextPage}&limit=${pageLimit}`
        );
        if (!res.ok) throw new Error("Failed to load more");

        const data = (await res.json()) as {
          candidates: CandidateWithInfo[];
          total: number;
          page: number;
          hasMore: boolean;
        };

        setColumns((prev) => {
          const existing = prev[stage]!;
          // Deduplicate by id in case a DnD operation moved something in the meantime
          const existingIds = new Set(existing.candidates.map((c) => c.id));
          const newOnes = data.candidates.filter((c) => !existingIds.has(c.id));
          return {
            ...prev,
            [stage]: {
              candidates: [...existing.candidates, ...newOnes],
              total: data.total,
              page: nextPage,
              loadingMore: false,
            },
          };
        });
      } catch {
        toast.error("Could not load more candidates");
        setColumns((prev) => ({
          ...prev,
          [stage]: { ...prev[stage]!, loadingMore: false },
        }));
      }
    },
    [columns, pageLimit]
  );

  // ── Re-fetch first page for every column (called after DnD success) ───────
  const handleStageUpdated = useCallback(async () => {
    try {
      const res = await fetch("/api/pipeline");
      if (!res.ok) return;
      const freshData = (await res.json()) as Record<
        string,
        CandidateWithInfo[]
      >;

      setColumns((prev) => {
        const next: ColumnsState = { ...prev };
        for (const stage of [...BOARD_STAGES, "REJECTED" as PipelineStage]) {
          const fresh = freshData[stage] ?? [];
          const col = prev[stage]!;
          // Keep the previously loaded count but replace with fresh data (server is source of truth)
          next[stage] = {
            ...col,
            candidates: fresh,
            total: fresh.length >= col.total ? fresh.length : col.total,
          };
        }
        return next;
      });
    } catch {
      // Silently fail — data will refresh on next navigation
    }
  }, []);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const sourceStage = source.droppableId;
      const destStage = destination.droppableId;

      // Optimistic update: move the card in local state immediately
      setColumns((prev) => {
        const next = { ...prev };
        const sourceList = [...(prev[sourceStage]?.candidates ?? [])];
        const destList =
          sourceStage === destStage
            ? sourceList
            : [...(prev[destStage]?.candidates ?? [])];

        const [moved] = sourceList.splice(source.index, 1);
        const updatedMoved: CandidateWithInfo = {
          ...moved,
          pipelineStage: destStage as PipelineStage,
        };

        if (sourceStage === destStage) {
          sourceList.splice(destination.index, 0, updatedMoved);
          next[sourceStage] = {
            ...prev[sourceStage]!,
            candidates: sourceList,
          };
        } else {
          destList.splice(destination.index, 0, updatedMoved);
          next[sourceStage] = {
            ...prev[sourceStage]!,
            candidates: sourceList,
            total: Math.max(0, (prev[sourceStage]?.total ?? 1) - 1),
          };
          next[destStage] = {
            ...prev[destStage]!,
            candidates: destList,
            total: (prev[destStage]?.total ?? 0) + 1,
          };
        }

        return next;
      });

      if (sourceStage !== destStage) {
        setIsUpdating(true);
        const actionResult = await updateCandidateStage(draggableId, destStage);
        setIsUpdating(false);

        if (actionResult.success) {
          toast.success(
            `Moved to ${destStage.charAt(0) + destStage.slice(1).toLowerCase()}`
          );
        } else {
          toast.error(actionResult.error ?? "Failed to update stage");
          // Revert on error
          await handleStageUpdated();
        }
      }
    },
    [handleStageUpdated]
  );

  const rejectedCol = columns["REJECTED"]!;
  const rejectedCount = rejectedCol.total;
  const totalActive = BOARD_STAGES.reduce(
    (acc, s) => acc + (columns[s]?.total ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Board stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{totalActive}</span>{" "}
          active candidates
        </span>
        {isUpdating && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Saving...
          </span>
        )}
      </div>

      {/* Main board — horizontal scroll */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ minHeight: "500px" }}
        >
          {BOARD_STAGES.map((stage) => {
            const col = columns[stage]!;
            return (
              <KanbanColumn
                key={stage}
                stage={stage}
                candidates={col.candidates}
                totalCount={col.total}
                hasMore={col.candidates.length < col.total}
                loadingMore={col.loadingMore}
                onLoadMore={() => handleLoadMore(stage)}
                onStageUpdated={handleStageUpdated}
              />
            );
          })}
        </div>

        {/* Rejected overflow section */}
        <div className="rounded-xl border bg-red-50/40 border-red-100">
          <button
            onClick={() => setRejectedOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50/60 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Rejected
              <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                {rejectedCount}
              </Badge>
            </div>
            {rejectedOpen ? (
              <ChevronUp className="h-4 w-4 text-red-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-red-500" />
            )}
          </button>

          {rejectedOpen && rejectedCol.candidates.length > 0 && (
            <div className="border-t border-red-100 p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {rejectedCol.candidates.map((candidate, index) => {
                  // Rejected cards are not draggable — render a simplified version
                  return (
                    <div
                      key={candidate.id}
                      className="rounded-lg border bg-white p-3 opacity-70"
                    >
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {candidate.email}
                      </p>
                    </div>
                  );
                })}
              </div>
              {rejectedCol.candidates.length < rejectedCol.total && (
                <div className="flex justify-center">
                  <button
                    disabled={rejectedCol.loadingMore}
                    onClick={() => handleLoadMore("REJECTED")}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 py-1 px-3 rounded hover:bg-red-50 transition-colors"
                  >
                    {rejectedCol.loadingMore
                      ? "Loading…"
                      : `Show more (${rejectedCol.total - rejectedCol.candidates.length} remaining)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {rejectedOpen && rejectedCount === 0 && (
            <div className="border-t border-red-100 px-4 py-6 text-center text-sm text-muted-foreground">
              No rejected candidates
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
