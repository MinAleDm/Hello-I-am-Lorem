import { LayoutTemplate, PanelTop, Pin, Shrink, Sparkle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Surface } from "@/shared/ui/surface";
import type { WorkspaceState } from "@/shared/types/focus-board";

interface WorkspaceControlsProps {
  workspace: WorkspaceState;
  onDensityToggle: () => void;
  onCompareToggle: () => void;
  onFrozenToggle: () => void;
  onHighlightToggle: () => void;
  onPinInsights: () => void;
}

export function WorkspaceControls({
  workspace,
  onDensityToggle,
  onCompareToggle,
  onFrozenToggle,
  onHighlightToggle,
  onPinInsights,
}: WorkspaceControlsProps) {
  return (
    <Surface className="rounded-[24px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Workspace controls
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">Stable layout settings</h3>
        </div>
        {workspace.frozenLayout ? <Badge tone="sage">Frozen</Badge> : null}
      </div>

      <div className="mt-5 grid gap-3">
        <ControlRow
          icon={Shrink}
          title={`Density: ${workspace.density}`}
          body="Switch between comfortable and compact spacing."
          actionLabel="Toggle density"
          onAction={onDensityToggle}
        />
        <ControlRow
          icon={PanelTop}
          title={workspace.compareMode ? "Compare mode is on" : "Compare mode is off"}
          body="Lay options against the same criteria when you want side-by-side evaluation."
          actionLabel={workspace.compareMode ? "Hide compare table" : "Show compare table"}
          onAction={onCompareToggle}
        />
        <ControlRow
          icon={Pin}
          title={workspace.pinnedPanels.includes("insights") ? "Insights are pinned" : "Pin insights"}
          body="Keep evidence visible in the right rail while you make the final call."
          actionLabel={workspace.pinnedPanels.includes("insights") ? "Unpin insights" : "Pin insights"}
          onAction={onPinInsights}
        />
        <ControlRow
          icon={Sparkle}
          title={workspace.highlightedCriteria ? "Criteria are highlighted" : "Highlight criteria"}
          body="Visually anchor what matters most during option review."
          actionLabel={workspace.highlightedCriteria ? "Remove highlight" : "Highlight criteria"}
          onAction={onHighlightToggle}
        />
        <ControlRow
          icon={LayoutTemplate}
          title={workspace.frozenLayout ? "Layout is frozen" : "Freeze current layout"}
          body="Hold the interface steady while you finish the recommendation."
          actionLabel={workspace.frozenLayout ? "Unfreeze" : "Freeze layout"}
          onAction={onFrozenToggle}
        />
      </div>
    </Surface>
  );
}

interface ControlRowProps {
  icon: typeof LayoutTemplate;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

function ControlRow({ icon: Icon, title, body, actionLabel, onAction }: ControlRowProps) {
  return (
    <div className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-full border border-ink-950/8 p-2">
            <Icon className="h-4 w-4 text-ink-950/65" />
          </div>
          <div>
            <p className="font-semibold text-ink-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-ink-950/60">{body}</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
