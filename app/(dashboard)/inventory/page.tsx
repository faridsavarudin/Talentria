import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FlaskConical, Users, CheckCircle2, BarChart2 } from "lucide-react";
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

export default async function InventoryPage() {
  const user = await requireAuth();

  const batteries = await prisma.inventoryBattery.findMany({
    where: { organizationId: user.organizationId },
    include: {
      tests: { orderBy: { order: "asc" } },
      invitations: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Psychometric instruments — RIASEC, Cognitive, VRA, Analytical &amp; Creative.
          </p>
        </div>
        <Button asChild className="btn-brand-gradient border-0">
          <Link href="/inventory/new">
            <Plus className="h-4 w-4 mr-2" /> Create Test Set
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {batteries.length === 0 && (
        <Card className="py-16 text-center">
          <CardContent>
            <FlaskConical className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No test sets yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Create a test set to combine multiple psychometric instruments (RIASEC,
              Cognitive, VRA, Analytical Reasoning, Creative Thinking) and invite
              candidates to complete them.
            </p>
            <Button asChild className="btn-brand-gradient border-0">
              <Link href="/inventory/new">
                <Plus className="h-4 w-4 mr-2" /> Create Test Set
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Battery list */}
      <div className="grid gap-4">
        {batteries.map((battery) => {
          const total = battery.invitations.length;
          const completed = battery.invitations.filter(
            (i) => i.status === "completed"
          ).length;
          const completionRate =
            total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Card key={battery.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base mb-1">{battery.title}</CardTitle>
                    {battery.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
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
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(battery.createdAt, { addSuffix: true })}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/inventory/${battery.id}`}>View Results</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-slate-900">{total}</span>{" "}
                    invited
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-slate-900">{completed}</span>{" "}
                    completed
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-slate-900">
                      {battery.tests.length}
                    </span>{" "}
                    tests
                  </div>
                </div>
                {total > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Completion rate</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
