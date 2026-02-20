"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  candidateId: string;
  initialNotes: string;
};

export function CandidateNotesEditor({ candidateId, initialNotes }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = () => {
    setDraft(notes);
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleCancel = () => {
    setDraft(notes);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (draft === notes) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: draft }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save notes");
        return;
      }

      setNotes(draft);
      setIsEditing(false);
      toast.success("Notes saved");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Edit notes</span>
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Cancel</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="h-3.5 w-3.5" />
                <span className="sr-only">Save</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Add notes about this candidate..."
            disabled={isSaving}
          />
        ) : notes ? (
          <p className="whitespace-pre-wrap text-sm text-foreground">{notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No notes yet. Click the edit button to add notes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
