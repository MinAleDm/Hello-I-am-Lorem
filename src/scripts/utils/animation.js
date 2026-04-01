(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        root.ThinkingUIStudioAnimation = factory();
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    function prefersReducedMotion(scope) {
        const environment = scope || (typeof window !== "undefined" ? window : null);
        return Boolean(environment &&
            environment.matchMedia &&
            environment.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    function bindSpotlight(scope) {
        const environment = scope || (typeof window !== "undefined" ? window : null);
        if (!environment || !environment.document || prefersReducedMotion(environment)) {
            return function () {
                return null;
            };
        }

        const root = environment.document.documentElement;
        const handlePointerMove = function (event) {
            root.style.setProperty("--spotlight-x", event.clientX + "px");
            root.style.setProperty("--spotlight-y", event.clientY + "px");
        };

        environment.addEventListener("pointermove", handlePointerMove, { passive: true });
        return function () {
            environment.removeEventListener("pointermove", handlePointerMove);
        };
    }

    return {
        prefersReducedMotion: prefersReducedMotion,
        bindSpotlight: bindSpotlight
    };
});
