(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(
            require("./content.js"),
            require("./behavior-tracker.js")
        );
    } else {
        root.ThinkingUIStudioState = factory(
            root.ThinkingUIStudioContent,
            root.ThinkingUIStudioBehaviorTracker
        );
    }
})(typeof window !== "undefined" ? window : globalThis, function (content, tracker) {
    function copyExpandedSections() {
        return Object.assign({}, content.DEFAULT_EXPANDED_SECTIONS);
    }

    function buildUiState(preferences) {
        const safePreferences = preferences || {};
        const ordering = content.DEFAULT_ORDER.slice();
        const pinnedSections = Array.isArray(safePreferences.pinnedSections)
            ? safePreferences.pinnedSections.slice()
            : [];

        pinnedSections.slice().reverse().forEach(function (sectionId) {
            const index = ordering.indexOf(sectionId);
            if (index >= 0) {
                ordering.splice(index, 1);
                ordering.unshift(sectionId);
            }
        });

        return {
            adaptationEnabled: safePreferences.adaptationEnabled !== false,
            lockedLayout: Boolean(safePreferences.lockedLayout),
            density: safePreferences.density || "comfortable",
            ordering: ordering,
            pinnedSections: pinnedSections,
            expandedSections: copyExpandedSections(),
            currentPattern: content.PATTERN_COPY.exploration,
            primaryCta: "start",
            emphasisSection: "signal",
            showAdvancedControls: Boolean(safePreferences.showAdvancedControls),
            disabledRuleIds: Array.isArray(safePreferences.disabledRuleIds)
                ? safePreferences.disabledRuleIds.slice()
                : []
        };
    }

    function createInitialState(options) {
        const preferences = options && options.preferences ? options.preferences : {};
        const history = options && Array.isArray(options.history) ? options.history : [];

        return {
            session: {
                profile: null,
                activeMode: preferences.preferredMode || "focus",
                activeIntent: "clarify",
                nameDraft: "",
                promptDraft: "",
                statusText: "Start a session to let the workspace adapt around your behavior."
            },
            ui: buildUiState(preferences),
            behavior: tracker.createBehaviorState(content.SECTION_KEYS),
            suggestions: [],
            reasoningLog: [],
            history: history,
            preferences: {
                preferredMode: preferences.preferredMode || "focus",
                dismissedSuggestionIds: Array.isArray(preferences.dismissedSuggestionIds)
                    ? preferences.dismissedSuggestionIds.slice()
                    : [],
                acceptedSuggestionIds: Array.isArray(preferences.acceptedSuggestionIds)
                    ? preferences.acceptedSuggestionIds.slice()
                    : [],
                keptRuleIds: Array.isArray(preferences.keptRuleIds)
                    ? preferences.keptRuleIds.slice()
                    : []
            }
        };
    }

    function syncPreferencesFromState(state) {
        return {
            preferredMode: state.session.activeMode,
            adaptationEnabled: state.ui.adaptationEnabled,
            lockedLayout: state.ui.lockedLayout,
            density: state.ui.density,
            pinnedSections: state.ui.pinnedSections.slice(),
            disabledRuleIds: state.ui.disabledRuleIds.slice(),
            dismissedSuggestionIds: state.preferences.dismissedSuggestionIds.slice(),
            acceptedSuggestionIds: state.preferences.acceptedSuggestionIds.slice(),
            keptRuleIds: state.preferences.keptRuleIds.slice(),
            showAdvancedControls: state.ui.showAdvancedControls
        };
    }

    return {
        createInitialState: createInitialState,
        syncPreferencesFromState: syncPreferencesFromState
    };
});
