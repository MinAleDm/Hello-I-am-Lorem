(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(
            require("./core/content.js"),
            require("./core/profile.js"),
            require("./core/storage.js"),
            require("./core/state.js"),
            require("./core/behavior-tracker.js"),
            require("./core/adaptation-engine.js"),
            require("./renderers/app-renderer.js"),
            require("./utils/animation.js")
        );
    } else {
        root.ThinkingUIStudioApp = factory(
            root.ThinkingUIStudioContent,
            root.ThinkingUIStudioProfile,
            root.ThinkingUIStudioStorage,
            root.ThinkingUIStudioState,
            root.ThinkingUIStudioBehaviorTracker,
            root.ThinkingUIStudioAdaptationEngine,
            root.ThinkingUIStudioRenderer,
            root.ThinkingUIStudioAnimation
        );
    }
})(typeof window !== "undefined" ? window : globalThis, function (
    content,
    profileModel,
    storage,
    stateModel,
    tracker,
    engine,
    renderer,
    animation
) {
    let state = null;
    let elements = null;
    let scrollFrameRequested = false;
    let detachSpotlight = function () {
        return null;
    };

    function pushUnique(list, value) {
        if (list.indexOf(value) < 0) {
            list.push(value);
        }
        return list;
    }

    function persistPreferences() {
        storage.savePreferences(stateModel.syncPreferencesFromState(state));
    }

    function sync(shouldEvaluateAdaptation) {
        if (shouldEvaluateAdaptation) {
            engine.evaluateAutomaticAdaptation(state);
        } else {
            state.ui.currentPattern = engine.detectBehaviorPattern(state.behavior);
        }

        state.suggestions = engine.evaluateAdaptiveSuggestions(state);
        elements = renderer.renderApp(document, state, elements);
        persistPreferences();
    }

    function createHistoryEntry(sessionProfile) {
        return {
            id: sessionProfile.id,
            name: sessionProfile.name,
            prompt: sessionProfile.prompt,
            mode: sessionProfile.mode,
            intent: sessionProfile.intent,
            headline: sessionProfile.headline,
            summary: sessionProfile.signalSummary,
            createdAt: sessionProfile.createdAt
        };
    }

    function resetBehaviorLayer() {
        state.behavior = tracker.createBehaviorState(content.SECTION_KEYS);
        state.reasoningLog = [];
        state.ui.currentPattern = content.PATTERN_COPY.exploration;
        state.ui.expandedSections = Object.assign({}, content.DEFAULT_EXPANDED_SECTIONS);
        state.ui.primaryCta = "start";
        state.ui.emphasisSection = "signal";
    }

    function readComposerValues() {
        return {
            name: document.getElementById("nameInput").value,
            prompt: document.getElementById("promptInput").value,
            mode: state.session.activeMode,
            intent: state.session.activeIntent
        };
    }

    function writeComposerValues(payload) {
        document.getElementById("nameInput").value = payload.name || "";
        document.getElementById("promptInput").value = payload.prompt || "";
    }

    function startSession(payload) {
        const sessionInput = payload || readComposerValues();
        const sessionProfile = profileModel.buildSessionProfile(sessionInput, new Date());

        if (!sessionProfile) {
            state.session.statusText = "A readable name is required before the interface can adapt.";
            sync(false);
            return null;
        }

        resetBehaviorLayer();
        state.session.profile = sessionProfile;
        state.session.activeMode = sessionInput.mode;
        state.session.activeIntent = sessionInput.intent;
        state.session.nameDraft = sessionInput.name;
        state.session.promptDraft = sessionInput.prompt;
        state.session.statusText = sessionProfile.headline + " is active.";

        state.history = storage.appendHistory(createHistoryEntry(sessionProfile));
        sync(false);
        return sessionProfile;
    }

    function loadSampleSession() {
        const sample = content.SAMPLE_SESSIONS[state.session.activeMode] || content.SAMPLE_SESSIONS.focus;
        writeComposerValues(sample);
        state.session.activeIntent = sample.intent;
        sync(false);
        return startSession({
            name: sample.name,
            prompt: sample.prompt,
            mode: state.session.activeMode,
            intent: sample.intent
        });
    }

    function clearSession() {
        writeComposerValues({ name: "", prompt: "" });
        resetBehaviorLayer();
        state.session.profile = null;
        state.session.statusText = "Start a session to let the workspace adapt around your behavior.";
        sync(false);
    }

    function handleModeSelection(modeId) {
        if (content.MODE_SEQUENCE.indexOf(modeId) < 0) {
            return;
        }

        if (state.session.activeMode !== modeId) {
            state.session.activeMode = modeId;
            tracker.registerModeSwitch(state.behavior);
        }

        sync(true);
    }

    function handleIntentSelection(intentId) {
        if (!content.getIntent(intentId)) {
            return;
        }

        state.session.activeIntent = intentId;
        sync(false);
    }

    function toggleSection(sectionId) {
        const nextValue = !(state.ui.expandedSections[sectionId] !== false);
        state.ui.expandedSections[sectionId] = nextValue;
        if (nextValue) {
            tracker.registerSectionOpen(state.behavior, sectionId);
        }
        sync(true);
    }

    function togglePinnedSection(sectionId) {
        const index = state.ui.pinnedSections.indexOf(sectionId);
        if (index >= 0) {
            state.ui.pinnedSections.splice(index, 1);
        } else {
            state.ui.pinnedSections.push(sectionId);
            state.ui.ordering = state.ui.ordering.filter(function (item) {
                return item !== sectionId;
            });
            state.ui.ordering.unshift(sectionId);
        }
        sync(false);
    }

    function setDensity(density) {
        state.ui.density = density;
        sync(false);
    }

    function handleSuggestionAction(action, suggestionId, ruleId) {
        if (action === "dismiss") {
            pushUnique(state.preferences.dismissedSuggestionIds, suggestionId);
            tracker.registerSuggestionResponse(state.behavior, suggestionId, "dismissed");
            sync(false);
            return;
        }

        if (action === "accept") {
            pushUnique(state.preferences.acceptedSuggestionIds, suggestionId);
            tracker.registerSuggestionResponse(state.behavior, suggestionId, "accepted");
            engine.applyRule(state, ruleId, {
                source: "manual",
                force: true,
                timestamp: new Date().toISOString()
            });
            sync(false);
        }
    }

    function handleReasoningAction(action, eventId) {
        if (action === "undo") {
            engine.undoAdaptation(state, eventId);
        }

        if (action === "keep") {
            engine.keepAdaptation(state, eventId);
        }

        if (action === "disable") {
            engine.disableSimilar(state, eventId);
        }

        sync(false);
    }

    function handleHistoryLoad(historyId) {
        const entry = state.history.find(function (item) {
            return item.id === historyId;
        });

        if (!entry) {
            return;
        }

        writeComposerValues(entry);
        state.session.activeMode = entry.mode;
        state.session.activeIntent = entry.intent;
        startSession({
            name: entry.name,
            prompt: entry.prompt,
            mode: entry.mode,
            intent: entry.intent
        });
    }

    function bindSectionAttention() {
        elements.sections.forEach(function (section) {
            const sectionId = section.getAttribute("data-section");

            section.addEventListener("pointerenter", function () {
                tracker.beginSectionAttention(state.behavior, sectionId);
            });

            section.addEventListener("pointerleave", function () {
                tracker.endSectionAttention(state.behavior, sectionId);
                sync(true);
            });

            section.addEventListener("focusin", function () {
                tracker.beginSectionAttention(state.behavior, sectionId);
            });

            section.addEventListener("focusout", function () {
                tracker.endSectionAttention(state.behavior, sectionId);
                sync(true);
            });
        });
    }

    function bindEvents() {
        document.getElementById("composerForm").addEventListener("submit", function (event) {
            event.preventDefault();
            startSession();
        });

        document.getElementById("sampleSessionButton").addEventListener("click", function () {
            loadSampleSession();
        });

        document.getElementById("resetSessionButton").addEventListener("click", function () {
            clearSession();
        });

        document.getElementById("clearHistoryButton").addEventListener("click", function () {
            state.history = storage.clearHistory();
            sync(false);
        });

        document.addEventListener("click", function (event) {
            const section = event.target.closest("[data-section]");
            if (section) {
                tracker.registerSectionClick(state.behavior, section.getAttribute("data-section"));
            }

            const modeButton = event.target.closest("[data-mode-select]");
            if (modeButton) {
                handleModeSelection(modeButton.getAttribute("data-mode-select"));
            }

            const intentButton = event.target.closest("[data-intent-select]");
            if (intentButton) {
                handleIntentSelection(intentButton.getAttribute("data-intent-select"));
            }

            const toggleButton = event.target.closest("[data-toggle-section]");
            if (toggleButton) {
                toggleSection(toggleButton.getAttribute("data-toggle-section"));
            }

            const densityButton = event.target.closest("[data-density-select]");
            if (densityButton) {
                setDensity(densityButton.getAttribute("data-density-select"));
            }

            const pinButton = event.target.closest("[data-pin-target]");
            if (pinButton) {
                togglePinnedSection(pinButton.getAttribute("data-pin-target"));
            }

            const suggestionAction = event.target.closest("[data-suggestion-action]");
            if (suggestionAction) {
                handleSuggestionAction(
                    suggestionAction.getAttribute("data-suggestion-action"),
                    suggestionAction.getAttribute("data-suggestion-id"),
                    suggestionAction.getAttribute("data-rule-id")
                );
            }

            const reasoningAction = event.target.closest("[data-reasoning-action]");
            if (reasoningAction) {
                handleReasoningAction(
                    reasoningAction.getAttribute("data-reasoning-action"),
                    reasoningAction.getAttribute("data-event-id")
                );
            }

            const historyAction = event.target.closest("[data-history-id]");
            if (historyAction) {
                handleHistoryLoad(historyAction.getAttribute("data-history-id"));
            }
        });

        document.getElementById("adaptationToggle").addEventListener("change", function (event) {
            state.ui.adaptationEnabled = event.target.checked;
            sync(false);
        });

        document.getElementById("layoutLockToggle").addEventListener("change", function (event) {
            state.ui.lockedLayout = event.target.checked;
            sync(false);
        });

        document.getElementById("undoLastButton").addEventListener("click", function () {
            const latestEvent = state.reasoningLog[0];
            if (!latestEvent) {
                return;
            }

            engine.undoAdaptation(state, latestEvent.id);
            sync(false);
        });

        window.addEventListener("scroll", function () {
            if (scrollFrameRequested) {
                return;
            }

            scrollFrameRequested = true;
            window.requestAnimationFrame(function () {
                const doc = document.documentElement;
                const maxScrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
                tracker.registerScroll(state.behavior, {
                    deltaY: window.scrollY - (window.__thinkingUiLastScrollY || 0),
                    depth: Math.round((window.scrollY / maxScrollable) * 100)
                });
                window.__thinkingUiLastScrollY = window.scrollY;
                sync(true);
                scrollFrameRequested = false;
            });
        }, { passive: true });

        window.addEventListener("beforeunload", function () {
            tracker.flushAttention(state.behavior);
            persistPreferences();
        });

        bindSectionAttention();
    }

    function initApp() {
        if (typeof document === "undefined") {
            return null;
        }

        state = stateModel.createInitialState({
            history: storage.loadHistory(),
            preferences: storage.loadPreferences()
        });
        elements = renderer.cacheElements(document);
        detachSpotlight = animation.bindSpotlight(window);
        sync(false);
        bindEvents();
        registerServiceWorker();
        return state;
    }

    function registerServiceWorker() {
        if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
            return;
        }

        navigator.serviceWorker.register("./service-worker.js").catch(function () {
            return null;
        });
    }

    const api = {
        initApp: initApp,
        startSession: startSession,
        loadSampleSession: loadSampleSession,
        clearSession: clearSession,
        handleSuggestionAction: handleSuggestionAction,
        handleReasoningAction: handleReasoningAction,
        getState: function () {
            return state;
        },
        destroy: function () {
            detachSpotlight();
        }
    };

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initApp);
        } else {
            initApp();
        }
    }

    return api;
});
