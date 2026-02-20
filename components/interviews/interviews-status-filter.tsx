"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { InterviewStatus } from "@prisma/client";

const FILTER_STATUSES: Array<InterviewStatus | ""> = [
  "",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

type Props = {
  activeStatus?: string;
  statusCounts: Partial<Record<InterviewStatus, number>>;
  statusLabels: Record<InterviewStatus, string>;
};

export function InterviewsStatusFilter({
  activeStatus,
  statusCounts,
  statusLabels,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = (status: InterviewStatus | "") => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_STATUSES.map((status) => {
        const isActive = status === "" ? !activeStatus : activeStatus === status;
        const count = status ? statusCounts[status] : undefined;
        const label = status === "" ? "All" : statusLabels[status];
        return (
          <Button
            key={status || "all"}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilter(status)}
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
