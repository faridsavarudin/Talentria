# AssInt — Implementation Patterns & Phase Plan

## Auth Type Augmentation Pattern
Create `types/next-auth.d.ts` to fix the `as Record<string,unknown>` casts:
```ts
import { UserRole } from "@prisma/client";
declare module "next-auth" {
  interface Session { user: { id: string; role: UserRole; organizationId: string; name?: string|null; email?: string|null; image?: string|null; } }
  interface User { role: UserRole; organizationId: string; }
}
declare module "next-auth/jwt" {
  interface JWT { role: UserRole; organizationId: string; }
}
```

## Session Helper Pattern (lib/session.ts)
```ts
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user; // fully typed with augmentation
}
```

## RSC Data Fetching Pattern (preferred)
- Pages in app/ should be async Server Components by default
- Fetch via prisma directly (not fetch('/api/...'))
- Pass data as props to Client Components that need interactivity
- Use Suspense + loading.tsx for streaming

## Toast Pattern
Use `sonner` package: `import { toast } from "sonner"` — replace all `alert()` calls

## Kanban Pipeline — Schema Addition Needed
Add to prisma schema:
```prisma
enum PipelineStage {
  APPLIED SCREENING INTERVIEW ASSESSMENT OFFER HIRED REJECTED
}
// Add to Candidate model:
pipelineStage PipelineStage @default(APPLIED)
matchScore    Float?
tags          String[]
notes         String? @db.Text
linkedinUrl   String?
source        String?  // "manual", "linkedin", "referral"
```

## AI Route Pattern (claude-sonnet-4-6)
```ts
// app/api/ai/generate-assessment/route.ts
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// Use streaming for long AI responses
```

## Pagination Pattern
Use cursor-based pagination for lists:
```ts
const items = await prisma.candidate.findMany({
  take: 20,
  ...(cursor && { skip: 1, cursor: { id: cursor } }),
  orderBy: { createdAt: "desc" },
});
```

## Drag-and-Drop Library
Use `@hello-pangea/dnd` (React 19 compatible fork of react-beautiful-dnd)
NOT `react-beautiful-dnd` (incompatible with React 19)

## Chart Library
Use `recharts` — already compatible with React 19 and renders as client component

## Package Install Commands
```bash
npm install @anthropic-ai/sdk sonner @hello-pangea/dnd recharts
npm install --save-dev @types/nodemailer
npm install nodemailer  # for email outreach
```
