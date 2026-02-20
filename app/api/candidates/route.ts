import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { candidateCreateSchema } from "@/lib/validations/candidate";
import type { PipelineStage } from "@prisma/client";

// GET /api/candidates - List candidates with search + stage filter + cursor pagination
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const stage = searchParams.get("stage") as PipelineStage | null;
    const cursor = searchParams.get("cursor");
    const take = 20;

    const where = {
      organizationId,
      ...(stage && { pipelineStage: stage }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        take,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { lastActivityAt: "desc" },
        include: {
          _count: {
            select: { interviews: true },
          },
          interviews: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              assessment: {
                select: { id: true, title: true },
              },
            },
          },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    const nextCursor =
      candidates.length === take
        ? candidates[candidates.length - 1].id
        : null;

    return NextResponse.json({ candidates, total, nextCursor });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

// POST /api/candidates - Create candidate
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    const body = await request.json();
    const parsed = candidateCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, resumeUrl, notes } = parsed.data;

    // Enforce email uniqueness within org
    const existing = await prisma.candidate.findFirst({
      where: { email, organizationId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A candidate with this email already exists in your organization" },
        { status: 409 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        resumeUrl: resumeUrl || null,
        notes: notes ?? null,
        organizationId,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      { error: "Failed to create candidate" },
      { status: 500 }
    );
  }
}
