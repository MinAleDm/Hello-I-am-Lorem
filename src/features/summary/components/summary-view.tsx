import { ArrowLeft, CheckCheck, Clock3, EyeOff, Settings2 } from "lucide-react";
import { getLearnedTendencies } from "@/entities/behavior/selectors";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Surface } from "@/shared/ui/surface";
import { formatDateTime } from "@/shared/lib/time";
import type { BehaviorSignals, DecisionArtifacts, Session, Suggestion, WorkspaceState } from "@/shared/types/focus-board";

interface SummaryViewProps {
  session: Session;
  artifacts: DecisionArtifacts;
  suggestions: Suggestion[];
  behavior: BehaviorSignals;
  workspace: WorkspaceState;
  onBack: () => void;
  onReset: () => void;
}

export function SummaryView({
  session,
  artifacts,
  suggestions,
  behavior,
  workspace,
  onBack,
  onReset,
}: SummaryViewProps) {
  const accepted = suggestions.filter((suggestion) => suggestion.status === "applied");
  const dismissed = suggestions.filter((suggestion) => suggestion.status === "dismissed");
  const disabled = suggestions.filter((suggestion) => suggestion.status === "disabled");
  const tendencies = getLearnedTendencies(behavior);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-950/42">
            Session summary
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink-950 sm:text-5xl">{session.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to workspace
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Start a new session
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface className="rounded-[24px] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sage">{session.outputFormat}</Badge>
            <Badge>Local-first</Badge>
            <Badge>Explainable suggestions</Badge>
          </div>
          <p className="mt-5 text-lg leading-8 text-ink-950/72">{artifacts.summary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SummaryMetric label="Template" value={session.template.replace("-", " ")} />
            <SummaryMetric label="Last updated" value={formatDateTime(session.updatedAt)} />
            <SummaryMetric label="Shortlisted options" value={String(artifacts.shortlistedOptions.length)} />
            <SummaryMetric label="Pinned panels" value={workspace.pinnedPanels.join(", ")} />
          </div>
        </Surface>

        <Surface className="rounded-[24px] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
            <Clock3 className="h-3.5 w-3.5" />
            Final decision
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-ink-950">{artifacts.finalDecision || "Still in progress"}</h2>
          <p className="mt-4 text-sm leading-7 text-ink-950/66">{artifacts.rationale}</p>
          <div className="mt-6 border-t border-ink-950/8 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">Next step</p>
            <p className="mt-2 text-sm leading-6 text-ink-950/68">{artifacts.nextStep}</p>
          </div>
        </Surface>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.1fr_0.95fr]">
        <Surface className="rounded-[24px] p-6">
          <h3 className="text-2xl font-semibold text-ink-950">Session brief</h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-ink-950/68">
            <p>{session.decisionQuestion}</p>
            <div>
              <p className="font-semibold text-ink-950">Priorities</p>
              <ul className="mt-2 space-y-2">
                {session.priorities.map((priority) => (
                  <li key={priority}>• {priority}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-950">Constraints</p>
              <ul className="mt-2 space-y-2">
                {session.constraints.map((constraint) => (
                  <li key={constraint}>• {constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </Surface>

        <Surface className="rounded-[24px] p-6">
          <h3 className="text-2xl font-semibold text-ink-950">Key insights and recommendation</h3>
          <div className="mt-5 space-y-4">
            {artifacts.insights.map((insight) => (
              <div key={insight.id} className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
                <Badge tone="neutral">{insight.weight}</Badge>
                <p className="mt-3 font-semibold text-ink-950">{insight.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink-950/64">{insight.body}</p>
              </div>
            ))}
            <div className="border-t border-ink-950/8 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">Recommendation</p>
              <p className="mt-3 text-sm leading-6 text-ink-950">{artifacts.recommendation}</p>
            </div>
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="rounded-[24px] p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
              <CheckCheck className="h-3.5 w-3.5" />
              Suggestion outcomes
            </div>
            <div className="mt-5 space-y-4">
              <SuggestionGroup title="Accepted" items={accepted} emptyText="No suggestions were applied in this session." />
              <SuggestionGroup title="Dismissed" items={dismissed} emptyText="No suggestions were dismissed." />
              <SuggestionGroup title="Disabled" items={disabled} emptyText="No suggestion types were disabled." />
            </div>
          </Surface>

          <Surface className="rounded-[24px] p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
              <Settings2 className="h-3.5 w-3.5" />
              Learned tendencies
            </div>
            <div className="mt-5 space-y-3">
              {tendencies.map((tendency) => (
                <div key={tendency} className="border-t border-ink-950/8 pt-3 first:border-t-0 first:pt-0">
                  <p className="text-sm leading-6 text-ink-950/68">{tendency}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-ink-950/8 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                <EyeOff className="h-4 w-4" />
                Saved workspace preferences
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-950/62">
                Density: {workspace.density}. Compare mode: {workspace.compareMode ? "on" : "off"}. Frozen layout:{" "}
                {workspace.frozenLayout ? "yes" : "no"}.
              </p>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-ink-950/8 px-0 py-3 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink-950">{value}</p>
    </div>
  );
}

function SuggestionGroup({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Suggestion[];
  emptyText: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-950">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="border-t border-ink-950/8 pt-3 first:border-t-0 first:pt-0">
              <p className="text-sm font-semibold text-ink-950">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-ink-950/62">{item.reason}</p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-ink-950/56">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
