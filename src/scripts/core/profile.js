(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require("./content.js"));
    } else {
        root.ThinkingUIStudioProfile = factory(root.ThinkingUIStudioContent);
    }
})(typeof window !== "undefined" ? window : globalThis, function (content) {
    const VOWELS = "aeiouyаеёиоуыэюя";

    const SIGNAL_OPENERS = [
        "The interface is reading for a calmer thesis.",
        "The signal is strong enough to reduce ornament.",
        "This session wants a clearer center of gravity.",
        "The system can stay quiet while the intent sharpens."
    ];

    const ENERGY_LINES = [
        "The pace is measured, but not passive.",
        "There is enough friction here to make the next choice meaningful.",
        "The workspace can afford fewer, better cues.",
        "The brief benefits from confidence more than expansion."
    ];

    const NEXT_MOVES = [
        "Keep the reasoning visible while you test the next move.",
        "Lift the most probable action and dim the rest.",
        "Anchor the session around one clear action, then widen only if needed.",
        "Treat comparison as temporary, not structural."
    ];

    function normalizeText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function hasLetters(value) {
        return /[A-Za-zА-Яа-яЁё]/.test(value);
    }

    function isValidName(value) {
        return normalizeText(value).length > 0 && hasLetters(value);
    }

    function hashString(value) {
        let hash = 0;
        for (let index = 0; index < value.length; index += 1) {
            hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
        }
        return hash;
    }

    function pickBySeed(items, seed, offset) {
        return items[(seed + offset) % items.length];
    }

    function reverseName(name) {
        return Array.from(normalizeText(name)).reverse().join("");
    }

    function getNameMetrics(name) {
        const clean = normalizeText(name).replace(/[^A-Za-zА-Яа-яЁё]/g, "");
        const letters = Array.from(clean);
        const vowels = letters.filter(function (letter) {
            return VOWELS.indexOf(letter.toLowerCase()) >= 0;
        }).length;

        return {
            length: letters.length,
            vowels: vowels,
            consonants: Math.max(letters.length - vowels, 0),
            firstLetter: letters[0] ? letters[0].toUpperCase() : "-"
        };
    }

    function excerptPrompt(prompt) {
        const normalized = normalizeText(prompt);
        if (!normalized) {
            return "No prompt yet. The workspace will stay lighter until a brief appears.";
        }

        return normalized.length > 120 ? normalized.slice(0, 117) + "..." : normalized;
    }

    function buildSessionProfile(input, now) {
        const date = now instanceof Date ? now : new Date();
        const name = normalizeText(input && input.name);
        const prompt = normalizeText(input && input.prompt);
        const modeId = input && input.mode ? input.mode : "focus";
        const intentId = input && input.intent ? input.intent : "clarify";

        if (!isValidName(name)) {
            return null;
        }

        const mode = content.getMode(modeId);
        const intent = content.getIntent(intentId);
        const metrics = getNameMetrics(name);
        const seed = hashString([name, prompt, mode.id, intent.id].join(":"));
        const mirrored = reverseName(name);
        const promptExcerpt = excerptPrompt(prompt);
        const opener = pickBySeed(SIGNAL_OPENERS, seed, 0);
        const energyLine = pickBySeed(ENERGY_LINES, seed, 1);
        const nextMove = pickBySeed(NEXT_MOVES, seed, 2);
        const promptLead = prompt
            ? "Prompt registered and condensed into a single working line."
            : "A prompt is optional, so the system is leaning on mode and behavioral cues.";

        return {
            id: "session-" + date.getTime(),
            createdAt: date.toISOString(),
            name: name,
            mode: mode.id,
            modeLabel: mode.label,
            intent: intent.id,
            intentLabel: intent.label,
            prompt: prompt,
            promptExcerpt: promptExcerpt,
            metrics: metrics,
            mirroredName: mirrored,
            headline: name + " / " + mode.label,
            signalTitle: opener,
            signalSummary: "Built for " + intent.label.toLowerCase() + ". " + promptLead + " " + energyLine,
            nextMove: nextMove,
            statusLine: "Name signature " + metrics.firstLetter + " / " + metrics.length + " chars / " + metrics.vowels + " vowels.",
            insightCards: [
                {
                    id: "insight-signature",
                    title: "Name signature",
                    body: "The letter rhythm suggests a calm but visible anchor. Mirrored form: " + mirrored + ".",
                    metric: metrics.length + " chars"
                },
                {
                    id: "insight-mode",
                    title: mode.label + " mode",
                    body: mode.interfaceTone + " " + mode.prompts[seed % mode.prompts.length],
                    metric: mode.densityHint
                },
                {
                    id: "insight-intent",
                    title: intent.label + " intent",
                    body: intent.description + " Prompt excerpt: " + promptExcerpt,
                    metric: prompt ? "brief loaded" : "behavior led"
                }
            ],
            reasoningSeed: {
                why: "The initial arrangement is seeded from the selected mode and intent before any behavioral adaptation runs.",
                whatChanged: "The interface starts broad, then narrows or expands only through deterministic rules."
            }
        };
    }

    return {
        normalizeText: normalizeText,
        hasLetters: hasLetters,
        isValidName: isValidName,
        reverseName: reverseName,
        getNameMetrics: getNameMetrics,
        buildSessionProfile: buildSessionProfile
    };
});
