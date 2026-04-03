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
      return "You are spending longer with the evidence, so the workspace is leaning toward review support.";
    case "comparing":
      return "You are weighing options side by side, so comparison support matters more right now.";
    case "deciding":
      return "You are moving from analysis into commitment, so summary and rationale support are more useful.";
    case "finalizing":
      return "The session is close to complete. FocusBoard is keeping the final rationale and next step in view.";
    case "scanning":
    default:
      return "You are still shaping the problem space. The workspace stays broad, stable, and easy to scan.";
  }
}

export function getLearnedTendencies(behavior: BehaviorSignals) {
  const tendencies: string[] = [];

  if ((behavior.sectionReopens.insights ?? 0) >= 2) {
    tendencies.push("You tend to revisit insights before narrowing options.");
  }

  if (behavior.compareActions >= 3) {
    tendencies.push("You make progress by comparing options directly rather than reading them in isolation.");
  }

  if (behavior.layoutToggles >= 2) {
    tendencies.push("You actively tune the workspace, so layout preferences are worth preserving.");
  }

  if (behavior.noteEdits >= 2) {
    tendencies.push("You refine the decision note iteratively before committing.");
  }

  if (!tendencies.length) {
    tendencies.push("This session stayed relatively light, so FocusBoard kept the workspace calm and unchanged.");
  }

  return tendencies;
}
