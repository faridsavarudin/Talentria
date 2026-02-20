"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StageCount = {
  stage: string;
  label: string;
  count: number;
  conversionRate: number | null; // conversion from previous stage
};

type Props = {
  data: StageCount[];
};

const STAGE_COLORS: Record<string, string> = {
  APPLIED:    "#94a3b8",
  SCREENING:  "#60a5fa",
  ASSESSMENT: "#a78bfa",
  INTERVIEW:  "#fbbf24",
  OFFER:      "#fb923c",
  HIRED:      "#4ade80",
};

type TooltipPayload = {
  payload: StageCount;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-lg border bg-white shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800">{d.label}</p>
      <p className="text-slate-600">
        <span className="font-bold">{d.count}</span> candidates
      </p>
      {d.conversionRate != null && (
        <p className="text-xs text-muted-foreground mt-1">
          {d.conversionRate.toFixed(1)}% from previous stage
        </p>
      )}
    </div>
  );
}

export function HiringFunnelChart({ data }: Props) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hiring Funnel</CardTitle>
          <CardDescription>Candidate counts by pipeline stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-sm">
            No candidates in the pipeline yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
        <CardDescription>
          Active candidate counts through each pipeline stage with conversion rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: -8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {data.map((entry) => (
                <Cell
                  key={entry.stage}
                  fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Conversion rates below */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data
            .filter((d) => d.conversionRate != null)
            .map((d) => (
              <div
                key={d.stage}
                className="rounded-lg bg-muted/40 px-3 py-2 text-center"
              >
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm font-bold text-slate-700">
                  {d.conversionRate!.toFixed(1)}%
                </p>
                <p className="text-[10px] text-muted-foreground">conversion</p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
