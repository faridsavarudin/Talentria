import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export type AuthUser = {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  role: UserRole;
  organizationId: string;
};

export async function requireAuth(): Promise<AuthUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as Record<string, unknown>;

  return {
    id: (user.id as string) ?? (session.user.id as string),
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: user.role as UserRole,
    organizationId: user.organizationId as string,
  };
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) redirect("/dashboard");
  return user;
}
