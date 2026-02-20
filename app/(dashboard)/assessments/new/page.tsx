"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assessmentCreateSchema, type AssessmentCreateInput } from "@/lib/validations/assessment";

type CompetencyField = {
  id: string;
  name: string;
  description: string;
};

export default function NewAssessmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [competencies, setCompetencies] = useState<CompetencyField[]>([
    { id: "1", name: "", description: "" },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssessmentCreateInput>({
    resolver: zodResolver(assessmentCreateSchema),
  });

  const addCompetency = () => {
    setCompetencies([
      ...competencies,
      { id: Date.now().toString(), name: "", description: "" },
    ]);
  };

  const removeCompetency = (id: string) => {
    if (competencies.length > 1) {
      setCompetencies(competencies.filter((c) => c.id !== id));
    }
  };

  const updateCompetency = (id: string, field: "name" | "description", value: string) => {
    setCompetencies(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  };

  const onSubmit = async (data: AssessmentCreateInput) => {
    try {
      setIsLoading(true);

      const competenciesData = competencies
        .filter(c => c.name.trim())
        .map(c => ({ name: c.name.trim(), description: c.description.trim() || undefined }));

      const payload = {
        ...data,
        competencies: competenciesData.length > 0 ? competenciesData : undefined,
      };

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create assessment");
      }

      const assessment = await response.json();
      toast.success("Assessment created successfully");
      router.push(`/assessments/${assessment.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create assessment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/assessments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Assessment</h1>
          <p className="text-muted-foreground">
            Set up a structured interview assessment for a role.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the job details for this assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assessment Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Frontend Engineer Assessment"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Frontend Engineer"
                {...register("jobTitle")}
              />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering"
                {...register("department")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <textarea
                id="jobDescription"
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the role, responsibilities, and requirements..."
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Assessment Description</Label>
              <textarea
                id="description"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Additional notes about this assessment..."
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Competencies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Competencies</CardTitle>
                <CardDescription>
                  Define the key competencies to evaluate for this role
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addCompetency}>
                <Plus className="h-4 w-4 mr-1" />
                Add Competency
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {competencies.map((comp, index) => (
              <div key={comp.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Competency {index + 1}</h4>
                  {competencies.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompetency(comp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`competency-name-${comp.id}`}>Name</Label>
                  <Input
                    id={`competency-name-${comp.id}`}
                    placeholder="e.g., Technical Problem Solving"
                    value={comp.name}
                    onChange={(e) => updateCompetency(comp.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`competency-desc-${comp.id}`}>Description</Label>
                  <Input
                    id={`competency-desc-${comp.id}`}
                    placeholder="Brief description of this competency..."
                    value={comp.description}
                    onChange={(e) => updateCompetency(comp.id, "description", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Link href="/assessments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
