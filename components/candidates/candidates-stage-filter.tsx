"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PipelineStage } from "@prisma/client";

type Props = {
  activeStage?: string;
  stageCounts: Partial<Record<PipelineStage, number>>;
  stageLabels: Record<PipelineStage, string>;
};

const FILTER_STAGES: Array<PipelineStage | ""> = [
  "",
  "APPLIED",
  "SCREENING",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

export function CandidatesStageFilter({
  activeStage,
  stageCounts,
  stageLabels,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = (stage: PipelineStage | "") => {
    const params = new URLSearchParams(searchParams.toString());
    if (stage) {
      params.set("stage", stage);
    } else {
      params.delete("stage");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_STAGES.map((stage) => {
        const isActive = stage === "" ? !activeStage : activeStage === stage;
        const count = stage ? stageCounts[stage] : undefined;
        const label = stage === "" ? "All" : stageLabels[stage];
        return (
          <Button
            key={stage || "all"}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilter(stage)}
            className="h-8 text-xs"
          >
            {label}
            {count !== undefined && (
              <span className="ml-1.5 rounded-full bg-current/20 px-1.5 py-0.5 text-xs font-semibold leading-none">
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
