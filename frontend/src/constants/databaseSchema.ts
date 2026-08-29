import { TableSchema } from '../types';

export const DATABASE_SCHEMA: Record<string, TableSchema> = {
  users: {
    name: 'users',
    rowCount: 50000,
    description: 'Primary customer profiles and authentication credentials',
    columns: [
      { name: 'id', type: 'SERIAL', isPk: true },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'email', type: 'VARCHAR(255) UNIQUE' },
      { name: 'status', type: 'VARCHAR(50)' },
      { name: 'last_login', type: 'TIMESTAMP' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'deleted_at', type: 'TIMESTAMP NULL' },
    ],
  },
  subscriptions: {
    name: 'subscriptions',
    rowCount: 15000,
    description: 'Active and past recurring monthly/annual billing contracts',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'SERIAL', isPk: true },
      { name: 'user_id', type: 'INT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'status', type: 'VARCHAR(50)' },
      { name: 'monthly_price', type: 'NUMERIC(10,2)' },
      { name: 'started_at', type: 'TIMESTAMP' },
    ],
  },
  orders: {
    name: 'orders',
    rowCount: 100000,
    description: 'Customer purchase orders and invoice header records',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'SERIAL', isPk: true },
      { name: 'user_id', type: 'INT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'amount', type: 'NUMERIC(10,2)' },
      { name: 'status', type: 'VARCHAR(50)' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  payments: {
    name: 'payments',
    rowCount: 90000,
    description: 'Settled credit card and wire transaction ledger items',
    parentTable: 'orders',
    columns: [
      { name: 'id', type: 'SERIAL', isPk: true },
      { name: 'order_id', type: 'INT', isFk: true, fkTarget: 'orders.id', cascade: true },
      { name: 'amount', type: 'NUMERIC(10,2)' },
      { name: 'status', type: 'VARCHAR(50)' },
    ],
  },
  invoices: {
    name: 'invoices',
    rowCount: 30000,
    description: 'Tax reconciliation receipts and billing statements',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'SERIAL', isPk: true },
      { name: 'user_id', type: 'INT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'amount', type: 'NUMERIC(10,2)' },
      { name: 'status', type: 'VARCHAR(50)' },
    ],
  },
  sessions: {
    name: 'sessions',
    rowCount: 120000,
    description: 'User device auth sessions and JWT refresh tokens',
    parentTable: 'users',
    columns: [
      { name: 'id', type: 'SERIAL', isPk: true },
      { name: 'user_id', type: 'INT', isFk: true, fkTarget: 'users.id', cascade: true },
      { name: 'last_active', type: 'TIMESTAMP' },
    ],
  },
};
