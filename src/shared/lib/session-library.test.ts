import { describe, expect, it } from "vitest";
import { createDraftFromTemplate, createSessionFromDraft } from "@/entities/session/model";
import {
  buildSessionMarkdown,
  createSessionSnapshot,
  duplicateSessionSnapshot,
  parseSessionSnapshot,
  serializeSessionSnapshot,
} from "@/shared/lib/session-library";

function createSnapshot() {
  const { session, artifacts } = createSessionFromDraft(createDraftFromTemplate("product-strategy"));

  return createSessionSnapshot({
    session,
    artifacts,
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
    behavior: {
      scrollBursts: 1,
      dwellBySection: {},
      sectionReopens: {},
      compareActions: 2,
      noteEdits: 1,
      layoutToggles: 0,
      optionSwitches: 1,
      lastScrollAt: null,
    },
    suggestions: [],
    disabledSuggestionTypes: [],
    startedAt: session.createdAt,
    savedAt: session.updatedAt,
  });
}

describe("session library helpers", () => {
  it("serializes and parses snapshot exports", () => {
    const snapshot = createSnapshot();

    const parsed = parseSessionSnapshot(serializeSessionSnapshot(snapshot));

    expect(parsed.session.id).toBe(snapshot.session.id);
    expect(parsed.artifacts.options).toHaveLength(snapshot.artifacts.options.length);
  });

  it("duplicates a snapshot into a new session identity", () => {
    const snapshot = createSnapshot();
    const duplicate = duplicateSessionSnapshot(snapshot);

    expect(duplicate.session.id).not.toBe(snapshot.session.id);
    expect(duplicate.session.title).toContain("копия");
  });

  it("builds a markdown export with the key sections", () => {
    const snapshot = createSnapshot();
    const markdown = buildSessionMarkdown(snapshot);

    expect(markdown).toContain("# Определить фокус следующего релиза FocusBoard");
    expect(markdown).toContain("## Финальное решение");
    expect(markdown).toContain("## Варианты");
  });
});
