import { pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { tipoCarga } from './culturas'

export const veiculos = pgTable('veiculos_transportador', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  capacidadeMaxima: numeric('capacidade_maxima', {
    precision: 14,
    scale: 3,
  }).notNull(),
  precoPorKm: numeric('preco_por_km', { precision: 14, scale: 2 }).notNull(),
  tiposCargaSuportados: tipoCarga('tipos_carga_suportados')
    .array()
    .notNull()
    .default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
