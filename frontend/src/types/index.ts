import type {
  DependencyImpact,
  ReportGraph,
  RiskBreakdown,
  RiskLevel,
  TimelineItem,
} from './api';

export type { RiskLevel, ReportGraph, RiskBreakdown, DependencyImpact, TimelineItem };

export type ImpactRole = 'DIRECT' | 'CASCADE' | 'UNAFFECTED';

export interface SchemaColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  cascade?: boolean;
}

export interface TableSchema {
  name: string;
  rowCount: number;
  description: string;
  columns: SchemaColumn[];
  parentTable?: string;
}

export interface TableImpactInfo {
  count: number;
  role: 'DIRECT' | 'CASCADE';
}

export interface SaferAlternativeView {
  available: boolean;
  sql: string | null;
  riskScore: number | null;
  riskLevel: RiskLevel | null;
}

/**
 * Flattened view of a backend `AnalysisResponse`, shaped for the cards and the
 * schema graph. Built by `adaptAnalysis` — never hand-constructed.
 */
export interface AnalysisView {
  analysisId: string;
  status: string;
  requiresApproval: boolean;

  /** The SQL that was submitted; the report itself does not echo it back. */
  sql: string;
  operation: string;
  targetTable: string;
  hasWhere: boolean;

  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  riskBreakdown: RiskBreakdown;

  directRows: number;
  dependentRows: number;
  totalRows: number;
  dependencies: DependencyImpact[];

  safer: SaferAlternativeView;
  affectedTableMap: Record<string, TableImpactInfo>;
  timeline: TimelineItem[];
  graph: ReportGraph;
}

export interface ERNodePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ERRelationship {
  from: string;
  to: string;
  label: string;
  fk: string;
}
