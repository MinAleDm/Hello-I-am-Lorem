import { CheckCircle2, Circle, Goal, ListChecks } from "lucide-react";
import { EditableTextarea } from "@/shared/ui/editable-textarea";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Surface } from "@/shared/ui/surface";
import type { DecisionArtifacts, DecisionOption } from "@/shared/types/focus-board";

interface DecisionPanelProps {
  artifacts: DecisionArtifacts;
  options: DecisionOption[];
  decisionStatus: string;
  onFinalDecisionCommit: (value: string) => void;
  onRationaleCommit: (value: string) => void;
  onNextStepCommit: (value: string) => void;
  onQuickPick: (value: string) => void;
}

export function DecisionPanel({
  artifacts,
  options,
  decisionStatus,
  onFinalDecisionCommit,
  onRationaleCommit,
  onNextStepCommit,
  onQuickPick,
}: DecisionPanelProps) {
  return (
    <Surface className="rounded-[24px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
            <Goal className="h-3.5 w-3.5" />
            Decision panel
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">Move from evidence to commitment.</h3>
        </div>
        <Badge tone={artifacts.finalDecision ? "sage" : "neutral"}>{decisionStatus}</Badge>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
            <ListChecks className="h-3.5 w-3.5" />
            Shortlisted options
          </div>
          <div className="mt-3 space-y-2">
            {artifacts.shortlistedOptions.length ? (
              artifacts.shortlistedOptions.map((optionId) => {
                const option = options.find((entry) => entry.id === optionId);

                if (!option) {
                  return null;
                }

                return (
                  <div key={option.id} className="border-b border-ink-950/8 py-3 last:border-b-0">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink-950">{option.label}</p>
                        <p className="mt-1 text-sm text-ink-950/62">{option.verdict}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => onQuickPick(option.label)}>
                        Use
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border-b border-ink-950/8 py-3 text-sm text-ink-950/60">
                No shortlist yet. Promote one or two options from the analysis column before finalizing.
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">Chosen direction</p>
          <EditableTextarea
            value={artifacts.finalDecision}
            onCommit={onFinalDecisionCommit}
            rows={3}
            placeholder="Capture the choice in one confident sentence."
            className="mt-2"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">Rationale</p>
          <EditableTextarea
            value={artifacts.rationale}
            onCommit={onRationaleCommit}
            rows={5}
            placeholder="Why is this the right path?"
            className="mt-2"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">Next step</p>
          <EditableTextarea
            value={artifacts.nextStep}
            onCommit={onNextStepCommit}
            rows={4}
            placeholder="What should happen immediately after the decision?"
            className="mt-2"
          />
        </div>

        <div className="border-t border-ink-950/8 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-950">
            {artifacts.finalDecision ? (
              <CheckCircle2 className="h-4 w-4 text-ink-950" />
            ) : (
              <Circle className="h-4 w-4 text-ink-950/35" />
            )}
            Final decision readiness
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-950/64">
            {artifacts.finalDecision
              ? "The decision direction is captured. Tighten the rationale and next step, then move to the summary."
              : "The answer is not locked yet. Use the shortlist and recommendation to sharpen the final call."}
          </p>
        </div>
      </div>
    </Surface>
  );
}
