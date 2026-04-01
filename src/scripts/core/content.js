(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        root.ThinkingUIStudioContent = factory();
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    const MODES = {
        focus: {
            id: "focus",
            label: "Focus",
            eyebrow: "Precision tuned",
            densityHint: "low-noise",
            interfaceTone: "Keeps the workspace narrow, calm and decisive.",
            motionHint: "Measured transitions and restrained emphasis.",
            prompts: [
                "Reduce noise until the next move feels obvious.",
                "Keep the signal strong and the surface quiet.",
                "Hold only the controls that support completion."
            ]
        },
        explore: {
            id: "explore",
            label: "Explore",
            eyebrow: "Pattern seeking",
            densityHint: "layered",
            interfaceTone: "Lets comparisons and alternate paths stay visible a little longer.",
            motionHint: "Broader reveals and slightly more lateral movement.",
            prompts: [
                "Surface alternatives before the direction hardens.",
                "Invite a wider reading of the same signal.",
                "Let adjacent possibilities stay in frame."
            ]
        },
        reflect: {
            id: "reflect",
            label: "Reflect",
            eyebrow: "Memory aware",
            densityHint: "soft-focus",
            interfaceTone: "Brings memory, rationale and context closer to the center.",
            motionHint: "Longer fades and quieter shifts between states.",
            prompts: [
                "Make room for nuance before deciding.",
                "Keep context visible while the signal settles.",
                "Move at the pace of synthesis, not urgency."
            ]
        },
        decide: {
            id: "decide",
            label: "Decide",
            eyebrow: "Commitment ready",
            densityHint: "high-clarity",
            interfaceTone: "Raises calls to action and shortens the path to commitment.",
            motionHint: "Sharper emphasis with shorter transition paths.",
            prompts: [
                "Bring the strongest option to the front.",
                "Shorten the distance between insight and action.",
                "Keep alternatives visible only while they help."
            ]
        }
    };

    const MODE_SEQUENCE = ["focus", "explore", "reflect", "decide"];

    const INTENTS = [
        {
            id: "clarify",
            label: "Clarify",
            description: "Tighten the brief and remove ambiguity."
        },
        {
            id: "sensemaking",
            label: "Sensemaking",
            description: "See patterns across scattered signals."
        },
        {
            id: "reframe",
            label: "Reframe",
            description: "Shift perspective without losing context."
        },
        {
            id: "commit",
            label: "Commit",
            description: "Turn comparison into a decision."
        }
    ];

    const SECTION_DEFINITIONS = [
        {
            id: "signal",
            label: "Signal card",
            eyebrow: "Live signal",
            summary: "The current session thesis and the next best move."
        },
        {
            id: "suggestions",
            label: "Adaptive suggestions",
            eyebrow: "Mixed initiative",
            summary: "Actions the system can raise without taking control away."
        },
        {
            id: "insights",
            label: "Insight stream",
            eyebrow: "Interpretation",
            summary: "Condensed observations shaped by mode, intent and prompt."
        },
        {
            id: "reasoning",
            label: "Interface reasoning log",
            eyebrow: "Explainability",
            summary: "Why the interface changed, and what you can do about it."
        },
        {
            id: "memory",
            label: "Behavioral memory",
            eyebrow: "Local memory",
            summary: "What the studio has learned locally about your working style."
        },
        {
            id: "behavior",
            label: "Behavior panel",
            eyebrow: "Visible system status",
            summary: "Deterministic signals from clicks, attention and scroll rhythm."
        },
        {
            id: "history",
            label: "Session history",
            eyebrow: "Session memory",
            summary: "Recent sessions kept on-device for fast re-entry."
        },
        {
            id: "controls",
            label: "Personalization controls",
            eyebrow: "User control first",
            summary: "Toggle adaptation, lock the layout or pin key surfaces."
        }
    ];

    const SECTION_KEYS = SECTION_DEFINITIONS.map(function (section) {
        return section.id;
    });

    const DEFAULT_ORDER = ["signal", "suggestions", "insights", "reasoning", "memory", "behavior", "history", "controls"];

    const DEFAULT_EXPANDED_SECTIONS = {
        signal: true,
        suggestions: true,
        insights: true,
        reasoning: true,
        memory: false,
        behavior: true,
        history: false,
        controls: false
    };

    const RULE_LABELS = {
        "density.compact-scan": "Compact density",
        "layout.focus-insights": "Insight-first workspace",
        "layout.pin-history": "Pinned history",
        "suggestions.raise-decision": "Decision priority",
        "controls.reveal-advanced": "Advanced controls revealed",
        "layout.raise-reasoning": "Reasoning moved up"
    };

    const SAMPLE_SESSIONS = {
        focus: {
            name: "Nadia",
            prompt: "I need to narrow three feature ideas into one clear direction for the landing experience.",
            intent: "clarify"
        },
        explore: {
            name: "Ilya",
            prompt: "I want the interface to feel more cinematic without becoming harder to scan.",
            intent: "sensemaking"
        },
        reflect: {
            name: "Mira",
            prompt: "I have strong feedback from users, but I need a calmer way to read the pattern behind it.",
            intent: "reframe"
        },
        decide: {
            name: "Artem",
            prompt: "I am between two UI directions and need help committing without losing the rationale.",
            intent: "commit"
        }
    };

    const PATTERN_COPY = {
        scanning: {
            label: "Scanning",
            summary: "Fast passes, short attention windows and repeated movement across cards."
        },
        deepFocus: {
            label: "Deep focus",
            summary: "Longer attention on fewer surfaces, with lower switching cost."
        },
        exploration: {
            label: "Exploration",
            summary: "The workspace is being sampled broadly to compare routes and find shape."
        },
        decision: {
            label: "Decision mode",
            summary: "Repeated comparisons suggest the interface should shorten the path to commitment."
        }
    };

    function getMode(modeId) {
        return MODES[modeId] || MODES.focus;
    }

    function getIntent(intentId) {
        return INTENTS.find(function (intent) {
            return intent.id === intentId;
        }) || INTENTS[0];
    }

    function getSectionMeta(sectionId) {
        return SECTION_DEFINITIONS.find(function (section) {
            return section.id === sectionId;
        }) || SECTION_DEFINITIONS[0];
    }

    return {
        MODES: MODES,
        MODE_SEQUENCE: MODE_SEQUENCE,
        INTENTS: INTENTS,
        SECTION_DEFINITIONS: SECTION_DEFINITIONS,
        SECTION_KEYS: SECTION_KEYS,
        DEFAULT_ORDER: DEFAULT_ORDER,
        DEFAULT_EXPANDED_SECTIONS: DEFAULT_EXPANDED_SECTIONS,
        SAMPLE_SESSIONS: SAMPLE_SESSIONS,
        PATTERN_COPY: PATTERN_COPY,
        RULE_LABELS: RULE_LABELS,
        getMode: getMode,
        getIntent: getIntent,
        getSectionMeta: getSectionMeta
    };
});
