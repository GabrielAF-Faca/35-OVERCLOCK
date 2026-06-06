import { pgTable, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { culturas } from './culturas'

export const demandas = pgTable('demandas', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  culturaId: text('cultura_id')
    .notNull()
    .references(() => culturas.id, { onDelete: 'restrict' }),
  quantidadeNecessaria: numeric('quantidade_necessaria', {
    precision: 14,
    scale: 3,
  }).notNull(),
  precoMaximoAceitavel: numeric('preco_maximo_aceitavel', {
    precision: 14,
    scale: 2,
  }).notNull(),
  distanciaMaximaKm: integer('distancia_maxima_km').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
