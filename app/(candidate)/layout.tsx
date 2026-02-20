import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview | AssInt",
  description: "Async video interview powered by AssInt",
};

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
