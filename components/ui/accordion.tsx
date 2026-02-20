"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Accordion (native <details> based, no Radix dependency) ──────────────────

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type: _type, collapsible: _collapsible, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-0", className)} {...props} />
  )
);
Accordion.displayName = "Accordion";

interface AccordionItemProps extends React.HTMLAttributes<HTMLDetailsElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDetailsElement, AccordionItemProps>(
  ({ className, value: _value, ...props }, ref) => (
    <details
      ref={ref}
      className={cn("group border-b border-stone-200 last:border-b-0", className)}
      {...props}
    />
  )
);
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = React.HTMLAttributes<HTMLElement>;

const AccordionTrigger = React.forwardRef<HTMLElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <summary
      ref={ref as React.Ref<HTMLElement>}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between py-4 text-sm font-medium text-stone-900 transition-all hover:text-amber-600 list-none [&::-webkit-details-marker]:hidden",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
  )
);
AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pb-4 text-sm text-stone-600 leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  )
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
