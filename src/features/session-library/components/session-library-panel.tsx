import { useRef, useState } from "react";
import { Copy, Download, FileJson2, FileText, FolderOpen, Printer, Trash2, Upload } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Surface } from "@/shared/ui/surface";
import { formatDateTime } from "@/shared/lib/time";
import type { SessionSnapshot } from "@/shared/types/focus-board";

interface SessionLibraryPanelProps {
  sessions: SessionSnapshot[];
  activeSessionId: string | null;
  onOpenSession: (sessionId: string) => void;
  onDuplicateSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportJson: (sessionId: string) => void;
  onExportMarkdown: (sessionId: string) => void;
  onExportPdf: (sessionId: string) => void;
  onImportFile: (file: File) => Promise<void>;
}

export function SessionLibraryPanel({
  sessions,
  activeSessionId,
  onOpenSession,
  onDuplicateSession,
  onDeleteSession,
  onExportJson,
  onExportMarkdown,
  onExportPdf,
  onImportFile,
}: SessionLibraryPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  async function handleImport(file: File | null) {
    if (!file) {
      return;
    }

    setImportError(null);
    setIsImporting(true);

    try {
      await onImportFile(file);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Не удалось импортировать файл.");
    } finally {
      setIsImporting(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Surface className="rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-950/45">Мои сессии</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink-950">Библиотека локальных решений.</h2>
          <p className="mt-3 text-sm leading-6 text-ink-950/65">
            Здесь остаются предыдущие сессии, их копии и импортированные файлы. Можно быстро вернуться к работе,
            выгрузить результат или собрать новую ветку решения на основе старой.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              void handleImport(event.target.files?.[0] ?? null);
            }}
          />
          <Button
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="h-4 w-4" />
            {isImporting ? "Импорт..." : "Импорт JSON"}
          </Button>
        </div>
      </div>

      {importError ? <p className="mt-4 text-sm text-rose-600">{importError}</p> : null}

      <div className="mt-6 space-y-4">
        {sessions.length ? (
          sessions.map((snapshot) => {
            const isActive = snapshot.session.id === activeSessionId;

            return (
              <div
                key={snapshot.session.id}
                className="rounded-[24px] border border-ink-950/8 bg-mist-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{snapshot.session.outputFormat}</Badge>
                      <Badge>{formatDateTime(snapshot.savedAt)}</Badge>
                      {isActive ? <Badge tone="sage">Текущая</Badge> : null}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-ink-950">{snapshot.session.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-950/64">
                      {snapshot.session.decisionQuestion}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink-950/42">
                      Шорт-лист: {snapshot.artifacts.shortlistedOptions.length} · Подсказок: {snapshot.suggestions.length}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-[360px] lg:justify-end">
                    <Button size="sm" onClick={() => onOpenSession(snapshot.session.id)}>
                      <FolderOpen className="h-4 w-4" />
                      Открыть
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onDuplicateSession(snapshot.session.id)}>
                      <Copy className="h-4 w-4" />
                      Дублировать
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onExportJson(snapshot.session.id)}>
                      <FileJson2 className="h-4 w-4" />
                      JSON
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onExportMarkdown(snapshot.session.id)}>
                      <FileText className="h-4 w-4" />
                      Markdown
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onExportPdf(snapshot.session.id)}>
                      <Printer className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (window.confirm(`Удалить сессию «${snapshot.session.title}» из библиотеки?`)) {
                          onDeleteSession(snapshot.session.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-ink-950/12 bg-mist-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-950">
              <Download className="h-4 w-4" />
              Библиотека пока пуста
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-950/60">
              Создайте первую сессию или импортируйте ранее сохранённый JSON-файл FocusBoard.
            </p>
          </div>
        )}
      </div>
    </Surface>
  );
}
