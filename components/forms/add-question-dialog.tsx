"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addQuestionSchema, type AddQuestionInput } from "@/lib/validations/assessment";

type RubricLevel = {
  id: string;
  level: number;
  label: string;
  description: string;
  behavioralAnchors: string[];
};

type AddQuestionDialogProps = {
  assessmentId: string;
  competencyId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const defaultRubricLevels: RubricLevel[] = [
  {
    id: "1",
    level: 1,
    label: "Below Expectations",
    description: "",
    behavioralAnchors: [""],
  },
  {
    id: "2",
    level: 2,
    label: "Partially Meets Expectations",
    description: "",
    behavioralAnchors: [""],
  },
  {
    id: "3",
    level: 3,
    label: "Meets Expectations",
    description: "",
    behavioralAnchors: [""],
  },
  {
    id: "4",
    level: 4,
    label: "Exceeds Expectations",
    description: "",
    behavioralAnchors: [""],
  },
  {
    id: "5",
    level: 5,
    label: "Far Exceeds Expectations",
    description: "",
    behavioralAnchors: [""],
  },
];

export function AddQuestionDialog({
  assessmentId,
  competencyId,
  open,
  onClose,
  onSuccess,
}: AddQuestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState<string>("BEHAVIORAL");
  const [rubricLevels, setRubricLevels] = useState<RubricLevel[]>(defaultRubricLevels);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddQuestionInput>({
    resolver: zodResolver(addQuestionSchema),
    defaultValues: {
      competencyId,
      type: "BEHAVIORAL",
    },
  });

  const addAnchor = (levelId: string) => {
    setRubricLevels(
      rubricLevels.map((level) =>
        level.id === levelId
          ? { ...level, behavioralAnchors: [...level.behavioralAnchors, ""] }
          : level
      )
    );
  };

  const removeAnchor = (levelId: string, anchorIndex: number) => {
    setRubricLevels(
      rubricLevels.map((level) =>
        level.id === levelId
          ? {
              ...level,
              behavioralAnchors: level.behavioralAnchors.filter((_, i) => i !== anchorIndex),
            }
          : level
      )
    );
  };

  const updateRubricLevel = (levelId: string, field: string, value: string) => {
    setRubricLevels(
      rubricLevels.map((level) =>
        level.id === levelId ? { ...level, [field]: value } : level
      )
    );
  };

  const updateAnchor = (levelId: string, anchorIndex: number, value: string) => {
    setRubricLevels(
      rubricLevels.map((level) =>
        level.id === levelId
          ? {
              ...level,
              behavioralAnchors: level.behavioralAnchors.map((anchor, i) =>
                i === anchorIndex ? value : anchor
              ),
            }
          : level
      )
    );
  };

  const onSubmit = async (data: AddQuestionInput) => {
    try {
      setIsLoading(true);

      // Validate and prepare rubric levels
      const validRubricLevels = rubricLevels.map((level) => ({
        level: level.level,
        label: level.label,
        description: level.description || `Level ${level.level} performance`,
        behavioralAnchors: level.behavioralAnchors.filter((a) => a.trim() !== ""),
      })).filter(level => level.behavioralAnchors.length > 0);

      if (validRubricLevels.length === 0) {
        alert("Please add at least one rubric level with behavioral anchors");
        setIsLoading(false);
        return;
      }

      const payload = {
        ...data,
        type: questionType as "BEHAVIORAL" | "SITUATIONAL" | "TECHNICAL",
        competencyId,
        rubricLevels: validRubricLevels,
      };

      const response = await fetch(`/api/assessments/${assessmentId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add question");
      }

      reset();
      setRubricLevels(defaultRubricLevels);
      setQuestionType("BEHAVIORAL");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding question:", error);
      alert(error instanceof Error ? error.message : "Failed to add question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Create a new interview question with behavioral rubrics for scoring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Question *</Label>
              <textarea
                id="content"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter your interview question..."
                {...register("content")}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                  <SelectItem value="SITUATIONAL">Situational</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-3">Rubric Levels (1-5 Scale)</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Define behavioral anchors for each level to guide evaluators in scoring.
              </p>
            </div>

            {rubricLevels.map((level) => (
              <div key={level.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-semibold text-sm">
                    {level.level}
                  </div>
                  <Input
                    value={level.label}
                    onChange={(e) => updateRubricLevel(level.id, "label", e.target.value)}
                    placeholder="Level label"
                    className="flex-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={level.description}
                    onChange={(e) => updateRubricLevel(level.id, "description", e.target.value)}
                    placeholder={`Describe level ${level.level} performance...`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Behavioral Anchors</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addAnchor(level.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {level.behavioralAnchors.map((anchor, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={anchor}
                        onChange={(e) => updateAnchor(level.id, index, e.target.value)}
                        placeholder="Observable behavior or indicator..."
                        className="text-sm"
                      />
                      {level.behavioralAnchors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnchor(level.id, index)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
