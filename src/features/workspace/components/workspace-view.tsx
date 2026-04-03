import { useMemo } from "react";
import { ArrowLeft, ArrowRight, BrainCircuit, RefreshCcw } from "lucide-react";
import { getBehaviorCopy, getBehaviorMode } from "@/entities/behavior/selectors";
import { AnalysisSection } from "@/features/workspace/components/analysis-section";
import { BriefPanel } from "@/features/workspace/components/brief-panel";
import { OptionsCompareTable } from "@/features/workspace/components/options-compare-table";
import { DecisionPanel } from "@/features/decision-panel/components/decision-panel";
import { WorkspaceControls } from "@/features/preferences/components/workspace-controls";
import { SuggestionRail } from "@/features/suggestions/components/suggestion-rail";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EditableTextarea } from "@/shared/ui/editable-textarea";
import { Surface } from "@/shared/ui/surface";
import type { FocusBoardStoreState, PanelKey, WorkspaceSectionKey } from "@/shared/types/focus-board";

interface WorkspaceViewProps {
  state: FocusBoardStoreState;
  onBackToStart: () => void;
  onOpenSummary: () => void;
  onTitleCommit: (value: string) => void;
  onQuestionCommit: (value: string) => void;
  onPrioritiesCommit: (value: string[]) => void;
  onConstraintsCommit: (value: string[]) => void;
  onSummaryCommit: (value: string) => void;
  onRecommendationCommit: (value: string) => void;
  onNotesCommit: (value: string) => void;
  onFinalDecisionCommit: (value: string) => void;
  onRationaleCommit: (value: string) => void;
  onNextStepCommit: (value: string) => void;
  onToggleShortlist: (value: string) => void;
  onToggleSection: (section: WorkspaceSectionKey) => void;
  onSetDensity: () => void;
  onToggleCompare: () => void;
  onTogglePinnedPanel: (panel: PanelKey) => void;
  onToggleHighlightedCriteria: () => void;
  onToggleFrozenLayout: () => void;
  onRecordDwell: (section: WorkspaceSectionKey | PanelKey, durationMs: number) => void;
  onRecordCompareAction: () => void;
  onApplySuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onDisableSuggestion: (suggestionId: string) => void;
  onUndoSuggestion: () => void;
  onReset: () => void;
}

