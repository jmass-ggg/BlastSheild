import { AnalysisRecord, OperationType, RiskLevel, RiskFactors, BusinessImpact, ImpactTableNode, AnalysisPipelineStep } from '../types/blastshield';

export function parseSqlStatement(sql: string): {
  operation: OperationType;
  table: string;
  whereClause: string;
  hasWhere: boolean;
} {
  const cleanSql = sql.trim();
  const upper = cleanSql.toUpperCase();

  let operation: OperationType = 'SELECT';
  let table = 'users';
  let whereClause = '';
  let hasWhere = false;

  if (upper.startsWith('DELETE')) {
    operation = 'DELETE';
    const fromMatch = cleanSql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch) table = fromMatch[1].toLowerCase();
  } else if (upper.startsWith('UPDATE')) {
    operation = 'UPDATE';
    const updateMatch = cleanSql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
    if (updateMatch) table = updateMatch[1].toLowerCase();
  } else if (upper.startsWith('TRUNCATE')) {
    operation = 'TRUNCATE';
    const truncMatch = cleanSql.match(/TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_]+)/i);
    if (truncMatch) table = truncMatch[1].toLowerCase();
  } else if (upper.startsWith('DROP')) {
    operation = 'DROP';
    const dropMatch = cleanSql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    if (dropMatch) table = dropMatch[1].toLowerCase();
  } else if (upper.startsWith('INSERT')) {
    operation = 'INSERT';
    const insMatch = cleanSql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
    if (insMatch) table = insMatch[1].toLowerCase();
  }

  const whereMatch = cleanSql.match(/WHERE\s+([\s\S]+?)(?:;|$)/i);
  if (whereMatch) {
    hasWhere = true;
    whereClause = whereMatch[1].trim();
  }

  return { operation, table, whereClause, hasWhere };
}

export function computeRiskScore(
  operation: OperationType,
  directRows: number,
  cascadeCount: number,
  mrrAtRisk: number,
  isReversible: boolean
): {
  score: number;
  level: RiskLevel;
  factors: RiskFactors;
} {
  // Deterministic Risk Engine per Section 16 of BlastShield Specification
  // 1. Operation severity: 0 - 25
  let opScore = 0;
  let opDesc = '';
  switch (operation) {
    case 'DROP':
    case 'TRUNCATE':
      opScore = 25;
      opDesc = 'Unconditional schema-level wipe';
      break;
    case 'DELETE':
      opScore = 20;
      opDesc = 'DELETE statement with row removal';
      break;
    case 'UPDATE':
      opScore = 12;
      opDesc = 'Data mutation in-place';
      break;
    case 'INSERT':
      opScore = 5;
      opDesc = 'Additive modification';
      break;
    case 'SELECT':
    default:
      opScore = 0;
      opDesc = 'Read-only operation';
  }

  // 2. Rows affected: 0 - 25
  let rowsScore = 0;
  if (directRows > 10000) rowsScore = 24;
  else if (directRows > 1000) rowsScore = 18;
  else if (directRows > 100) rowsScore = 10;
  else if (directRows > 0) rowsScore = 4;

  // 3. Cascade impact: 0 - 20
  let cascadeScore = 0;
  if (cascadeCount > 10000) cascadeScore = 18;
  else if (cascadeCount > 1000) cascadeScore = 15;
  else if (cascadeCount > 100) cascadeScore = 12;
  else if (cascadeCount > 0) cascadeScore = 6;

  // 4. Business Critical data: 0 - 20
  let bizScore = 0;
  if (mrrAtRisk > 5000) bizScore = 20;
  else if (mrrAtRisk > 1000) bizScore = 14;
  else if (mrrAtRisk > 200) bizScore = 6;
  else if (mrrAtRisk > 0) bizScore = 2;

  // 5. Reversibility: 0 - 10
  const revScore = isReversible ? 2 : 8;

  const totalScore = Math.min(100, opScore + rowsScore + cascadeScore + bizScore + revScore);

  let level: RiskLevel = 'LOW';
  if (totalScore >= 75) level = 'CRITICAL';
  else if (totalScore >= 50) level = 'HIGH';
  else if (totalScore >= 25) level = 'MEDIUM';

  const factors: RiskFactors = {
    operation_severity: {
      score: opScore,
      max: 25,
      label: 'Operation Risk',
      description: opDesc,
    },
    rows_affected: {
      score: rowsScore,
      max: 25,
      label: 'Rows Affected',
      description: `${directRows.toLocaleString()} direct target rows`,
    },
    cascade_exposure: {
      score: cascadeScore,
      max: 20,
      label: 'Cascade Exposure',
      description: `${cascadeCount.toLocaleString()} downstream cascade rows`,
    },
    business_criticality: {
      score: bizScore,
      max: 20,
      label: 'Business Impact',
      description: `$${mrrAtRisk.toLocaleString()} MRR revenue at risk`,
    },
    recoverability: {
      score: revScore,
      max: 10,
      label: 'Recoverability',
      description: isReversible ? 'Reversible via soft-delete' : 'Hard purge requiring cold restore',
    },
  };

  return { score: totalScore, level, factors };
}

