// Public route — no auth required.
// Renders the AI interview experience with demo questions (no DB).
// The actual interview UI is in /app/(candidate)/ai-interview/[token]/page.tsx.
// This page simply redirects to that page with the special "demo" token.
import { redirect } from "next/navigation";

export default function DemoPage() {
  // The AI interview page handles the "demo" token specially:
  // it uses hardcoded questions and skips DB reads.
  redirect("/ai-interview/demo");
}
