import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import type { FlowNode, FlowEdge } from '#shared/domain'

export const fluxos = pgTable('fluxos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  userRole: text('user_role').notNull(),
  nodes: jsonb('nodes').$type<FlowNode[]>().notNull(),
  edges: jsonb('edges').$type<FlowEdge[]>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
