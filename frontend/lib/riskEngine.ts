import { OperationType, RiskBreakdown, RiskLevel } from "./types";

export interface RiskCalculationInput {
  operation: OperationType;
  directRows: number;
  totalRowsInTable: number;
  cascadeTablesCount: number;
  cascadedRows: number;
  activePayingUsers: number;
  isHardDelete: boolean;
  hasWhereClause: boolean;
}

export function calculateDeterministicRisk(input: RiskCalculationInput): RiskBreakdown {
  // 1. Operation Severity (0 - 25)
  let opScore = 0;
  let opDesc = '';
  switch (input.operation) {
    case 'DROP':
      opScore = 25;
      opDesc = 'DROP TABLE destroys table structure and all contained data';
      break;
    case 'TRUNCATE':
      opScore = 24;
      opDesc = 'TRUNCATE removes all rows immediately bypassing triggers';
      break;
    case 'DELETE':
      opScore = input.isHardDelete ? 20 : 10;
      opDesc = input.isHardDelete 
        ? 'Hard DELETE permanently removes tuples from disk' 
        : 'Soft delete (UPDATE deleted_at) preserves historical data';
      break;
    case 'UPDATE':
      opScore = input.hasWhereClause ? 10 : 22;
      opDesc = input.hasWhereClause 
        ? 'Targeted UPDATE with WHERE clause' 
        : 'CRITICAL: UPDATE without WHERE clause affects entire table!';
      break;
    case 'INSERT':
      opScore = 5;
      opDesc = 'INSERT creates new records without mutating existing data';
      break;
    case 'SELECT':
    default:
      opScore = 0;
      opDesc = 'Read-only query with zero mutation risk';
      break;
  }

  // 2. Rows Affected (0 - 25)
  let rowScore = 0;
  let rowDesc = '';
  const totalImpact = input.directRows + input.cascadedRows;
  
  if (totalImpact === 0) {
    rowScore = 0;
    rowDesc = '0 records affected';
  } else if (totalImpact < 50) {
    rowScore = 4;
    rowDesc = `<50 records affected (${totalImpact})`;
  } else if (totalImpact < 500) {
    rowScore = 8;
    rowDesc = `Small batch impact (${totalImpact} records)`;
  } else if (totalImpact < 5000) {
    rowScore = 15;
    rowDesc = `Significant batch impact (${totalImpact.toLocaleString()} records)`;
  } else if (totalImpact < 25000) {
    rowScore = 22;
    rowDesc = `Massive scale impact (${totalImpact.toLocaleString()} records affected)`;
  } else {
    rowScore = 25;
    rowDesc = `Catastrophic scale (${totalImpact.toLocaleString()} records affected)`;
  }

  // 3. Cascade Impact (0 - 20)
  let cascadeScore = 0;
  let cascadeDesc = '';
  if (input.cascadeTablesCount === 0 || input.cascadedRows === 0) {
    cascadeScore = 0;
    cascadeDesc = '0 cascading tables affected (Isolated)';
  } else if (input.cascadeTablesCount === 1) {
    cascadeScore = 8;
    cascadeDesc = `1 dependent table affected (${input.cascadedRows.toLocaleString()} rows)`;
  } else if (input.cascadeTablesCount === 2) {
    cascadeScore = 12;
    cascadeDesc = `2 dependent tables affected (${input.cascadedRows.toLocaleString()} rows)`;
  } else {
    cascadeScore = 15 + Math.min(5, input.cascadeTablesCount);
    cascadeDesc = `${input.cascadeTablesCount} cascading dependent tables affected (${input.cascadedRows.toLocaleString()} cascaded rows)`;
  }

  // 4. Business Critical Data (0 - 20)
  let businessScore = 0;
  let businessDesc = '';
  if (input.activePayingUsers === 0) {
    businessScore = 0;
    businessDesc = 'No active paying customers or revenue streams impacted';
  } else if (input.activePayingUsers < 10) {
    businessScore = 6;
    businessDesc = `${input.activePayingUsers} active subscriptions impacted`;
  } else if (input.activePayingUsers < 100) {
    businessScore = 12;
    businessDesc = `${input.activePayingUsers} paying customers affected`;
  } else {
    businessScore = 20;
    businessDesc = `High severity: ${input.activePayingUsers} active paying customer subscriptions in blast radius`;
  }

  // 5. Reversibility (0 - 10)
  let revScore = 0;
  let revDesc = '';
  if (input.operation === 'SELECT') {
    revScore = 0;
    revDesc = 'Read only';
  } else if (!input.isHardDelete && input.operation === 'UPDATE') {
    revScore = 2;
    revDesc = 'Easily reversible via timestamp rollback / audit log';
  } else if (input.operation === 'DELETE' || input.operation === 'TRUNCATE' || input.operation === 'DROP') {
    revScore = input.isHardDelete ? 8 : 2;
    revDesc = input.isHardDelete 
      ? 'Hard to recover — requires point-in-time database restore from backup' 
      : 'Easily reversible via soft-delete recovery';
  } else {
    revScore = 5;
    revDesc = 'Requires manual rollback script';
  }

  const totalScore = Math.min(100, opScore + rowScore + cascadeScore + businessScore + revScore);

  let level: RiskLevel = 'LOW';
  if (totalScore >= 75) {
    level = 'CRITICAL';
  } else if (totalScore >= 50) {
    level = 'HIGH';
  } else if (totalScore >= 25) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return {
    operationSeverity: { score: opScore, max: 25, label: 'Operation Severity', desc: opDesc },
    rowsAffected: { score: rowScore, max: 25, label: 'Rows Affected', desc: rowDesc },
    cascadeImpact: { score: cascadeScore, max: 20, label: 'Cascade Impact', desc: cascadeDesc },
    businessCriticalData: { score: businessScore, max: 20, label: 'Business Critical Data', desc: businessDesc },
    reversibility: { score: revScore, max: 10, label: 'Reversibility & Recovery', desc: revDesc },
    totalScore,
    level,
  };
}
