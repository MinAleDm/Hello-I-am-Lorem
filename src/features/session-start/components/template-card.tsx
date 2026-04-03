import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Surface } from "@/shared/ui/surface";
import { cn } from "@/shared/lib/cn";
import type { SessionTemplate } from "@/shared/types/focus-board";

interface TemplateCardProps {
  template: SessionTemplate;
  selected: boolean;
  onSelect: () => void;
}

export function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button className="text-left" type="button" onClick={onSelect}>
      <Surface
        className={cn(
          "h-full rounded-[20px] p-4 transition",
          selected
            ? "border-ink-950/18 bg-mist-50"
            : "hover:border-ink-950/16 hover:bg-mist-50",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <Badge tone={selected ? "sage" : "neutral"}>{template.eyebrow}</Badge>
          <ArrowUpRight className="h-4 w-4 text-ink-950/28" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-ink-950">{template.label}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-950/60">{template.description}</p>
      </Surface>
    </button>
  );
}
