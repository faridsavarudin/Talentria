"use client";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  size?: number;
  theme?: "light" | "dark";
  className?: string;
}

export function LogoIcon({ size = 32, theme = "light", className }: LogoIconProps) {
  const primary = theme === "dark" ? "#818CF8" : "#6366F1";
  const accent = theme === "dark" ? "#FCD34D" : "#D97706";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-label="Kaleo logo"
      role="img"
    >
      {/* Source dot — the person / the voice */}
      <circle cx="7" cy="16" r="3" fill={accent} />

      {/* Arc 1 — inner, strong */}
      <path
        d="M13 9.5 Q17.5 16 13 22.5"
        stroke={primary}
        strokeWidth="2.25"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arc 2 — mid */}
      <path
        d="M17.5 6 Q24 16 17.5 26"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />

      {/* Arc 3 — outer, faintest */}
      <path
        d="M22 3 Q30.5 16 22 29"
        stroke={primary}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}
