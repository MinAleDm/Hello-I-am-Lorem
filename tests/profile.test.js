const {
    normalizeText,
    reverseName,
    getNameMetrics,
    buildSessionProfile
} = require("../src/scripts/core/profile.js");

describe("session profile model", () => {
    test("normalizeText trims repeated whitespace", () => {
        expect(normalizeText("  Ada   Lovelace  ")).toBe("Ada Lovelace");
    });

    test("reverseName mirrors the normalized name", () => {
        expect(reverseName(" Nadia ")).toBe("aidaN");
    });

    test("getNameMetrics counts letters predictably", () => {
        expect(getNameMetrics("Анна")).toEqual({
            length: 4,
            vowels: 2,
            consonants: 2,
            firstLetter: "А"
        });
    });

    test("buildSessionProfile creates a deterministic session payload", () => {
        const fixedDate = new Date("2026-04-01T09:00:00.000Z");
        const profile = buildSessionProfile({
            name: "Mira",
            prompt: "Need a calmer way to read product feedback.",
            mode: "reflect",
            intent: "reframe"
        }, fixedDate);

        expect(profile).toMatchObject({
            id: "session-1775034000000",
            name: "Mira",
            mode: "reflect",
            modeLabel: "Reflect",
            intent: "reframe",
            intentLabel: "Reframe",
            mirroredName: "ariM"
        });
        expect(profile.signalSummary).toContain("reframe");
        expect(profile.insightCards).toHaveLength(3);
    });

    test("buildSessionProfile returns null for invalid names", () => {
        expect(buildSessionProfile({
            name: "   ",
            prompt: "",
            mode: "focus",
            intent: "clarify"
        })).toBeNull();
    });
});
