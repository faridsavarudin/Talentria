import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Video, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  EXPIRED: "bg-red-100 text-red-700",
};

export default async function AsyncInterviewsPage() {
  const user = await requireAuth();

  const interviews = await prisma.asyncInterview.findMany({
    where: { organizationId: user.organizationId },
    include: {
      assessment: { select: { title: true } },
      invitations: {
        select: { id: true, completedAt: true, openedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Async Video Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send structured video interview links to candidates — no scheduling needed.
          </p>
        </div>
        <Button asChild className="btn-brand-gradient border-0">
          <Link href="/async-interviews/new">
            <Plus className="h-4 w-4 mr-2" /> Create Interview
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {interviews.length === 0 && (
        <Card className="py-16 text-center">
          <CardContent>
            <Video className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No async interviews yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first async interview and invite candidates to respond on their own schedule.
            </p>
            <Button asChild className="btn-brand-gradient border-0">
              <Link href="/async-interviews/new">
                <Plus className="h-4 w-4 mr-2" /> Create Interview
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interview list */}
      <div className="grid gap-4">
        {interviews.map((interview) => {
          const total = interview.invitations.length;
          const completed = interview.invitations.filter((i) => i.completedAt).length;
          const opened = interview.invitations.filter((i) => i.openedAt).length;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{interview.title}</CardTitle>
                      <Badge
                        className={`text-xs font-medium ${STATUS_STYLES[interview.status] ?? ""}`}
                        variant="secondary"
                      >
                        {interview.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {interview.assessment.title} ·{" "}
                      {formatDistanceToNow(interview.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/async-interviews/${interview.id}`}>View Responses</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-slate-900">{total}</span> invited
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-slate-900">{opened}</span> opened
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-slate-900">{completed}</span> completed
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-slate-900">{interview.timeLimitSeconds}s</span> / question
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
