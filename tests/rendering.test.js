const renderer = require("../src/scripts/renderers/app-renderer.js");
const stateModel = require("../src/scripts/core/state.js");
const content = require("../src/scripts/core/content.js");

describe("key rendering flows", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <span id="statsSavedSessions"></span>
            <span id="statsKeptAdaptations"></span>
            <span id="statsPreferredMode"></span>
            <span id="statsPinnedBlocks"></span>
            <span id="currentPatternLabel"></span>
            <span id="currentPatternSummary"></span>
            <span id="sessionStatus"></span>
            <span id="currentModeTone"></span>
            <span id="heroReason"></span>
            <span id="signalTitle"></span>
            <span id="signalSummary"></span>
            <span id="signalStatus"></span>
            <span id="signalNextMove"></span>
            <div id="insightsList"></div>
            <div id="suggestionsList"></div>
            <ul id="memoryList"></ul>
            <div id="behaviorStats"></div>
            <div id="reasoningList"></div>
            <div id="historyList"></div>
            <div id="controlsSummary"></div>
            <div id="manualPins"></div>
            <button id="startSessionButton"></button>
            <input id="adaptationToggle" type="checkbox">
            <input id="layoutLockToggle" type="checkbox">
            <button id="undoLastButton"></button>
            <button data-mode-select="focus"></button>
            <button data-mode-select="explore"></button>
            <button data-intent-select="clarify"></button>
            <button data-intent-select="sensemaking"></button>
            <button data-density-select="comfortable"></button>
            <button data-density-select="compact"></button>
            <button data-pin-target="history"></button>
            <button data-pin-target="reasoning"></button>
            <section data-section="signal"><button data-toggle-section="signal"></button><div data-section-content></div></section>
            <section data-section="suggestions"><button data-toggle-section="suggestions"></button><div data-section-content></div></section>
            <section data-section="insights"><button data-toggle-section="insights"></button><div data-section-content></div></section>
            <section data-section="reasoning"><button data-toggle-section="reasoning"></button><div data-section-content></div></section>
            <section data-section="memory"><button data-toggle-section="memory"></button><div data-section-content></div></section>
            <section data-section="behavior"><button data-toggle-section="behavior"></button><div data-section-content></div></section>
            <section data-section="history"><button data-toggle-section="history"></button><div data-section-content></div></section>
            <section data-section="controls"><button data-toggle-section="controls"></button><div data-section-content></div></section>
        `;
    });

    test("renders suggestions, reasoning actions and advanced controls state", () => {
        const state = stateModel.createInitialState({
            history: [{
                id: "session-1",
                headline: "Mira / Reflect",
                summary: "Signal summary",
                createdAt: "2026-04-01T09:00:00.000Z"
            }],
            preferences: {
                showAdvancedControls: true,
                pinnedSections: ["history"]
            }
        });

        state.session.activeMode = "reflect";
        state.ui.currentPattern = content.PATTERN_COPY.decision;
        state.ui.showAdvancedControls = true;
        state.suggestions = [{
            id: "suggest-decision",
            title: "Prioritize comparison aids",
            body: "Bring decision helpers forward.",
            ruleId: "suggestions.raise-decision",
            tone: "bright"
        }];
        state.reasoningLog = [{
            id: "event-1",
            ruleId: "suggestions.raise-decision",
            title: "Decision aids promoted",
            reason: "You compared several paths.",
            source: "system",
            timestamp: "2026-04-01T09:10:00.000Z",
            beforeUi: state.ui,
            afterUi: state.ui,
            status: "active"
        }];

        const elements = renderer.cacheElements(document);
        renderer.renderApp(document, state, elements);

        expect(document.body.dataset.advanced).toBe("true");
        expect(document.getElementById("currentPatternLabel").textContent).toBe("Decision mode");
        expect(document.getElementById("suggestionsList").textContent).toContain("Prioritize comparison aids");
        expect(document.getElementById("reasoningList").textContent).toContain("Decision aids promoted");
        expect(document.getElementById("reasoningList").querySelector("[data-reasoning-action=\"undo\"]")).not.toBeNull();
        expect(document.getElementById("manualPins").textContent).toContain("Session history");
    });
});
