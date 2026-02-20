"use client";

import { Draggable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { updateCandidateStage } from "@/app/actions/pipeline";
import { toast } from "sonner";
import type { PipelineStage } from "@prisma/client";
import type { CandidateWithInfo } from "../page";

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

function getDaysInStage(lastActivityAt: Date | string): number {
  const activity = new Date(lastActivityAt);
  const now = new Date();
  const diffMs = now.getTime() - activity.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

type Props = {
  candidate: CandidateWithInfo;
  index: number;
  onStageUpdated: () => void;
};

export function CandidateCard({ candidate, index, onStageUpdated }: Props) {
  const router = useRouter();
  const daysInStage = getDaysInStage(candidate.lastActivityAt);

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await updateCandidateStage(candidate.id, "REJECTED");
    if (result.success) {
      toast.success(`${candidate.name} moved to Rejected`);
      onStageUpdated();
    } else {
      toast.error(result.error ?? "Failed to update stage");
    }
  };

  const handleScheduleInterview = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/interviews/new?candidateId=${candidate.id}`);
  };

  const handleCardClick = () => {
    router.push(`/candidates/${candidate.id}`);
  };

  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          className={`
            group relative rounded-lg border bg-white p-3 shadow-xs cursor-pointer
            transition-all duration-150 hover:shadow-sm hover:border-primary/30
            ${snapshot.isDragging ? "shadow-lg border-primary/40 rotate-1 scale-105 z-50" : ""}
          `}
        >
          {/* Header: avatar + name */}
          <div className="flex items-start gap-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {candidate.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {candidate.email}
              </p>
            </div>
            {/* Reject button — shown on hover */}
            {candidate.pipelineStage !== "REJECTED" && (
              <button
                onClick={handleReject}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 shrink-0"
                title="Move to Rejected"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stage badge + days */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <Badge
              className={`${STAGE_COLORS[candidate.pipelineStage]} border-0 text-xs px-1.5 py-0.5`}
            >
              {STAGE_LABELS[candidate.pipelineStage]}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0">
              {daysInStage === 0
                ? "Today"
                : `${daysInStage}d ago`}
            </span>
          </div>

          {/* Interviews count */}
          {candidate._count.interviews > 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {candidate._count.interviews} interview
              {candidate._count.interviews !== 1 ? "s" : ""}
            </p>
          )}

          {/* Schedule interview button — only on ASSESSMENT stage */}
          {candidate.pipelineStage === "ASSESSMENT" && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2.5 w-full h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleScheduleInterview}
            >
              <CalendarPlus className="h-3 w-3 mr-1" />
              Schedule Interview
            </Button>
          )}
        </div>
      )}
    </Draggable>
  );
}
