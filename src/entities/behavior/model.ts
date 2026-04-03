import type { BehaviorSignals } from "@/shared/types/focus-board";

export function createInitialBehaviorSignals(): BehaviorSignals {
  return {
    scrollBursts: 0,
    dwellBySection: {},
    sectionReopens: {},
    compareActions: 0,
    noteEdits: 0,
    layoutToggles: 0,
    optionSwitches: 0,
    lastScrollAt: null,
  };
}

export function registerScrollBurst(behavior: BehaviorSignals, timestamp = Date.now()) {
  const lastAt = behavior.lastScrollAt;
  const nextBursts = lastAt && timestamp - lastAt < 900 ? behavior.scrollBursts + 1 : behavior.scrollBursts;

  return {
    ...behavior,
    scrollBursts: nextBursts,
    lastScrollAt: timestamp,
  };
}