export function WorkspaceView({
  state,
  onBackToStart,
  onOpenSummary,
  onTitleCommit,
  onQuestionCommit,
  onPrioritiesCommit,
  onConstraintsCommit,
  onSummaryCommit,
  onRecommendationCommit,
  onNotesCommit,
  onFinalDecisionCommit,
  onRationaleCommit,
  onNextStepCommit,
  onToggleShortlist,
  onToggleSection,
  onSetDensity,
  onToggleCompare,
  onTogglePinnedPanel,
  onToggleHighlightedCriteria,
  onToggleFrozenLayout,
  onRecordDwell,
  onRecordCompareAction,
  onApplySuggestion,
  onDismissSuggestion,
  onDisableSuggestion,
  onUndoSuggestion,
  onReset,
}: WorkspaceViewProps) {
  if (!state.session || !state.artifacts) {
    return null;
  }

  const behaviorMode = getBehaviorMode(state.behavior, state);
  const behaviorCopy = getBehaviorCopy(behaviorMode);
  const pendingSuggestions = state.suggestions.filter((suggestion) => suggestion.status === "pending");
  const shortlisted = new Set(state.artifacts.shortlistedOptions);
  const decisionStatus = state.artifacts.finalDecision
    ? "Ready to ship"
    : shortlisted.size
      ? "Narrowing"
      : "Exploring";

  const pinnedInsights = useMemo(
    () => state.artifacts?.insights.slice(0, 2) ?? [],
    [state.artifacts],
  );

  return (
    <div className="mx-auto min-h-screen max-w-[1560px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-ink-950/8 pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="sage">FocusBoard workspace</Badge>
              <Badge>{behaviorMode}</Badge>
              <Badge>Stable by default</Badge>
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-ink-950 sm:text-5xl">{state.session.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-950/62">{behaviorCopy}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={onBackToStart}>
              <ArrowLeft className="h-4 w-4" />
              Setup
            </Button>
            <Button variant="secondary" onClick={onReset}>
              <RefreshCcw className="h-4 w-4" />
              New session
            </Button>
            <Button onClick={onOpenSummary}>
              Session summary
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <BriefPanel
            session={state.session}
            onTitleCommit={onTitleCommit}
            onQuestionCommit={onQuestionCommit}
            onPrioritiesCommit={onPrioritiesCommit}
            onConstraintsCommit={onConstraintsCommit}
          />
        </div>

        <Surface className="rounded-[24px] p-6 sm:p-8">
          <AnalysisSection
            id="summary"
            title="Summary"
            eyebrow="Current read"
            collapsed={state.workspace.collapsedSections.includes("summary")}
            highlighted={state.workspace.prioritySection === "summary"}
            onToggle={() => onToggleSection("summary")}
            onDwell={(duration) => onRecordDwell("summary", duration)}
          >
            <EditableTextarea value={state.artifacts.summary} onCommit={onSummaryCommit} rows={8} />
          </AnalysisSection>

          <AnalysisSection
            id="insights"
            title="Key insights"
            eyebrow="Evidence"
            collapsed={state.workspace.collapsedSections.includes("insights")}
            onToggle={() => onToggleSection("insights")}
            onDwell={(duration) => onRecordDwell("insights", duration)}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {state.artifacts.insights.map((insight) => (
                <div key={insight.id} className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-950/42">
                    {insight.weight}
                  </p>
                  <p className="mt-2 text-base font-semibold text-ink-950">{insight.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-950/62">{insight.body}</p>
                </div>
              ))}
            </div>
          </AnalysisSection>

          <AnalysisSection
            id="options"
            title="Options"
            eyebrow="Comparative view"
            collapsed={state.workspace.collapsedSections.includes("options")}
            onToggle={() => onToggleSection("options")}
            onDwell={(duration) => onRecordDwell("options", duration)}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              {state.artifacts.options.map((option) => (
                <div key={option.id} className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-ink-950">{option.label}</p>
                      <p className="mt-1 text-sm leading-6 text-ink-950/64">{option.summary}</p>
                    </div>
                    {shortlisted.has(option.id) ? <Badge tone="sage">Shortlisted</Badge> : null}
                  </div>

                  <p className="mt-4 text-sm font-semibold text-ink-950">Strengths</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-ink-950/64">
                    {option.pros.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>

                  <p className="mt-4 text-sm font-semibold text-ink-950">Tradeoffs</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-ink-950/64">
                    {option.cons.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={shortlisted.has(option.id) ? "secondary" : "primary"}
                      onClick={() => {
                        onToggleShortlist(option.id);
                        onRecordCompareAction();
                      }}
                    >
                      {shortlisted.has(option.id) ? "Remove from shortlist" : "Shortlist option"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onFinalDecisionCommit(option.label);
                        onRecordCompareAction();
                      }}
                    >
                      Use as chosen direction
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {state.workspace.compareMode ? (
              <OptionsCompareTable criteria={state.artifacts.criteria} options={state.artifacts.options} />
            ) : null}
          </AnalysisSection>

          <AnalysisSection
            id="tradeoffs"
            title="Tradeoffs"
            eyebrow="What this choice gives up"
            collapsed={state.workspace.collapsedSections.includes("tradeoffs")}
            onToggle={() => onToggleSection("tradeoffs")}
            onDwell={(duration) => onRecordDwell("tradeoffs", duration)}
          >
            <div className="grid gap-4">
              {state.artifacts.tradeoffs.map((tradeoff) => (
                <div key={tradeoff.id} className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
                  <p className="text-base font-semibold text-ink-950">{tradeoff.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-950/64">{tradeoff.summary}</p>
                </div>
              ))}
            </div>
          </AnalysisSection>

          <AnalysisSection
            id="risks"
            title="Risks"
            eyebrow="Watchouts"
            collapsed={state.workspace.collapsedSections.includes("risks")}
            onToggle={() => onToggleSection("risks")}
            onDwell={(duration) => onRecordDwell("risks", duration)}
          >
            <div className="grid gap-4">
              {state.artifacts.risks.map((risk) => (
                <div key={risk.id} className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
                  <p className="text-base font-semibold text-ink-950">{risk.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-950/64">{risk.mitigation}</p>
                </div>
              ))}
            </div>
          </AnalysisSection>

          <AnalysisSection
            id="recommendation"
            title="Recommendation"
            eyebrow="Recommended path"
            collapsed={state.workspace.collapsedSections.includes("recommendation")}
            highlighted={state.workspace.prioritySection === "recommendation"}
            onToggle={() => onToggleSection("recommendation")}
            onDwell={(duration) => onRecordDwell("recommendation", duration)}
          >
            <EditableTextarea value={state.artifacts.recommendation} onCommit={onRecommendationCommit} rows={6} />
          </AnalysisSection>

          <AnalysisSection
            id="notes"
            title="Notes"
            eyebrow="Working memory"
            collapsed={state.workspace.collapsedSections.includes("notes")}
            onToggle={() => onToggleSection("notes")}
            onDwell={(duration) => onRecordDwell("notes", duration)}
          >
            <EditableTextarea value={state.artifacts.notes} onCommit={onNotesCommit} rows={7} />
          </AnalysisSection>
        </Surface>

        <div className="space-y-6">
          {state.workspace.pinnedPanels.includes("insights") ? (
            <Surface className="rounded-[24px] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
                <BrainCircuit className="h-3.5 w-3.5" />
                Pinned insights
              </div>
              <div className="mt-4 space-y-3">
                {pinnedInsights.map((insight) => (
                  <div key={insight.id} className="border-t border-ink-950/8 pt-3 first:border-t-0 first:pt-0">
                    <p className="font-semibold text-ink-950">{insight.title}</p>
                    <p className="mt-2 text-sm leading-6 text-ink-950/64">{insight.body}</p>
                  </div>
                ))}
              </div>
            </Surface>
          ) : null}

          <DecisionPanel
            artifacts={state.artifacts}
            options={state.artifacts.options}
            decisionStatus={decisionStatus}
            onFinalDecisionCommit={onFinalDecisionCommit}
            onRationaleCommit={onRationaleCommit}
            onNextStepCommit={onNextStepCommit}
            onQuickPick={onFinalDecisionCommit}
          />

          <SuggestionRail
            pendingSuggestions={pendingSuggestions}
            onApply={onApplySuggestion}
            onDismiss={onDismissSuggestion}
            onDisableSimilar={onDisableSuggestion}
            onUndo={onUndoSuggestion}
            canUndo={state.undoStack.length > 0}
          />

          <WorkspaceControls
            workspace={state.workspace}
            onDensityToggle={onSetDensity}
            onCompareToggle={onToggleCompare}
            onFrozenToggle={onToggleFrozenLayout}
            onHighlightToggle={onToggleHighlightedCriteria}
            onPinInsights={() => onTogglePinnedPanel("insights")}
          />
        </div>
      </div>
    </div>
  );
}
