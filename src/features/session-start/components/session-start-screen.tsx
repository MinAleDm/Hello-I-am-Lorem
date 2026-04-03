import { useMemo, useState } from "react";
import { Check, Compass, Layers3, LockKeyhole, Sparkles } from "lucide-react";
import { getDefaultDraft } from "@/app/store/use-focus-board-store";
import { createDraftFromTemplate } from "@/entities/session/model";
import { OUTPUT_FORMATS, SESSION_TEMPLATES } from "@/shared/config/templates";
import { Button } from "@/shared/ui/button";
import { InputField, SelectField, TextareaField } from "@/shared/ui/field";
import { Surface } from "@/shared/ui/surface";
import { TemplateCard } from "@/features/session-start/components/template-card";
import type { SessionDraft, SessionTemplateId } from "@/shared/types/focus-board";

interface SessionStartScreenProps {
  onStart: (draft: SessionDraft) => void;
}

export function SessionStartScreen({ onStart }: SessionStartScreenProps) {
  const [draft, setDraft] = useState<SessionDraft>(getDefaultDraft());
  const selectedTemplate = useMemo(
    () => SESSION_TEMPLATES.find((template) => template.id === draft.template) ?? SESSION_TEMPLATES[0],
    [draft.template],
  );

  function handleTemplateSelect(templateId: SessionTemplateId) {
    setDraft(createDraftFromTemplate(templateId));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="py-4">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-ink-950/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-950/62">
              FocusBoard
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] text-ink-950 sm:text-6xl">
              A calmer way to work through a complex decision.
            </h1>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-950/64">
            FocusBoard helps turn a messy prompt into structured reasoning, tradeoff analysis,
            and a final recommendation. The interface stays stable and only offers lightweight,
            explainable suggestions.
          </p>

          <div className="mt-10 space-y-4 border-t border-ink-950/8 pt-6">
            {[
              {
                icon: Compass,
                title: "Structured thinking",
                body: "Move from a messy question to insights, options, and a final call without losing the thread.",
              },
              {
                icon: Sparkles,
                title: "Explainable suggestions",
                body: "Recommendations are small, reversible, and written in plain product language.",
              },
              {
                icon: LockKeyhole,
                title: "Stable by default",
                body: "The workspace favors calm continuity over clever or surprising adaptation.",
              },
              {
                icon: Layers3,
                title: "Local-first execution",
                body: "Sessions, preferences, and behavior-aware adjustments stay on-device.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 border-b border-ink-950/8 pb-4 last:border-b-0">
                <item.icon className="mt-0.5 h-4 w-4 text-ink-950/46" />
                <div>
                  <h2 className="text-sm font-semibold text-ink-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-950/60">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Surface className="rounded-[28px] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-950/45">
                  Session setup
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-ink-950">Start with a stable brief.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-ink-950/65">
                  Choose a template to seed the session, then adjust the brief before entering the
                  workspace.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDraft(getDefaultDraft())}>
                Reset
              </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SESSION_TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={template.id === draft.template}
                  onSelect={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>

            <form
              className="mt-8 grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                onStart(draft);
              }}
            >
              <InputField
                label="Session title"
                placeholder="Name the decision clearly."
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <TextareaField
                label="What are you trying to decide?"
                placeholder="Describe the choice, uncertainty, or evaluation question."
                rows={4}
                value={draft.decisionQuestion}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, decisionQuestion: event.target.value }))
                }
              />
              <div className="grid gap-5 md:grid-cols-2">
                <TextareaField
                  label="What matters most?"
                  hint="One priority per line."
                  rows={5}
                  value={draft.prioritiesText}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, prioritiesText: event.target.value }))
                  }
                />
                <TextareaField
                  label="Constraints"
                  hint="List timing, scope, or decision constraints."
                  rows={5}
                  value={draft.constraintsText}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, constraintsText: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                <SelectField
                  label="Desired output format"
                  value={draft.outputFormat}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      outputFormat: event.target.value as SessionDraft["outputFormat"],
                    }))
                  }
                >
                  {OUTPUT_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </SelectField>
                <Button className="w-full md:w-auto" type="submit">
                  Start session
                </Button>
              </div>
            </form>

            <div className="mt-8 border-t border-ink-950/8 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-950/42">
                Selected template
              </p>
              <div className="mt-3 flex items-start gap-3">
                <Check className="mt-1 h-4 w-4 text-ink-950/42" />
                <div>
                  <p className="text-sm font-semibold text-ink-950">{selectedTemplate.label}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-950/60">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>
          </Surface>
        </section>
      </div>
    </div>
  );
}
