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
        note: "Инсайты закреплены, чтобы аргументы оставались на виду.",
      };
    case "compact-density":
      return {
        workspace: {
          ...workspace,
          density: "compact",
        },
        artifacts,
        note: "Рабочая область переключена на компактную плотность.",
      };
    case "open-compare-mode":
      return {
        workspace: {
          ...workspace,
          compareMode: true,
        },
        artifacts,
        note: "Режим сравнения включён.",
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
        note: "Вспомогательные разделы свернуты.",
      };
    case "highlight-decision-criteria":
      return {
        workspace: {
          ...workspace,
          highlightedCriteria: true,
        },
        artifacts,
        note: "Критерии решения теперь подсвечены.",
      };
    case "freeze-layout":
      return {
        workspace: {
          ...workspace,
          frozenLayout: true,
        },
        artifacts,
        note: "Текущая компоновка зафиксирована.",
      };
    case "surface-recommendation":
      return {
        workspace: {
          ...workspace,
          prioritySection: "recommendation",
          collapsedSections: workspace.collapsedSections.filter((section) => section !== "recommendation"),
        },
        artifacts,
        note: "Блок с рекомендацией поднят выше.",
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
            `${artifacts.summary}\n\nРешение: ${artifacts.finalDecision || "Ещё не зафиксировано"}\n` +
            `Почему этот путь: ${artifacts.rationale || "Обоснование ещё уточняется."}\n` +
            `Следующий шаг: ${artifacts.nextStep || "Следующий шаг пока не задан."}`,
        },
        stage: "summary",
        note: "Финальное резюме по решению подготовлено.",
      };
    default:
      return {
        workspace,
        artifacts,
        note: "Изменения не применены.",
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
