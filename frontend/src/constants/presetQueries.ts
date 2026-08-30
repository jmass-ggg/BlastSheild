/**
 * Demo statements against the seeded `public` schema in database/init.
 * The analyzer only accepts a single DELETE, so every preset is a DELETE.
 */
export interface PresetQuery {
  key: string;
  label: string;
  hint: string;
  sql: string;
}

export const PRESET_QUERIES: PresetQuery[] = [
  {
    key: 'inactive_users',
    label: 'Delete inactive customers (2y+)',
    hint: 'Cascades into orders, payments, subscriptions and sessions',
    sql: "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';",
  },
  {
    key: 'refunded_orders',
    label: 'Purge refunded orders',
    hint: 'Cascades into the payments ledger',
    sql: "DELETE FROM orders WHERE status = 'refunded';",
  },
  {
    key: 'expired_sessions',
    label: 'Clear expired sessions',
    hint: 'Leaf table — no downstream dependents',
    sql: 'DELETE FROM sessions WHERE expires_at < NOW();',
  },
  {
    key: 'cancelled_subscriptions',
    label: 'Prune cancelled subscriptions',
    hint: 'Removes churned customer subscription records',
    sql: "DELETE FROM subscriptions WHERE status = 'cancelled';",
  },
  {
    key: 'unguarded_delete',
    label: 'Delete every user (no WHERE)',
    hint: 'Worst case — full-table delete across the whole graph',
    sql: 'DELETE FROM users;',
  },
];

export const DEFAULT_SQL = PRESET_QUERIES[0].sql;
