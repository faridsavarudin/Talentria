"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addCompetencySchema, type AddCompetencyInput } from "@/lib/validations/assessment";

type AddCompetencyDialogProps = {
  assessmentId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddCompetencyDialog({
  assessmentId,
  open,
  onClose,
  onSuccess,
}: AddCompetencyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddCompetencyInput>({
    resolver: zodResolver(addCompetencySchema),
  });

  const onSubmit = async (data: AddCompetencyInput) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/assessments/${assessmentId}/competencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add competency");
      }

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding competency:", error);
      alert(error instanceof Error ? error.message : "Failed to add competency");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Competency</DialogTitle>
          <DialogDescription>
            Define a new competency to evaluate for this role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Competency Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Technical Problem Solving"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Describe what this competency evaluates..."
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Competency"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
