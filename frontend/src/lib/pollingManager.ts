import type { AnalysisResponse } from '../types/api';

const TERMINAL_STATUSES = ['APPROVED', 'EXECUTED', 'REJECTED', 'STALE'];

/**
 * Returns true if an incoming status transition should be suppressed to prevent
 * an out-of-order race from downgrading an already terminal or approved status to PENDING_APPROVAL.
 */
export function shouldSuppressDowngrade(currentStatus: string, incomingStatus: string): boolean {
  return TERMINAL_STATUSES.includes(currentStatus) && incomingStatus === 'PENDING_APPROVAL';
}

/**
 * Filters incoming reports and returns only those not present in the known IDs set.
 */
export function filterUnseenReports(
  incoming: AnalysisResponse[],
  knownIds: Set<string>
): AnalysisResponse[] {
  return incoming.filter((report) => !knownIds.has(report.analysis_id));
}

/**
 * Prepends new incoming reports to an existing pending reports queue without duplicate entries.
 */
export function enqueuePendingReports(
  existing: AnalysisResponse[],
  newReports: AnalysisResponse[]
): AnalysisResponse[] {
  const existingIds = new Set(existing.map((r) => r.analysis_id));
  const additions = newReports.filter((r) => !existingIds.has(r.analysis_id));
  return [...additions, ...existing];
}

/**
 * Determines whether the active analysis status should be updated based on terminal status rules.
 * Returns the new status string to apply, or null if no update should be performed.
 */
export function resolveActiveStatusUpdate(
  currentStatus: string,
  serverStatus: string
): string | null {
  if (currentStatus === serverStatus) {
    return null;
  }
  if (shouldSuppressDowngrade(currentStatus, serverStatus)) {
    return null;
  }
  return serverStatus;
}
