"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, FileText } from "lucide-react";
import Link from "next/link";

type Assessment = {
  id: string;
  title: string;
  jobTitle: string;
  department: string | null;
  _count: { questions: number };
};

export default function NewAsyncInterviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emails, setEmails] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  useEffect(() => {
    fetch("/api/assessments?status=ACTIVE")
      .then((r) => r.json())
      .then((data: Assessment[]) => setAssessments(data))
      .catch(() => toast.error("Failed to load assessments"))
      .finally(() => setLoadingAssessments(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!assessmentId) {
      toast.error("Please select an assessment");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get("title") as string,
      assessmentId,
      instructions: (formData.get("instructions") as string) || null,
      timeLimitSeconds: parseInt(formData.get("timeLimitSeconds") as string) || 180,
      retakesAllowed: parseInt(formData.get("retakesAllowed") as string) || 1,
      deadlineAt: formData.get("deadlineAt") || null,
      candidateEmails: emails
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean) as string[],
    };

    try {
      const res = await fetch("/api/async-interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }

      const data = await res.json();
      toast.success(
        `Interview created! ${data.invitesSent} invite${data.invitesSent !== 1 ? "s" : ""} sent.`
      );
      router.push(`/async-interviews/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create interview");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedAssessment = assessments.find((a) => a.id === assessmentId);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/async-interviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Async Interview</h1>
          <p className="text-sm text-muted-foreground">
            Candidates record video answers on their own schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Interview Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g. Senior Engineer — Video Screen"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Assessment *</Label>
              {loadingAssessments ? (
                <div className="h-10 rounded-md border bg-muted animate-pulse" />
              ) : assessments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    No published assessments found.{" "}
                    <Link href="/assessments" className="text-primary underline underline-offset-2">
                      Publish an assessment
                    </Link>{" "}
                    first, then come back here.
                  </span>
                </div>
              ) : (
                <>
                  <Select value={assessmentId} onValueChange={setAssessmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assessment…" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="font-medium">{a.title}</span>
                          <span className="ml-2 text-muted-foreground text-xs">
                            — {a.jobTitle}
                            {a.department ? ` · ${a.department}` : ""}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAssessment && (
                    <p className="text-xs text-muted-foreground">
                      {selectedAssessment._count.questions} question
                      {selectedAssessment._count.questions !== 1 ? "s" : ""} in this assessment
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions">Candidate Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                rows={3}
                placeholder="What should candidates know before they begin? Tips, context, what to prepare..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="timeLimitSeconds">Time Limit per Question (seconds)</Label>
                <Input
                  id="timeLimitSeconds"
                  name="timeLimitSeconds"
                  type="number"
                  defaultValue={180}
                  min={30}
                  max={600}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="retakesAllowed">Retakes Allowed</Label>
                <Input
                  id="retakesAllowed"
                  name="retakesAllowed"
                  type="number"
                  defaultValue={1}
                  min={0}
                  max={5}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadlineAt">Response Deadline (optional)</Label>
              <Input id="deadlineAt" name="deadlineAt" type="datetime-local" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite Candidates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emails">Candidate Emails</Label>
              <Textarea
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={4}
                placeholder={"alice@example.com\nbob@example.com, carol@example.com"}
              />
              <p className="text-xs text-muted-foreground">
                One email per line or comma-separated. Each candidate gets a unique link.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting || !assessmentId}
          className="w-full btn-brand-gradient border-0"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create & Send Invites"}
        </Button>
      </form>
    </div>
  );
}
