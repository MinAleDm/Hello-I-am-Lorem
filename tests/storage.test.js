const storage = require("../src/scripts/core/storage.js");

describe("local-first storage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("loadPreferences falls back to defaults when storage is empty", () => {
        expect(storage.loadPreferences()).toMatchObject({
            preferredMode: "focus",
            adaptationEnabled: true,
            lockedLayout: false,
            pinnedSections: []
        });
    });

    test("appendHistory prepends entries and caps the list", () => {
        for (let index = 0; index < storage.MAX_HISTORY_ITEMS + 3; index += 1) {
            storage.appendHistory({
                id: "session-" + index,
                headline: "Session " + index,
                createdAt: "2026-04-01T09:00:00.000Z"
            });
        }

        const history = storage.loadHistory();
        expect(history).toHaveLength(storage.MAX_HISTORY_ITEMS);
        expect(history[0].id).toBe("session-14");
        expect(history[history.length - 1].id).toBe("session-3");
    });

    test("mergePreferences keeps arrays safe and booleans predictable", () => {
        const merged = storage.mergePreferences({
            preferredMode: "decide",
            adaptationEnabled: false,
            disabledRuleIds: "wrong",
            pinnedSections: ["history"]
        });

        expect(merged).toEqual({
            preferredMode: "decide",
            adaptationEnabled: false,
            lockedLayout: false,
            density: "comfortable",
            ordering: null,
            pinnedSections: ["history"],
            disabledRuleIds: [],
            dismissedSuggestionIds: [],
            acceptedSuggestionIds: [],
            keptRuleIds: [],
            showAdvancedControls: false
        });
    });
});
