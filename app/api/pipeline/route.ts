import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PipelineStage } from "@prisma/client";

export type CandidateWithInfo = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pipelineStage: PipelineStage;
  lastActivityAt: Date;
  createdAt: Date;
  _count: { interviews: number };
};

export type PipelineColumnData = {
  candidates: CandidateWithInfo[];
  total: number;
  page: number;
  hasMore: boolean;
};

export type PipelineData = Record<string, CandidateWithInfo[]>;
export type PaginatedPipelineData = Record<string, PipelineColumnData>;

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

const DEFAULT_LIMIT = 15;

/**
 * GET /api/pipeline
 *
 * With no query params: returns all candidates grouped by stage (legacy behaviour).
 *
 * With ?stage=APPLIED&page=1&limit=15: returns paginated candidates for that
 * single stage plus the total count so the client can render "Show more".
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as Record<string, unknown>)
      .organizationId as string;

    const { searchParams } = req.nextUrl;
    const stageParam = searchParams.get("stage");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // ── Single-stage paginated query ───────────────────────────────────────
    if (stageParam) {
      const stage = stageParam.toUpperCase() as PipelineStage;
      if (!VALID_STAGES.includes(stage)) {
        return NextResponse.json(
          { error: "Invalid pipeline stage" },
          { status: 400 }
        );
      }

      const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
      );
      const skip = (page - 1) * limit;

      const [candidates, total] = await Promise.all([
        prisma.candidate.findMany({
          where: { organizationId, pipelineStage: stage },
          orderBy: { lastActivityAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            pipelineStage: true,
            lastActivityAt: true,
            createdAt: true,
            _count: { select: { interviews: true } },
          },
        }),
        prisma.candidate.count({
          where: { organizationId, pipelineStage: stage },
        }),
      ]);

      const columnData: PipelineColumnData = {
        candidates,
        total,
        page,
        hasMore: skip + candidates.length < total,
      };

      return NextResponse.json(columnData);
    }

    // ── All-stages query (used by KanbanBoard on initial load + after DnD) ─
    const candidates = await prisma.candidate.findMany({
      where: { organizationId },
      orderBy: { lastActivityAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        pipelineStage: true,
        lastActivityAt: true,
        createdAt: true,
        _count: { select: { interviews: true } },
      },
    });

    // Group by stage
    const grouped: PipelineData = {};
    for (const c of candidates) {
      const stage = c.pipelineStage;
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(c);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching pipeline data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline data" },
      { status: 500 }
    );
  }
}
