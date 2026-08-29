import { ERNodePosition, ERRelationship } from '../types';

export const ER_NODE_POSITIONS: Record<string, ERNodePosition> = {
  users: { x: 380, y: 20, w: 240, h: 160 },
  subscriptions: { x: 90, y: 250, w: 210, h: 150 },
  orders: { x: 360, y: 250, w: 210, h: 150 },
  sessions: { x: 630, y: 250, w: 210, h: 150 },
  payments: { x: 360, y: 450, w: 210, h: 150 },
};

export const ER_RELATIONSHIPS: ERRelationship[] = [
  { from: 'users', to: 'subscriptions', label: '1 : N (CASCADE)', fk: 'user_id ➔ users.id' },
  { from: 'users', to: 'orders', label: '1 : N (CASCADE)', fk: 'user_id ➔ users.id' },
  { from: 'users', to: 'sessions', label: '1 : N (CASCADE)', fk: 'user_id ➔ users.id' },
  { from: 'orders', to: 'payments', label: '1 : N (CASCADE)', fk: 'order_id ➔ orders.id' },
];
