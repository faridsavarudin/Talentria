import * as React from "react";
import { cn } from "@/lib/utils";

const SCORE_MAP: Record<
  number,
  { label: string; bg: string; text: string; ring: string }
> = {
  1: {
    label: "Poor",
    bg: "bg-[#fef2f2]",
    text: "text-[#b91c1c]",
    ring: "ring-[#ef4444]/20",
  },
  2: {
    label: "Below",
    bg: "bg-[#fff7ed]",
    text: "text-[#c2410c]",
    ring: "ring-[#f97316]/20",
  },
  3: {
    label: "Meets",
    bg: "bg-[#fffbeb]",
    text: "text-[#92400e]",
    ring: "ring-[#f59e0b]/20",
  },
  4: {
    label: "Exceeds",
    bg: "bg-[#f0fdf4]",
    text: "text-[#15803d]",
    ring: "ring-[#22c55e]/20",
  },
  5: {
    label: "Outstanding",
    bg: "bg-[#eef2ff]",
    text: "text-[#4338ca]",
    ring: "ring-[#6366f1]/20",
  },
};

const SIZE_MAP = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1 rounded-md",
  md: "text-xs px-2.5 py-1 gap-1.5 rounded-lg",
  lg: "text-sm px-3 py-1.5 gap-2 rounded-lg",
};

const DOT_SIZE_MAP = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

interface ScoreBadgeProps {
  score: 1 | 2 | 3 | 4 | 5;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({
  score,
  showLabel = true,
  size = "md",
  className,
}: ScoreBadgeProps) {
  const config = SCORE_MAP[score];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold ring-1 ring-inset",
        config.bg,
        config.text,
        config.ring,
        SIZE_MAP[size],
        className
      )}
      aria-label={`Score ${score}: ${config.label}`}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          DOT_SIZE_MAP[size],
          // Use the same text color to derive background via currentColor trick
          score === 1 ? "bg-[#ef4444]" :
          score === 2 ? "bg-[#f97316]" :
          score === 3 ? "bg-[#f59e0b]" :
          score === 4 ? "bg-[#22c55e]" :
          "bg-[#6366f1]"
        )}
      />
      <span>{score}</span>
      {showLabel && <span className="font-normal opacity-80">{config.label}</span>}
    </span>
  );
}
