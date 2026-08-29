export type OperationType = 'DELETE' | 'UPDATE' | 'TRUNCATE' | 'DROP' | 'SELECT' | 'INSERT';

export type AnalysisStatus = 
  | 'ANALYZING' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'EXECUTED' 
  | 'INVALIDATED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RelationshipType = 'ROOT' | 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'FK DEPENDENCY';

export interface BusinessImpact {
  mrr_at_risk: number;
  arr_at_risk: number;
  active_subscriptions: number;
  paying_customers: number;
  critical_records_summary: string;
}

export interface RiskFactor {
  score: number;
  max: number;
  label: string;
  description: string;
}

export interface RiskFactors {
  operation_severity: RiskFactor;
  rows_affected: RiskFactor;
  cascade_exposure: RiskFactor;
  business_criticality: RiskFactor;
  recoverability: RiskFactor;
}

export interface ImpactTableNode {
  id: string;
  table_name: string;
  relationship: RelationshipType;
  affected_rows: number;
  total_table_rows: number;
  impact_type: 'DIRECT' | 'DEPENDENT';
  depth: number;
  parent_table?: string;
  foreign_key_column?: string;
  cascade_rule: 'CASCADE' | 'RESTRICT' | 'SET_NULL' | 'NONE';
  description: string;
  business_note?: string;
  columns?: string[];
  sample_cascade_details?: {
    reason: string;
    monetary_loss?: string;
    reversibility: string;
  };
}

export interface AnalysisPipelineStep {
  id: string;
  title: string;
  iconName: 'sql' | 'check' | 'table' | 'rows' | 'network' | 'layers' | 'shield' | 'zap';
  status: 'DONE' | 'ACTIVE' | 'PENDING' | 'BLOCKED';
  headline: string;
  detail: string;
  subtext: string;
  badgeText: string;
}

export interface AnalysisRecord {
  id: string;
  session_id: string;
  title: string;
  prompt_origin: string;
  original_sql: string;
  operation_type: OperationType;
  target_table: string;
  where_clause: string;
  risk_score: number;
  risk_level: RiskLevel;
  direct_rows: number;
  indirect_rows: number;
  total_rows: number;
  tables_affected_count: number;
  status: AnalysisStatus;
  
  // Business Impact
  business_impact: BusinessImpact;
  
  // Detailed Risk Breakdown
  risk_factors: RiskFactors;
  
  // Pipeline Steps (for visual flowchart)
  pipeline_steps: AnalysisPipelineStep[];
  
  // Tables Impact Graph
  tables_impact: ImpactTableNode[];
  
  // Safer Alternative
  safer_sql: string;
  safer_risk_score: number;
  safer_risk_level: RiskLevel;
  safer_direct_rows: number;
  safer_indirect_rows: number;
  safer_total_rows: number;
  safer_action_name: string;
  safer_description: string;
  safer_pros: string[];
  
  // Timestamps and execution data
  created_at: string;
  approved_at?: string;
  executed_at?: string;
  audit_id?: string;
  executed_mode?: 'ORIGINAL' | 'SAFER_VERSION';
}

export interface AuditEvent {
  id: string;
  analysis_id: string;
  event_type: 
    | 'ACTION_INTERCEPTED'
    | 'SANDBOX_CREATED'
    | 'SIMULATION_COMPLETED'
    | 'RISK_CALCULATED'
    | 'USER_REVIEW_OPENED'
    | 'SAFER_ALTERNATIVE_SELECTED'
    | 'USER_APPROVED'
    | 'ACTION_REJECTED'
    | 'REVALIDATION_PASSED'
    | 'PRODUCTION_EXECUTED';
  title: string;
  description: string;
  payload?: any;
  timestamp: string;
  actor: string;
}


