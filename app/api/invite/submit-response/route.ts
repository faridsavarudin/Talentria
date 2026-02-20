import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/invite/submit-response
// FormData: video (Blob), inviteId (string), questionId (string)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const inviteId = formData.get("inviteId") as string;
    const questionId = formData.get("questionId") as string;
    const video = formData.get("video") as File | null;

    if (!inviteId || !questionId) {
      return NextResponse.json({ error: "inviteId and questionId required" }, { status: 400 });
    }

    // Verify the invite is valid
    const invite = await prisma.candidateInvite.findUnique({
      where: { id: inviteId },
      include: { asyncInterview: { select: { id: true, assessmentId: true } } },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.completedAt) {
      return NextResponse.json({ error: "Interview already completed" }, { status: 409 });
    }

    // Video URL placeholder — wire up Vercel Blob / S3 when BLOB_READ_WRITE_TOKEN is set
    const videoUrl: string | null = null;
    const duration = video ? Math.round(video.size / 25000) : null; // rough estimate

    // Upsert the video response
    await prisma.videoResponse.upsert({
      where: { inviteId_questionId: { inviteId, questionId } },
      create: {
        asyncInterviewId: invite.asyncInterviewId,
        inviteId,
        questionId,
        videoUrl,
        duration,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      update: {
        videoUrl,
        duration,
        status: "SUBMITTED",
        submittedAt: new Date(),
        retakeCount: { increment: 1 },
      },
    });

    return NextResponse.json({ ok: true, videoUrl });
  } catch (err) {
    console.error("submit-response error:", err);
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
  }
}
