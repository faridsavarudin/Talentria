import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Star } from "lucide-react";

const exercises = [
  {
    id: "1",
    title: "Evaluating Leadership Response",
    competency: "Leadership & Collaboration",
    difficulty: "Beginner",
    completions: 45,
    avgAccuracy: 78,
  },
  {
    id: "2",
    title: "Technical Problem Solving",
    competency: "Problem Solving",
    difficulty: "Intermediate",
    completions: 32,
    avgAccuracy: 65,
  },
  {
    id: "3",
    title: "Communication Skills Assessment",
    competency: "Communication",
    difficulty: "Advanced",
    completions: 18,
    avgAccuracy: 52,
  },
];

export default function CalibrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calibration Training</h1>
        <p className="text-muted-foreground">
          Practice scoring to improve your evaluation consistency.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardDescription>Exercises Completed</CardDescription>
              <CardTitle className="text-2xl">7 / 15</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardDescription>Calibration Score</CardDescription>
              <CardTitle className="text-2xl">82%</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardDescription>Certification</CardDescription>
              <CardTitle className="text-2xl">In Progress</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Exercises</CardTitle>
          <CardDescription>
            Score sample interview responses and compare with expert consensus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{exercise.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{exercise.competency}</span>
                    <span>-</span>
                    <Badge variant="outline">{exercise.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {exercise.completions} completions - {exercise.avgAccuracy}% avg accuracy
                  </p>
                </div>
                <Button size="sm">Start Exercise</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
