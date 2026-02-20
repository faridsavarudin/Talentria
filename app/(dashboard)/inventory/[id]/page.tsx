import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { InventoryTestType } from "@prisma/client";

const TEST_LABELS: Record<InventoryTestType, string> = {
  RIASEC: "RIASEC",
  COGNITIVE: "Cognitive",
  VRA: "VRA",
  CREATIVE_THINKING: "Creative",
  ANALYTICAL_REASONING: "Analytical",
  BIG_FIVE: "Big Five",
};

const TEST_COLORS: Record<InventoryTestType, string> = {
  RIASEC: "bg-violet-100 text-violet-700",
  COGNITIVE: "bg-blue-100 text-blue-700",
  VRA: "bg-amber-100 text-amber-700",
  CREATIVE_THINKING: "bg-pink-100 text-pink-700",
  ANALYTICAL_REASONING: "bg-green-100 text-green-700",
  BIG_FIVE: "bg-slate-100 text-slate-700",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
};

function getResultSummary(
  results: Array<{
    testType: InventoryTestType;
    rawScores: unknown;
    bandLabel: string | null;
  }>
): string {
  if (results.length === 0) return "—";

  const parts: string[] = [];

  for (const r of results) {
    const scores = r.rawScores as Record<string, number>;
    if (r.testType === "RIASEC") {
      parts.push(`Holland: ${r.bandLabel ?? "—"}`);
    } else if (r.testType === "COGNITIVE") {
      parts.push(`Cognitive: ${scores.percentile ?? "—"}th pct.`);
    } else if (r.bandLabel) {
      parts.push(`${TEST_LABELS[r.testType]}: ${r.bandLabel}`);
    }
  }

  return parts.join(" · ") || "—";
}

export default async function InventoryBatteryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();

  const battery = await prisma.inventoryBattery.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      tests: { orderBy: { order: "asc" } },
      createdBy: { select: { name: true, email: true } },
      invitations: {
        orderBy: { createdAt: "desc" },
        include: {
          results: {
            select: {
              testType: true,
              rawScores: true,
              bandLabel: true,
              completedAt: true,
            },
          },
        },
      },
    },
  });

  if (!battery) notFound();

  const total = battery.invitations.length;
  const started = battery.invitations.filter(
    (i) => i.status === "in_progress" || i.status === "completed"
  ).length;
  const completed = battery.invitations.filter(
    (i) => i.status === "completed"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{battery.title}</h1>
          {battery.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {battery.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {battery.tests.map((t) => (
              <Badge
                key={t.id}
                variant="secondary"
                className={`text-xs font-medium ${TEST_COLORS[t.testType]}`}
              >
                {TEST_LABELS[t.testType]}
              </Badge>
            ))}
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/inventory/${id}/invite`}>
            <Users className="h-4 w-4 mr-1.5" /> Add Invites
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Invited", value: total, icon: Users, color: "text-slate-600" },
          {
            label: "Started",
            value: started,
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-green-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div
                className={`flex items-center gap-2 text-sm mb-1 text-muted-foreground`}
              >
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invitations list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Candidates</h2>

        {battery.invitations.length === 0 && (
          <Card className="py-8 text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No invitations sent yet.{" "}
                <Link
                  href={`/inventory/${id}/invite`}
                  className="text-indigo-600 hover:underline"
                >
                  Add candidates
                </Link>{" "}
                to get started.
              </p>
            </CardContent>
          </Card>
        )}

        {battery.invitations.map((inv) => (
          <Card key={inv.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">
                    {inv.candidateName ?? inv.candidateEmail ?? "Unknown candidate"}
                  </p>
                  {inv.candidateName && inv.candidateEmail && (
                    <p className="text-xs text-muted-foreground">
                      {inv.candidateEmail}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {inv.completedAt
                      ? `Completed ${formatDistanceToNow(inv.completedAt, { addSuffix: true })}`
                      : inv.startedAt
                        ? `Started ${formatDistanceToNow(inv.startedAt, { addSuffix: true })}`
                        : `Invited ${formatDistanceToNow(inv.createdAt, { addSuffix: true })}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="secondary"
                    className={`text-xs font-medium ${STATUS_STYLES[inv.status] ?? ""}`}
                  >
                    {inv.status.replace("_", " ")}
                  </Badge>
                  {inv.status === "completed" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/inventory/${id}/results/${inv.id}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Results
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {inv.results.length > 0 && (
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {getResultSummary(inv.results)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {inv.results.map((r) => (
                    <Badge
                      key={r.testType}
                      variant="secondary"
                      className={`text-xs ${TEST_COLORS[r.testType]}`}
                    >
                      {TEST_LABELS[r.testType]} ✓
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
