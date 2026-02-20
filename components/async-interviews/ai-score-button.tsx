"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AiScoreButton({ responseId }: { responseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleScore() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/score-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scoring failed");
      toast.success(`AI score: ${data.score}/5`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleScore}
      disabled={loading}
      className="h-7 text-xs text-violet-600 border-violet-200 hover:bg-violet-50"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Brain className="h-3 w-3 mr-1" />
      )}
      {loading ? "Scoring..." : "AI Score"}
    </Button>
  );
}
