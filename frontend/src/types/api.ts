/**
 * Mirrors app/schemas/*.py on the BlastShield backend.
 * Keep field names identical to the Pydantic models — these are parsed straight
 * off the wire with no renaming.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Measurement = 'EXACT' | 'ESTIMATED';

export type DependencyEffect =
  | 'DELETE'
  | 'SET_NULL'
  | 'SET_DEFAULT'
  | 'BLOCK'
  | 'NONE';

export interface AnalyzeRequest {
  sql: string;
  source?: string;
  reason?: string | null;
}

export interface ActionReport {
  operation: string;
  table: string;
  has_where: boolean;
}

export interface ImpactSummary {
  direct_rows: number;
  dependent_rows: number;
  total_rows: number;
}

export interface DependencyImpact {
  table: string;
  rows: number;
  depth: number;
  path: string[];
  on_delete: string;
  effect: DependencyEffect;
  measurement: Measurement;
}

export interface RiskBreakdown {
  operation: number;
  direct_impact: number;
  dependent_impact: number;
  cascade: number;
  recoverability: number;
}

export interface RiskReport {
  score: number;
  level: RiskLevel;
  breakdown: RiskBreakdown;
  reasons: string[];
}

export interface ReportGraphNode {
  id: string;
  table: string;
  rows: number;
  depth: number;
}

export interface ReportGraphEdge {
  id: string;
  source: string;
  target: string;
  on_delete: string;
}

export interface ReportGraph {
  nodes: ReportGraphNode[];
  edges: ReportGraphEdge[];
}

export interface SaferAlternative {
  available: boolean;
  sql?: string | null;
  risk_score?: number | null;
  risk_level?: RiskLevel | null;
}

export interface TimelineItem {
  key: string;
  label: string;
  status: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: string;
  action: ActionReport;
  impact: ImpactSummary;
  dependencies: DependencyImpact[];
  risk: RiskReport;
  graph: ReportGraph;
  safer_alternative: SaferAlternative;
  requires_approval: boolean;
  timeline: TimelineItem[];
}

export interface ApprovalRequest {
  actor?: string | null;
  reason?: string | null;
}

export interface ApprovalTransitionResponse {
  analysis_id: string;
  status: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export interface ExecutionResponse {
  analysis_id: string;
  executed: boolean;
  status: string;
  affected_rows: number;
  executed_at: string;
}

export interface StaleExecutionResponse {
  executed: false;
  status: 'STALE';
  code: 'ANALYSIS_STALE';
  message: string;
}

/** Shape of every non-2xx body returned by the backend exception handlers. */
export interface ApiErrorBody {
  code: string;
  message: string;
  remediation?: string;
}
