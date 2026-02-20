"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface IccGaugeProps {
  icc: number;
  ci95?: [number, number];
  sampleSize?: number;
  className?: string;
}

type IccLevel = "poor" | "moderate" | "good" | "excellent";

function getIccLevel(icc: number): IccLevel {
  if (icc < 0.4) return "poor";
  if (icc < 0.6) return "moderate";
  if (icc < 0.75) return "good";
  return "excellent";
}

const LEVEL_CONFIG: Record<
  IccLevel,
  { label: string; color: string; trackColor: string; textColor: string; bgColor: string }
> = {
  poor: {
    label: "Poor",
    color: "#ef4444",
    trackColor: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  moderate: {
    label: "Moderate",
    color: "#f59e0b",
    trackColor: "bg-amber-500",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  good: {
    label: "Good",
    color: "#22c55e",
    trackColor: "bg-emerald-500",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  excellent: {
    label: "Excellent",
    color: "#3b82f6",
    trackColor: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
};

// Threshold markers displayed on the track
const THRESHOLDS = [
  { value: 0.4, label: "0.4" },
  { value: 0.6, label: "0.6" },
  { value: 0.75, label: "0.75" },
];

export function IccGauge({ icc, ci95, sampleSize, className }: IccGaugeProps) {
  const clamped = Math.max(0, Math.min(1, icc));
  const level = getIccLevel(clamped);
  const config = LEVEL_CONFIG[level];

  const pct = (v: number) => `${Math.max(0, Math.min(100, v * 100)).toFixed(1)}%`;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          ICC = {clamped.toFixed(3)}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
            config.bgColor,
            config.textColor,
            level === "poor" ? "ring-red-500/20" :
            level === "moderate" ? "ring-amber-500/20" :
            level === "good" ? "ring-emerald-500/20" :
            "ring-blue-500/20"
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2.5 rounded-full bg-slate-100 overflow-visible">
        {/* CI95 band */}
        {ci95 && (
          <div
            className="absolute top-0 h-full rounded-full opacity-30"
            style={{
              left: pct(ci95[0]),
              width: `${Math.max(0, (ci95[1] - ci95[0]) * 100).toFixed(1)}%`,
              backgroundColor: config.color,
            }}
          />
        )}

        {/* Fill bar */}
        <div
          className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out", config.trackColor)}
          style={{ width: pct(clamped) }}
        />

        {/* Threshold tick marks */}
        {THRESHOLDS.map((t) => (
          <div
            key={t.value}
            className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-slate-300"
            style={{ left: pct(t.value) }}
            aria-hidden="true"
          />
        ))}

        {/* Value indicator dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-all duration-700 ease-out"
          style={{ left: pct(clamped), backgroundColor: config.color }}
          role="presentation"
        />
      </div>

      {/* Threshold labels */}
      <div className="relative h-4">
        {THRESHOLDS.map((t) => (
          <span
            key={t.value}
            className="absolute -translate-x-1/2 text-[10px] text-slate-400 tabular-nums"
            style={{ left: pct(t.value) }}
          >
            {t.label}
          </span>
        ))}
        <span className="absolute left-0 text-[10px] text-slate-400">0</span>
        <span className="absolute right-0 text-[10px] text-slate-400">1</span>
      </div>

      {/* Metadata row */}
      {(ci95 || sampleSize) && (
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {ci95 && (
            <span>
              95% CI: [{ci95[0].toFixed(2)}, {ci95[1].toFixed(2)}]
            </span>
          )}
          {sampleSize && <span>n = {sampleSize}</span>}
        </div>
      )}
    </div>
  );
}
