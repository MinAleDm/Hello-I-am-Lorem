import { buildSessionId } from "@/shared/lib/text";
import type {
  BehaviorSignals,
  DecisionArtifacts,
  Session,
  SessionSnapshot,
  Suggestion,
  SuggestionType,
  WorkspaceState,
} from "@/shared/types/focus-board";

const SESSION_SNAPSHOT_SCHEMA_VERSION = 1;

function clonePlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function ensureSnapshotShape(value: unknown): asserts value is SessionSnapshot {
  if (!isRecord(value)) {
    throw new Error("Файл не похож на экспорт FocusBoard.");
  }

  if (!isRecord(value.session) || typeof value.session.id !== "string" || typeof value.session.title !== "string") {
    throw new Error("В файле нет корректных данных сессии.");
  }

  if (!isRecord(value.artifacts) || !Array.isArray(value.artifacts.options) || !Array.isArray(value.artifacts.insights)) {
    throw new Error("В файле нет артефактов решения.");
  }

  if (!isRecord(value.workspace) || !Array.isArray(value.workspace.pinnedPanels)) {
    throw new Error("В файле нет данных рабочего пространства.");
  }

  if (!isRecord(value.behavior) || typeof value.behavior.noteEdits !== "number") {
    throw new Error("В файле нет поведенческих сигналов.");
  }

  if (!Array.isArray(value.suggestions) || !isStringArray(value.disabledSuggestionTypes)) {
    throw new Error("В файле нет данных подсказок.");
  }
}

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- Нет данных";
}

function formatParagraph(value: string) {
  return value.trim() || "Нет данных";
}

function buildPrintStyles() {
  return `
    :root {
      color: #111111;
      font-family: Manrope, system-ui, sans-serif;
      line-height: 1.55;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 32px;
      color: #111111;
      background: #ffffff;
    }
    h1, h2, h3, p {
      margin: 0;
    }
    .page {
      max-width: 860px;
      margin: 0 auto;
    }
    .eyebrow {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: rgba(17, 17, 17, 0.5);
    }
    .title {
      margin-top: 16px;
      font-size: 34px;
      line-height: 1.08;
    }
    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 28px;
    }
    .card {
      border: 1px solid rgba(17, 17, 17, 0.1);
      border-radius: 20px;
      padding: 20px;
      break-inside: avoid;
    }
    .stack {
      margin-top: 24px;
      display: grid;
      gap: 16px;
    }
    .list {
      margin: 12px 0 0;
      padding-left: 18px;
    }
    .list li + li {
      margin-top: 8px;
    }
    .meta {
      margin-top: 8px;
      font-size: 14px;
      color: rgba(17, 17, 17, 0.68);
    }
    .body {
      margin-top: 12px;
      font-size: 15px;
      color: rgba(17, 17, 17, 0.84);
      white-space: pre-wrap;
    }
    @media print {
      body {
        padding: 0;
      }
      .page {
        max-width: none;
      }
    }
  `;
}

export function createSessionSnapshot(input: {
  session: Session;
  artifacts: DecisionArtifacts;
  workspace: WorkspaceState;
  behavior: BehaviorSignals;
  suggestions: Suggestion[];
  disabledSuggestionTypes: SuggestionType[];
  startedAt: string | null;
  savedAt?: string;
}): SessionSnapshot {
  return {
    schemaVersion: SESSION_SNAPSHOT_SCHEMA_VERSION,
    savedAt: input.savedAt ?? new Date().toISOString(),
    startedAt: input.startedAt,
    session: clonePlainData(input.session),
    artifacts: clonePlainData(input.artifacts),
    workspace: clonePlainData(input.workspace),
    behavior: clonePlainData(input.behavior),
    suggestions: clonePlainData(input.suggestions),
    disabledSuggestionTypes: clonePlainData(input.disabledSuggestionTypes),
  };
}

