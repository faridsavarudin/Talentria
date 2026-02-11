"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAssessmentSchema, type CreateAssessmentInput } from "@/lib/validations/assessment";

const steps = [
  { id: 1, title: "Job Details", description: "Enter the job information" },
  { id: 2, title: "AI Generate", description: "Generate questions with AI" },
  { id: 3, title: "Review & Edit", description: "Review generated content" },
  { id: 4, title: "Publish", description: "Finalize and publish" },
];

export default function NewAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAssessmentInput>({
    resolver: zodResolver(createAssessmentSchema),
  });

  const onSubmit = (data: CreateAssessmentInput) => {
    if (currentStep < 4) {
      if (currentStep === 1) {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep(currentStep + 1);
        }, 2000);
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Assessment</h1>
        <p className="text-muted-foreground">
          Set up a structured interview assessment for a role.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium ${
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span className="mt-2 text-xs font-medium text-muted-foreground hidden sm:block">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 w-16 sm:w-24 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Frontend Engineer Assessment"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Frontend Engineer"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-destructive">{errors.jobTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  placeholder="e.g., Engineering"
                  {...register("department")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <textarea
                  id="jobDescription"
                  rows={6}
                  placeholder="Paste the full job description here. The AI will analyze it to generate competency-mapped interview questions with behavioral rubrics."
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("jobDescription")}
                />
                {errors.jobDescription && (
                  <p className="text-sm text-destructive">{errors.jobDescription.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate with AI
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">Generated Competencies & Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The AI has analyzed the job description and generated the following
                  structured interview guide. You can edit these in the next step.
                </p>

                {/* Mock generated content */}
                {[
                  {
                    competency: "Technical Proficiency",
                    questions: [
                      "Describe a complex technical problem you solved recently. Walk me through your approach.",
                      "Tell me about a time you had to learn a new technology quickly for a project.",
                    ],
                  },
                  {
                    competency: "Leadership & Collaboration",
                    questions: [
                      "Give an example of when you mentored a junior team member. What was the outcome?",
                      "Describe a situation where you had to resolve a disagreement within your team.",
                    ],
                  },
                  {
                    competency: "Problem Solving",
                    questions: [
                      "Tell me about a time you identified a problem before it became critical.",
                      "Describe how you approach debugging a production issue under time pressure.",
                    ],
                  },
                ].map((comp) => (
                  <div key={comp.competency} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-semibold text-primary mb-1">
                      {comp.competency}
                    </h4>
                    <ul className="space-y-1">
                      {comp.questions.map((q, i) => (
                        <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Review & Edit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Edit the generated questions and rubrics below. Each question has a 5-point
                scoring rubric with behavioral anchors.
              </p>
              <div className="rounded-lg border p-4 text-center text-muted-foreground py-12">
                Full rubric editor will be implemented in Sprint 2.
                <br />
                For now, review the generated content and proceed.
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)}>
                  Finalize
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Assessment Ready!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your assessment has been created with AI-generated questions and rubrics.
                You can now start scheduling interviews.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Create Another
                </Button>
                <Button>View Assessment</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
