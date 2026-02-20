"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  Target,
  Settings,
  ChevronLeft,
  Menu,
  UserSearch,
  Kanban,
  CalendarCheck,
  Sparkles,
  Video,
  Bot,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { LogoIcon } from "@/components/brand/logo-icon";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline", href: "/pipeline", icon: Kanban },
  { title: "Candidates", href: "/candidates", icon: UserSearch },
  { title: "Assessments", href: "/assessments", icon: ClipboardList },
  { title: "Interviews", href: "/interviews", icon: CalendarCheck },
  { title: "Evaluators", href: "/evaluators", icon: Users },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Calibration", href: "/calibration", icon: Target },
  { title: "Video Interviews", href: "/async-interviews", icon: Video },
  { title: "AI Interviews", href: "/ai-interviews", icon: Bot },
  { title: "Inventory Tests", href: "/inventory", icon: FlaskConical },
  { title: "AI Co-Pilot", href: "/copilot", icon: Sparkles },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          "hidden lg:block"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {collapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center">
              <LogoIcon size={24} theme="light" />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <LogoIcon size={28} theme="light" />
              <span className="text-lg font-bold tracking-tight">Kaleo</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      {collapsed && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCollapsed(false)} />
          <aside className="absolute left-0 top-0 h-screen w-64 border-r bg-background">
            <div className="flex h-16 items-center px-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <LogoIcon size={28} theme="light" />
                <span className="text-lg font-bold tracking-tight">Kaleo</span>
              </Link>
            </div>
            <Separator />
            <nav className="flex flex-col gap-1 p-3">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setCollapsed(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