export function duplicateSessionSnapshot(snapshot: SessionSnapshot): SessionSnapshot {
  const now = new Date().toISOString();

  return {
    ...clonePlainData(snapshot),
    savedAt: now,
    session: {
      ...clonePlainData(snapshot.session),
      id: buildSessionId(),
      title: `${snapshot.session.title} (копия)`,
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function serializeSessionSnapshot(snapshot: SessionSnapshot) {
  return JSON.stringify(snapshot, null, 2);
}

export function parseSessionSnapshot(text: string): SessionSnapshot {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Не удалось прочитать JSON-файл.");
  }

  ensureSnapshotShape(parsed);

  return createSessionSnapshot({
    session: parsed.session,
    artifacts: parsed.artifacts,
    workspace: parsed.workspace,
    behavior: parsed.behavior,
    suggestions: parsed.suggestions,
    disabledSuggestionTypes: parsed.disabledSuggestionTypes,
    startedAt: parsed.startedAt ?? null,
    savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
  });
}

export function buildSessionExportFileName(snapshot: SessionSnapshot, extension: "json" | "md") {
  const title = sanitizeFilePart(snapshot.session.title) || "focusboard-session";

  return `${title}.${extension}`;
}

export function buildSessionMarkdown(snapshot: SessionSnapshot) {
  const { session, artifacts, workspace, suggestions } = snapshot;

  return [
    `# ${session.title}`,
    "",
    `- Формат результата: ${session.outputFormat}`,
    `- Шаблон: ${session.template}`,
    `- Сохранено: ${snapshot.savedAt}`,
    "",
    "## Главный вопрос",
    "",
    formatParagraph(session.decisionQuestion),
    "",
    "## Приоритеты",
    "",
    formatList(session.priorities),
    "",
    "## Ограничения",
    "",
    formatList(session.constraints),
    "",
    "## Сводка",
    "",
    formatParagraph(artifacts.summary),
    "",
    "## Инсайты",
    "",
    artifacts.insights.length
      ? artifacts.insights
          .map(
            (insight) =>
              `### ${insight.title}\n\n- Тип: ${insight.weight}\n- Суть: ${formatParagraph(insight.body)}`,
          )
          .join("\n\n")
      : "Нет данных",
    "",
    "## Критерии",
    "",
    artifacts.criteria.length
      ? artifacts.criteria
          .map(
            (criterion) =>
              `- ${criterion.label} (${criterion.weight}) — ${formatParagraph(criterion.description)}`,
          )
          .join("\n")
      : "- Нет данных",
    "",
    "## Варианты",
    "",
    artifacts.options.length
      ? artifacts.options
          .map((option) =>
            [
              `### ${option.label}`,
              "",
              formatParagraph(option.summary),
              "",
              `- Вердикт: ${option.verdict}`,
              `- Плюсы: ${option.pros.join("; ") || "Нет данных"}`,
              `- Минусы: ${option.cons.join("; ") || "Нет данных"}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "Нет данных",
    "",
    "## Компромиссы",
    "",
    artifacts.tradeoffs.length
      ? artifacts.tradeoffs.map((item) => `- ${item.title} — ${formatParagraph(item.summary)}`).join("\n")
      : "- Нет данных",
    "",
    "## Риски",
    "",
    artifacts.risks.length
      ? artifacts.risks
          .map((item) => `- ${item.title} — Митигация: ${formatParagraph(item.mitigation)}`)
          .join("\n")
      : "- Нет данных",
    "",
    "## Рекомендация",
    "",
    formatParagraph(artifacts.recommendation),
    "",
    "## Финальное решение",
    "",
    formatParagraph(artifacts.finalDecision),
    "",
    "## Обоснование",
    "",
    formatParagraph(artifacts.rationale),
    "",
    "## Следующий шаг",
    "",
    formatParagraph(artifacts.nextStep),
    "",
    "## Заметки",
    "",
    formatParagraph(artifacts.notes),
    "",
    "## Состояние пространства",
    "",
    `- Плотность: ${workspace.density}`,
    `- Сравнение: ${workspace.compareMode ? "включено" : "выключено"}`,
    `- Фиксация компоновки: ${workspace.frozenLayout ? "да" : "нет"}`,
    `- Подсветка критериев: ${workspace.highlightedCriteria ? "да" : "нет"}`,
    "",
    "## Подсказки",
    "",
    suggestions.length
      ? suggestions.map((suggestion) => `- ${suggestion.title} (${suggestion.status})`).join("\n")
      : "- Нет данных",
    "",
  ].join("\n");
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function openSessionPrintView(snapshot: SessionSnapshot) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    throw new Error("Браузер заблокировал окно печати. Разрешите всплывающие окна и попробуйте снова.");
  }

  const { session, artifacts } = snapshot;

  const html = `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(session.title)}</title>
        <style>${buildPrintStyles()}</style>
      </head>
      <body>
        <main class="page">
          <p class="eyebrow">FocusBoard · Экспорт для PDF</p>
          <h1 class="title">${escapeHtml(session.title)}</h1>
          <p class="meta">Сохранено ${escapeHtml(snapshot.savedAt)}</p>

          <section class="grid">
            <article class="card">
              <p class="eyebrow">Главный вопрос</p>
              <p class="body">${escapeHtml(session.decisionQuestion)}</p>
            </article>
            <article class="card">
              <p class="eyebrow">Финальное решение</p>
              <p class="body">${escapeHtml(formatParagraph(artifacts.finalDecision))}</p>
            </article>
          </section>

          <section class="stack">
            <article class="card">
              <p class="eyebrow">Сводка</p>
              <p class="body">${escapeHtml(formatParagraph(artifacts.summary))}</p>
            </article>
            <article class="card">
              <p class="eyebrow">Рекомендация</p>
              <p class="body">${escapeHtml(formatParagraph(artifacts.recommendation))}</p>
            </article>
            <article class="card">
              <p class="eyebrow">Обоснование</p>
              <p class="body">${escapeHtml(formatParagraph(artifacts.rationale))}</p>
            </article>
            <article class="card">
              <p class="eyebrow">Следующий шаг</p>
              <p class="body">${escapeHtml(formatParagraph(artifacts.nextStep))}</p>
            </article>
            <article class="card">
              <p class="eyebrow">Приоритеты</p>
              <ul class="list">
                ${session.priorities.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Нет данных</li>"}
              </ul>
            </article>
            <article class="card">
              <p class="eyebrow">Ограничения</p>
              <ul class="list">
                ${session.constraints.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Нет данных</li>"}
              </ul>
            </article>
          </section>
        </main>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
