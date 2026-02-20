import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, List } from "lucide-react";
import {
  ASSESSMENT_LIST,
  COLOR_MAP,
  ICON_LABEL,
  type AssessmentCategory,
} from "@/lib/assessments-data";
import { LogoIcon } from "@/components/brand/logo-icon";

export const metadata: Metadata = {
  title: "Assessment Library | Kaleo",
  description:
    "Six psychometrically validated assessments — personality, cognitive ability, reasoning, and vocational interest — ready to deploy in minutes.",
};

const CATEGORIES: AssessmentCategory[] = [
  "Interest",
  "Cognitive",
  "Reasoning",
  "Personality",
];

// ── Page (Server Component) ───────────────────────────────────────────────────
export default function AssessmentLibraryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Header / Nav ── */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoIcon size={28} theme="light" />
            <span className="text-base font-bold text-stone-900 tracking-tight">Kaleo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Home
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

      {/* ── Hero ── */}
      <section className="bg-stone-50 border-b border-stone-200 py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-600 mb-4">
            Psychometric Instruments
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight max-w-2xl">
            Assessment Library
          </h1>
          <p className="mt-5 text-lg text-stone-600 max-w-2xl leading-relaxed">
            Six validated instruments covering personality, cognitive ability,
            vocational interest, and reasoning — each ready to deploy in minutes
            and scored automatically by AI.
          </p>

          {/* Category filter pills (visual only — full filter would need client state) */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white">
              All
            </span>
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ASSESSMENT_LIST.map((assessment) => {
              const colors = COLOR_MAP[assessment.color];
              const initials = ICON_LABEL[assessment.slug];

              return (
                <Link
                  key={assessment.slug}
                  href={`/assessments-library/${assessment.slug}`}
                  className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200"
                >
                  {/* Icon badge */}
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg}`}
                  >
                    <span className={`text-sm font-black ${colors.iconText}`}>
                      {initials}
                    </span>
                  </div>

                  {/* Category tag */}
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${colors.badge} ${colors.badgeBorder} ${colors.accentText}`}
                    >
                      {assessment.category}
                    </span>
                  </div>

                  {/* Name + tagline */}
                  <h2 className="text-base font-bold text-stone-900 mb-1.5 leading-snug">
                    {assessment.name}
                  </h2>
                  <p className="text-sm text-stone-500 leading-relaxed flex-1">
                    {assessment.tagline}
                  </p>

                  {/* Chips */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                      <Clock className="h-3 w-3" />
                      {assessment.duration}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                      <List className="h-3 w-3" />
                      {assessment.questions}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {assessment.jobLevel}
                    </span>
                  </div>

                  {/* Learn more arrow */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-stone-400 group-hover:text-amber-600 transition-colors">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-stone-900 px-8 py-12 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-400 mb-3">
                Ready to deploy?
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Start assessing candidates
                <br className="hidden sm:block" /> with science-backed tools.
              </h2>
              <p className="mt-3 text-sm text-stone-400 max-w-md leading-relaxed">
                All six instruments are available on every plan. Set up your
                first battery in under 5 minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-700 px-6 py-3 text-sm font-semibold text-stone-300 hover:border-stone-500 hover:text-white transition-colors whitespace-nowrap"
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon size={24} theme="dark" />
            <span className="text-sm font-bold text-white tracking-tight">Kaleo</span>
          </Link>
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Kaleo. All rights reserved.
          </p>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Home
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
