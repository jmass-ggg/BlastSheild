export type OperationType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE' | 'DROP';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnalysisStatus = 
  | 'ANALYZING'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'INVALIDATED';

export interface RiskBreakdown {
  operationSeverity: { score: number; max: number; label: string; desc: string };
  rowsAffected: { score: number; max: number; label: string; desc: string };
  cascadeImpact: { score: number; max: number; label: string; desc: string };
  businessCriticalData: { score: number; max: number; label: string; desc: string };
  reversibility: { score: number; max: number; label: string; desc: string };
  totalScore: number;
  level: RiskLevel;
}

export interface BusinessImpact {
  activePayingUsers: number;
  mrrAtRisk: number;
  arrAtRisk: number;
  criticalTablesAffected: string[];
  summary: string;
}

export interface TableRowDiff {
  tableName: string;
  beforeCount: number;
  afterCount: number;
  delta: number;
  action: 'DELETE' | 'UPDATE' | 'TRUNCATE' | 'DROP' | 'NONE';
  cascadeType: 'DIRECT' | 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NONE';
  description: string;
}

export interface ForeignKeyRelation {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  cascadeAction: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
  description: string;
}

export interface SimulationStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'error';
  timestamp?: string;
  details?: Record<string, unknown> | string;
}

export interface SqlAlternative {
  title: string;
  sql: string;
  explanation: string;
  riskScore: number;
  riskLevel: RiskLevel;
  directRows: number;
  indirectRows: number;
  arrAtRisk: number;
  reversibility: string;
  benefits: string[];
}

export interface AnalysisRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  prompt: string;
  originalSql: string;
  operationType: OperationType;
  targetTable: string;
  condition: string;
  status: AnalysisStatus;
  
  // Risk metrics
  riskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: RiskBreakdown;
  
  // Impact metrics
  directRows: number;
  indirectRows: number;
  totalAffectedRows: number;
  cascadesCount: number;
  businessImpact: BusinessImpact;
  
  // Diff breakdown
  tableDiffs: TableRowDiff[];
  
  // Alternatives
  recommendedAlternative: SqlAlternative;
  activeAlternativeSql?: string;
  isUsingSaferAlternative: boolean;
  
  // Simulation Steps
  steps: SimulationStep[];
  
  // Execution data if completed
  auditId?: string;
  executedAt?: string;
  executedSql?: string;
  executionLog?: string[];
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  badge: string;
  prompt: string;
  sql: string;
  operation: OperationType;
  targetTable: string;
  expectedRiskLevel: RiskLevel;
  expectedRiskScore: number;
  highlightColor: string;
  saferSql: string;
}

export interface AuditEvent {
  id: string;
  analysisId: string;
  eventType: 
    | 'ACTION_INTERCEPTED'
    | 'SANDBOX_CREATED'
    | 'SIMULATION_COMPLETED'
    | 'RISK_CALCULATED'
    | 'USER_SELECTED_SAFE_ALTERNATIVE'
    | 'USER_APPROVED'
    | 'USER_REJECTED'
    | 'REVALIDATION_PASSED'
    | 'REVALIDATION_FAILED'
    | 'EXECUTION_STARTED'
    | 'EXECUTION_COMPLETED';
  description: string;
  payload: Record<string, unknown>;
  createdAt: string;
  actor: string;
}

export interface DatabaseSchemaTable {
  name: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary?: boolean; isForeign?: boolean; foreignTo?: string }[];
  foreignKeys: ForeignKeyRelation[];
  description: string;
}
