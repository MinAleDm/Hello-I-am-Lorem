import { describe, expect, it } from "vitest";
import { createDraftFromTemplate, createSessionFromDraft } from "@/entities/session/model";

describe("session model", () => {
  it("creates a session and seeded artifacts from the selected template", () => {
    const draft = createDraftFromTemplate("product-strategy");
    const result = createSessionFromDraft(draft);

    expect(result.session.title).toBe("Position the next FocusBoard release");
    expect(result.session.priorities.length).toBeGreaterThan(1);
    expect(result.artifacts.options.length).toBeGreaterThan(1);
    expect(result.artifacts.finalDecision).toContain("solo");
  });

  it("lets the draft override template text", () => {
    const draft = createDraftFromTemplate("career-decision");
    draft.title = "Choose the next chapter";
    draft.decisionQuestion = "Which role sets up the strongest two-year arc?";

    const result = createSessionFromDraft(draft);

    expect(result.session.title).toBe("Choose the next chapter");
    expect(result.session.decisionQuestion).toBe("Which role sets up the strongest two-year arc?");
  });
});
