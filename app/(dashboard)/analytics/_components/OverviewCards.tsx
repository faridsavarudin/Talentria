"use client";

import { Users, CalendarCheck, BarChart3, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";

type Props = {
  totalCandidates: number;
  totalInterviews: number;
  avgIcc: number | null;
  biasAlerts: number;
};

export function OverviewCards({ totalCandidates, totalInterviews, avgIcc, biasAlerts }: Props) {
  const iccDisplay = avgIcc != null ? avgIcc.toFixed(2) : "—";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Candidates"
        value={totalCandidates}
        description="In the pipeline"
        icon={Users}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
      />
      <MetricCard
        title="Total Interviews"
        value={totalInterviews}
        description="All time"
        icon={CalendarCheck}
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50"
      />
      <MetricCard
        title="Avg. ICC Score"
        value={iccDisplay}
        description="Inter-rater reliability"
        icon={BarChart3}
        iconColor="text-violet-600"
        bgColor="bg-violet-50"
      />
      <MetricCard
        title="Bias Alerts"
        value={biasAlerts}
        description="Assessments with reports"
        icon={AlertTriangle}
        iconColor="text-amber-600"
        bgColor="bg-amber-50"
      />
    </div>
  );
}
