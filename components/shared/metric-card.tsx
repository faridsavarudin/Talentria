import * as React from "react";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  iconColor?: string;
  bgColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendDirection = "neutral",
  iconColor = "text-primary",
  bgColor = "bg-primary/10",
  className,
}: MetricCardProps) {
  const trendColorClass =
    trendDirection === "up"
      ? "text-emerald-600"
      : trendDirection === "down"
      ? "text-red-500"
      : "text-muted-foreground";

  const TrendIcon = trendDirection === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("border-0 shadow-sm bg-white", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground leading-none">
              {value}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              {trend && trendDirection !== "neutral" && (
                <TrendIcon className={cn("h-3.5 w-3.5 shrink-0", trendColorClass)} />
              )}
              {trend ? (
                <span className={cn("text-xs font-medium", trendColorClass)}>
                  {trend}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{description}</span>
              )}
            </div>
            {trend && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
