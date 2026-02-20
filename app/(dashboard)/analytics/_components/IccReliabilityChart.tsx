"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EvaluatorScore = {
  name: string;
  icc: number;
  evaluations: number;
};

type Props = {
  data: EvaluatorScore[];
};

function iccColor(icc: number): string {
  if (icc >= 0.75) return "#16a34a"; // green-600
  if (icc >= 0.5) return "#d97706";  // amber-600
  return "#dc2626";                   // red-600
}

type TooltipPayload = {
  name: string;
  value: number;
  payload: EvaluatorScore;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = iccColor(d.icc);
  const rating = d.icc >= 0.75 ? "Good" : d.icc >= 0.5 ? "Moderate" : "Poor";

  return (
    <div className="rounded-lg border bg-white shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800">{d.name}</p>
      <p style={{ color }} className="font-mono font-bold">
        ICC: {d.icc.toFixed(3)} — {rating}
      </p>
      <p className="text-muted-foreground text-xs mt-1">
        {d.evaluations} evaluation{d.evaluations !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function IccReliabilityChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ICC Reliability by Evaluator</CardTitle>
          <CardDescription>Inter-rater agreement scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-sm">
            No reliability data yet. Complete interviews to see ICC scores.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ICC Reliability by Evaluator</CardTitle>
        <CardDescription>
          Inter-rater correlation coefficient per evaluator.
          Green = good (&ge;0.75), amber = moderate (0.5–0.74), red = poor (&lt;0.5)
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
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <ReferenceLine
              y={0.75}
              stroke="#16a34a"
              strokeDasharray="4 4"
              label={{ value: "0.75 threshold", position: "right", fontSize: 10, fill: "#16a34a" }}
            />
            <Bar dataKey="icc" radius={[4, 4, 0, 0]} maxBarSize={56}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={iccColor(entry.icc)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {[
            { color: "#16a34a", label: "Good (≥0.75)" },
            { color: "#d97706", label: "Moderate (0.5–0.74)" },
            { color: "#dc2626", label: "Poor (<0.5)" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: color }}
              />
              {label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
