import { ChevronDown, ChevronUp } from "lucide-react";
import { useSectionDwell } from "@/shared/hooks/use-section-dwell";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import type { PropsWithChildren } from "react";
import type { WorkspaceSectionKey } from "@/shared/types/focus-board";

interface AnalysisSectionProps {
  id: WorkspaceSectionKey;
  title: string;
  eyebrow: string;
  collapsed: boolean;
  highlighted?: boolean;
  onToggle: () => void;
  onDwell: (durationMs: number) => void;
}

export function AnalysisSection({
  title,
  eyebrow,
  collapsed,
  highlighted = false,
  onToggle,
  onDwell,
  children,
}: PropsWithChildren<AnalysisSectionProps>) {
  const dwellBindings = useSectionDwell(onDwell);

  return (
    <section
      className={cn(
        "border-b border-ink-950/8 py-7 first:pt-0 last:border-b-0 last:pb-0",
        highlighted && "border-ink-950/18",
      )}
      {...dwellBindings}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-950/42">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink-950">{title}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          {collapsed ? "Expand" : "Collapse"}
        </Button>
      </div>

      {!collapsed ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
