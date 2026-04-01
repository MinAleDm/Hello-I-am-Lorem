const stateModel = require("../src/scripts/core/state.js");
const tracker = require("../src/scripts/core/behavior-tracker.js");
const engine = require("../src/scripts/core/adaptation-engine.js");

describe("deterministic adaptation engine", () => {
    function createState() {
        return stateModel.createInitialState({
            history: [],
            preferences: {}
        });
    }

    test("pins history after repeated returns", () => {
        const state = createState();

        tracker.registerSectionOpen(state.behavior, "history", 1000);
        tracker.registerSectionOpen(state.behavior, "history", 2000);

        const event = engine.evaluateAutomaticAdaptation(state);

        expect(event.ruleId).toBe("layout.pin-history");
        expect(state.ui.pinnedSections).toContain("history");
        expect(state.ui.ordering[1]).toBe("history");
        expect(state.reasoningLog[0].reason).toContain("reopened session history");
    });

    test("switches to compact density for fast scanning behavior", () => {
        const state = createState();

        tracker.registerSectionClick(state.behavior, "signal", 1000);
        tracker.registerSectionOpen(state.behavior, "signal", 1100);
        tracker.registerSectionClick(state.behavior, "insights", 1200);
        tracker.registerSectionOpen(state.behavior, "insights", 1300);
        tracker.registerSectionClick(state.behavior, "behavior", 1400);
        tracker.registerSectionOpen(state.behavior, "behavior", 1500);
        tracker.registerSectionClick(state.behavior, "reasoning", 1600);
        tracker.registerScroll(state.behavior, { deltaY: 120, depth: 20 }, 1700);
        tracker.registerScroll(state.behavior, { deltaY: 150, depth: 35 }, 2000);
        tracker.registerScroll(state.behavior, { deltaY: 160, depth: 48 }, 2300);
        tracker.registerScroll(state.behavior, { deltaY: -100, depth: 28 }, 2500);

        const event = engine.evaluateAutomaticAdaptation(state);

        expect(event.ruleId).toBe("density.compact-scan");
        expect(state.ui.density).toBe("compact");
        expect(state.ui.emphasisSection).toBe("suggestions");
    });

    test("undo and disable similar work on reasoning events", () => {
        const state = createState();

        tracker.registerModeSwitch(state.behavior);
        tracker.registerModeSwitch(state.behavior);
        const event = engine.applyRule(state, "controls.reveal-advanced", {
            source: "manual",
            force: true,
            timestamp: "2026-04-01T10:00:00.000Z"
        });

        expect(state.ui.showAdvancedControls).toBe(true);

        engine.undoAdaptation(state, event.id);
        expect(state.ui.showAdvancedControls).toBe(false);
        expect(state.reasoningLog[0].status).toBe("undone");

        engine.disableSimilar(state, event.id);
        expect(state.ui.disabledRuleIds).toContain("controls.reveal-advanced");
        expect(state.reasoningLog[0].status).toBe("disabled");
    });

    test("builds adaptive suggestions without ML guesses", () => {
        const state = createState();

        tracker.registerSectionOpen(state.behavior, "history", 1000);
        tracker.registerModeSwitch(state.behavior);
        tracker.registerModeSwitch(state.behavior);

        const suggestions = engine.evaluateAdaptiveSuggestions(state);

        expect(suggestions.map((item) => item.ruleId)).toEqual(
            expect.arrayContaining(["layout.pin-history", "controls.reveal-advanced"])
        );
    });
});
