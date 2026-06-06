import { pgTable, text, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { ofertas } from './ofertas'
import { demandas } from './demandas'
import { veiculos } from './veiculos'

export const statusOperacao = pgEnum('status_operacao', [
  'PENDENTE',
  'EM_TRANSITO',
  'ENTREGUE',
  'CANCELADO',
])

/** O "match": triangulação Produtor + Comprador + Transportador fechada. */
export const contratos = pgTable('contratos_operacao', {
  id: text('id').primaryKey(),
  ofertaId: text('oferta_id')
    .notNull()
    .references(() => ofertas.id, { onDelete: 'restrict' }),
  demandaId: text('demanda_id')
    .notNull()
    .references(() => demandas.id, { onDelete: 'restrict' }),
  veiculoId: text('veiculo_id')
    .notNull()
    .references(() => veiculos.id, { onDelete: 'restrict' }),
  quantidadeNegociada: numeric('quantidade_negociada', {
    precision: 14,
    scale: 3,
  }).notNull(),
  valorTotalProduto: numeric('valor_total_produto', {
    precision: 16,
    scale: 2,
  }).notNull(),
  valorTotalFrete: numeric('valor_total_frete', {
    precision: 16,
    scale: 2,
  }).notNull(),
  distanciaRotaKm: numeric('distancia_rota_km', {
    precision: 10,
    scale: 2,
  }).notNull(),
  statusOperacao: statusOperacao('status_operacao')
    .notNull()
    .default('PENDENTE'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
