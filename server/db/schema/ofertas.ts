import { pgTable, text, numeric, date, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { culturas } from './culturas'

export const ofertas = pgTable('ofertas', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  culturaId: text('cultura_id')
    .notNull()
    .references(() => culturas.id, { onDelete: 'restrict' }),
  quantidadeDisponivel: numeric('quantidade_disponivel', {
    precision: 14,
    scale: 3,
  }).notNull(),
  precoUnitarioDesejado: numeric('preco_unitario_desejado', {
    precision: 14,
    scale: 2,
  }).notNull(),
  dataDisponibilidade: date('data_disponibilidade'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
