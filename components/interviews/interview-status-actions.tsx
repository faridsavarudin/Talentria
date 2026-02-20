"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, CheckCircle2, XCircle, ClipboardPen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { InterviewStatus } from "@prisma/client";

type Props = {
  interviewId: string;
  currentStatus: InterviewStatus;
  isOnPanel: boolean;
  isAdminOrRecruiter: boolean;
};

export function InterviewStatusActions({
  interviewId,
  currentStatus,
  isOnPanel,
  isAdminOrRecruiter,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: InterviewStatus) => {
    setLoading(status);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update status");
        return;
      }
      toast.success("Interview status updated");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Evaluator: Go to evaluate page */}
      {isOnPanel &&
        (currentStatus === "SCHEDULED" || currentStatus === "IN_PROGRESS") && (
          <Link href={`/interviews/${interviewId}/evaluate`}>
            <Button>
              <ClipboardPen className="mr-2 h-4 w-4" />
              Evaluate
            </Button>
          </Link>
        )}

      {/* Admin/Recruiter: Status control */}
      {isAdminOrRecruiter && currentStatus === "SCHEDULED" && (
        <Button
          variant="outline"
          onClick={() => updateStatus("IN_PROGRESS")}
          disabled={!!loading || isPending}
        >
          <Play className="mr-2 h-4 w-4" />
          {loading === "IN_PROGRESS" ? "Starting..." : "Start Interview"}
        </Button>
      )}

      {isAdminOrRecruiter && currentStatus === "IN_PROGRESS" && (
        <Button
          variant="outline"
          onClick={() => updateStatus("COMPLETED")}
          disabled={!!loading || isPending}
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          {loading === "COMPLETED" ? "Completing..." : "Mark Complete"}
        </Button>
      )}

      {isAdminOrRecruiter &&
        (currentStatus === "SCHEDULED" ||
          currentStatus === "IN_PROGRESS") && (
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => updateStatus("CANCELLED")}
            disabled={!!loading || isPending}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {loading === "CANCELLED" ? "Cancelling..." : "Cancel"}
          </Button>
        )}
    </div>
  );
}
