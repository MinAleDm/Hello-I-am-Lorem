import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialBehaviorSignals, registerScrollBurst } from "@/entities/behavior/model";
import { evaluateSuggestions, applySuggestionEffect, updateSuggestionStatus } from "@/entities/suggestion/model";
import { createDraftFromTemplate, createSessionFromDraft, updateSessionTimestamp } from "@/entities/session/model";
import {
  createSessionSnapshot,
  duplicateSessionSnapshot,
} from "@/shared/lib/session-library";
import { TEMPLATE_MAP } from "@/shared/config/templates";
import type {
  DecisionArtifacts,
  FocusBoardStoreState,
  OutputFormat,
  PanelKey,
  SessionDraft,
  SessionSnapshot,
  SessionTemplateId,
  SuggestionStatus,
  WorkspaceSectionKey,
} from "@/shared/types/focus-board";

interface FocusBoardStore extends FocusBoardStoreState {
  startFromTemplate: (templateId: SessionTemplateId) => SessionDraft;
  goToStart: () => void;
  startSession: (draft: SessionDraft) => void;
  resetApp: () => void;
  goToWorkspace: () => void;
  goToSummary: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  duplicateSession: (sessionId: string) => void;
  importSession: (snapshot: SessionSnapshot) => void;
  updateSessionField: (
    field: "title" | "decisionQuestion" | "outputFormat",
    value: string,
  ) => void;
  updateSessionListField: (field: "priorities" | "constraints", value: string[]) => void;
  updateArtifactText: (
    field: keyof Pick<
      DecisionArtifacts,
      "summary" | "recommendation" | "notes" | "finalDecision" | "rationale" | "nextStep"
    >,
    value: string,
    options?: {
      markEdit?: boolean;
    },
  ) => void;
  toggleShortlistOption: (optionId: string) => void;
  toggleSection: (section: WorkspaceSectionKey) => void;
  setDensity: (density: "comfortable" | "compact") => void;
  toggleCompareMode: () => void;
  togglePinnedPanel: (panel: PanelKey) => void;
  toggleHighlightedCriteria: () => void;
  toggleFrozenLayout: () => void;
  recordScroll: () => void;
  recordDwell: (section: WorkspaceSectionKey | PanelKey, durationMs: number) => void;
  recordCompareAction: () => void;
  recordNoteEdit: () => void;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  disableSuggestionType: (suggestionId: string) => void;
  undoLastSuggestion: () => void;
  clearLastActionNote: () => void;
}

const defaultTemplate = TEMPLATE_MAP["product-strategy"];

const initialWorkspace = {
  density: "comfortable" as const,
  compareMode: false,
  pinnedPanels: ["brief", "decision"] as PanelKey[],
  collapsedSections: [] as WorkspaceSectionKey[],
  frozenLayout: false,
  highlightedCriteria: false,
  prioritySection: null,
  summaryReady: false,
};

function clonePlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createEmptyState(sessionLibrary: SessionSnapshot[] = []): FocusBoardStoreState {
  return {
    stage: "start",
    session: null,
    workspace: clonePlainData(initialWorkspace),
    behavior: createInitialBehaviorSignals(),
    suggestions: [],
    disabledSuggestionTypes: [],
    artifacts: null,
    undoStack: [],
    lastActionNote: null,
    startedAt: null,
    sessionLibrary,
  };
}

const initialState = createEmptyState();

function withEvaluatedSuggestions(state: FocusBoardStoreState): FocusBoardStoreState {
  return {
    ...state,
    suggestions: evaluateSuggestions(state),
  };
}

function createSnapshotFromState(state: FocusBoardStoreState) {
  if (!state.session || !state.artifacts) {
    return null;
  }

  return createSessionSnapshot({
    session: state.session,
    artifacts: state.artifacts,
    workspace: state.workspace,
    behavior: state.behavior,
    suggestions: state.suggestions,
    disabledSuggestionTypes: state.disabledSuggestionTypes,
    startedAt: state.startedAt,
  });
}

function upsertSessionLibrary(sessionLibrary: SessionSnapshot[], snapshot: SessionSnapshot) {
  return [snapshot, ...sessionLibrary.filter((entry) => entry.session.id !== snapshot.session.id)].sort(
    (left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt),
  );
}

function withSyncedLibrary(state: FocusBoardStoreState) {
  const snapshot = createSnapshotFromState(state);

  if (!snapshot) {
    return state;
  }

  return {
    ...state,
    sessionLibrary: upsertSessionLibrary(state.sessionLibrary, snapshot),
  };
}

