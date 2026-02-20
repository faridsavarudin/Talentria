import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/credits/deduct — deduct AI credits from org subscription
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    const body = await request.json().catch(() => ({}));
    const amount = typeof body.amount === "number" ? body.amount : 1;

    // Find or create subscription
    let subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { organizationId, plan: "FREE", aiCredits: 50 },
      });
    }

    if (subscription.aiCredits < amount) {
      return NextResponse.json(
        { error: "Insufficient AI credits", aiCredits: subscription.aiCredits },
        { status: 402 }
      );
    }

    const updated = await prisma.subscription.update({
      where: { organizationId },
      data: { aiCredits: { decrement: amount } },
      select: { aiCredits: true },
    });

    return NextResponse.json({ aiCredits: updated.aiCredits });
  } catch (error) {
    console.error("Error deducting credits:", error);
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
