import { useRef } from "react";

export function useSectionDwell(onCommit: (durationMs: number) => void) {
  const startedAtRef = useRef<number | null>(null);

  function begin() {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
  }

  function end() {
    if (startedAtRef.current === null) {
      return;
    }

    const duration = Date.now() - startedAtRef.current;
    startedAtRef.current = null;

    if (duration > 250) {
      onCommit(duration);
    }
  }

  return {
    onMouseEnter: begin,
    onFocus: begin,
    onMouseLeave: end,
    onBlur: end,
  };
}
