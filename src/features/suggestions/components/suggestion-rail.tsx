import { motion } from "framer-motion";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Surface } from "@/shared/ui/surface";
import { formatConfidence } from "@/shared/lib/time";
import type { Suggestion } from "@/shared/types/focus-board";

interface SuggestionRailProps {
  pendingSuggestions: Suggestion[];
  onApply: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
  onDisableSimilar: (suggestionId: string) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function SuggestionRail({
  pendingSuggestions,
  onApply,
  onDismiss,
  onDisableSimilar,
  onUndo,
  canUndo,
}: SuggestionRailProps) {
  return (
    <div className="space-y-4">
      <Surface className="rounded-[24px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
              <Lightbulb className="h-3.5 w-3.5" />
              Suggestion rail
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-ink-950">Helpful, reversible nudges.</h3>
            <p className="mt-2 text-sm leading-6 text-ink-950/64">
              FocusBoard recommends light adjustments when the interaction pattern clearly points to one.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo}>
            <RotateCcw className="h-4 w-4" />
            Undo
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {pendingSuggestions.length ? (
            pendingSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.22 }}
              >
                <div className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      tone={
                        suggestion.impact === "high"
                          ? "amber"
                          : suggestion.impact === "medium"
                            ? "sage"
                            : "neutral"
                      }
                    >
                      {suggestion.impact} impact
                    </Badge>
                    <span className="text-xs text-ink-950/45">
                      Confidence {formatConfidence(suggestion.confidence)}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-ink-950">{suggestion.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-ink-950/64">{suggestion.description}</p>
                  <p className="mt-3 border-l-2 border-ink-950/10 pl-3 text-sm text-ink-950/72">
                    {suggestion.reason}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onApply(suggestion.id)}>
                      {suggestion.actionLabel}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onDismiss(suggestion.id)}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDisableSimilar(suggestion.id)}>
                      Disable similar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="border-t border-ink-950/8 pt-4">
              <p className="text-sm font-semibold text-ink-950">No active suggestions right now.</p>
              <p className="mt-2 text-sm leading-6 text-ink-950/60">
                The workspace stays calm until there is a clear, low-risk recommendation to make.
              </p>
            </div>
          )}
        </div>
      </Surface>
    </div>
  );
}
