(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        root.ThinkingUIStudioStorage = factory();
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    const KEYS = {
        history: "thinking-ui-studio-history-v1",
        preferences: "thinking-ui-studio-preferences-v1"
    };

    const DEFAULT_PREFERENCES = {
        preferredMode: "focus",
        adaptationEnabled: true,
        lockedLayout: false,
        density: "comfortable",
        ordering: null,
        pinnedSections: [],
        disabledRuleIds: [],
        dismissedSuggestionIds: [],
        acceptedSuggestionIds: [],
        keptRuleIds: [],
        showAdvancedControls: false
    };

    const MAX_HISTORY_ITEMS = 12;

    function canUseStorage(rootLike) {
        const scope = rootLike || (typeof window !== "undefined" ? window : globalThis);
        return typeof scope.localStorage !== "undefined";
    }

    function safeParse(raw, fallback) {
        if (!raw) {
            return fallback;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    function readJson(key, fallback, rootLike) {
        const scope = rootLike || (typeof window !== "undefined" ? window : globalThis);
        if (!canUseStorage(scope)) {
            return fallback;
        }

        return safeParse(scope.localStorage.getItem(key), fallback);
    }

    function writeJson(key, value, rootLike) {
        const scope = rootLike || (typeof window !== "undefined" ? window : globalThis);
        if (!canUseStorage(scope)) {
            return value;
        }

        scope.localStorage.setItem(key, JSON.stringify(value));
        return value;
    }

    function mergePreferences(preferences) {
        const incoming = preferences && typeof preferences === "object" ? preferences : {};
        return {
            preferredMode: incoming.preferredMode || DEFAULT_PREFERENCES.preferredMode,
            adaptationEnabled: incoming.adaptationEnabled !== false,
            lockedLayout: Boolean(incoming.lockedLayout),
            density: incoming.density || DEFAULT_PREFERENCES.density,
            ordering: Array.isArray(incoming.ordering) ? incoming.ordering.slice() : null,
            pinnedSections: Array.isArray(incoming.pinnedSections) ? incoming.pinnedSections.slice() : [],
            disabledRuleIds: Array.isArray(incoming.disabledRuleIds) ? incoming.disabledRuleIds.slice() : [],
            dismissedSuggestionIds: Array.isArray(incoming.dismissedSuggestionIds) ? incoming.dismissedSuggestionIds.slice() : [],
            acceptedSuggestionIds: Array.isArray(incoming.acceptedSuggestionIds) ? incoming.acceptedSuggestionIds.slice() : [],
            keptRuleIds: Array.isArray(incoming.keptRuleIds) ? incoming.keptRuleIds.slice() : [],
            showAdvancedControls: Boolean(incoming.showAdvancedControls)
        };
    }

    function loadHistory(rootLike) {
        const history = readJson(KEYS.history, [], rootLike);
        return Array.isArray(history) ? history : [];
    }

    function saveHistory(history, rootLike) {
        const safeHistory = Array.isArray(history) ? history.slice(0, MAX_HISTORY_ITEMS) : [];
        return writeJson(KEYS.history, safeHistory, rootLike);
    }

    function appendHistory(entry, rootLike) {
        const history = loadHistory(rootLike);
        const nextHistory = [entry].concat(
            history.filter(function (item) {
                return item.id !== entry.id;
            })
        ).slice(0, MAX_HISTORY_ITEMS);

        return saveHistory(nextHistory, rootLike);
    }

    function clearHistory(rootLike) {
        return saveHistory([], rootLike);
    }

    function loadPreferences(rootLike) {
        return mergePreferences(readJson(KEYS.preferences, DEFAULT_PREFERENCES, rootLike));
    }

    function savePreferences(preferences, rootLike) {
        return writeJson(KEYS.preferences, mergePreferences(preferences), rootLike);
    }

    function updatePreferences(patch, rootLike) {
        const nextPreferences = Object.assign({}, loadPreferences(rootLike), patch || {});
        return savePreferences(nextPreferences, rootLike);
    }

    return {
        KEYS: KEYS,
        DEFAULT_PREFERENCES: DEFAULT_PREFERENCES,
        MAX_HISTORY_ITEMS: MAX_HISTORY_ITEMS,
        canUseStorage: canUseStorage,
        readJson: readJson,
        writeJson: writeJson,
        mergePreferences: mergePreferences,
        loadHistory: loadHistory,
        saveHistory: saveHistory,
        appendHistory: appendHistory,
        clearHistory: clearHistory,
        loadPreferences: loadPreferences,
        savePreferences: savePreferences,
        updatePreferences: updatePreferences
    };
});
