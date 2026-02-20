"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CreditsData = {
  plan: string;
  aiCredits: number;
};

type Props = {
  refreshSignal?: number; // increment this to trigger a refresh
};

export function AiCreditsDisplay({ refreshSignal }: Props) {
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits, refreshSignal]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 animate-pulse">
        <div className="h-4 w-4 rounded-full bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
    );
  }

  if (!data) return null;

  const isLow = data.aiCredits <= 5;
  const isDepleted = data.aiCredits === 0;

  const tooltipText = isDepleted
    ? "No AI credits remaining. Upgrade to generate more."
    : isLow
    ? `Only ${data.aiCredits} credits left. Consider upgrading.`
    : `${data.aiCredits} AI generation credits on ${data.plan} plan.`;

  return (
    <div
      title={tooltipText}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium cursor-default select-none transition-colors ${
        isDepleted
          ? "border-red-200 bg-red-50 text-red-700"
          : isLow
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-violet-200 bg-violet-50 text-violet-700"
      }`}
    >
      {isDepleted || isLow ? (
        <AlertTriangle className="h-3 w-3 shrink-0" />
      ) : (
        <Sparkles className="h-3 w-3 shrink-0" />
      )}
      <span>{data.aiCredits} AI credits</span>
      <Badge
        className={`text-[10px] px-1 py-0 border-0 ml-0.5 ${
          isDepleted
            ? "bg-red-100 text-red-700"
            : isLow
            ? "bg-amber-100 text-amber-700"
            : "bg-violet-100 text-violet-700"
        }`}
      >
        {data.plan}
      </Badge>
    </div>
  );
}
