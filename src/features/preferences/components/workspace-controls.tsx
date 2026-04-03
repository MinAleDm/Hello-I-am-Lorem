import { LayoutTemplate, PanelTop, Pin, Shrink, Sparkle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Surface } from "@/shared/ui/surface";
import type { WorkspaceState } from "@/shared/types/focus-board";

interface WorkspaceControlsProps {
  workspace: WorkspaceState;
  onDensityToggle: () => void;
  onCompareToggle: () => void;
  onFrozenToggle: () => void;
  onHighlightToggle: () => void;
  onPinInsights: () => void;
}

export function WorkspaceControls({
  workspace,
  onDensityToggle,
  onCompareToggle,
  onFrozenToggle,
  onHighlightToggle,
  onPinInsights,
}: WorkspaceControlsProps) {
  return (
    <Surface className="rounded-[24px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Управление пространством
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">Спокойные настройки компоновки</h3>
        </div>
        {workspace.frozenLayout ? <Badge tone="sage">Зафиксировано</Badge> : null}
      </div>

      <div className="mt-5 grid gap-3">
        <ControlRow
          icon={Shrink}
          title={workspace.density === "compact" ? "Плотность: компактная" : "Плотность: комфортная"}
          body="Переключайтесь между свободными и компактными отступами."
          actionLabel="Сменить плотность"
          onAction={onDensityToggle}
        />
        <ControlRow
          icon={PanelTop}
          title={workspace.compareMode ? "Режим сравнения включён" : "Режим сравнения выключен"}
          body="Сравнивайте варианты по одним и тем же критериям, когда нужен обзор бок о бок."
          actionLabel={workspace.compareMode ? "Скрыть таблицу сравнения" : "Показать таблицу сравнения"}
          onAction={onCompareToggle}
        />
        <ControlRow
          icon={Pin}
          title={workspace.pinnedPanels.includes("insights") ? "Инсайты закреплены" : "Закрепить инсайты"}
          body="Держите аргументы на виду в правой колонке, пока формулируете финальный выбор."
          actionLabel={workspace.pinnedPanels.includes("insights") ? "Открепить инсайты" : "Закрепить инсайты"}
          onAction={onPinInsights}
        />
        <ControlRow
          icon={Sparkle}
          title={workspace.highlightedCriteria ? "Критерии подсвечены" : "Подсветить критерии"}
          body="Зрительно зафиксируйте то, что важнее всего, пока оцениваете варианты."
          actionLabel={workspace.highlightedCriteria ? "Убрать подсветку" : "Подсветить критерии"}
          onAction={onHighlightToggle}
        />
        <ControlRow
          icon={LayoutTemplate}
          title={workspace.frozenLayout ? "Компоновка зафиксирована" : "Зафиксировать текущую компоновку"}
          body="Сохраните интерфейс стабильным, пока завершаете рекомендацию."
          actionLabel={workspace.frozenLayout ? "Снять фиксацию" : "Зафиксировать"}
          onAction={onFrozenToggle}
        />
      </div>
    </Surface>
  );
}

interface ControlRowProps {
  icon: typeof LayoutTemplate;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

function ControlRow({ icon: Icon, title, body, actionLabel, onAction }: ControlRowProps) {
  return (
    <div className="border-t border-ink-950/8 pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-full border border-ink-950/8 p-2">
            <Icon className="h-4 w-4 text-ink-950/65" />
          </div>
          <div>
            <p className="font-semibold text-ink-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-ink-950/60">{body}</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
