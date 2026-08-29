import type { AnalysisResponse } from '../types/api';
import type { AnalysisView, TableImpactInfo } from '../types';

/**
 * Rolls the report's direct target and its dependency paths into one
 * table -> {rows, role} map for the schema graph. Two paths can land on the
 * same table (e.g. payments via orders), so dependency rows are summed.
 */
function buildAffectedTableMap(
  report: AnalysisResponse
): Record<string, TableImpactInfo> {
  const map: Record<string, TableImpactInfo> = {
    [report.action.table]: {
      count: report.impact.direct_rows,
      role: 'DIRECT',
    },
  };

  for (const dependency of report.dependencies) {
    if (dependency.table === report.action.table) continue;
    const existing = map[dependency.table];
    map[dependency.table] = {
      count: (existing?.count ?? 0) + dependency.rows,
      role: 'CASCADE',
    };
  }

  return map;
}

/** Flattens a backend report into the shape the UI renders. */
export function adaptAnalysis(
  report: AnalysisResponse,
  submittedSql: string
): AnalysisView {
  return {
    analysisId: report.analysis_id,
    status: report.status,
    requiresApproval: report.requires_approval,

    sql: submittedSql,
    operation: report.action.operation,
    targetTable: report.action.table,
    hasWhere: report.action.has_where,

    riskScore: report.risk.score,
    riskLevel: report.risk.level,
    riskReasons: report.risk.reasons,
    riskBreakdown: report.risk.breakdown,

    directRows: report.impact.direct_rows,
    dependentRows: report.impact.dependent_rows,
    totalRows: report.impact.total_rows,
    dependencies: report.dependencies,

    activeSubscriptions: report.business_impact.active_subscriptions,
    mrrAtRisk: report.business_impact.mrr_at_risk,
    arrAtRisk: report.business_impact.arr_at_risk,

    safer: {
      available: report.safer_alternative.available,
      sql: report.safer_alternative.sql ?? null,
      riskScore: report.safer_alternative.risk_score ?? null,
      riskLevel: report.safer_alternative.risk_level ?? null,
    },

    affectedTableMap: buildAffectedTableMap(report),
    timeline: report.timeline,
  };
}

/**
 * Reversibility copy for the original statement. A DELETE that the backend
 * could not pair with a soft-delete column has no in-database undo at all.
 */
export function describeReversibility(view: AnalysisView): string {
  if (view.safer.available) {
    return 'Hard delete — restore requires a backup';
  }
  return 'Irreversible — no soft-delete column on this table';
}
