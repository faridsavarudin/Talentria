import type { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  organizationId: string | null;
};

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  badge?: number;
};
