import { z } from "zod";

export const interviewCreateSchema = z.object({
  assessmentId: z.string().min(1, "Assessment is required"),
  candidateId: z.string().min(1, "Candidate is required"),
  scheduledAt: z.string().datetime({ message: "Invalid date/time" }),
  panelMembers: z
    .array(
      z.object({
        evaluatorId: z.string().min(1, "Evaluator ID is required"),
        role: z.enum(["LEAD", "MEMBER"]).default("MEMBER"),
      })
    )
    .min(1, "At least one panel member is required"),
});

export const interviewUpdateSchema = z.object({
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
  scheduledAt: z.string().datetime().optional(),
  recommendation: z
    .enum(["strong_advance", "advance", "hold", "decline"])
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export const evaluationSubmitSchema = z.object({
  evaluations: z
    .array(
      z.object({
        questionId: z.string().min(1, "Question ID is required"),
        score: z.number().int().min(1).max(5),
        notes: z.string().optional().nullable(),
      })
    )
    .min(1, "At least one evaluation is required"),
});

export type InterviewCreateInput = z.infer<typeof interviewCreateSchema>;
export type InterviewUpdateInput = z.infer<typeof interviewUpdateSchema>;
export type EvaluationSubmitInput = z.infer<typeof evaluationSubmitSchema>;
