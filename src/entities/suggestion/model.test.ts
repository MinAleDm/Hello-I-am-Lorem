import { describe, expect, it } from "vitest";
import { createInitialBehaviorSignals } from "@/entities/behavior/model";
import { applySuggestionEffect, evaluateSuggestions } from "@/entities/suggestion/model";
import { createDraftFromTemplate, createSessionFromDraft } from "@/entities/session/model";
import type { FocusBoardStoreState } from "@/shared/types/focus-board";

function createBaseState(): FocusBoardStoreState {
  const { session, artifacts } = createSessionFromDraft(createDraftFromTemplate("product-strategy"));

  return {
    stage: "workspace",
    session,
    artifacts,
    behavior: createInitialBehaviorSignals(),
    workspace: {
      density: "comfortable",
      compareMode: false,
      pinnedPanels: ["brief", "decision"],
      collapsedSections: [],
      frozenLayout: false,
      highlightedCriteria: false,
      prioritySection: null,
      summaryReady: false,
    },
    suggestions: [],
    disabledSuggestionTypes: [],
    undoStack: [],
    lastActionNote: null,
    startedAt: new Date().toISOString(),
  };
}

describe("suggestion engine", () => {
  it("suggests pinning insights after repeated reopens", () => {
    const state = createBaseState();
    state.behavior.sectionReopens.insights = 2;

    const suggestions = evaluateSuggestions(state);

    expect(suggestions.some((suggestion) => suggestion.type === "pin-insights")).toBe(true);
  });

  it("applies compare mode suggestion deterministically", () => {
    const state = createBaseState();
    const effect = applySuggestionEffect("open-compare-mode", state.workspace, state.artifacts!);

    expect(effect.workspace.compareMode).toBe(true);
    expect(effect.note).toContain("Режим сравнения");
  });
});
