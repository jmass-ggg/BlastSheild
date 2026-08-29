import { TableSchema } from '../types';

/**
 * Mirrors database/init/00_schema.sql. Row counts are seed baselines and are
 * only used as a denominator — live affected-row counts come from the API.
 */
export const DATABASE_SCHEMA: Record<string, TableSchema> = {
  users: {
    name: 'users',
    rowCount: 100,
    description: 'Primary customer profiles, with a deleted_at soft-delete column',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPk: true },
      { name: 'email', type: 'TEXT UNIQUE' },
      { name: 'full_name', type: 'TEXT' },
      { name: 'last_login', type: 'TIMESTAMPTZ' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ NULL' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  orders: {
    name: 'orders',
    rowCount: 250,
    description: 'Customer purchase orders',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPk: true },
      { name: 'user_id', type: 'BIGINT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'status', type: 'TEXT' },
      { name: 'total_amount', type: 'NUMERIC(12,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  payments: {
    name: 'payments',
    rowCount: 250,
    description: 'Settled transaction ledger, one row per order',
    parentTable: 'orders',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPk: true },
      { name: 'order_id', type: 'BIGINT', isFk: true, fkTarget: 'orders.id', cascade: true },
      { name: 'status', type: 'TEXT' },
      { name: 'amount', type: 'NUMERIC(12,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  subscriptions: {
    name: 'subscriptions',
    rowCount: 50,
    description: 'Recurring billing contracts — drives the MRR/ARR at risk figure',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPk: true },
      { name: 'user_id', type: 'BIGINT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'status', type: 'TEXT' },
      { name: 'monthly_price', type: 'NUMERIC(12,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  sessions: {
    name: 'sessions',
    rowCount: 200,
    description: 'Device auth sessions and refresh tokens',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPk: true },
      { name: 'user_id', type: 'BIGINT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'token_hash', type: 'TEXT UNIQUE' },
      { name: 'expires_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
};
