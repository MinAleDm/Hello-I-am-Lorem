export type SessionTemplateId =
  | "product-strategy"
  | "career-decision"
  | "ux-review"
  | "compare-options"
  | "open-exploration";

export type OutputFormat =
  | "Мемо по решению"
  | "Таблица сравнения"
  | "Краткая рекомендация"
  | "Резюме для руководителя"
  | "Тезисы";

export type AppStage = "start" | "workspace" | "summary";

export type WorkspaceDensity = "comfortable" | "compact";

export type PanelKey = "brief" | "insights" | "decision" | "suggestions";

export type WorkspaceSectionKey =
  | "summary"
  | "insights"
  | "options"
  | "tradeoffs"
  | "risks"
  | "recommendation"
  | "notes";

export type SuggestionType =
  | "pin-insights"
  | "compact-density"
  | "open-compare-mode"
  | "collapse-supporting-details"
  | "highlight-decision-criteria"
  | "freeze-layout"
  | "surface-recommendation"
  | "generate-decision-summary";

export type SuggestionStatus = "pending" | "applied" | "dismissed" | "disabled";

export type ImpactLevel = "low" | "medium" | "high";

export type BehaviorMode = "scanning" | "reviewing" | "comparing" | "deciding" | "finalizing";

export interface Session {
  id: string;
  title: string;
  decisionQuestion: string;
  priorities: string[];
  constraints: string[];
  outputFormat: OutputFormat;
  template: SessionTemplateId;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceState {
  density: WorkspaceDensity;
  compareMode: boolean;
  pinnedPanels: PanelKey[];
  collapsedSections: WorkspaceSectionKey[];
  frozenLayout: boolean;
  highlightedCriteria: boolean;
  prioritySection: WorkspaceSectionKey | null;
  summaryReady: boolean;
}

export interface BehaviorSignals {
  scrollBursts: number;
  dwellBySection: Partial<Record<WorkspaceSectionKey | PanelKey, number>>;
  sectionReopens: Partial<Record<WorkspaceSectionKey, number>>;
  compareActions: number;
  noteEdits: number;
  layoutToggles: number;
  optionSwitches: number;
  lastScrollAt: number | null;
}

export interface SuggestionTriggerMeta {
  signal: string;
  value: number;
  threshold: number;
}

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  reason: string;
  actionLabel: string;
  impact: ImpactLevel;
  confidence: number;
  status: SuggestionStatus;
  createdAt: string;
  trigger: SuggestionTriggerMeta;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  weight: "Signal" | "Pattern" | "Constraint";
}

export interface Criterion {
  id: string;
  label: string;
  weight: "High" | "Medium";
  description: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  summary: string;
  verdict: string;
  pros: string[];
  cons: string[];
  scores: Record<string, number>;
}

export interface TradeoffItem {
  id: string;
  title: string;
  summary: string;
}

export interface RiskItem {
  id: string;
  title: string;
  mitigation: string;
}

export interface DecisionArtifacts {
  summary: string;
  insights: Insight[];
  criteria: Criterion[];
  options: DecisionOption[];
  tradeoffs: TradeoffItem[];
  risks: RiskItem[];
  recommendation: string;
  notes: string;
  shortlistedOptions: string[];
  finalDecision: string;
  rationale: string;
  nextStep: string;
}

export interface SessionTemplate {
  id: SessionTemplateId;
  label: string;
  eyebrow: string;
  description: string;
  session: Omit<Session, "id" | "createdAt" | "updatedAt">;
  artifacts: DecisionArtifacts;
}

export interface UndoEntry {
  suggestionId: string;
  stage: AppStage;
  workspace: WorkspaceState;
  artifacts: DecisionArtifacts;
}

export interface FocusBoardStoreState {
  stage: AppStage;
  session: Session | null;
  workspace: WorkspaceState;
  behavior: BehaviorSignals;
  suggestions: Suggestion[];
  disabledSuggestionTypes: SuggestionType[];
  artifacts: DecisionArtifacts | null;
  undoStack: UndoEntry[];
  lastActionNote: string | null;
  startedAt: string | null;
}

export interface SessionDraft {
  title: string;
  decisionQuestion: string;
  prioritiesText: string;
  constraintsText: string;
  outputFormat: OutputFormat;
  template: SessionTemplateId;
}
