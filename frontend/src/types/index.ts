export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ImpactRole = 'DIRECT' | 'CASCADE' | 'UNAFFECTED';

export type ExecutionMode = 'SAFER' | 'ORIGINAL';

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

export interface ImpactResult {
  id: string;
  promptText: string;
  targetTable: string;
  
  // Original Destructive Action
  originalSql: string;
  originalRisk: number;
  originalRiskLevel: RiskLevel;
  originalDirectRows: number;
  originalCascadeRows: number;
  mrrLost: number;
  arrLost: number;
  activeSubsLost: number;
  originalRollback: string;
  
  // Safer Alternative Recommendation
  saferSql: string;
  saferRisk: number;
  saferRiskLevel: 'LOW' | 'MEDIUM';
  saferDirectRows: number;
  saferCascadeRows: number;
  saferRollback: string;
  saferBenefits: string[];
  
  // Table Breakdown Map
  affectedTableMap: Record<string, TableImpactInfo>;
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
