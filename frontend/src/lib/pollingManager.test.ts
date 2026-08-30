import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldSuppressDowngrade,
  filterUnseenReports,
  enqueuePendingReports,
  resolveActiveStatusUpdate,
} from './pollingManager.ts';
import type { AnalysisResponse } from '../types/api.ts';

test('shouldSuppressDowngrade suppresses out-of-order downgrade to PENDING_APPROVAL', () => {
  assert.equal(shouldSuppressDowngrade('APPROVED', 'PENDING_APPROVAL'), true);
  assert.equal(shouldSuppressDowngrade('EXECUTED', 'PENDING_APPROVAL'), true);
  assert.equal(shouldSuppressDowngrade('REJECTED', 'PENDING_APPROVAL'), true);
  assert.equal(shouldSuppressDowngrade('STALE', 'PENDING_APPROVAL'), true);
  assert.equal(shouldSuppressDowngrade('PENDING_APPROVAL', 'APPROVED'), false);
  assert.equal(shouldSuppressDowngrade('PENDING_APPROVAL', 'EXECUTED'), false);
});

test('filterUnseenReports returns only reports not in knownIds set', () => {
  const known = new Set(['id-1', 'id-2']);
  const incoming = [
    { analysis_id: 'id-1', status: 'PENDING_APPROVAL' } as AnalysisResponse,
    { analysis_id: 'id-3', status: 'APPROVED' } as AnalysisResponse,
    { analysis_id: 'id-4', status: 'PENDING_APPROVAL' } as AnalysisResponse,
  ];
  const result = filterUnseenReports(incoming, known);
  assert.equal(result.length, 2);
  assert.equal(result[0].analysis_id, 'id-3');
  assert.equal(result[1].analysis_id, 'id-4');
});

test('enqueuePendingReports prepends incoming without duplicating existing entries', () => {
  const existing = [{ analysis_id: 'id-1', status: 'PENDING_APPROVAL' } as AnalysisResponse];
  const newReports = [
    { analysis_id: 'id-1', status: 'PENDING_APPROVAL' } as AnalysisResponse,
    { analysis_id: 'id-2', status: 'APPROVED' } as AnalysisResponse,
  ];
  const queue = enqueuePendingReports(existing, newReports);
  assert.equal(queue.length, 2);
  assert.equal(queue[0].analysis_id, 'id-2');
  assert.equal(queue[1].analysis_id, 'id-1');
});

test('resolveActiveStatusUpdate resolves valid updates and suppresses redundant/downgrades', () => {
  // Identical status: no update
  assert.equal(resolveActiveStatusUpdate('APPROVED', 'APPROVED'), null);
  // Valid forward transition
  assert.equal(resolveActiveStatusUpdate('PENDING_APPROVAL', 'APPROVED'), 'APPROVED');
  assert.equal(resolveActiveStatusUpdate('APPROVED', 'EXECUTED'), 'EXECUTED');
  // Downgrade suppressed
  assert.equal(resolveActiveStatusUpdate('APPROVED', 'PENDING_APPROVAL'), null);
});
