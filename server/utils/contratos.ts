import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { contratos, ofertas, demandas, users } from '../db/schema'
import { alias } from 'drizzle-orm/pg-core'

export type StatusOperacao =
  | 'PENDENTE'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADO'

const produtor = alias(users, 'produtor')
const comprador = alias(users, 'comprador')

export async function listContratos() {
  return db
    .select({
      id: contratos.id,
      quantidadeNegociada: contratos.quantidadeNegociada,
      valorTotalProduto: contratos.valorTotalProduto,
      valorTotalFrete: contratos.valorTotalFrete,
      distanciaRotaKm: contratos.distanciaRotaKm,
      statusOperacao: contratos.statusOperacao,
      produtorNome: produtor.name,
      compradorNome: comprador.name,
    })
    .from(contratos)
    .innerJoin(ofertas, eq(contratos.ofertaId, ofertas.id))
    .innerJoin(demandas, eq(contratos.demandaId, demandas.id))
    .innerJoin(produtor, eq(ofertas.usuarioId, produtor.id))
    .innerJoin(comprador, eq(demandas.usuarioId, comprador.id))
    .orderBy(desc(contratos.createdAt))
}

export async function createContrato(input: {
  ofertaId: string
  demandaId: string
  veiculoId: string
  quantidadeNegociada: number
  valorTotalProduto: number
  valorTotalFrete: number
  distanciaRotaKm: number
}) {
  const [row] = await db
    .insert(contratos)
    .values({
      id: genId('ctr'),
      ofertaId: input.ofertaId,
      demandaId: input.demandaId,
      veiculoId: input.veiculoId,
      quantidadeNegociada: String(input.quantidadeNegociada),
      valorTotalProduto: String(input.valorTotalProduto),
      valorTotalFrete: String(input.valorTotalFrete),
      distanciaRotaKm: String(input.distanciaRotaKm),
    })
    .returning()
  return row
}
