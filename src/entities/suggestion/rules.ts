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
      title: "Закрепить инсайты",
      description: "Оставить самые сильные аргументы на виду, пока вы пересматриваете варианты.",
      reason: "Вы несколько раз заново открывали раздел с инсайтами.",
      actionLabel: "Закрепить панель инсайтов",
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
      title: "Переключить на компактный вид",
      description: "Сделать отступы плотнее, чтобы всю рабочую область было легче быстро просматривать.",
      reason: "Вы быстро проходите по экрану и часто скроллите короткими рывками.",
      actionLabel: "Включить компактную плотность",
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
      title: "Открыть режим сравнения",
      description: "Положить варианты на одни и те же критерии, чтобы компромиссы были видны сразу.",
      reason: "Вы регулярно переключаетесь между вариантами и шорт-листом.",
      actionLabel: "Открыть таблицу сравнения",
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
      title: "Свернуть второстепенные детали",
      description: "Убрать вторичный материал, чтобы основная мысль читалась легче.",
      reason: "Сессия выглядит обзорной, а вспомогательные разделы всё ещё полностью раскрыты.",
      actionLabel: "Свернуть детали",
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
      title: "Подсветить критерии решения",
      description: "Вывести критерии оценки на первый план, чтобы каждый вариант оставался привязан к важному.",
      reason: "Вы часто переходите между компромиссами и вариантами, а значит критериям не хватает заметности.",
      actionLabel: "Подсветить критерии",
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
      title: "Зафиксировать текущую компоновку",
      description: "Сохранить текущую конфигурацию интерфейса, пока вы завершаете решение.",
      reason: "Вы уже несколько раз настраивали рабочую область, и похоже, что текущая компоновка вам подходит.",
      actionLabel: "Зафиксировать компоновку",
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
      title: "Поднять рекомендацию выше",
      description: "Закрепить рекомендуемый путь в заметной зоне, пока вы дописываете финальную формулировку.",
      reason: "Вы снова и снова возвращаетесь к блоку с рекомендацией, пока собираете окончательный ответ.",
      actionLabel: "Показать рекомендацию выше",
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
      title: "Собрать итог по решению",
      description: "Упаковать бриф, рекомендацию и обоснование в финальное резюме для просмотра.",
      reason: "Вы уже доработали заметку о решении после сравнения вариантов, а значит сессию можно подводить к финалу.",
      actionLabel: "Создать итог",
      impact: "high",
      confidence: 0.88,
      trigger,
    }),
  },
];
