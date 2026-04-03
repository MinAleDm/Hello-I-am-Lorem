import { Clock3, FileText, Flag, ShieldAlert } from "lucide-react";
import { EditableTextarea } from "@/shared/ui/editable-textarea";
import { Surface } from "@/shared/ui/surface";
import { getTemplateLabel } from "@/shared/lib/labels";
import { formatDateTime } from "@/shared/lib/time";
import type { Session } from "@/shared/types/focus-board";

interface BriefPanelProps {
  session: Session;
  onTitleCommit: (value: string) => void;
  onQuestionCommit: (value: string) => void;
  onPrioritiesCommit: (value: string[]) => void;
  onConstraintsCommit: (value: string[]) => void;
}

export function BriefPanel({
  session,
  onTitleCommit,
  onQuestionCommit,
  onPrioritiesCommit,
  onConstraintsCommit,
}: BriefPanelProps) {
  return (
    <Surface className="rounded-[24px] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
        <Clock3 className="h-3.5 w-3.5" />
        Бриф сессии
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/38">Название</p>
          <EditableTextarea value={session.title} onCommit={onTitleCommit} rows={2} className="mt-2" />
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/38">
            <FileText className="h-3.5 w-3.5" />
            Главный вопрос
          </div>
          <EditableTextarea
            value={session.decisionQuestion}
            onCommit={onQuestionCommit}
            rows={5}
            className="mt-2"
          />
        </div>

        <div className="grid gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/38">
              <Flag className="h-3.5 w-3.5" />
              Что важнее всего
            </div>
            <EditableTextarea
              value={session.priorities.join("\n")}
              onCommit={(value) =>
                onPrioritiesCommit(
                  value
                    .split("\n")
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                )
              }
              rows={5}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/38">
              <ShieldAlert className="h-3.5 w-3.5" />
              Ограничения
            </div>
            <EditableTextarea
              value={session.constraints.join("\n")}
              onCommit={(value) =>
                onConstraintsCommit(
                  value
                    .split("\n")
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                )
              }
              rows={5}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-ink-950/8 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">Метаданные сессии</p>
        <div className="mt-3 space-y-2 text-sm text-ink-950/64">
          <p>Формат результата: {session.outputFormat}</p>
          <p>Шаблон: {getTemplateLabel(session.template)}</p>
          <p>Обновлено: {formatDateTime(session.updatedAt)}</p>
        </div>
      </div>
    </Surface>
  );
}
