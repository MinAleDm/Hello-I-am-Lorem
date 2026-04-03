import { TEMPLATE_MAP } from "@/shared/config/templates";
import { buildSessionId } from "@/shared/lib/text";
import type {
  DecisionArtifacts,
  Session,
  SessionDraft,
  SessionTemplateId,
} from "@/shared/types/focus-board";

function cloneArtifacts(templateId: SessionTemplateId): DecisionArtifacts {
  return JSON.parse(JSON.stringify(TEMPLATE_MAP[templateId].artifacts)) as DecisionArtifacts;
}

export function createSessionFromDraft(draft: SessionDraft): {
  session: Session;
  artifacts: DecisionArtifacts;
} {
  const template = TEMPLATE_MAP[draft.template];
  const now = new Date().toISOString();

  return {
    session: {
      id: buildSessionId(),
      title: draft.title.trim() || template.session.title,
      decisionQuestion: draft.decisionQuestion.trim() || template.session.decisionQuestion,
      priorities: draft.prioritiesText
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean),
      constraints: draft.constraintsText
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean),
      outputFormat: draft.outputFormat,
      template: draft.template,
      createdAt: now,
      updatedAt: now,
    },
    artifacts: cloneArtifacts(draft.template),
  };
}

export function createDraftFromTemplate(templateId: SessionTemplateId): SessionDraft {
  const template = TEMPLATE_MAP[templateId];

  return {
    title: template.session.title,
    decisionQuestion: template.session.decisionQuestion,
    prioritiesText: template.session.priorities.join("\n"),
    constraintsText: template.session.constraints.join("\n"),
    outputFormat: template.session.outputFormat,
    template: template.id,
  };
}

export function updateSessionTimestamp(session: Session): Session {
  return {
    ...session,
    updatedAt: new Date().toISOString(),
  };
}
