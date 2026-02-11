import { z } from "zod";

// Rubric level schema
export const rubricLevelSchema = z.object({
  level: z.number().min(1).max(5),
  label: z.string().min(1, "Label is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  behavioralAnchors: z.array(z.string()).min(1, "At least one behavioral anchor is required"),
});

// Question schema
export const questionSchema = z.object({
  content: z.string().min(10, "Question must be at least 10 characters"),
  type: z.enum(["BEHAVIORAL", "SITUATIONAL", "TECHNICAL"]),
  order: z.number().optional(),
  rubricLevels: z.array(rubricLevelSchema).optional(),
});

// Competency schema
export const competencySchema = z.object({
  name: z.string().min(2, "Competency name is required"),
  description: z.string().optional(),
  questions: z.array(questionSchema).optional(),
});

// Create assessment schema
export const assessmentCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  jobTitle: z.string().min(2, "Job title is required"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  department: z.string().optional(),
  description: z.string().optional(),
  competencies: z.array(competencySchema).optional(),
});

// Update assessment schema (all fields optional)
export const assessmentUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  jobTitle: z.string().min(2, "Job title is required").optional(),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters").optional(),
  department: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

// Add competency to assessment
export const addCompetencySchema = z.object({
  name: z.string().min(2, "Competency name is required"),
  description: z.string().optional(),
});

// Add question to competency
export const addQuestionSchema = z.object({
  content: z.string().min(10, "Question must be at least 10 characters"),
  type: z.enum(["BEHAVIORAL", "SITUATIONAL", "TECHNICAL"]),
  competencyId: z.string(),
  order: z.number().optional(),
  rubricLevels: z.array(rubricLevelSchema).optional(),
});

export type RubricLevelInput = z.infer<typeof rubricLevelSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CompetencyInput = z.infer<typeof competencySchema>;
export type AssessmentCreateInput = z.infer<typeof assessmentCreateSchema>;
export type AssessmentUpdateInput = z.infer<typeof assessmentUpdateSchema>;
export type AddCompetencyInput = z.infer<typeof addCompetencySchema>;
export type AddQuestionInput = z.infer<typeof addQuestionSchema>;
