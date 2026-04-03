import type {
  FocusBoardStoreState,
  Suggestion,
  SuggestionTriggerMeta,
  SuggestionType,
} from "@/shared/types/focus-board";

interface SuggestionRule {
  type: SuggestionType;
  priority: number;
  shouldSuggest: (state: FocusBoardStoreState) => SuggestionTriggerMeta | null;
  build: (trigger: SuggestionTriggerMeta) => Omit<Suggestion, "id" | "createdAt" | "status">;
}

function hasSuggestion(state: FocusBoardStoreState, type: SuggestionType) {
  return state.suggestions.some((suggestion) => suggestion.type === type);
}

function canTrigger(state: FocusBoardStoreState, type: SuggestionType) {
  return !hasSuggestion(state, type) && !state.disabledSuggestionTypes.includes(type);
}

export const suggestionRules: SuggestionRule[] = [
  {
    type: "pin-insights",
    priority: 10,
    shouldSuggest: (state) => {
      const value = state.behavior.sectionReopens.insights ?? 0;

      if (
        value >= 2 &&
        !state.workspace.pinnedPanels.includes("insights") &&
        canTrigger(state, "pin-insights")
      ) {
        return {
          signal: "insights_reopened",
          value,
          threshold: 2,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "pin-insights",
      title: "Pin insights",
      description: "Keep the strongest evidence visible while you review options.",
      reason: "You reopened the insights section several times.",
      actionLabel: "Pin insights panel",
      impact: "low",
      confidence: 0.81,
      trigger,
    }),
  },
  {
    type: "compact-density",
    priority: 20,
    shouldSuggest: (state) => {
      const value = state.behavior.scrollBursts;

      if (
        value >= 3 &&
        state.workspace.density !== "compact" &&
        !state.workspace.frozenLayout &&
        canTrigger(state, "compact-density")
      ) {
        return {
          signal: "scroll_bursts",
          value,
          threshold: 3,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "compact-density",
      title: "Switch to compact view",
      description: "Tighten spacing so it takes less effort to scan the full workspace.",
      reason: "You moved through the workspace quickly and kept scrolling in short bursts.",
      actionLabel: "Use compact density",
      impact: "low",
      confidence: 0.74,
      trigger,
    }),
  },
  {
    type: "open-compare-mode",
    priority: 30,
    shouldSuggest: (state) => {
      const value = state.behavior.compareActions;

      if (
        value >= 3 &&
        !state.workspace.compareMode &&
        !state.workspace.frozenLayout &&
        canTrigger(state, "open-compare-mode")
      ) {
        return {
          signal: "compare_actions",
          value,
          threshold: 3,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "open-compare-mode",
      title: "Open compare mode",
      description: "Lay the options against the same criteria so tradeoffs stay visible.",
      reason: "You are repeatedly moving between options and shortlist decisions.",
      actionLabel: "Open compare view",
      impact: "medium",
      confidence: 0.83,
      trigger,
    }),
  },
  {
    type: "collapse-supporting-details",
    priority: 40,
    shouldSuggest: (state) => {
      const value = state.behavior.scrollBursts;
      const collapsed = state.workspace.collapsedSections;

      if (
        value >= 2 &&
        !collapsed.includes("risks") &&
        !collapsed.includes("notes") &&
        !state.workspace.frozenLayout &&
        canTrigger(state, "collapse-supporting-details")
      ) {
        return {
          signal: "supporting_details_visible",
          value,
          threshold: 2,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "collapse-supporting-details",
      title: "Collapse supporting details",
      description: "Tuck secondary detail away so the main argument stays easier to read.",
      reason: "The session looks scan-heavy, and the supporting sections are still fully open.",
      actionLabel: "Collapse details",
      impact: "low",
      confidence: 0.68,
      trigger,
    }),
  },
  {
    type: "highlight-decision-criteria",
    priority: 50,
    shouldSuggest: (state) => {
      const reopenCount = state.behavior.sectionReopens.tradeoffs ?? 0;
      const compareCount = state.behavior.compareActions;

      if (
        (reopenCount >= 2 || compareCount >= 2) &&
        !state.workspace.highlightedCriteria &&
        canTrigger(state, "highlight-decision-criteria")
      ) {
        return {
          signal: "criteria_reference",
          value: Math.max(reopenCount, compareCount),
          threshold: 2,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "highlight-decision-criteria",
      title: "Highlight decision criteria",
      description: "Bring the evaluation criteria forward so each option stays grounded in what matters.",
      reason: "You keep moving between tradeoffs and options, which usually means the criteria need more prominence.",
      actionLabel: "Highlight criteria",
      impact: "low",
      confidence: 0.79,
      trigger,
    }),
  },
  {
    type: "freeze-layout",
    priority: 60,
    shouldSuggest: (state) => {
      const value = state.behavior.layoutToggles;

      if (value >= 3 && !state.workspace.frozenLayout && canTrigger(state, "freeze-layout")) {
        return {
          signal: "layout_toggles",
          value,
          threshold: 3,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "freeze-layout",
      title: "Freeze current layout",
      description: "Hold the current workspace configuration steady while you finish the decision.",
      reason: "You have already tuned the workspace several times, which suggests the current layout is close to right.",
      actionLabel: "Freeze layout",
      impact: "medium",
      confidence: 0.77,
      trigger,
    }),
  },
  {
    type: "surface-recommendation",
    priority: 70,
    shouldSuggest: (state) => {
      const reopenCount = state.behavior.sectionReopens.recommendation ?? 0;
      const dwell = state.behavior.dwellBySection.recommendation ?? 0;

      if (
        (reopenCount >= 2 || dwell >= 12000) &&
        state.workspace.prioritySection !== "recommendation" &&
        canTrigger(state, "surface-recommendation")
      ) {
        return {
          signal: "recommendation_focus",
          value: Math.max(reopenCount, Math.round(dwell / 1000)),
          threshold: reopenCount >= 2 ? 2 : 12,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "surface-recommendation",
      title: "Surface the recommendation",
      description: "Keep the recommended path visibly anchored while you finalize the decision note.",
      reason: "You keep returning to the recommendation block as you shape the final answer.",
      actionLabel: "Bring recommendation forward",
      impact: "medium",
      confidence: 0.8,
      trigger,
    }),
  },
  {
    type: "generate-decision-summary",
    priority: 80,
    shouldSuggest: (state) => {
      const value = state.behavior.noteEdits;

      if (
        value >= 2 &&
        state.behavior.compareActions >= 2 &&
        Boolean(state.artifacts?.finalDecision) &&
        !state.workspace.summaryReady &&
        canTrigger(state, "generate-decision-summary")
      ) {
        return {
          signal: "decision_note_edits",
          value,
          threshold: 2,
        };
      }

      return null;
    },
    build: (trigger) => ({
      type: "generate-decision-summary",
      title: "Generate decision summary",
      description: "Package the brief, recommendation, and rationale into a final review-ready summary.",
      reason: "You have iterated on the decision note after comparing options, which usually means the session is ready to wrap up.",
      actionLabel: "Create summary",
      impact: "high",
      confidence: 0.88,
      trigger,
    }),
  },
];
