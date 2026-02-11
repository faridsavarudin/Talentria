import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList, BarChart3, Target, Users, ArrowRight, Shield } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "AI-Powered Interview Builder",
    description:
      "Turn any job description into a structured interview guide with competency-mapped questions and behavioral rubrics in minutes.",
  },
  {
    icon: BarChart3,
    title: "Inter-Rater Reliability",
    description:
      "Monitor evaluator scoring patterns in real-time. Flag inconsistencies and drift before they affect hiring decisions.",
  },
  {
    icon: Shield,
    title: "Bias Detection",
    description:
      "Automated adverse impact analysis using the 4/5ths rule. Identify and address scoring bias at the evaluator and question level.",
  },
  {
    icon: Target,
    title: "Evaluator Calibration",
    description:
      "Gamified training exercises that turn managers into calibrated evaluators. Track certification and improvement over time.",
  },
  {
    icon: Users,
    title: "Candidate Feedback",
    description:
      "Auto-generated competency reports for candidates. Improve employer brand and candidate experience with transparency.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              A
            </div>
            <span className="text-lg font-bold">AssInt</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Make Every Hire
          <br />
          <span className="text-primary">Fair and Consistent</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Assessment Intelligence Platform that combines AI-powered structured interviews
          with real-time analytics on evaluator reliability and bias. Stop guessing,
          start measuring.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight mb-12">
          Everything you need for better hiring decisions
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AssInt - Assessment Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
