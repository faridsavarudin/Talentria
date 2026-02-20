import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  ClipboardList,
  Clock,
  ExternalLink,
  Plus,
  TrendingUp,
  UserSearch,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { IccGauge } from "@/components/ui/icc-gauge";

export default async function DashboardPage() {
  const user = await requireAuth();
  const orgId = user.organizationId;

  const [
    totalAssessments,
    activeInterviews,
    pendingEvaluations,
    avgReliability,
    recentAssessments,
    topEvaluators,
  ] = await Promise.all([
    prisma.assessment.count({ where: { organizationId: orgId } }),
    prisma.interview.count({
      where: { assessment: { organizationId: orgId }, status: "IN_PROGRESS" },
    }),
    prisma.interview.count({
      where: { assessment: { organizationId: orgId }, status: "SCHEDULED" },
    }),
    prisma.reliabilityScore.aggregate({
      where: { assessment: { organizationId: orgId } },
      _avg: { icc: true },
    }),
    prisma.assessment.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { interviews: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "EVALUATOR" },
      include: {
        reliabilityScores: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        _count: { select: { evaluations: true } },
      },
      take: 5,
    }),
  ]);

  const iccValue = avgReliability._avg.icc;
  const iccDisplay = iccValue != null ? iccValue.toFixed(2) : "—";
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 pb-10">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your assessments today.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 mt-4 sm:mt-0">
          <Link href="/assessments/new">
            <Button
              size="sm"
              className="btn-brand-gradient border-0 shadow-sm shadow-indigo-200 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Assessment
            </Button>
          </Link>
          <Link href="/candidates/new">
            <Button size="sm" variant="outline" className="gap-1.5 border-slate-200">
              <UserSearch className="h-3.5 w-3.5" />
              Add Candidate
            </Button>
          </Link>
          <Link href="/interviews/new">
            <Button size="sm" variant="outline" className="gap-1.5 border-slate-200">
              <CalendarCheck className="h-3.5 w-3.5" />
              Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Quick action tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: ClipboardList,
            label: "New Assessment",
            description: "Build a structured interview",
            href: "/assessments/new",
            iconColor: "text-indigo-600",
            bg: "bg-indigo-50 hover:bg-indigo-100",
          },
          {
            icon: UserSearch,
            label: "Add Candidate",
            description: "Add to the hiring pipeline",
            href: "/candidates/new",
            iconColor: "text-emerald-600",
            bg: "bg-emerald-50 hover:bg-emerald-100",
          },
          {
            icon: CalendarCheck,
            label: "Schedule Interview",
            description: "Book an evaluation session",
            href: "/interviews/new",
            iconColor: "text-violet-600",
            bg: "bg-violet-50 hover:bg-violet-100",
          },
        ].map((a) => (
          <Link key={a.label} href={a.href}>
            <div className={`flex items-center gap-4 rounded-xl p-4 transition-colors cursor-pointer ${a.bg}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <a.icon className={`h-5 w-5 ${a.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{a.label}</p>
                <p className="text-xs text-slate-500 truncate">{a.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Metric cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Assessments"
          value={totalAssessments}
          description="All time"
          icon={ClipboardList}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <MetricCard
          title="Active Interviews"
          value={activeInterviews}
          description="Currently in progress"
          icon={Clock}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <MetricCard
          title="Avg. Reliability"
          value={iccDisplay}
          description="ICC across evaluators"
          icon={BarChart3}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Pending Reviews"
          value={pendingEvaluations}
          description="Interviews awaiting evaluation"
          icon={Users}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Recent Assessments — wider */}
        <Card className="lg:col-span-3 border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Assessments</CardTitle>
                <CardDescription className="mt-0.5">Latest assessment activities</CardDescription>
              </div>
              <Link href="/assessments">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                  View all <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {recentAssessments.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground px-6">
                No assessments yet.{" "}
                <Link href="/assessments/new" className="text-primary hover:underline font-medium">
                  Create your first one
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 pb-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Assessment
                    </th>
                    <th className="px-3 pb-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                      Interviews
                    </th>
                    <th className="px-6 pb-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <Link href={`/assessments/${a.id}`} className="block">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                              <ClipboardList className="h-3.5 w-3.5 text-indigo-600" />
                            </div>
                            <p className="font-medium text-slate-900 truncate">{a.title}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {a._count.interviews}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Evaluator Reliability — narrower */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Evaluator Reliability</CardTitle>
                <CardDescription className="mt-0.5">Inter-rater ICC scores</CardDescription>
              </div>
              <Link href="/evaluators">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                  Manage <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {topEvaluators.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No evaluators yet.{" "}
                <Link href="/evaluators" className="text-primary hover:underline font-medium">
                  Invite one
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {topEvaluators.map((ev) => {
                  const latestIcc = ev.reliabilityScores[0]?.icc ?? null;
                  return (
                    <div key={ev.id} className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 uppercase">
                          {ev.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{ev.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {ev._count.evaluations} evaluation{ev._count.evaluations !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {latestIcc != null ? (
                        <IccGauge icc={latestIcc} />
                      ) : (
                        <p className="text-xs text-muted-foreground pl-9">No ICC data yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── AI Co-Pilot CTA ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 sm:p-8 shadow-lg shadow-indigo-200">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-20 h-36 w-36 rounded-full bg-white/5"
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-white">AI Co-Pilot is ready</p>
            <p className="text-sm text-indigo-100 mt-0.5">
              Generate interview questions, calibrate evaluators, and detect bias patterns — all powered by AI.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/assessments/new">
              <Button
                size="sm"
                className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 font-semibold gap-1.5 shadow-sm"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Try AI Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
