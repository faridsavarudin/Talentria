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
      <rect x="4" y="18" width="6" height="10" rx="2" fill={primary} opacity="0.45" />
      <rect x="13" y="11" width="6" height="17" rx="2" fill={primary} opacity="0.7" />
      <rect x="22" y="5" width="6" height="23" rx="2" fill={primary} />
      <circle cx="25" cy="3" r="2.25" fill={accent} />
      <path
        d="M7 17 L16 10 L25 4"
        stroke={primary}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 2"
        opacity="0.5"
      />
    </svg>
  );
}
