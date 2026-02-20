import { z } from "zod";

export const candidateCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  resumeUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});

export const candidateUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  resumeUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
  pipelineStage: z
    .enum([
      "APPLIED",
      "SCREENING",
      "ASSESSMENT",
      "INTERVIEW",
      "OFFER",
      "HIRED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional(),
});

export type CandidateCreateInput = z.infer<typeof candidateCreateSchema>;
export type CandidateUpdateInput = z.infer<typeof candidateUpdateSchema>;
