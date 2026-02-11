import { z } from "zod";

export const createAssessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  jobTitle: z.string().min(2, "Job title is required"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  department: z.string().optional(),
  description: z.string().optional(),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
