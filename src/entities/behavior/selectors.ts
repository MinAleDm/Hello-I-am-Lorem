import type { BehaviorMode, BehaviorSignals, FocusBoardStoreState } from "@/shared/types/focus-board";

export function getBehaviorMode(
  behavior: BehaviorSignals,
  state: Pick<FocusBoardStoreState, "artifacts">,
): BehaviorMode {
  if (state.artifacts?.finalDecision && state.artifacts?.rationale && state.artifacts?.nextStep) {
    return "finalizing";
  }

  if (behavior.noteEdits >= 2 || behavior.sectionReopens.recommendation) {
    return "deciding";
  }

  if (behavior.compareActions >= 3 || behavior.optionSwitches >= 3) {
    return "comparing";
  }

  if ((behavior.dwellBySection.insights ?? 0) > 12000 || (behavior.dwellBySection.summary ?? 0) > 10000) {
    return "reviewing";
  }

  return "scanning";
}

export function getBehaviorCopy(mode: BehaviorMode) {
  switch (mode) {
    case "reviewing":
      return "Вы дольше работаете с доказательствами, поэтому интерфейс смещается в сторону спокойного разбора.";
    case "comparing":
      return "Сейчас вы сравниваете варианты бок о бок, поэтому поддержка сравнения становится важнее.";
    case "deciding":
      return "Вы переходите от анализа к выбору, поэтому особенно полезны итог и обоснование.";
    case "finalizing":
      return "Сессия почти завершена. FocusBoard удерживает в поле зрения финальное обоснование и следующий шаг.";
    case "scanning":
    default:
      return "Вы ещё очерчиваете пространство задачи. Рабочая область остаётся широкой, стабильной и удобной для обзора.";
  }
}

export function getLearnedTendencies(behavior: BehaviorSignals) {
  const tendencies: string[] = [];

  if ((behavior.sectionReopens.insights ?? 0) >= 2) {
    tendencies.push("Вы обычно возвращаетесь к инсайтам перед тем, как сузить набор вариантов.");
  }

  if (behavior.compareActions >= 3) {
    tendencies.push("Вы лучше продвигаетесь, когда сравниваете варианты напрямую, а не читаете их по отдельности.");
  }

  if (behavior.layoutToggles >= 2) {
    tendencies.push("Вы активно настраиваете рабочее пространство, поэтому ваши предпочтения по компоновке стоит сохранять.");
  }

  if (behavior.noteEdits >= 2) {
    tendencies.push("Перед финальным выбором вы обычно несколько раз уточняете формулировку решения.");
  }

  if (!tendencies.length) {
    tendencies.push("Сессия прошла спокойно, поэтому FocusBoard сохранил интерфейс без лишних изменений.");
  }

  return tendencies;
}
