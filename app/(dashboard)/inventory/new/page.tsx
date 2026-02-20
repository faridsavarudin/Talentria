"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";
import { InventoryTestType } from "@prisma/client";

const AVAILABLE_TESTS: {
  type: InventoryTestType;
  label: string;
  description: string;
}[] = [
  {
    type: "RIASEC",
    label: "RIASEC",
    description:
      "Holland Occupational Themes — measures Realistic, Investigative, Artistic, Social, Enterprising, and Conventional interests.",
  },
  {
    type: "COGNITIVE",
    label: "Cognitive Ability",
    description:
      "General mental ability test covering verbal, numerical, and abstract reasoning.",
  },
  {
    type: "VRA",
    label: "VRA (Verbal & Abstract Reasoning)",
    description:
      "Assesses verbal comprehension and abstract problem-solving capability.",
  },
  {
    type: "ANALYTICAL_REASONING",
    label: "Analytical Reasoning",
    description:
      "Measures logical deduction, critical thinking, and structured problem analysis.",
  },
  {
    type: "CREATIVE_THINKING",
    label: "Creative Thinking",
    description:
      "Evaluates fluency, flexibility, originality, and elaboration in ideation.",
  },
  {
    type: "BIG_FIVE",
    label: "Big Five Personality",
    description:
      "Measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
  },
];

export default function NewInventoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<InventoryTestType[]>([]);
  const [emails, setEmails] = useState("");

  function toggleTest(type: InventoryTestType) {
    setSelectedTests((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (selectedTests.length === 0) {
      toast.error("Select at least one test");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const candidateEmails = emails
      .split(/[\n,]/)
      .map((em) => em.trim())
      .filter(Boolean);

    const body = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      tests: selectedTests,
      candidateEmails,
    };

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create test set");
      }

      const data = await res.json();
      toast.success(
        `Test set created! ${data.invitesSent} invite${data.invitesSent !== 1 ? "s" : ""} sent.`
      );
      router.push(`/inventory/${data.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create test set"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Test Set</h1>
          <p className="text-sm text-muted-foreground">
            Combine psychometric instruments and invite candidates
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Battery details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Set Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Test Set Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g. Software Engineer Psychometric Screen"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Internal notes about when to use this test set..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Test selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Tests *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AVAILABLE_TESTS.map((test) => {
              const selected = selectedTests.includes(test.type);
              return (
                <button
                  key={test.type}
                  type="button"
                  onClick={() => toggleTest(test.type)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                        selected
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M1.5 5L4 7.5L8.5 2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${selected ? "text-indigo-900" : "text-slate-900"}`}
                      >
                        {test.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {test.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {selectedTests.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Select at least one test to continue.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Invite candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite Candidates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emails">Candidate Emails (optional)</Label>
              <Textarea
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={4}
                placeholder={"alice@example.com\nbob@example.com, carol@example.com"}
              />
              <p className="text-xs text-muted-foreground">
                One email per line or comma-separated. Each candidate gets a
                unique invite link. You can add more invites later.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-brand-gradient border-0"
        >
          <FlaskConical className="h-4 w-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create Test Set & Send Invites"}
        </Button>
      </form>
    </div>
  );
}
