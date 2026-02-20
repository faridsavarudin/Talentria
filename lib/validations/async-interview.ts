import { z } from "zod";

export const asyncInterviewCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  assessmentId: z.string().min(1, "Assessment is required"),
  instructions: z.string().optional().nullable(),
  timeLimitSeconds: z.number().int().min(30).max(600).default(180),
  retakesAllowed: z.number().int().min(0).max(5).default(1),
  deadlineAt: z
    .string()
    .optional()
    .nullable()
    .refine((d) => !d || new Date(d) > new Date(), {
      message: "Deadline must be in the future",
    }),
  candidateEmails: z.array(z.string().email()).default([]),
});

export const videoResponseSubmitSchema = z.object({
  inviteId: z.string().min(1),
  questionId: z.string().min(1),
  videoUrl: z.string().optional().nullable(),
  durationSeconds: z.number().int().min(1).max(700).optional().nullable(),
});

export const proctorEventSchema = z.object({
  inviteId: z.string().min(1),
  eventType: z.string().min(1),
  eventData: z.record(z.string(), z.unknown()).optional(),
});

export const asyncInterviewScoreSchema = z.object({
  questionId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  notes: z.string().optional().nullable(),
});

export type AsyncInterviewCreateInput = z.infer<typeof asyncInterviewCreateSchema>;
export type VideoResponseSubmitInput = z.infer<typeof videoResponseSubmitSchema>;
export type ProctorEventInput = z.infer<typeof proctorEventSchema>;
export type AsyncInterviewScoreInput = z.infer<typeof asyncInterviewScoreSchema>;
