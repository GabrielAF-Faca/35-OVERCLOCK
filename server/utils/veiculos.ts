import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { veiculos, users } from '../db/schema'
import type { TipoCarga } from './culturas'

export async function listVeiculos() {
  return db
    .select({
      id: veiculos.id,
      capacidadeMaxima: veiculos.capacidadeMaxima,
      precoPorKm: veiculos.precoPorKm,
      tiposCargaSuportados: veiculos.tiposCargaSuportados,
      transportadorId: users.id,
      transportadorNome: users.name,
    })
    .from(veiculos)
    .innerJoin(users, eq(veiculos.usuarioId, users.id))
    .orderBy(desc(veiculos.createdAt))
}

export async function createVeiculo(input: {
  usuarioId: string
  capacidadeMaxima: number
  precoPorKm: number
  tiposCargaSuportados: TipoCarga[]
}) {
  const [row] = await db
    .insert(veiculos)
    .values({
      id: genId('veh'),
      usuarioId: input.usuarioId,
      capacidadeMaxima: String(input.capacidadeMaxima),
      precoPorKm: String(input.precoPorKm),
      tiposCargaSuportados: input.tiposCargaSuportados,
    })
    .returning()
  return row
}
