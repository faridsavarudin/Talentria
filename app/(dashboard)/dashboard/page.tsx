import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, BarChart3, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Assessments",
    value: "24",
    description: "+3 this month",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Active Interviews",
    value: "12",
    description: "5 scheduled today",
    icon: Clock,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Avg. Reliability",
    value: "0.78",
    description: "ICC score across evaluators",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Pending Evaluations",
    value: "8",
    description: "3 overdue",
    icon: Users,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your assessment activities and performance metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Latest assessment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Senior Frontend Engineer", status: "Active", count: "3 interviews" },
                { title: "Product Manager", status: "Draft", count: "0 interviews" },
                { title: "Data Scientist", status: "Active", count: "7 interviews" },
                { title: "UX Designer", status: "Archived", count: "12 interviews" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.count}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluator Performance</CardTitle>
            <CardDescription>Inter-rater reliability scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sarah Chen", icc: 0.92, status: "Calibrated" },
                { name: "Mike Johnson", icc: 0.85, status: "Calibrated" },
                { name: "Emily Davis", icc: 0.61, status: "Needs Calibration" },
                { name: "Alex Kim", icc: 0.45, status: "Needs Calibration" },
              ].map((evaluator) => (
                <div key={evaluator.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{evaluator.name}</p>
                    <p className="text-xs text-muted-foreground">ICC: {evaluator.icc}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      evaluator.status === "Calibrated"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {evaluator.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
