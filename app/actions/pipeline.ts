"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import type { PipelineStage } from "@prisma/client";

const VALID_STAGES: PipelineStage[] = [
  "APPLIED",
  "SCREENING",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

export async function updateCandidateStage(
  candidateId: string,
  stage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    if (!VALID_STAGES.includes(stage as PipelineStage)) {
      return { success: false, error: "Invalid pipeline stage" };
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, organizationId: user.organizationId },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found" };
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        pipelineStage: stage as PipelineStage,
        lastActivityAt: new Date(),
      },
    });

    revalidatePath("/pipeline");
    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/candidates");

    return { success: true };
  } catch (error) {
    console.error("Error updating candidate stage:", error);
    return { success: false, error: "Failed to update stage" };
  }
}
