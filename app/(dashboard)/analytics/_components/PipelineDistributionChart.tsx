"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StageSlice = {
  stage: string;
  label: string;
  count: number;
  fill: string;
};

type Props = {
  data: StageSlice[];
};

type TooltipPayload = {
  payload: StageSlice;
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
      <p className="font-semibold" style={{ color: d.fill }}>
        {d.label}
      </p>
      <p className="text-slate-600">
        <span className="font-bold">{d.count}</span> candidate{d.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

type LegendPayloadItem = {
  value?: string;
  color?: string;
};

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-3">
      {payload.map((entry, i) => (
        <div key={`${entry.value ?? ""}-${i}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ background: entry.color ?? "#94a3b8" }}
          />
          {entry.value ?? ""}
        </div>
      ))}
    </div>
  );
}

export function PipelineDistributionChart({ data }: Props) {
  const nonEmpty = data.filter((d) => d.count > 0);

  if (nonEmpty.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Distribution</CardTitle>
          <CardDescription>Candidates by current stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-sm">
            No candidates in the pipeline yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = nonEmpty.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Distribution</CardTitle>
        <CardDescription>
          {total} total candidates across {nonEmpty.length} active stage
          {nonEmpty.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={nonEmpty}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="45%"
              outerRadius={100}
              innerRadius={48}
              paddingAngle={2}
              label={({ percent }: { percent?: number }) =>
                (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ""
              }
              labelLine={false}
            >
              {nonEmpty.map((entry) => (
                <Cell key={entry.stage} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Stage breakdown list */}
        <div className="mt-2 space-y-1.5">
          {nonEmpty.map((d) => (
            <div key={d.stage} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: d.fill }}
                />
                <span className="text-muted-foreground">{d.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.count / total) * 100}%`,
                      background: d.fill,
                    }}
                  />
                </div>
                <span className="font-semibold text-slate-700 w-6 text-right">
                  {d.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
