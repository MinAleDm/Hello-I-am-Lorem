import { describe, expect, it } from "vitest";
import { createDraftFromTemplate, createSessionFromDraft } from "@/entities/session/model";

describe("session model", () => {
  it("creates a session and seeded artifacts from the selected template", () => {
    const draft = createDraftFromTemplate("product-strategy");
    const result = createSessionFromDraft(draft);

    expect(result.session.title).toBe("Определить фокус следующего релиза FocusBoard");
    expect(result.session.priorities.length).toBeGreaterThan(1);
    expect(result.artifacts.options.length).toBeGreaterThan(1);
    expect(result.artifacts.finalDecision).toContain("индивиду");
  });

  it("lets the draft override template text", () => {
    const draft = createDraftFromTemplate("career-decision");
    draft.title = "Выбрать следующую главу";
    draft.decisionQuestion = "Какая роль создаёт самую сильную траекторию на два года?";

    const result = createSessionFromDraft(draft);

    expect(result.session.title).toBe("Выбрать следующую главу");
    expect(result.session.decisionQuestion).toBe("Какая роль создаёт самую сильную траекторию на два года?");
  });
});
