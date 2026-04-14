import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFocusBoardStore } from "@/app/store/use-focus-board-store";
import { SessionStartScreen } from "@/features/session-start/components/session-start-screen";
import { SummaryView } from "@/features/summary/components/summary-view";
import { WorkspaceView } from "@/features/workspace/components/workspace-view";
import {
  buildSessionExportFileName,
  buildSessionMarkdown,
  createSessionSnapshot,
  downloadTextFile,
  openSessionPrintView,
  parseSessionSnapshot,
  serializeSessionSnapshot,
} from "@/shared/lib/session-library";
import { useWorkspaceScroll } from "@/shared/hooks/use-workspace-scroll";

export function FocusBoardPage() {
  const state = useFocusBoardStore(
    useShallow((store) => ({
      stage: store.stage,
      session: store.session,
      workspace: store.workspace,
      behavior: store.behavior,
      suggestions: store.suggestions,
      disabledSuggestionTypes: store.disabledSuggestionTypes,
      artifacts: store.artifacts,
      undoStack: store.undoStack,
      lastActionNote: store.lastActionNote,
      startedAt: store.startedAt,
      sessionLibrary: store.sessionLibrary,
    })),
  );

  const startSession = useFocusBoardStore((store) => store.startSession);
  const resetApp = useFocusBoardStore((store) => store.resetApp);
  const goToStart = useFocusBoardStore((store) => store.goToStart);
  const goToSummary = useFocusBoardStore((store) => store.goToSummary);
  const goToWorkspace = useFocusBoardStore((store) => store.goToWorkspace);
  const loadSession = useFocusBoardStore((store) => store.loadSession);
  const deleteSession = useFocusBoardStore((store) => store.deleteSession);
  const duplicateSession = useFocusBoardStore((store) => store.duplicateSession);
  const importSession = useFocusBoardStore((store) => store.importSession);
  const updateSessionField = useFocusBoardStore((store) => store.updateSessionField);
  const updateSessionListField = useFocusBoardStore((store) => store.updateSessionListField);
  const updateArtifactText = useFocusBoardStore((store) => store.updateArtifactText);
  const toggleShortlistOption = useFocusBoardStore((store) => store.toggleShortlistOption);
  const toggleSection = useFocusBoardStore((store) => store.toggleSection);
  const setDensity = useFocusBoardStore((store) => store.setDensity);
  const toggleCompareMode = useFocusBoardStore((store) => store.toggleCompareMode);
  const togglePinnedPanel = useFocusBoardStore((store) => store.togglePinnedPanel);
  const toggleHighlightedCriteria = useFocusBoardStore((store) => store.toggleHighlightedCriteria);
  const toggleFrozenLayout = useFocusBoardStore((store) => store.toggleFrozenLayout);
  const recordScroll = useFocusBoardStore((store) => store.recordScroll);
  const recordDwell = useFocusBoardStore((store) => store.recordDwell);
  const recordCompareAction = useFocusBoardStore((store) => store.recordCompareAction);
  const applySuggestion = useFocusBoardStore((store) => store.applySuggestion);
  const dismissSuggestion = useFocusBoardStore((store) => store.dismissSuggestion);
  const disableSuggestionType = useFocusBoardStore((store) => store.disableSuggestionType);
  const undoLastSuggestion = useFocusBoardStore((store) => store.undoLastSuggestion);
  const clearLastActionNote = useFocusBoardStore((store) => store.clearLastActionNote);

  useWorkspaceScroll(state.stage === "workspace", recordScroll);

  const currentSnapshot =
    state.session && state.artifacts
      ? createSessionSnapshot({
          session: state.session,
          artifacts: state.artifacts,
          workspace: state.workspace,
          behavior: state.behavior,
          suggestions: state.suggestions,
          disabledSuggestionTypes: state.disabledSuggestionTypes,
          startedAt: state.startedAt,
        })
      : null;

  function getSnapshotById(sessionId: string) {
    return state.sessionLibrary.find((entry) => entry.session.id === sessionId) ?? null;
  }

  function exportSessionJson(sessionId: string) {
    const snapshot = getSnapshotById(sessionId);

    if (!snapshot) {
      return;
    }

    downloadTextFile(
      buildSessionExportFileName(snapshot, "json"),
      serializeSessionSnapshot(snapshot),
      "application/json",
    );
  }

  function exportSessionMarkdown(sessionId: string) {
    const snapshot = getSnapshotById(sessionId);

    if (!snapshot) {
      return;
    }

    downloadTextFile(
      buildSessionExportFileName(snapshot, "md"),
      buildSessionMarkdown(snapshot),
      "text/markdown",
    );
  }

  function exportSessionPdf(sessionId: string) {
    const snapshot = getSnapshotById(sessionId);

    if (!snapshot) {
      return;
    }

    openSessionPrintView(snapshot);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const snapshot = parseSessionSnapshot(text);

    importSession(snapshot);
  }

  useEffect(() => {
    if (!state.lastActionNote) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearLastActionNote();
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [clearLastActionNote, state.lastActionNote]);

  return (
    <div className="relative min-h-screen">
      {state.stage === "start" ? (
        <SessionStartScreen
          onStart={startSession}
          sessions={state.sessionLibrary}
          activeSessionId={state.session?.id ?? null}
          onOpenSession={loadSession}
          onDuplicateSession={duplicateSession}
          onDeleteSession={deleteSession}
          onExportJson={exportSessionJson}
          onExportMarkdown={exportSessionMarkdown}
          onExportPdf={exportSessionPdf}
          onImportFile={handleImportFile}
        />
      ) : null}

      {state.stage === "workspace" ? (
        <WorkspaceView
          state={state}
          onBackToStart={goToStart}
          onOpenSummary={goToSummary}
          onTitleCommit={(value) => updateSessionField("title", value)}
          onQuestionCommit={(value) => updateSessionField("decisionQuestion", value)}
          onPrioritiesCommit={(value) => updateSessionListField("priorities", value)}
          onConstraintsCommit={(value) => updateSessionListField("constraints", value)}
          onSummaryCommit={(value) => updateArtifactText("summary", value, { markEdit: true })}
          onRecommendationCommit={(value) =>
            updateArtifactText("recommendation", value, { markEdit: true })
          }
          onNotesCommit={(value) => updateArtifactText("notes", value, { markEdit: true })}
          onFinalDecisionCommit={(value) =>
            updateArtifactText("finalDecision", value, { markEdit: true })
          }
          onRationaleCommit={(value) => updateArtifactText("rationale", value, { markEdit: true })}
          onNextStepCommit={(value) => updateArtifactText("nextStep", value, { markEdit: true })}
          onToggleShortlist={toggleShortlistOption}
          onToggleSection={toggleSection}
          onSetDensity={() => setDensity(state.workspace.density === "comfortable" ? "compact" : "comfortable")}
          onToggleCompare={toggleCompareMode}
          onTogglePinnedPanel={togglePinnedPanel}
          onToggleHighlightedCriteria={toggleHighlightedCriteria}
          onToggleFrozenLayout={toggleFrozenLayout}
          onRecordDwell={recordDwell}
          onRecordCompareAction={recordCompareAction}
          onApplySuggestion={applySuggestion}
          onDismissSuggestion={dismissSuggestion}
          onDisableSuggestion={disableSuggestionType}
          onUndoSuggestion={undoLastSuggestion}
          onReset={resetApp}
        />
      ) : null}

      {state.stage === "summary" && state.session && state.artifacts ? (
        <SummaryView
          session={state.session}
          artifacts={state.artifacts}
          suggestions={state.suggestions}
          behavior={state.behavior}
          workspace={state.workspace}
          currentSnapshot={currentSnapshot}
          onBack={goToWorkspace}
          onReset={resetApp}
          onExportJson={() => {
            if (!currentSnapshot) {
              return;
            }

            downloadTextFile(
              buildSessionExportFileName(currentSnapshot, "json"),
              serializeSessionSnapshot(currentSnapshot),
              "application/json",
            );
          }}
          onExportMarkdown={() => {
            if (!currentSnapshot) {
              return;
            }

            downloadTextFile(
              buildSessionExportFileName(currentSnapshot, "md"),
              buildSessionMarkdown(currentSnapshot),
              "text/markdown",
            );
          }}
          onExportPdf={() => {
            if (!currentSnapshot) {
              return;
            }

            openSessionPrintView(currentSnapshot);
          }}
        />
      ) : null}

      {state.lastActionNote ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-full bg-ink-950 px-5 py-3 text-sm text-white">
          {state.lastActionNote}
        </div>
      ) : null}
    </div>
  );
}
