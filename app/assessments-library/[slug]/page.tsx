import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  List,
  Briefcase,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  ASSESSMENTS,
  ASSESSMENT_SLUGS,
  COLOR_MAP,
  ICON_LABEL,
  ASSESSMENT_LIST,
} from "@/lib/assessments-data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// ── Static generation ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ASSESSMENT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assessment = ASSESSMENTS[slug];
  if (!assessment) return {};
  return {
    title: `${assessment.name} | AssInt Assessment Library`,
    description: assessment.tagline,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assessment = ASSESSMENTS[slug];
  if (!assessment) notFound();

  const colors = COLOR_MAP[assessment.color];
  const initials = ICON_LABEL[assessment.slug];

  // Related assessments (exclude current)
  const related = ASSESSMENT_LIST.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white font-black text-sm">
              A
            </div>
            <span className="text-base font-bold text-stone-900">AssInt</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/assessments-library"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Assessment Library
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Request a Demo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="border-b border-stone-100 bg-stone-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-stone-500">
            <Link href="/" className="hover:text-stone-700 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/assessments-library"
              className="hover:text-stone-700 transition-colors"
            >
              Assessment Library
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-stone-700 font-medium">{assessment.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="py-16 sm:py-20 border-b border-stone-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: identity + stats */}
            <div>
              <Link
                href="/assessments-library"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors mb-8"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Assessment Library
              </Link>

              {/* Icon + category */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.iconBg}`}
                >
                  <span className={`text-lg font-black ${colors.iconText}`}>
                    {initials}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${colors.badge} ${colors.badgeBorder} ${colors.accentText}`}
                >
                  {assessment.category}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight mb-4">
                {assessment.name}
              </h1>
              <p className="text-xl text-stone-600 leading-relaxed mb-8 max-w-lg">
                {assessment.tagline}
              </p>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
              >
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: stats card */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-6">
                Instrument Details
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: Clock,
                    label: "Duration",
                    value: assessment.duration,
                  },
                  {
                    icon: List,
                    label: "Items",
                    value: assessment.questions,
                  },
                  {
                    icon: Briefcase,
                    label: "Job Level",
                    value: assessment.jobLevel,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-stone-200 shrink-0">
                      <Icon className="h-4 w-4 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                        {label}
                      </p>
                      <p className="text-sm font-bold text-stone-900 mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-8 rounded-xl p-4 ${colors.badge} border ${colors.badgeBorder}`}>
                <p className={`text-xs font-semibold ${colors.accentText} mb-1`}>
                  Scoring
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  AI-scored with percentile rankings. Results available in your
                  dashboard within seconds of submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What It Measures ── */}
      <section className="py-16 sm:py-20 border-b border-stone-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">
              Dimensions
            </p>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-10">
              What It Measures
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {assessment.dimensions.map((dim) => (
                <div
                  key={dim.name}
                  className="rounded-xl border border-stone-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${colors.dot}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-stone-900 mb-1">
                        {dim.name}
                      </p>
                      <p className="text-sm text-stone-500 leading-relaxed">
                        {dim.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Use It ── */}
      <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">
                Business Value
              </p>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-6">
                Why Use It
              </h2>
              <ul className="space-y-4">
                {assessment.whyUseIt.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-stone-700 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">
                Ideal Users
              </p>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-6">
                Who It&apos;s For
              </h2>
              <ul className="space-y-3">
                {assessment.whoIsItFor.map((who) => (
                  <li key={who} className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${colors.dot}`}
                    />
                    <span className="text-stone-700 leading-relaxed">{who}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-20 border-b border-stone-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">
            Process
          </p>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-10">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {assessment.howItWorks.map((step, idx) => (
              <div key={idx}>
                <span className="text-6xl font-black text-stone-100 leading-none tabular-nums block select-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="w-8 h-0.5 bg-amber-500 mt-2 mb-4" />
                <p className="text-sm text-stone-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 border-b border-stone-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-10">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible>
              {assessment.faq.map((item, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Related assessments ── */}
      <section className="py-16 sm:py-20 bg-stone-50 border-b border-stone-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-stone-900">
              Other Instruments
            </h2>
            <Link
              href="/assessments-library"
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((a) => {
              const c = COLOR_MAP[a.color];
              return (
                <Link
                  key={a.slug}
                  href={`/assessments-library/${a.slug}`}
                  className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 hover:shadow-md hover:border-stone-300 transition-all"
                >
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}
                  >
                    <span className={`text-xs font-black ${c.iconText}`}>
                      {ICON_LABEL[a.slug]}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-stone-900 mb-1 leading-snug">
                    {a.name}
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed flex-1">
                    {a.tagline}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-stone-400 group-hover:text-amber-600 transition-colors">
                    Learn more
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 bg-stone-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-12 h-0.5 bg-amber-500 mb-8" />
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[0.97] mb-6">
            Ready to deploy{" "}
            <span className="text-amber-400">{assessment.name}</span>?
          </h2>
          <p className="text-lg text-stone-400 max-w-lg leading-relaxed mb-10">
            Set up your first candidate battery in under 5 minutes. No
            configuration needed — just select, invite, and review results.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
            >
              Start free — no card needed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/assessments-library"
              className="inline-flex items-center gap-2 rounded-md border border-stone-700 px-6 py-3.5 text-sm font-semibold text-stone-300 hover:border-stone-500 hover:text-white transition-colors"
            >
              Browse all assessments
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 border-t border-stone-800 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-600 text-white font-black text-xs">
              A
            </div>
            <span className="text-sm font-bold text-white">AssInt</span>
          </Link>
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} AssInt. All rights reserved.
          </p>
          <nav className="flex items-center gap-4">
            <Link
              href="/assessments-library"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Library
            </Link>
            <Link
              href="/#pricing"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/register"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
