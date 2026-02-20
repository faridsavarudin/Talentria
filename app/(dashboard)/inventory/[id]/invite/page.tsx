"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function AddInvitesPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emails, setEmails] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const candidateEmails = emails
      .split(/[\n,]/)
      .map((em) => em.trim())
      .filter(Boolean);

    if (candidateEmails.length === 0) {
      toast.error("Enter at least one email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/inventory/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateEmails }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send invites");
      }

      const data = await res.json();
      toast.success(
        `${data.invitesSent} invite${data.invitesSent !== 1 ? "s" : ""} sent!`
      );
      router.push(`/inventory/${id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send invites"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/inventory/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Invitations</h1>
          <p className="text-sm text-muted-foreground">
            Send additional test links to candidates
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Candidate Emails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emails">Emails *</Label>
              <Textarea
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={6}
                placeholder={"alice@example.com\nbob@example.com, carol@example.com"}
                required
              />
              <p className="text-xs text-muted-foreground">
                One email per line or comma-separated. Each candidate gets a
                unique invite link.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-brand-gradient border-0"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Sending..." : "Send Invites"}
        </Button>
      </form>
    </div>
  );
}
