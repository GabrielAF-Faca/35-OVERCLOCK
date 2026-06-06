import { pgTable, text, pgEnum } from 'drizzle-orm/pg-core'

export const tipoCarga = pgEnum('tipo_carga', [
  'GRANEL',
  'REFRIGERADO',
  'VIVO',
  'SACA',
])

export const culturas = pgTable('culturas', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  tipoCarga: tipoCarga('tipo_carga').notNull(),
  unidadeMedida: text('unidade_medida').notNull(),
})
