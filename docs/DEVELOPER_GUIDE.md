# Developer Guide

## Prerequisites

- Node.js 20+
- npm or pnpm
- A Supabase project (free tier works)
- An Anthropic API key

## Local Setup

```bash
git clone <repo-url>
cd assint
npm install
```

Copy the environment file:

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Google OAuth (optional — button is hidden until configured)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Push the schema to your database:

```bash
npx prisma db push
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npx tsc --noEmit` | TypeScript type check (no output = clean) |
| `npx prisma db push` | Sync schema to DB (no migration file) |
| `npx prisma generate` | Regenerate Prisma client after schema change |
| `npx prisma studio` | Open visual DB browser at localhost:5555 |

## Adding a New Dashboard Page

1. Create the file: `app/(dashboard)/your-page/page.tsx`
2. Make it a server component (no `"use client"` at top)
3. Call `requireAuth()` or `requireRole()` at the top:

```tsx
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function YourPage() {
  const user = await requireAuth();
  const data = await prisma.something.findMany({
    where: { organizationId: user.organizationId },
  });
  return <div>...</div>;
}
```

4. Add a nav item in `components/layout/sidebar.tsx` (import icon from lucide-react):

```tsx
{ title: "Your Page", href: "/your-page", icon: YourIcon },
```

5. Add the path to the middleware role guard in `middleware.ts` if it should be ADMIN/RECRUITER-only:

```ts
pathname.startsWith("/your-page") ||
```

## Adding a New API Route

Create `app/api/your-route/route.ts`. Use the auth helpers from `lib/api-auth.ts`:

```ts
import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireApiRole(["ADMIN", "RECRUITER"]);
  if (!authResult.ok) return authResult.response;

  const { user } = authResult;

  const data = await prisma.something.findMany({
    where: { organizationId: user.organizationId },
  });

  return NextResponse.json(data);
}
```

For public routes (no auth needed), query the DB directly without the auth helper.

## Adding a New Prisma Model

1. Edit `prisma/schema.prisma` and add your model.
2. Add any necessary relation fields to connected models.
3. Run `npx prisma db push` (syncs to DB, no migration file for dev).
4. Run `npx prisma generate` (regenerates the TypeScript client).
5. Import and use: `import { prisma } from "@/lib/prisma";`

## Calling Claude (Anthropic API)

```ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: "You are a...",
  messages: [{ role: "user", content: "..." }],
});

const text = response.content[0].type === "text" ? response.content[0].text : "";
```

**Always strip markdown code fences from JSON responses:**

```ts
const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
const parsed = JSON.parse(cleaned);
```

**Always wrap JSON.parse in try/catch** — Claude occasionally returns non-JSON (retry messages, refusals):

```ts
try {
  return JSON.parse(cleaned);
} catch {
  return defaultFallback;
}
```

## Code Conventions

- **Server Components by default** — only add `"use client"` when you need hooks, event handlers, or browser APIs
- **Co-located types** — define TypeScript types inline in the file that uses them; don't create a global `types/` folder
- **Prisma `select` over `include`** — be explicit about which fields you fetch; don't return full models to the client
- **Never expose PII on public endpoints** — `candidateEmail`, `transcript`, `organizationId` must not appear in public GET responses
- **shadcn/ui components** — always use the existing components in `components/ui/` rather than raw HTML elements
- **Toast pattern** — use `toast.success()` / `toast.error()` from `sonner` for all user feedback on client forms
- **Error responses** — return `{ error: "Human-readable message" }` with the appropriate status code
- **Rate limiting** — wrap public mutation endpoints with `rateLimit()` from `lib/rate-limit.ts`

## Project-Specific Patterns

### Auth in Server Components
```ts
const user = await requireAuth();     // redirects to /login if not authed
const user = await requireRole(["ADMIN"]);  // redirects to /dashboard if wrong role
```

### Auth in API Routes
```ts
const authResult = await requireApiRole(["ADMIN", "RECRUITER"]);
if (!authResult.ok) return authResult.response;  // returns 401 or 403 JSON
const { user } = authResult;  // typed as ApiUser
```

### Organization scoping
Every DB query involving org data must include `organizationId: user.organizationId` in the where clause. Never return data from other orgs.

### Token-based candidate pages
The candidate portal pages (`/ai-interview/[token]`, `/interview/[token]`) are public. They verify the candidate by looking up the token in the DB. No session cookie. No login.