function createStateFromSnapshot(
  snapshot: SessionSnapshot,
  sessionLibrary: SessionSnapshot[],
  note: string,
): FocusBoardStoreState {
  return {
    stage: "workspace",
    session: clonePlainData(snapshot.session),
    workspace: clonePlainData(snapshot.workspace),
    behavior: clonePlainData(snapshot.behavior),
    suggestions: clonePlainData(snapshot.suggestions),
    disabledSuggestionTypes: clonePlainData(snapshot.disabledSuggestionTypes),
    artifacts: clonePlainData(snapshot.artifacts),
    undoStack: [],
    lastActionNote: note,
    startedAt: snapshot.startedAt,
    sessionLibrary,
  };
}

function ensureUniqueImportedSnapshot(
  snapshot: SessionSnapshot,
  sessionLibrary: SessionSnapshot[],
): SessionSnapshot {
  if (!sessionLibrary.some((entry) => entry.session.id === snapshot.session.id)) {
    return snapshot;
  }

  const duplicated = duplicateSessionSnapshot(snapshot);

  return {
    ...duplicated,
    session: {
      ...duplicated.session,
      title: `${snapshot.session.title} (импорт)`,
    },
  };
}

export const useFocusBoardStore = create<FocusBoardStore>()(
  persist(
    (set) => ({
      ...initialState,
      startFromTemplate: (templateId) => createDraftFromTemplate(templateId),
      goToStart: () => set((state) => ({ ...withSyncedLibrary(state), stage: "start" })),
      startSession: (draft) => {
        const { session, artifacts } = createSessionFromDraft(draft);

        set((state) =>
          withSyncedLibrary(
            withEvaluatedSuggestions({
              ...createEmptyState(state.sessionLibrary),
              stage: "workspace",
              session,
              artifacts,
              startedAt: new Date().toISOString(),
            }),
          ),
        );
      },
      resetApp: () =>
        set((state) => {
          const syncedState = withSyncedLibrary(state);

          return {
            ...createEmptyState(syncedState.sessionLibrary),
            lastActionNote: "Текущая сессия сохранена в библиотеке.",
          };
        }),
      goToWorkspace: () => set((state) => ({ ...withSyncedLibrary(state), stage: "workspace" })),
      goToSummary: () =>
        set((state) =>
          state.session && state.artifacts
            ? withSyncedLibrary({
                ...state,
                stage: "summary",
                workspace: { ...state.workspace, summaryReady: true },
              })
            : state,
        ),
      loadSession: (sessionId) =>
        set((state) => {
          const syncedState = withSyncedLibrary(state);
          const snapshot = syncedState.sessionLibrary.find((entry) => entry.session.id === sessionId);

          if (!snapshot) {
            return syncedState;
          }

          return createStateFromSnapshot(snapshot, syncedState.sessionLibrary, "Сессия открыта из библиотеки.");
        }),
      deleteSession: (sessionId) =>
        set((state) => {
          const syncedState = withSyncedLibrary(state);
          const sessionLibrary = syncedState.sessionLibrary.filter((entry) => entry.session.id !== sessionId);

          if (syncedState.session?.id === sessionId) {
            return {
              ...createEmptyState(sessionLibrary),
              lastActionNote: "Сессия удалена из библиотеки.",
            };
          }

          return {
            ...syncedState,
            sessionLibrary,
            lastActionNote: "Сессия удалена из библиотеки.",
          };
        }),
      duplicateSession: (sessionId) =>
        set((state) => {
          const syncedState = withSyncedLibrary(state);
          const snapshot = syncedState.sessionLibrary.find((entry) => entry.session.id === sessionId);

          if (!snapshot) {
            return syncedState;
          }

          const duplicate = duplicateSessionSnapshot(snapshot);
          const sessionLibrary = upsertSessionLibrary(syncedState.sessionLibrary, duplicate);

          return createStateFromSnapshot(duplicate, sessionLibrary, "Создана копия сессии.");
        }),
      importSession: (snapshot) =>
        set((state) => {
          const syncedState = withSyncedLibrary(state);
          const importedSnapshot = ensureUniqueImportedSnapshot(snapshot, syncedState.sessionLibrary);
          const sessionLibrary = upsertSessionLibrary(syncedState.sessionLibrary, importedSnapshot);

          return createStateFromSnapshot(importedSnapshot, sessionLibrary, "Сессия импортирована из файла.");
        }),
      updateSessionField: (field, value) =>
        set((state) => {
          if (!state.session) {
            return state;
          }

          const nextSession = updateSessionTimestamp({
            ...state.session,
            [field]: value as string | OutputFormat,
          });

          return withSyncedLibrary({
            ...state,
            session: nextSession,
          });
        }),
      updateSessionListField: (field, value) =>
        set((state) => {
          if (!state.session) {
            return state;
          }

          const nextSession = updateSessionTimestamp({
            ...state.session,
            [field]: value,
          });

          return withSyncedLibrary({
            ...state,
            session: nextSession,
          });
        }),
      updateArtifactText: (field, value, options) =>
        set((state) => {
          if (!state.artifacts) {
            return state;
          }

          const nextState: FocusBoardStoreState = {
            ...state,
            artifacts: {
              ...state.artifacts,
              [field]: value,
            },
          };

          if (options?.markEdit) {
            nextState.behavior = {
              ...state.behavior,
              noteEdits: state.behavior.noteEdits + 1,
            };
          }

          return withSyncedLibrary(withEvaluatedSuggestions(nextState));
        }),
      toggleShortlistOption: (optionId) =>
        set((state) => {
          if (!state.artifacts) {
            return state;
          }

          const shortlistedOptions = state.artifacts.shortlistedOptions.includes(optionId)
            ? state.artifacts.shortlistedOptions.filter((entry) => entry !== optionId)
            : [...state.artifacts.shortlistedOptions, optionId];

          return withSyncedLibrary(
            withEvaluatedSuggestions({
              ...state,
              artifacts: {
                ...state.artifacts,
                shortlistedOptions,
              },
              behavior: {
                ...state.behavior,
                compareActions: state.behavior.compareActions + 1,
                optionSwitches: state.behavior.optionSwitches + 1,
              },
            }),
          );
        }),
      toggleSection: (section) =>
        set((state) => {
          const isCollapsed = state.workspace.collapsedSections.includes(section);
          const nextCollapsedSections = isCollapsed
            ? state.workspace.collapsedSections.filter((entry) => entry !== section)
            : [...state.workspace.collapsedSections, section];

          const reopenCount = isCollapsed
            ? (state.behavior.sectionReopens[section] ?? 0) + 1
            : state.behavior.sectionReopens[section] ?? 0;

          return withSyncedLibrary(
            withEvaluatedSuggestions({
              ...state,
              workspace: {
                ...state.workspace,
                collapsedSections: nextCollapsedSections,
              },
              behavior: {
                ...state.behavior,
                sectionReopens: {
                  ...state.behavior.sectionReopens,
                  [section]: reopenCount,
                },
              },
            }),
          );
        }),
      setDensity: (density) =>
        set((state) =>
          withSyncedLibrary(
            withEvaluatedSuggestions({
              ...state,
              workspace: {
                ...state.workspace,
                density,
              },
              behavior: {
                ...state.behavior,
                layoutToggles: state.behavior.layoutToggles + 1,
              },
              lastActionNote:
                density === "compact" ? "Плотность переключена на компактную." : "Плотность переключена на комфортную.",
            }),
          ),
        ),
      toggleCompareMode: () =>
        set((state) =>
          withSyncedLibrary(
            withEvaluatedSuggestions({
              ...state,
              workspace: {
                ...state.workspace,
                compareMode: !state.workspace.compareMode,
              },
              behavior: {
                ...state.behavior,
                compareActions: state.behavior.compareActions + 1,
                layoutToggles: state.behavior.layoutToggles + 1,
              },
              lastActionNote: state.workspace.compareMode ? "Режим сравнения выключен." : "Режим сравнения включён.",
            }),
          ),
        ),
      togglePinnedPanel: (panel) =>
        set((state) =>
          withSyncedLibrary(
            withEvaluatedSuggestions({
              ...state,
              workspace: {
                ...state.workspace,
                pinnedPanels: state.workspace.pinnedPanels.includes(panel)
                  ? state.workspace.pinnedPanels.filter((entry) => entry !== panel)
                  : [...state.workspace.pinnedPanels, panel],
              },
              behavior: {
                ...state.behavior,
                layoutToggles: state.behavior.layoutToggles + 1,
              },
            }),
          ),
        ),
      toggleHighlightedCriteria: () =>
        set((state) =>
          withSyncedLibrary({
            ...state,
            workspace: {
              ...state.workspace,
              highlightedCriteria: !state.workspace.highlightedCriteria,
            },
          }),
        ),
      toggleFrozenLayout: () =>
        set((state) =>
          withSyncedLibrary({
            ...state,
            workspace: {
              ...state.workspace,
              frozenLayout: !state.workspace.frozenLayout,
            },
            behavior: {
              ...state.behavior,
              layoutToggles: state.behavior.layoutToggles + 1,
            },
          }),
        ),
      recordScroll: () =>
        set((state) =>
          withEvaluatedSuggestions({
            ...state,
            behavior: registerScrollBurst(state.behavior),
          }),
        ),
      recordDwell: (section, durationMs) =>
        set((state) =>
          withEvaluatedSuggestions({
            ...state,
            behavior: {
              ...state.behavior,
              dwellBySection: {
                ...state.behavior.dwellBySection,
                [section]: (state.behavior.dwellBySection[section] ?? 0) + durationMs,
              },
            },
          }),
        ),
      recordCompareAction: () =>
        set((state) =>
          withEvaluatedSuggestions({
            ...state,
            behavior: {
              ...state.behavior,
              compareActions: state.behavior.compareActions + 1,
            },
          }),
        ),
      recordNoteEdit: () =>
        set((state) =>
          withEvaluatedSuggestions({
            ...state,
            behavior: {
              ...state.behavior,
              noteEdits: state.behavior.noteEdits + 1,
            },
          }),
        ),
      applySuggestion: (suggestionId) =>
        set((state) => {
          if (!state.artifacts) {
            return state;
          }

          const suggestion = state.suggestions.find((entry) => entry.id === suggestionId);

          if (!suggestion) {
            return state;
          }

          const effect = applySuggestionEffect(suggestion.type, state.workspace, state.artifacts);

          return withSyncedLibrary({
            ...state,
            stage: effect.stage ?? state.stage,
            workspace: effect.workspace,
            artifacts: effect.artifacts,
            suggestions: updateSuggestionStatus(state.suggestions, suggestionId, "applied"),
            undoStack: [
              {
                suggestionId,
                stage: state.stage,
                workspace: state.workspace,
                artifacts: state.artifacts,
              },
              ...state.undoStack,
            ].slice(0, 8),
            lastActionNote: effect.note,
          });
        }),
      dismissSuggestion: (suggestionId) =>
        set((state) =>
          withSyncedLibrary({
            ...state,
            suggestions: updateSuggestionStatus(state.suggestions, suggestionId, "dismissed"),
            lastActionNote: "Подсказка скрыта.",
          }),
        ),
      disableSuggestionType: (suggestionId) =>
        set((state) => {
          const suggestion = state.suggestions.find((entry) => entry.id === suggestionId);

          if (!suggestion) {
            return state;
          }

          return withSyncedLibrary({
            ...state,
            disabledSuggestionTypes: Array.from(
              new Set([...state.disabledSuggestionTypes, suggestion.type]),
            ),
            suggestions: updateSuggestionStatus(state.suggestions, suggestionId, "disabled"),
            lastActionNote: "Похожие подсказки больше не будут показываться.",
          });
        }),
      undoLastSuggestion: () =>
        set((state) => {
          const [lastUndo, ...remaining] = state.undoStack;

          if (!lastUndo) {
            return state;
          }

          return withSyncedLibrary({
            ...state,
            stage: lastUndo.stage,
            workspace: lastUndo.workspace,
            artifacts: lastUndo.artifacts,
            suggestions: updateSuggestionStatus(
              state.suggestions,
              lastUndo.suggestionId,
              "pending" as SuggestionStatus,
            ),
            undoStack: remaining,
            lastActionNote: "Последнее действие по подсказке отменено.",
          });
        }),
      clearLastActionNote: () => set((state) => ({ ...state, lastActionNote: null })),
    }),
    {
      name: "focusboard-store-v3",
      partialize: (state) => ({
        stage: state.stage,
        session: state.session,
        workspace: state.workspace,
        behavior: state.behavior,
        suggestions: state.suggestions,
        disabledSuggestionTypes: state.disabledSuggestionTypes,
        artifacts: state.artifacts,
        undoStack: state.undoStack,
        lastActionNote: state.lastActionNote,
        startedAt: state.startedAt,
        sessionLibrary: state.sessionLibrary,
      }),
    },
  ),
);

export function getDefaultDraft() {
  return createDraftFromTemplate(defaultTemplate.id);
}
