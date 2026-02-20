import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/credits — returns plan and aiCredits for the user's org
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    let subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      select: { plan: true, aiCredits: true },
    });

    // Auto-create subscription if it doesn't exist
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { organizationId, plan: "FREE", aiCredits: 50 },
        select: { plan: true, aiCredits: true },
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
