import type {
  BehaviorMode,
  ImpactLevel,
  Insight,
  PanelKey,
  SessionTemplateId,
  WorkspaceDensity,
} from "@/shared/types/focus-board";

export function getTemplateLabel(templateId: SessionTemplateId) {
  switch (templateId) {
    case "product-strategy":
      return "Продуктовая стратегия";
    case "career-decision":
      return "Карьерное решение";
    case "ux-review":
      return "UX-ревью";
    case "compare-options":
      return "Сравнение вариантов";
    case "open-exploration":
      return "Открытое исследование";
    default:
      return templateId;
  }
}

export function getDensityLabel(density: WorkspaceDensity) {
  return density === "compact" ? "компактная" : "комфортная";
}

export function getPanelLabel(panel: PanelKey) {
  switch (panel) {
    case "brief":
      return "бриф";
    case "insights":
      return "инсайты";
    case "decision":
      return "решение";
    case "suggestions":
      return "подсказки";
    default:
      return panel;
  }
}

export function getBehaviorModeLabel(mode: BehaviorMode) {
  switch (mode) {
    case "reviewing":
      return "Разбор";
    case "comparing":
      return "Сравнение";
    case "deciding":
      return "Выбор";
    case "finalizing":
      return "Финал";
    case "scanning":
    default:
      return "Обзор";
  }
}

export function getImpactLabel(impact: ImpactLevel) {
  switch (impact) {
    case "high":
      return "Высокое влияние";
    case "medium":
      return "Среднее влияние";
    case "low":
    default:
      return "Низкое влияние";
  }
}

export function getInsightWeightLabel(weight: Insight["weight"]) {
  switch (weight) {
    case "Signal":
      return "Сигнал";
    case "Pattern":
      return "Паттерн";
    case "Constraint":
      return "Ограничение";
    default:
      return weight;
  }
}
