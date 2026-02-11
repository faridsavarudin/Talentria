import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as Record<string, unknown>)?.role as string | undefined;

  // Public routes
  const publicRoutes = ["/login", "/register", "/"];
  if (publicRoutes.includes(pathname)) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Dashboard routes - Admin and Recruiter only
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/assessments") || pathname.startsWith("/analytics")) {
    if (userRole !== "ADMIN" && userRole !== "RECRUITER") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  // Evaluator routes
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
