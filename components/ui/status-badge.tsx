import * as React from "react";
import { cn } from "@/lib/utils";

type AssessmentStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
type BadgeVariant = "default" | "dot";

const STATUS_CONFIG: Record<
  AssessmentStatus,
  { label: string; bg: string; text: string; ring: string; dot: string }
> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
  },
  ACTIVE: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  ARCHIVED: {
    label: "Archived",
    bg: "bg-slate-100",
    text: "text-slate-600",
    ring: "ring-slate-400/20",
    dot: "bg-slate-400",
  },
};

interface StatusBadgeProps {
  status: AssessmentStatus;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({
  status,
  variant = "default",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          config.text,
          className
        )}
        aria-label={`Status: ${config.label}`}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full animate-none",
            config.dot,
            status === "ACTIVE" && "animate-pulse"
          )}
        />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.bg,
        config.text,
        config.ring,
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          config.dot,
          status === "ACTIVE" && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
