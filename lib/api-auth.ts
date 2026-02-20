/**
 * API Route auth helpers — return proper JSON responses instead of redirecting.
 * Use these in API Route handlers (not Server Components/Actions).
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

export type ApiUser = {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  role: UserRole;
  organizationId: string;
};

type ApiAuthResult =
  | { ok: true; user: ApiUser }
  | { ok: false; response: NextResponse };

/** Require a valid session. Returns 401 if unauthenticated. */
export async function requireApiAuth(): Promise<ApiAuthResult> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const u = session.user as Record<string, unknown>;
  return {
    ok: true,
    user: {
      id: (u.id as string) ?? "",
      name: session.user.name,
      email: session.user.email,
      role: u.role as UserRole,
      organizationId: u.organizationId as string,
    },
  };
}

/** Require a valid session AND one of the allowed roles. Returns 401/403. */
export async function requireApiRole(
  allowedRoles: UserRole[]
): Promise<ApiAuthResult> {
  const result = await requireApiAuth();
  if (!result.ok) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden: insufficient role" },
        { status: 403 }
      ),
    };
  }

  return result;
}
