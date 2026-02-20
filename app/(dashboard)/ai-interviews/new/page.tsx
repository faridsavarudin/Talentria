"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Bot, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function NewAIInterviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      candidateName: (formData.get("candidateName") as string) || undefined,
      candidateEmail: (formData.get("candidateEmail") as string) || undefined,
      totalQuestions: parseInt(formData.get("totalQuestions") as string) || 4,
    };

    try {
      const res = await fetch("/api/ai-interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }

      const data = await res.json();
      setCreatedToken(data.inviteToken);
      toast.success("AI interview session created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyLink() {
    if (!createdToken) return;
    const url = `${window.location.origin}/ai-interview/${createdToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (createdToken) {
    const interviewUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/ai-interview/${createdToken}`;
    return (
      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ai-interviews"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Session Created</h1>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base text-green-800 flex items-center gap-2">
              <Bot className="h-5 w-5" /> Interview Link Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-700">
              Share this link with the candidate. They can start the AI interview immediately — no account needed.
            </p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white border border-green-300 rounded px-3 py-2 text-xs text-slate-700 break-all">
                {interviewUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                className="shrink-0 border-green-300"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setCreatedToken(null);
              setCopied(false);
            }}
          >
            Create Another
          </Button>
          <Button
            className="flex-1 btn-brand-gradient border-0"
            onClick={() => router.push("/ai-interviews")}
          >
            View All Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ai-interviews"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New AI Interview</h1>
          <p className="text-sm text-muted-foreground">Generate an interview link for a candidate</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Candidate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                name="candidateName"
                placeholder="e.g. Jane Smith"
              />
              <p className="text-xs text-muted-foreground">Shown on the interview welcome screen</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="candidateEmail">Candidate Email</Label>
              <Input
                id="candidateEmail"
                name="candidateEmail"
                type="email"
                placeholder="jane@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="totalQuestions">Number of Questions</Label>
              <Input
                id="totalQuestions"
                name="totalQuestions"
                type="number"
                defaultValue={4}
                min={2}
                max={10}
              />
              <p className="text-xs text-muted-foreground">
                The AI will ask this many behavioral questions (2–10)
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-brand-gradient border-0"
        >
          <Bot className="h-4 w-4 mr-2" />
          {isSubmitting ? "Creating..." : "Generate Interview Link"}
        </Button>
      </form>
    </div>
  );
}
