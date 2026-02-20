import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as Record<string, unknown>)?.role as
    | string
    | undefined;

  // Public routes (candidate interview portal uses token-based auth, not session)
  const publicRoutes = ["/login", "/register", "/", "/demo"];
  const isPublicPrefix =
    pathname.startsWith("/interview/") ||
    pathname.startsWith("/ai-interview/") ||
    pathname.startsWith("/inventory/invite/") ||
    pathname.startsWith("/assessments-library");
  if (publicRoutes.includes(pathname) || isPublicPrefix) {
    // Candidate portal is always public — skip login redirect
    if (isPublicPrefix) return NextResponse.next();
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // All dashboard routes require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Evaluate page: evaluators can access /interviews/[id]/evaluate
  const isEvaluatePage = /^\/interviews\/[^/]+\/evaluate/.test(pathname);
  if (isEvaluatePage) {
    if (!["ADMIN", "RECRUITER", "EVALUATOR"].includes(userRole ?? "")) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Admin/Recruiter only routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assessments") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/candidates") ||
    pathname.startsWith("/interviews") ||
    pathname.startsWith("/ai-interviews") ||
    pathname.startsWith("/async-interviews") ||
    pathname.startsWith("/inventory")
  ) {
    if (userRole !== "ADMIN" && userRole !== "RECRUITER") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  // Evaluator routes (legacy prefix)
  if (pathname.startsWith("/evaluator")) {
    if (userRole !== "EVALUATOR" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
