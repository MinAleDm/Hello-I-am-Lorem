import { useEffect } from "react";

export function useWorkspaceScroll(enabled: boolean, onScrollBurst: () => void) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleScroll() {
      onScrollBurst();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [enabled, onScrollBurst]);
}
