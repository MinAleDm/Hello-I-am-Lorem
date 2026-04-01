(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require("./content.js"));
    } else {
        root.ThinkingUIStudioBehaviorTracker = factory(root.ThinkingUIStudioContent);
    }
})(typeof window !== "undefined" ? window : globalThis, function (content) {
    function createSectionStats(sectionKeys) {
        return (sectionKeys || []).reduce(function (accumulator, key) {
            accumulator[key] = {
                clicks: 0,
                opens: 0,
                dwellMs: 0,
                lastInteractionAt: null,
                activeSince: null
            };
            return accumulator;
        }, {});
    }

    function createBehaviorState(sectionKeys) {
        return {
            sectionStats: createSectionStats(sectionKeys || content.SECTION_KEYS),
            scroll: {
                events: 0,
                quickBursts: 0,
                directionChanges: 0,
                maxDepth: 0,
                lastAt: null,
                lastDirection: 0
            },
            modeSwitches: 0,
            suggestionResponses: {
                accepted: 0,
                dismissed: 0,
                byId: {}
            }
        };
    }

    function touchSection(behavior, sectionId, now) {
        if (!behavior.sectionStats[sectionId]) {
            behavior.sectionStats[sectionId] = {
                clicks: 0,
                opens: 0,
                dwellMs: 0,
                lastInteractionAt: null,
                activeSince: null
            };
        }

        behavior.sectionStats[sectionId].lastInteractionAt = now;
    }

    function registerSectionClick(behavior, sectionId, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        touchSection(behavior, sectionId, timestamp);
        behavior.sectionStats[sectionId].clicks += 1;
        return behavior;
    }

    function registerSectionOpen(behavior, sectionId, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        touchSection(behavior, sectionId, timestamp);
        behavior.sectionStats[sectionId].opens += 1;
        return behavior;
    }

    function beginSectionAttention(behavior, sectionId, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        touchSection(behavior, sectionId, timestamp);
        if (behavior.sectionStats[sectionId].activeSince === null) {
            behavior.sectionStats[sectionId].activeSince = timestamp;
        }
        return behavior;
    }

    function endSectionAttention(behavior, sectionId, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        const stats = behavior.sectionStats[sectionId];
        if (!stats || stats.activeSince === null) {
            return behavior;
        }

        stats.dwellMs += Math.max(timestamp - stats.activeSince, 0);
        stats.activeSince = null;
        stats.lastInteractionAt = timestamp;
        return behavior;
    }

    function flushAttention(behavior, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        Object.keys(behavior.sectionStats).forEach(function (sectionId) {
            endSectionAttention(behavior, sectionId, timestamp);
        });
        return behavior;
    }

    function registerScroll(behavior, detail, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        const deltaY = detail && typeof detail.deltaY === "number" ? detail.deltaY : 0;
        const depth = detail && typeof detail.depth === "number" ? detail.depth : 0;
        const direction = deltaY === 0 ? 0 : deltaY > 0 ? 1 : -1;
        const scrollState = behavior.scroll;

        scrollState.events += 1;
        scrollState.maxDepth = Math.max(scrollState.maxDepth, depth);

        if (scrollState.lastAt !== null && timestamp - scrollState.lastAt < 700) {
            scrollState.quickBursts += 1;
        }

        if (direction !== 0 && scrollState.lastDirection !== 0 && direction !== scrollState.lastDirection) {
            scrollState.directionChanges += 1;
        }

        scrollState.lastDirection = direction || scrollState.lastDirection;
        scrollState.lastAt = timestamp;
        return behavior;
    }

    function registerModeSwitch(behavior) {
        behavior.modeSwitches += 1;
        return behavior;
    }

    function registerSuggestionResponse(behavior, suggestionId, response, now) {
        const timestamp = typeof now === "number" ? now : Date.now();
        const bucket = response === "accepted" ? "accepted" : "dismissed";
        behavior.suggestionResponses[bucket] += 1;
        behavior.suggestionResponses.byId[suggestionId] = {
            response: bucket,
            at: timestamp
        };
        return behavior;
    }

    function summarizeBehavior(behavior) {
        const stats = behavior.sectionStats;
        const quickVisits = Object.keys(stats).filter(function (sectionId) {
            const section = stats[sectionId];
            return section.clicks + section.opens > 0 && section.dwellMs < 5000;
        }).length;

        const totalClicks = Object.keys(stats).reduce(function (sum, sectionId) {
            return sum + stats[sectionId].clicks;
        }, 0);

        return {
            quickVisits: quickVisits,
            totalClicks: totalClicks,
            totalScrollEvents: behavior.scroll.events,
            quickBursts: behavior.scroll.quickBursts,
            modeSwitches: behavior.modeSwitches,
            historyReopens: stats.history ? stats.history.opens : 0,
            reasoningReopens: stats.reasoning ? stats.reasoning.opens : 0,
            signalDwellMs: stats.signal ? stats.signal.dwellMs : 0,
            insightsDwellMs: stats.insights ? stats.insights.dwellMs : 0,
            suggestionAccepted: behavior.suggestionResponses.accepted,
            suggestionDismissed: behavior.suggestionResponses.dismissed
        };
    }

    return {
        createBehaviorState: createBehaviorState,
        registerSectionClick: registerSectionClick,
        registerSectionOpen: registerSectionOpen,
        beginSectionAttention: beginSectionAttention,
        endSectionAttention: endSectionAttention,
        flushAttention: flushAttention,
        registerScroll: registerScroll,
        registerModeSwitch: registerModeSwitch,
        registerSuggestionResponse: registerSuggestionResponse,
        summarizeBehavior: summarizeBehavior
    };
});