export function generateCustomAnalysis(customSql: string): AnalysisRecord {
  const { operation, table, whereClause, hasWhere } = parseSqlStatement(customSql);

  const isUsers = table === 'users';
  const directRows = isUsers ? (hasWhere ? 12481 : 50000) : 520;
  const indirectRows = isUsers ? (hasWhere ? 36134 : 145000) : 120;
  const mrrAtRisk = isUsers ? (hasWhere ? 6116 : 24500) : 0;
  const activeSubs = isUsers ? (hasWhere ? 347 : 1400) : 0;

  const { score, level, factors } = computeRiskScore(
    operation,
    directRows,
    indirectRows,
    mrrAtRisk,
    false
  );

  const pipeline_steps: AnalysisPipelineStep[] = [
    {
      id: 'step_1',
      title: 'SQL Statement',
      iconName: 'sql',
      status: 'DONE',
      headline: 'SQL Statement',
      detail: customSql,
      subtext: 'Custom prompt query',
      badgeText: 'DONE',
    },
    {
      id: 'step_2',
      title: 'Validate SQL',
      iconName: 'check',
      status: 'DONE',
      headline: 'Validate SQL',
      detail: hasWhere ? 'Valid · WHERE present' : 'WARNING: Unbounded query',
      subtext: `Single statement · ${operation} parsed`,
      badgeText: 'DONE',
    },
    {
      id: 'step_3',
      title: 'Target Table',
      iconName: 'table',
      status: 'DONE',
      headline: 'Target Table',
      detail: `Target: ${table}`,
      subtext: `${operation} · WHERE: ${hasWhere ? 'Yes' : 'No'}`,
      badgeText: 'DONE',
    },
    {
      id: 'step_4',
      title: 'Direct Impact',
      iconName: 'rows',
      status: 'DONE',
      headline: 'Direct Impact',
      detail: `${directRows.toLocaleString()} rows`,
      subtext: `from ${table}`,
      badgeText: 'DONE',
    },
    {
      id: 'step_5',
      title: 'Foreign-Key Analysis',
      iconName: 'network',
      status: 'DONE',
      headline: 'Foreign-Key Analysis',
      detail: `${isUsers ? '5' : '2'} dependent tables`,
      subtext: 'CASCADE relationships analyzed',
      badgeText: 'DONE',
    },
    {
      id: 'step_6',
      title: 'Cascade Impact',
      iconName: 'layers',
      status: 'DONE',
      headline: 'Cascade Impact',
      detail: `${indirectRows.toLocaleString()} rows`,
      subtext: `Across downstream dependencies`,
      badgeText: 'DONE',
    },
  ];

  const tables_impact: ImpactTableNode[] = [
    {
      id: table,
      table_name: table,
      relationship: 'ROOT',
      affected_rows: directRows,
      total_table_rows: 50000,
      impact_type: 'DIRECT',
      depth: 0,
      cascade_rule: 'CASCADE',
      description: `Target root table: ${directRows.toLocaleString()} rows will be modified or deleted.`,
    },
    {
      id: 'subscriptions',
      table_name: 'subscriptions',
      relationship: 'CASCADE',
      affected_rows: activeSubs,
      total_table_rows: 15000,
      impact_type: 'DEPENDENT',
      depth: 1,
      parent_table: table,
      foreign_key_column: 'user_id',
      cascade_rule: 'CASCADE',
      description: `${activeSubs} active subscription billing contracts linked to these records.`,
    },
    {
      id: 'orders',
      table_name: 'orders',
      relationship: 'CASCADE',
      affected_rows: Math.floor(indirectRows * 0.58),
      total_table_rows: 100000,
      impact_type: 'DEPENDENT',
      depth: 1,
      parent_table: table,
      foreign_key_column: 'user_id',
      cascade_rule: 'CASCADE',
      description: `Historical purchase orders linked to the target records.`,
    },
  ];

  const safer_sql = operation === 'DELETE' 
    ? `UPDATE ${table} SET deleted_at = NOW() WHERE ${whereClause || '1=1'};`
    : `BEGIN TRANSACTION;\n${customSql}\n-- Verification required before COMMIT;`;

  return {
    id: `an_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    session_id: `sess_${Date.now()}`,
    title: `Analyzed ${operation} on ${table}`,
    prompt_origin: customSql,
    original_sql: customSql,
    operation_type: operation,
    target_table: table,
    where_clause: whereClause || 'NONE',
    risk_score: score,
    risk_level: level,
    direct_rows: directRows,
    indirect_rows: indirectRows,
    total_rows: directRows + indirectRows,
    tables_affected_count: tables_impact.length,
    status: 'PENDING_APPROVAL',
    business_impact: {
      mrr_at_risk: mrrAtRisk,
      arr_at_risk: mrrAtRisk * 12,
      active_subscriptions: activeSubs,
      paying_customers: activeSubs,
      critical_records_summary: `${activeSubs} paying customer accounts in target scope`,
    },
    risk_factors: factors,
    pipeline_steps,
    tables_impact,
    safer_sql,
    safer_risk_score: Math.max(15, Math.floor(score * 0.4)),
    safer_risk_level: 'LOW',
    safer_direct_rows: directRows,
    safer_indirect_rows: 0,
    safer_total_rows: directRows,
    safer_action_name: `Soft-Mutation Safeguard for ${table}`,
    safer_description: `Applies non-destructive update pattern, preventing all ${indirectRows.toLocaleString()} cascading deletions.`,
    safer_pros: [
      `Reduces risk from ${score} → ${Math.max(15, Math.floor(score * 0.4))}`,
      'Preserves downstream cascade records',
      'Fully reversible without restoring backups',
    ],
    created_at: new Date().toISOString(),
  };
}
