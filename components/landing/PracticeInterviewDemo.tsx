"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";

const DEMO_QUESTIONS = [
  "Tell me about yourself and your background.",
  "Describe a challenging project you worked on. What was your role?",
  "How do you handle working under pressure or tight deadlines?",
  "Where do you see yourself in 5 years?",
];

export function PracticeInterviewDemo() {
  return (
    <section className="bg-[#1C1917] py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-400 mb-6">
          Try it now — no account needed
        </p>

        {/* Editorial headline */}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-8">
          What would you say<br />
          if the job started<br />
          today?
        </h2>

        {/* Body */}
        <p className="text-lg text-stone-300 max-w-lg mb-12">
          A 4-question AI-conducted interview. No scheduling. No judgment. Just practice.
        </p>

        {/* Interview-in-progress card */}
        <div
          className="rounded-2xl border p-6 max-w-lg mb-10"
          style={{ backgroundColor: "#292524", borderColor: "#44403C" }}
          aria-label="AI Interview interface preview"
          role="img"
        >
          {/* LIVE indicator */}
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded w-fit mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>

          {/* AI avatar + waveform */}
          <div className="flex flex-col items-start gap-2 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-400">AI</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  AI Interviewer
                </p>
                {/* Waveform */}
                <div className="flex items-center gap-1 mt-1.5 h-5">
                  {[0.5, 0.8, 1, 0.7, 0.4, 0.6, 0.9].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-amber-400"
                      style={{
                        height: `${Math.round(h * 18)}px`,
                        opacity: 0.6 + h * 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question preview */}
          <div className="bg-stone-900 rounded-xl p-4">
            <p className="text-xs text-stone-500 mb-1.5">Current question:</p>
            <p className="text-base text-stone-200 leading-relaxed">
              &ldquo;{DEMO_QUESTIONS[0]}&rdquo;
            </p>
          </div>
        </div>

        {/* CTA button */}
        <Link href="/demo">
          <button className="
            inline-flex items-center gap-3
            bg-amber-500 hover:bg-amber-400
            text-stone-900 font-bold text-lg
            px-8 py-4 rounded-xl
            transition-all duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_8px_24px_rgba(245,158,11,0.4)]
            group
            mb-6
          ">
            <Mic className="h-5 w-5" />
            Begin your interview
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 mb-10">
          {["No account required", "No video saved", "Runs in your browser", "Results in 60 seconds"].map((s, i) => (
            <Fragment key={s}>
              {i > 0 && <span className="text-stone-700" aria-hidden="true">·</span>}
              <span>{s}</span>
            </Fragment>
          ))}
        </div>

        {/* Questions preview */}
        <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
          {DEMO_QUESTIONS.map((q, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xs font-bold text-amber-500 mt-0.5 tabular-nums shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-stone-400">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
