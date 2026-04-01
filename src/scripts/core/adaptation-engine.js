(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(
            require("./content.js"),
            require("./behavior-tracker.js")
        );
    } else {
        root.ThinkingUIStudioAdaptationEngine = factory(
            root.ThinkingUIStudioContent,
            root.ThinkingUIStudioBehaviorTracker
        );
    }
})(typeof window !== "undefined" ? window : globalThis, function (content, tracker) {
    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function reorderSection(ordering, sectionId, targetIndex) {
        const nextOrder = ordering.filter(function (item) {
            return item !== sectionId;
        });
        nextOrder.splice(targetIndex, 0, sectionId);
        return nextOrder;
    }

    function ensurePinned(pinnedSections, sectionId) {
        if (pinnedSections.indexOf(sectionId) >= 0) {
            return pinnedSections.slice();
        }
        return pinnedSections.concat(sectionId);
    }

    function detectBehaviorPattern(behavior) {
        const summary = tracker.summarizeBehavior(behavior);

        if (summary.modeSwitches >= 3 || summary.suggestionAccepted >= 2) {
            return content.PATTERN_COPY.decision;
        }

        if (summary.signalDwellMs >= 18000 || summary.insightsDwellMs >= 16000) {
            return content.PATTERN_COPY.deepFocus;
        }

        if (summary.quickBursts >= 3 || summary.quickVisits >= 4) {
            return content.PATTERN_COPY.scanning;
        }

        return content.PATTERN_COPY.exploration;
    }

    function getRules() {
        return {
            "density.compact-scan": {
                id: "density.compact-scan",
                affectsLayout: true,
                eligible: function (state, pattern) {
                    const summary = tracker.summarizeBehavior(state.behavior);
                    return pattern.label === content.PATTERN_COPY.scanning.label &&
                        (summary.quickBursts >= 3 || summary.quickVisits >= 4) &&
                        state.ui.density !== "compact";
                },
                mutate: function (ui) {
                    const nextUi = clone(ui);
                    nextUi.density = "compact";
                    nextUi.ordering = ["signal", "suggestions", "insights", "behavior", "reasoning", "memory", "history", "controls"];
                    nextUi.emphasisSection = "suggestions";
                    return nextUi;
                },
                describe: function (state) {
                    const summary = tracker.summarizeBehavior(state.behavior);
                    return {
                        title: "Compact mode enabled",
                        reason: "We reduced visual density because you moved through " + summary.quickVisits +
                            " sections quickly and scrolled in short bursts " + summary.quickBursts + " times."
                    };
                }
            },
            "layout.focus-insights": {
                id: "layout.focus-insights",
                affectsLayout: true,
                eligible: function (state, pattern) {
                    return pattern.label === content.PATTERN_COPY.deepFocus.label &&
                        (state.ui.ordering[1] !== "insights" || state.ui.density !== "airy");
                },
                mutate: function (ui) {
                    const nextUi = clone(ui);
                    nextUi.density = "airy";
                    nextUi.ordering = ["signal", "insights", "reasoning", "suggestions", "memory", "behavior", "history", "controls"];
                    nextUi.emphasisSection = "signal";
                    nextUi.primaryCta = "refine";
                    return nextUi;
                },
                describe: function (state) {
                    const summary = tracker.summarizeBehavior(state.behavior);
                    return {
                        title: "Insights moved closer",
                        reason: "Signal and insight cards held attention for " +
                            Math.round((summary.signalDwellMs + summary.insightsDwellMs) / 1000) +
                            " seconds, so we widened that reading lane."
                    };
                }
            },
            "layout.pin-history": {
                id: "layout.pin-history",
                affectsLayout: true,
                eligible: function (state) {
                    const summary = tracker.summarizeBehavior(state.behavior);
                    return summary.historyReopens >= 2 && state.ui.pinnedSections.indexOf("history") < 0;
                },
                mutate: function (ui) {
                    const nextUi = clone(ui);
                    nextUi.pinnedSections = ensurePinned(nextUi.pinnedSections, "history");
                    nextUi.ordering = reorderSection(nextUi.ordering, "history", 1);
                    nextUi.expandedSections.history = true;
                    return nextUi;
                },
                describe: function () {
                    return {
                        title: "History pinned to the upper workspace",
                        reason: "You reopened session history more than once, so it was raised for faster return access."
                    };
                }
            },
            "suggestions.raise-decision": {
                id: "suggestions.raise-decision",
                affectsLayout: true,
                eligible: function (state, pattern) {
                    return pattern.label === content.PATTERN_COPY.decision.label &&
                        (state.ui.emphasisSection !== "suggestions" || state.ui.primaryCta !== "compare");
                },
                mutate: function (ui) {
                    const nextUi = clone(ui);
                    nextUi.ordering = reorderSection(nextUi.ordering, "suggestions", 1);
                    nextUi.emphasisSection = "suggestions";
                    nextUi.primaryCta = "compare";
                    nextUi.expandedSections.suggestions = true;
                    return nextUi;
                },
                describe: function (state) {
                    return {
                        title: "Decision aids promoted",
                        reason: "Repeated mode changes and accepted prompts suggest you are comparing options, so decision helpers were moved forward."
                    };
                }
            },
            "controls.reveal-advanced": {
                id: "controls.reveal-advanced",
                affectsLayout: false,
                eligible: function (state) {
                    const summary = tracker.summarizeBehavior(state.behavior);
                    return summary.modeSwitches >= 2 && state.ui.showAdvancedControls === false;
                },
                mutate: function (ui) {
                    const nextUi = clone(ui);
                    nextUi.showAdvancedControls = true;
                    nextUi.expandedSections.controls = true;
                    return nextUi;
                },
                describe: function () {
                    return {
                        title: "Advanced controls revealed",
                        reason: "You switched modes a few times, so manual density and pin controls are now kept closer."
                    };
                }
            },
            "layout.raise-reasoning": {
                id: "layout.raise-reasoning",
                affectsLayout: true,
                eligible: function (state) {
                    const summary = tracker.summarizeBehavior(state.behavior);
                    return summary.reasoningReopens >= 2 && state.ui.ordering.indexOf("reasoning") > 2;
                },
                mutate: function (ui) {
                    const nextUi = clone(ui);
                    nextUi.ordering = reorderSection(nextUi.ordering, "reasoning", 2);
                    nextUi.expandedSections.reasoning = true;
                    return nextUi;
                },
                describe: function () {
                    return {
                        title: "Reasoning log moved higher",
                        reason: "You returned to the explanation layer multiple times, so it was raised closer to the signal."
                    };
                }
            }
        };
    }

    function isRuleDisabled(state, ruleId) {
        return state.ui.disabledRuleIds.indexOf(ruleId) >= 0;
    }

    function applyRule(state, ruleId, options) {
        const rules = getRules();
        const rule = rules[ruleId];
        const meta = options || {};
        if (!rule || isRuleDisabled(state, ruleId)) {
            return null;
        }

        if (meta.source !== "manual" && state.ui.lockedLayout && rule.affectsLayout) {
            return null;
        }

        const pattern = detectBehaviorPattern(state.behavior);
        if (!rule.eligible(state, pattern) && meta.force !== true) {
            return null;
        }

        const beforeUi = clone(state.ui);
        const afterUi = rule.mutate(clone(state.ui), state);
        if (JSON.stringify(beforeUi) === JSON.stringify(afterUi)) {
            return null;
        }

        state.ui = afterUi;
        state.ui.currentPattern = detectBehaviorPattern(state.behavior);

        const description = rule.describe(state, pattern);
        const event = {
            id: "adapt-" + Date.now() + "-" + ruleId.replace(/\W+/g, "-"),
            ruleId: ruleId,
            title: description.title,
            reason: description.reason,
            source: meta.source || "system",
            timestamp: meta.timestamp || new Date().toISOString(),
            beforeUi: beforeUi,
            afterUi: clone(afterUi),
            status: "active"
        };

        state.reasoningLog = [event].concat(state.reasoningLog).slice(0, 8);
        return event;
    }

    function evaluateAutomaticAdaptation(state) {
        if (!state.ui.adaptationEnabled) {
            return null;
        }

        const pattern = detectBehaviorPattern(state.behavior);
        const rules = getRules();
        const priority = [
            "layout.pin-history",
            "layout.raise-reasoning",
            "controls.reveal-advanced",
            "suggestions.raise-decision",
            "layout.focus-insights",
            "density.compact-scan"
        ];

        for (let index = 0; index < priority.length; index += 1) {
            const ruleId = priority[index];
            const rule = rules[ruleId];
            if (!rule || isRuleDisabled(state, ruleId)) {
                continue;
            }

            if (state.ui.lockedLayout && rule.affectsLayout) {
                continue;
            }

            if (rule.eligible(state, pattern)) {
                return applyRule(state, ruleId, { source: "system" });
            }
        }

        state.ui.currentPattern = pattern;
        return null;
    }

    function buildSuggestion(id, title, body, ruleId, tone) {
        return {
            id: id,
            title: title,
            body: body,
            ruleId: ruleId,
            tone: tone || "neutral"
        };
    }

    function evaluateAdaptiveSuggestions(state) {
        const summary = tracker.summarizeBehavior(state.behavior);
        const dismissed = state.preferences.dismissedSuggestionIds;
        const accepted = state.preferences.acceptedSuggestionIds;
        const pattern = detectBehaviorPattern(state.behavior);
        const suggestions = [];

        if (summary.historyReopens >= 1 && state.ui.pinnedSections.indexOf("history") < 0) {
            suggestions.push(buildSuggestion(
                "suggest-pin-history",
                "Pin history nearby",
                "You already went back to previous sessions. Keep history beside the signal for faster reuse.",
                "layout.pin-history",
                "warm"
            ));
        }

        if ((summary.quickBursts >= 2 || summary.quickVisits >= 3) && state.ui.density !== "compact") {
            suggestions.push(buildSuggestion(
                "suggest-compact",
                "Switch to compact density",
                "The session reads like fast scanning. Compress the surface and raise probable actions.",
                "density.compact-scan",
                "sharp"
            ));
        }

        if (summary.modeSwitches >= 2 && state.ui.showAdvancedControls === false) {
            suggestions.push(buildSuggestion(
                "suggest-advanced",
                "Reveal advanced controls",
                "Mode switching suggests active tuning. Surface density and pin controls without leaving the workspace.",
                "controls.reveal-advanced",
                "calm"
            ));
        }

        if (pattern.label === content.PATTERN_COPY.decision.label) {
            suggestions.push(buildSuggestion(
                "suggest-decision",
                "Prioritize comparison aids",
                "The current pattern looks like decision work. Bring side-by-side thinking and commitment actions forward.",
                "suggestions.raise-decision",
                "bright"
            ));
        }

        if (summary.reasoningReopens >= 1 && state.ui.ordering.indexOf("reasoning") > 2) {
            suggestions.push(buildSuggestion(
                "suggest-reasoning",
                "Raise the reasoning layer",
                "You checked why the interface changed. Keep that explanation closer to the main signal.",
                "layout.raise-reasoning",
                "calm"
            ));
        }

        if (!suggestions.length && state.ui.density !== "airy") {
            suggestions.push(buildSuggestion(
                "suggest-focus-lane",
                "Open a wider reading lane",
                "No strong behavioral signal yet. Expand the central lane for a slower pass through the session.",
                "layout.focus-insights",
                "neutral"
            ));
        }

        return suggestions.filter(function (suggestion) {
            return dismissed.indexOf(suggestion.id) < 0 && accepted.indexOf(suggestion.id) < 0;
        }).slice(0, 3);
    }

    function undoAdaptation(state, eventId) {
        const event = state.reasoningLog.find(function (item) {
            return item.id === eventId;
        });
        if (!event || event.status === "undone") {
            return null;
        }

        state.ui = clone(event.beforeUi);
        state.ui.currentPattern = detectBehaviorPattern(state.behavior);
        event.status = "undone";
        return event;
    }

    function keepAdaptation(state, eventId) {
        const event = state.reasoningLog.find(function (item) {
            return item.id === eventId;
        });
        if (!event) {
            return null;
        }

        event.status = "kept";
        if (state.preferences.keptRuleIds.indexOf(event.ruleId) < 0) {
            state.preferences.keptRuleIds.push(event.ruleId);
        }
        return event;
    }

    function disableSimilar(state, eventId) {
        const event = state.reasoningLog.find(function (item) {
            return item.id === eventId;
        });
        if (!event) {
            return null;
        }

        if (state.ui.disabledRuleIds.indexOf(event.ruleId) < 0) {
            state.ui.disabledRuleIds.push(event.ruleId);
        }
        event.status = "disabled";
        return event;
    }

    return {
        detectBehaviorPattern: detectBehaviorPattern,
        applyRule: applyRule,
        evaluateAutomaticAdaptation: evaluateAutomaticAdaptation,
        evaluateAdaptiveSuggestions: evaluateAdaptiveSuggestions,
        undoAdaptation: undoAdaptation,
        keepAdaptation: keepAdaptation,
        disableSimilar: disableSimilar
    };
});
