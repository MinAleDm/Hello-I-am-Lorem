import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/cn";

interface BadgeProps {
  tone?: "neutral" | "sage" | "amber" | "rose";
  className?: string;
}

const toneClasses = {
  neutral: "border border-ink-950/8 bg-white text-ink-950/62",
  sage: "border border-ink-950/10 bg-mist-50 text-ink-950/72",
  amber: "border border-ink-950/10 bg-mist-50 text-ink-950/72",
  rose: "border border-ink-950/10 bg-mist-50 text-ink-950/72",
};

export function Badge({ children, tone = "neutral", className }: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
