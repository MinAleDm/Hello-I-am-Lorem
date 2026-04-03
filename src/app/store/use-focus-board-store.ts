import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialBehaviorSignals, registerScrollBurst } from "@/entities/behavior/model";
import { evaluateSuggestions, applySuggestionEffect, updateSuggestionStatus } from "@/entities/suggestion/model";
import { createDraftFromTemplate, createSessionFromDraft, updateSessionTimestamp } from "@/entities/session/model";
import { TEMPLATE_MAP } from "@/shared/config/templates";
import type {
  DecisionArtifacts,
  FocusBoardStoreState,
  OutputFormat,
  PanelKey,
  SessionDraft,
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

const initialState: FocusBoardStoreState = {
  stage: "start",
  session: null,
  workspace: initialWorkspace,
  behavior: createInitialBehaviorSignals(),
  suggestions: [],
  disabledSuggestionTypes: [],
  artifacts: null,
  undoStack: [],
  lastActionNote: null,
  startedAt: null,
};

function withEvaluatedSuggestions(state: FocusBoardStoreState): FocusBoardStoreState {
  return {
    ...state,
    suggestions: evaluateSuggestions(state),
  };
}

export const useFocusBoardStore = create<FocusBoardStore>()(
  persist(
    (set) => ({
      ...initialState,
      startFromTemplate: (templateId) => createDraftFromTemplate(templateId),
      goToStart: () => set((state) => ({ ...state, stage: "start" })),
      startSession: (draft) => {
        const { session, artifacts } = createSessionFromDraft(draft);

        set(() =>
          withEvaluatedSuggestions({
            ...initialState,
            stage: "workspace",
            session,
            artifacts,
            startedAt: new Date().toISOString(),
          }),
        );
      },
      resetApp: () => set(() => initialState),
      goToWorkspace: () => set((state) => ({ ...state, stage: "workspace" })),
      goToSummary: () =>
        set((state) =>
          state.session && state.artifacts
            ? { ...state, stage: "summary", workspace: { ...state.workspace, summaryReady: true } }
            : state,
        ),
      updateSessionField: (field, value) =>
        set((state) => {
          if (!state.session) {
            return state;
          }

          const nextSession = updateSessionTimestamp({
            ...state.session,
            [field]: value as string | OutputFormat,
          });

          return {
            ...state,
            session: nextSession,
          };
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

          return {
            ...state,
            session: nextSession,
          };
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

          return withEvaluatedSuggestions(nextState);
        }),
      toggleShortlistOption: (optionId) =>
        set((state) => {
          if (!state.artifacts) {
            return state;
          }

          const shortlistedOptions = state.artifacts.shortlistedOptions.includes(optionId)
            ? state.artifacts.shortlistedOptions.filter((entry) => entry !== optionId)
            : [...state.artifacts.shortlistedOptions, optionId];

          return withEvaluatedSuggestions({
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
          });
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

          return withEvaluatedSuggestions({
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
          });
        }),
      setDensity: (density) =>
        set((state) =>
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
            lastActionNote: `Density set to ${density}.`,
          }),
        ),
      toggleCompareMode: () =>
        set((state) =>
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
            lastActionNote: state.workspace.compareMode ? "Compare mode turned off." : "Compare mode turned on.",
          }),
        ),
      togglePinnedPanel: (panel) =>
        set((state) =>
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
      toggleHighlightedCriteria: () =>
        set((state) => ({
          ...state,
          workspace: {
            ...state.workspace,
            highlightedCriteria: !state.workspace.highlightedCriteria,
          },
        })),
      toggleFrozenLayout: () =>
        set((state) => ({
          ...state,
          workspace: {
            ...state.workspace,
            frozenLayout: !state.workspace.frozenLayout,
          },
          behavior: {
            ...state.behavior,
            layoutToggles: state.behavior.layoutToggles + 1,
          },
        })),
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

          return {
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
          };
        }),
      dismissSuggestion: (suggestionId) =>
        set((state) => ({
          ...state,
          suggestions: updateSuggestionStatus(state.suggestions, suggestionId, "dismissed"),
          lastActionNote: "Suggestion dismissed.",
        })),
      disableSuggestionType: (suggestionId) =>
        set((state) => {
          const suggestion = state.suggestions.find((entry) => entry.id === suggestionId);

          if (!suggestion) {
            return state;
          }

          return {
            ...state,
            disabledSuggestionTypes: Array.from(
              new Set([...state.disabledSuggestionTypes, suggestion.type]),
            ),
            suggestions: updateSuggestionStatus(state.suggestions, suggestionId, "disabled"),
            lastActionNote: "Similar suggestions will stay hidden.",
          };
        }),
      undoLastSuggestion: () =>
        set((state) => {
          const [lastUndo, ...remaining] = state.undoStack;

          if (!lastUndo) {
            return state;
          }

          return {
            ...state,
            stage: lastUndo.stage,
            workspace: lastUndo.workspace,
            artifacts: lastUndo.artifacts,
            suggestions: updateSuggestionStatus(state.suggestions, lastUndo.suggestionId, "pending" as SuggestionStatus),
            undoStack: remaining,
            lastActionNote: "The last suggestion was undone.",
          };
        }),
      clearLastActionNote: () => set((state) => ({ ...state, lastActionNote: null })),
    }),
    {
      name: "focusboard-store-v1",
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
      }),
    },
  ),
);

export function getDefaultDraft() {
  return createDraftFromTemplate(defaultTemplate.id);
}
