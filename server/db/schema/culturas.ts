import { pgTable, text, pgEnum } from 'drizzle-orm/pg-core'

/** Natureza física da carga — usada para casar oferta com veículo compatível. */
export const tipoCarga = pgEnum('tipo_carga', [
  'GRANEL',
  'REFRIGERADO',
  'VIVO',
  'SACA',
])

/** Catálogo de culturas/produtos negociáveis (Soja, Milho, Gado, etc). */
export const culturas = pgTable('culturas', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  tipoCarga: tipoCarga('tipo_carga').notNull(),
  unidadeMedida: text('unidade_medida').notNull(), // TON, KG, CABECA
})
