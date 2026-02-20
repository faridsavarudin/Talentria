import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const InviteSchema = z.object({
  candidateEmails: z
    .array(z.string().email())
    .min(1, "Provide at least one email"),
  candidateName: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const battery = await prisma.inventoryBattery.findFirst({
    where: { id, organizationId: auth.user.organizationId },
  });

  if (!battery) {
    return NextResponse.json({ error: "Battery not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { candidateEmails, candidateName } = parsed.data;

  const invitations = await prisma.$transaction(
    candidateEmails.map((email) =>
      prisma.inventoryInvitation.create({
        data: {
          batteryId: id,
          candidateEmail: email,
          candidateName: candidateName ?? null,
        },
      })
    )
  );

  return NextResponse.json({ invitesSent: invitations.length }, { status: 201 });
}
