(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(
            require("../core/content.js"),
            require("../core/behavior-tracker.js")
        );
    } else {
        root.ThinkingUIStudioRenderer = factory(
            root.ThinkingUIStudioContent,
            root.ThinkingUIStudioBehaviorTracker
        );
    }
})(typeof window !== "undefined" ? window : globalThis, function (content, tracker) {
    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatTime(isoString) {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
            return "just now";
        }

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    function formatDuration(ms) {
        if (!ms) {
            return "0s";
        }
        if (ms < 1000) {
            return ms + "ms";
        }
        return Math.round(ms / 1000) + "s";
    }

    function cacheElements(doc) {
        return {
            body: doc.body,
            savedSessions: doc.getElementById("statsSavedSessions"),
            keptAdaptations: doc.getElementById("statsKeptAdaptations"),
            preferredMode: doc.getElementById("statsPreferredMode"),
            pinnedBlocks: doc.getElementById("statsPinnedBlocks"),
            currentPatternLabel: doc.getElementById("currentPatternLabel"),
            currentPatternSummary: doc.getElementById("currentPatternSummary"),
            sessionStatus: doc.getElementById("sessionStatus"),
            currentModeTone: doc.getElementById("currentModeTone"),
            heroReason: doc.getElementById("heroReason"),
            signalTitle: doc.getElementById("signalTitle"),
            signalSummary: doc.getElementById("signalSummary"),
            signalStatus: doc.getElementById("signalStatus"),
            signalNextMove: doc.getElementById("signalNextMove"),
            insightsList: doc.getElementById("insightsList"),
            suggestionsList: doc.getElementById("suggestionsList"),
            memoryList: doc.getElementById("memoryList"),
            behaviorStats: doc.getElementById("behaviorStats"),
            reasoningList: doc.getElementById("reasoningList"),
            historyList: doc.getElementById("historyList"),
            controlsSummary: doc.getElementById("controlsSummary"),
            manualPins: doc.getElementById("manualPins"),
            startSessionButton: doc.getElementById("startSessionButton"),
            adaptationToggle: doc.getElementById("adaptationToggle"),
            layoutLockToggle: doc.getElementById("layoutLockToggle"),
            undoLastButton: doc.getElementById("undoLastButton"),
            densityButtons: Array.prototype.slice.call(doc.querySelectorAll("[data-density-select]")),
            modeButtons: Array.prototype.slice.call(doc.querySelectorAll("[data-mode-select]")),
            intentButtons: Array.prototype.slice.call(doc.querySelectorAll("[data-intent-select]")),
            pinButtons: Array.prototype.slice.call(doc.querySelectorAll("[data-pin-target]")),
            sections: Array.prototype.slice.call(doc.querySelectorAll("[data-section]"))
        };
    }

    function buildSignalMarkup(state) {
        const profile = state.session.profile;
        if (!profile) {
            return {
                title: "The workspace is waiting for a signal.",
                summary: "Add a name, a state or a brief. The studio will start broad and become more specific through deterministic behavior rules.",
                status: "No active session",
                nextMove: "Next move: start a session to unlock adaptive suggestions and explainability."
            };
        }

        return {
            title: profile.signalTitle,
            summary: profile.signalSummary,
            status: profile.statusLine,
            nextMove: "Next move: " + profile.nextMove
        };
    }

    function renderInsights(elements, state) {
        const profile = state.session.profile;
        if (!profile) {
            elements.insightsList.innerHTML = [
                '<article class="stream-card placeholder">',
                "<strong>Insight stream is idle.</strong>",
                "<p>Once a session begins, this lane will condense name signature, mode tone and intent framing into readable cards.</p>",
                "</article>"
            ].join("");
            return;
        }

        elements.insightsList.innerHTML = profile.insightCards.map(function (card) {
            return [
                '<article class="stream-card">',
                "<span class=\"stream-metric\">" + escapeHtml(card.metric) + "</span>",
                "<strong>" + escapeHtml(card.title) + "</strong>",
                "<p>" + escapeHtml(card.body) + "</p>",
                "</article>"
            ].join("");
        }).join("");
    }

    function renderSuggestions(elements, state) {
        if (!state.suggestions.length) {
            elements.suggestionsList.innerHTML = [
                '<article class="suggestion-card placeholder">',
                "<strong>No adaptive suggestions yet.</strong>",
                "<p>Interaction is still too light for a strong proposal. The studio will stay calm until a pattern becomes clear.</p>",
                "</article>"
            ].join("");
            return;
        }

        elements.suggestionsList.innerHTML = state.suggestions.map(function (suggestion) {
            return [
                "<article class=\"suggestion-card tone-" + escapeHtml(suggestion.tone) + "\">",
                "<strong>" + escapeHtml(suggestion.title) + "</strong>",
                "<p>" + escapeHtml(suggestion.body) + "</p>",
                "<div class=\"suggestion-actions\">",
                "<button type=\"button\" class=\"button button-primary\" data-suggestion-action=\"accept\" data-suggestion-id=\"" + escapeHtml(suggestion.id) + "\" data-rule-id=\"" + escapeHtml(suggestion.ruleId) + "\">Apply</button>",
                "<button type=\"button\" class=\"button button-subtle\" data-suggestion-action=\"dismiss\" data-suggestion-id=\"" + escapeHtml(suggestion.id) + "\">Dismiss</button>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    function renderMemory(elements, state) {
        const profile = state.session.profile;
        const pinned = state.ui.pinnedSections.length
            ? state.ui.pinnedSections.map(function (sectionId) {
                return content.getSectionMeta(sectionId).label;
            }).join(", ")
            : "No pinned zones yet";
        const lastSession = state.history[0];

        const items = [
            "Preferred mode: " + content.getMode(state.session.activeMode).label + ".",
            "Accepted suggestions: " + state.preferences.acceptedSuggestionIds.length + ".",
            "Dismissed suggestions: " + state.preferences.dismissedSuggestionIds.length + ".",
            "Pinned layout: " + pinned + ".",
            lastSession
                ? "Last session: " + lastSession.headline + " at " + formatTime(lastSession.createdAt) + "."
                : "Local history is empty, so the memory layer is intentionally light."
        ];

        if (profile) {
            items.unshift("Current intent: " + profile.intentLabel + ". Prompt excerpt: " + profile.promptExcerpt);
        }

        elements.memoryList.innerHTML = items.map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
        }).join("");
    }

    function renderBehavior(elements, state) {
        const summary = tracker.summarizeBehavior(state.behavior);
        const stats = [
            { label: "Quick visits", value: summary.quickVisits },
            { label: "Scroll bursts", value: summary.quickBursts },
            { label: "Mode switches", value: summary.modeSwitches },
            { label: "Signal dwell", value: formatDuration(summary.signalDwellMs) },
            { label: "Insight dwell", value: formatDuration(summary.insightsDwellMs) },
            { label: "Suggestion accepts", value: summary.suggestionAccepted }
        ];

        elements.behaviorStats.innerHTML = stats.map(function (stat) {
            return [
                '<article class="behavior-stat">',
                "<span>" + escapeHtml(stat.label) + "</span>",
                "<strong>" + escapeHtml(stat.value) + "</strong>",
                "</article>"
            ].join("");
        }).join("");
    }

    function renderReasoning(elements, state) {
        if (!state.reasoningLog.length) {
            const seedCopy = state.session.profile
                ? state.session.profile.reasoningSeed.why + " " + state.session.profile.reasoningSeed.whatChanged
                : "No adaptation has been applied yet. The system will explain each change the moment it happens.";

            elements.reasoningList.innerHTML = [
                '<article class="reasoning-item placeholder">',
                "<strong>Explainability log is clear.</strong>",
                "<p>" + escapeHtml(seedCopy) + "</p>",
                "</article>"
            ].join("");
            return;
        }

        elements.reasoningList.innerHTML = state.reasoningLog.map(function (event) {
            const actions = event.status === "active"
                ? [
                    "<button type=\"button\" class=\"button button-subtle\" data-reasoning-action=\"undo\" data-event-id=\"" + escapeHtml(event.id) + "\">Undo</button>",
                    "<button type=\"button\" class=\"button button-subtle\" data-reasoning-action=\"keep\" data-event-id=\"" + escapeHtml(event.id) + "\">Keep</button>",
                    "<button type=\"button\" class=\"button button-subtle\" data-reasoning-action=\"disable\" data-event-id=\"" + escapeHtml(event.id) + "\">Disable similar</button>"
                ].join("")
                : "<span class=\"reasoning-status is-" + escapeHtml(event.status) + "\">" + escapeHtml(event.status) + "</span>";

            return [
                "<article class=\"reasoning-item is-" + escapeHtml(event.status) + "\">",
                "<div class=\"reasoning-meta\">",
                "<span>" + escapeHtml(event.source) + "</span>",
                "<span>" + escapeHtml(formatTime(event.timestamp)) + "</span>",
                "</div>",
                "<strong>" + escapeHtml(event.title) + "</strong>",
                "<p>" + escapeHtml(event.reason) + "</p>",
                "<div class=\"reasoning-actions\">" + actions + "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    function renderHistory(elements, state) {
        if (!state.history.length) {
            elements.historyList.innerHTML = [
                '<article class="history-item placeholder">',
                "<strong>No stored sessions.</strong>",
                "<p>Sessions stay local-first. Start one and it will appear here for fast re-entry.</p>",
                "</article>"
            ].join("");
            return;
        }

        elements.historyList.innerHTML = state.history.map(function (entry) {
            return [
                "<article class=\"history-item\">",
                "<div class=\"history-head\">",
                "<strong>" + escapeHtml(entry.headline) + "</strong>",
                "<span>" + escapeHtml(formatTime(entry.createdAt)) + "</span>",
                "</div>",
                "<p>" + escapeHtml(entry.summary) + "</p>",
                "<button type=\"button\" class=\"button button-subtle\" data-history-id=\"" + escapeHtml(entry.id) + "\">Load session</button>",
                "</article>"
            ].join("");
        }).join("");
    }

    function renderControls(elements, state) {
        elements.controlsSummary.textContent = state.ui.adaptationEnabled
            ? "Adaptation is active. Every change stays explainable and reversible."
            : "Adaptation is paused. You can still apply suggestions manually.";

        elements.manualPins.innerHTML = state.ui.pinnedSections.length
            ? state.ui.pinnedSections.map(function (sectionId) {
                return "<span class=\"pin-chip\">" + escapeHtml(content.getSectionMeta(sectionId).label) + "</span>";
            }).join("")
            : "<span class=\"pin-chip is-empty\">Nothing pinned yet</span>";
    }

    function renderSectionStates(elements, state) {
        const orderMap = {};
        state.ui.ordering.forEach(function (sectionId, index) {
            orderMap[sectionId] = index + 1;
        });

        elements.sections.forEach(function (section) {
            const sectionId = section.getAttribute("data-section");
            const expanded = state.ui.expandedSections[sectionId] !== false;
            const contentNode = section.querySelector("[data-section-content]");
            const toggleButton = section.querySelector("[data-toggle-section]");

            section.style.order = String(orderMap[sectionId] || 999);
            section.classList.toggle("is-pinned", state.ui.pinnedSections.indexOf(sectionId) >= 0);
            section.classList.toggle("is-emphasis", state.ui.emphasisSection === sectionId);
            section.dataset.expanded = expanded ? "true" : "false";

            if (contentNode) {
                contentNode.hidden = !expanded;
            }

            if (toggleButton) {
                toggleButton.textContent = expanded ? "Collapse" : "Expand";
                toggleButton.setAttribute("aria-expanded", expanded ? "true" : "false");
            }
        });
    }

    function renderSelectionState(elements, state) {
        elements.modeButtons.forEach(function (button) {
            const selected = button.getAttribute("data-mode-select") === state.session.activeMode;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-pressed", selected ? "true" : "false");
        });

        elements.intentButtons.forEach(function (button) {
            const selected = button.getAttribute("data-intent-select") === state.session.activeIntent;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-pressed", selected ? "true" : "false");
        });

        elements.densityButtons.forEach(function (button) {
            const selected = button.getAttribute("data-density-select") === state.ui.density;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-pressed", selected ? "true" : "false");
        });

        elements.pinButtons.forEach(function (button) {
            const selected = state.ui.pinnedSections.indexOf(button.getAttribute("data-pin-target")) >= 0;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-pressed", selected ? "true" : "false");
        });
    }

    function renderApp(doc, state, cachedElements) {
        const elements = cachedElements || cacheElements(doc);
        const signal = buildSignalMarkup(state);
        const latestEvent = state.reasoningLog[0] || null;
        const keptCount = state.preferences.keptRuleIds.length + state.preferences.acceptedSuggestionIds.length;
        const mode = content.getMode(state.session.activeMode);
        const pattern = state.ui.currentPattern || content.PATTERN_COPY.exploration;
        const ctaLabels = {
            start: "Start adaptive session",
            refine: "Start focused session",
            compare: "Start comparison session"
        };

        elements.body.dataset.mode = state.session.activeMode;
        elements.body.dataset.density = state.ui.density;
        elements.body.dataset.pattern = pattern.label.toLowerCase().replace(/\s+/g, "-");
        elements.body.dataset.advanced = state.ui.showAdvancedControls ? "true" : "false";

        elements.savedSessions.textContent = String(state.history.length);
        elements.keptAdaptations.textContent = String(keptCount);
        elements.preferredMode.textContent = mode.label;
        elements.pinnedBlocks.textContent = String(state.ui.pinnedSections.length);
        elements.currentPatternLabel.textContent = pattern.label;
        elements.currentPatternSummary.textContent = pattern.summary;
        elements.sessionStatus.textContent = state.session.profile
            ? state.session.profile.headline + " is active."
            : state.session.statusText;
        elements.currentModeTone.textContent = mode.interfaceTone;
        elements.heroReason.textContent = latestEvent
            ? latestEvent.title + ". " + latestEvent.reason
            : "No adaptive change yet. The studio is still observing the session.";
        elements.signalTitle.textContent = signal.title;
        elements.signalSummary.textContent = signal.summary;
        elements.signalStatus.textContent = signal.status;
        elements.signalNextMove.textContent = signal.nextMove;
        elements.startSessionButton.textContent = ctaLabels[state.ui.primaryCta] || ctaLabels.start;
        elements.adaptationToggle.checked = state.ui.adaptationEnabled;
        elements.layoutLockToggle.checked = state.ui.lockedLayout;
        elements.undoLastButton.disabled = !latestEvent || latestEvent.status === "undone";

        renderSelectionState(elements, state);
        renderInsights(elements, state);
        renderSuggestions(elements, state);
        renderMemory(elements, state);
        renderBehavior(elements, state);
        renderReasoning(elements, state);
        renderHistory(elements, state);
        renderControls(elements, state);
        renderSectionStates(elements, state);
        return elements;
    }

    return {
        cacheElements: cacheElements,
        renderApp: renderApp
    };
});
