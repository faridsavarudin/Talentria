"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PipelineStage } from "@prisma/client";

const ALL_STAGES: PipelineStage[] = [
  "APPLIED",
  "SCREENING",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

type Props = {
  candidateId: string;
  currentStage: PipelineStage;
  stageLabels: Record<PipelineStage, string>;
};

export function CandidateStagePicker({
  candidateId,
  currentStage,
  stageLabels,
}: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<PipelineStage>(currentStage);
  const [isPending, startTransition] = useTransition();

  const handleChange = async (newStage: PipelineStage) => {
    if (newStage === stage) return;

    const previous = stage;
    setStage(newStage); // optimistic

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: newStage }),
      });

      if (!res.ok) {
        setStage(previous); // revert
        const data = await res.json();
        toast.error(data.error ?? "Failed to update stage");
        return;
      }

      toast.success(`Stage updated to ${stageLabels[newStage]}`);
      startTransition(() => router.refresh());
    } catch {
      setStage(previous);
      toast.error("Something went wrong");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending} className="gap-1.5">
          Move Stage
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ALL_STAGES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleChange(s)}
            className={s === stage ? "font-semibold" : ""}
          >
            {stageLabels[s]}
            {s === stage && (
              <span className="ml-auto text-xs text-muted-foreground">
                current
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
