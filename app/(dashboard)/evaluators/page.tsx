import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const evaluators = [
  { name: "Sarah Chen", email: "sarah@company.com", role: "Engineering Manager", icc: 0.92, evaluations: 45, calibrated: true },
  { name: "Mike Johnson", email: "mike@company.com", role: "Senior Engineer", icc: 0.85, evaluations: 32, calibrated: true },
  { name: "Emily Davis", email: "emily@company.com", role: "Tech Lead", icc: 0.61, evaluations: 18, calibrated: false },
  { name: "Alex Kim", email: "alex@company.com", role: "Product Manager", icc: 0.45, evaluations: 8, calibrated: false },
  { name: "Jordan Lee", email: "jordan@company.com", role: "Design Lead", icc: 0.88, evaluations: 27, calibrated: true },
];

export default function EvaluatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluators</h1>
        <p className="text-muted-foreground">
          Monitor evaluator performance and inter-rater reliability.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Evaluators</CardDescription>
            <CardTitle className="text-3xl">{evaluators.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Calibrated</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {evaluators.filter((e) => e.calibrated).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Needs Calibration</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {evaluators.filter((e) => !e.calibrated).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluator List</CardTitle>
          <CardDescription>All evaluators with their reliability scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">ICC Score</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Evaluations</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {evaluators.map((evaluator) => (
                  <tr key={evaluator.email} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{evaluator.name}</p>
                        <p className="text-muted-foreground text-xs">{evaluator.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{evaluator.role}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-semibold ${
                          evaluator.icc >= 0.75
                            ? "text-green-600"
                            : evaluator.icc >= 0.6
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {evaluator.icc.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{evaluator.evaluations}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={evaluator.calibrated ? "success" : "destructive"}>
                        {evaluator.calibrated ? "Calibrated" : "Needs Calibration"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
