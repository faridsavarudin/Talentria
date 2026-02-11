import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Bias detection, adverse impact analysis, and reliability metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bias Detection</CardTitle>
            <CardDescription>
              Adverse impact analysis using the 4/5ths rule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="text-xs text-muted-foreground">Pass rate ratio: 0.89</p>
                </div>
                <span className="text-sm font-medium text-green-700">No Impact</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                <div>
                  <p className="text-sm font-medium">Ethnicity</p>
                  <p className="text-xs text-muted-foreground">Pass rate ratio: 0.82</p>
                </div>
                <span className="text-sm font-medium text-yellow-700">Monitor</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                <div>
                  <p className="text-sm font-medium">Age Group</p>
                  <p className="text-xs text-muted-foreground">Pass rate ratio: 0.71</p>
                </div>
                <span className="text-sm font-medium text-red-700">Adverse Impact</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reliability Trends</CardTitle>
            <CardDescription>
              Inter-rater reliability over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed text-muted-foreground">
              Chart visualization will be added in Sprint 2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluator Bias Scores</CardTitle>
            <CardDescription>
              Individual evaluator scoring patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sarah Chen", bias: 0.02, direction: "neutral" },
                { name: "Mike Johnson", bias: -0.15, direction: "lenient" },
                { name: "Emily Davis", bias: 0.28, direction: "strict" },
                { name: "Alex Kim", bias: -0.31, direction: "lenient" },
              ].map((evaluator) => (
                <div key={evaluator.name} className="flex items-center justify-between">
                  <span className="text-sm">{evaluator.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          Math.abs(evaluator.bias) < 0.1
                            ? "bg-green-500"
                            : Math.abs(evaluator.bias) < 0.25
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(Math.abs(evaluator.bias) * 200, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {evaluator.direction}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question-Level Analysis</CardTitle>
            <CardDescription>
              Questions with highest score variance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { question: "Describe a complex technical problem...", variance: 1.8 },
                { question: "Tell me about a leadership experience...", variance: 1.5 },
                { question: "How do you approach code reviews?", variance: 0.9 },
                { question: "Describe your debugging process...", variance: 0.6 },
              ].map((q) => (
                <div key={q.question} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[240px]">{q.question}</span>
                  <span
                    className={`text-sm font-mono ${
                      q.variance > 1.5
                        ? "text-red-600"
                        : q.variance > 1.0
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {q.variance.toFixed(1)}
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
