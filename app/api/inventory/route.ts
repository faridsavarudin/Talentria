import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { InventoryTestType } from "@prisma/client";
import { z } from "zod";

const CreateBatterySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  tests: z
    .array(z.nativeEnum(InventoryTestType))
    .min(1, "Select at least one test"),
  candidateEmails: z.array(z.string().email()).optional().default([]),
});

export async function GET() {
  const auth = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!auth.ok) return auth.response;

  const batteries = await prisma.inventoryBattery.findMany({
    where: { organizationId: auth.user.organizationId },
    include: {
      tests: { orderBy: { order: "asc" } },
      invitations: {
        select: { id: true, status: true, completedAt: true },
      },
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(batteries);
}

export async function POST(req: NextRequest) {
  const auth = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateBatterySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { title, description, tests, candidateEmails } = parsed.data;

  const battery = await prisma.inventoryBattery.create({
    data: {
      title,
      description,
      organizationId: auth.user.organizationId,
      createdById: auth.user.id,
      tests: {
        create: tests.map((testType, index) => ({
          testType,
          order: index,
        })),
      },
      invitations: {
        create: candidateEmails.map((email) => ({
          candidateEmail: email,
        })),
      },
    },
    include: {
      tests: true,
      invitations: true,
    },
  });

  return NextResponse.json(
    { id: battery.id, invitesSent: battery.invitations.length },
    { status: 201 }
  );
}
