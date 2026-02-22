"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Mic, ArrowRight, UserCircle2 } from "lucide-react";

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

        {/* Interview-in-progress card — split-screen video interview mockup */}
        <div
          className="rounded-2xl border overflow-hidden max-w-2xl mb-10"
          style={{ backgroundColor: "#0d0d0d", borderColor: "#44403C" }}
          aria-label="AI Video Interview interface preview"
          role="img"
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ backgroundColor: "#292524", borderColor: "#44403C" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>
              <span className="text-xs text-stone-400">Question 1 of 4</span>
            </div>
            <span className="text-xs text-stone-500 font-mono tabular-nums">0:42</span>
          </div>

          {/* Split screen */}
          <div className="flex">
            {/* Left: candidate video feed */}
            <div className="w-1/2 bg-black relative overflow-hidden" style={{ height: "300px" }}>
              <img 
                src="/ai-interview-candidate.png"
                alt="Interview candidate"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* "You" label */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded z-10">
                You
              </div>
              {/* Mic indicator */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded z-10">
                <Mic className="h-3 w-3" />
                <span>Live</span>
              </div>
            </div>

            {/* Right: AI interviewer panel */}
            <div
              className="w-1/2 flex flex-col items-center justify-center p-5 gap-3"
              style={{ backgroundColor: "#1a1715" }}
            >
              {/* AI avatar */}
              <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-400">AI</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                AI Interviewer
              </p>
              {/* Animated waveform */}
              <div className="flex items-center gap-1 h-5">
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
              {/* Current question */}
              <p className="text-xs text-stone-300 text-center leading-relaxed max-w-[180px]">
                &ldquo;{DEMO_QUESTIONS[0]}&rdquo;
              </p>
            </div>
          </div>

          {/* Bottom bar: listening + done button */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-t"
            style={{ backgroundColor: "#292524", borderColor: "#44403C" }}
          >
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
              <Mic className="h-3 w-3" />
              Listening…
            </div>
            <div className="ml-auto">
              <span className="text-xs bg-stone-700 text-stone-300 px-3 py-1 rounded cursor-default select-none">
                Done Answering
              </span>
            </div>
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
            <UserCircle2 className="h-5 w-5" />
            Begin video interview
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
