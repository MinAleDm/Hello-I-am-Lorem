import { suggestionRules } from "@/entities/suggestion/rules";
import type {
  DecisionArtifacts,
  FocusBoardStoreState,
  Suggestion,
  SuggestionType,
  WorkspaceState,
} from "@/shared/types/focus-board";

export function evaluateSuggestions(state: FocusBoardStoreState) {
  const pendingCount = state.suggestions.filter((suggestion) => suggestion.status === "pending").length;

  if (pendingCount >= 3) {
    return state.suggestions;
  }

  const nextSuggestions = [...state.suggestions];

  suggestionRules
    .slice()
    .sort((left, right) => left.priority - right.priority)
    .forEach((rule) => {
      if (nextSuggestions.some((entry) => entry.type === rule.type)) {
        return;
      }

      const trigger = rule.shouldSuggest({
        ...state,
        suggestions: nextSuggestions,
      });

      if (!trigger) {
        return;
      }

      nextSuggestions.push({
        id: `${rule.type}-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        ...rule.build(trigger),
      });
    });

  return nextSuggestions;
}

export function applySuggestionEffect(
  type: SuggestionType,
  workspace: WorkspaceState,
  artifacts: DecisionArtifacts,
): {
  workspace: WorkspaceState;
  artifacts: DecisionArtifacts;
  stage?: "summary";
  note: string;
} {
  switch (type) {
    case "pin-insights":
      return {
        workspace: {
          ...workspace,
          pinnedPanels: workspace.pinnedPanels.includes("insights")
            ? workspace.pinnedPanels
            : [...workspace.pinnedPanels, "insights"],
        },
        artifacts,
        note: "Insights were pinned to keep the evidence in view.",
      };
    case "compact-density":
      return {
        workspace: {
          ...workspace,
          density: "compact",
        },
        artifacts,
        note: "The workspace switched to compact density.",
      };
    case "open-compare-mode":
      return {
        workspace: {
          ...workspace,
          compareMode: true,
        },
        artifacts,
        note: "Compare mode is now on.",
      };
    case "collapse-supporting-details":
      return {
        workspace: {
          ...workspace,
          collapsedSections: Array.from(
            new Set([...workspace.collapsedSections, "risks", "notes"]),
          ),
        },
        artifacts,
        note: "Supporting detail sections were collapsed.",
      };
    case "highlight-decision-criteria":
      return {
        workspace: {
          ...workspace,
          highlightedCriteria: true,
        },
        artifacts,
        note: "Decision criteria are now highlighted.",
      };
    case "freeze-layout":
      return {
        workspace: {
          ...workspace,
          frozenLayout: true,
        },
        artifacts,
        note: "The current layout is now frozen.",
      };
    case "surface-recommendation":
      return {
        workspace: {
          ...workspace,
          prioritySection: "recommendation",
          collapsedSections: workspace.collapsedSections.filter((section) => section !== "recommendation"),
        },
        artifacts,
        note: "The recommendation block was surfaced.",
      };
    case "generate-decision-summary":
      return {
        workspace: {
          ...workspace,
          summaryReady: true,
        },
        artifacts: {
          ...artifacts,
          summary:
            `${artifacts.summary}\n\nDecision: ${artifacts.finalDecision || "Still in progress"}\n` +
            `Why this path: ${artifacts.rationale || "Rationale still being refined."}\n` +
            `Next step: ${artifacts.nextStep || "Next step not set yet."}`,
        },
        stage: "summary",
        note: "A final decision summary was prepared.",
      };
    default:
      return {
        workspace,
        artifacts,
        note: "No change applied.",
      };
  }
}

export function updateSuggestionStatus(
  suggestions: Suggestion[],
  suggestionId: string,
  status: Suggestion["status"],
) {
  return suggestions.map((suggestion) =>
    suggestion.id === suggestionId ? { ...suggestion, status } : suggestion,
  );
}
