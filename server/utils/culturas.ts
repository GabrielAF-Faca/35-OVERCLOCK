import { asc } from 'drizzle-orm'
import { db } from '../db'
import { culturas } from '../db/schema'

export type TipoCarga = 'GRANEL' | 'REFRIGERADO' | 'VIVO' | 'SACA'

export async function listCulturas() {
  return db.select().from(culturas).orderBy(asc(culturas.nome))
}

export async function createCultura(input: {
  nome: string
  tipoCarga: TipoCarga
  unidadeMedida: string
}) {
  const [row] = await db
    .insert(culturas)
    .values({
      id: genId('cul'),
      nome: input.nome.trim(),
      tipoCarga: input.tipoCarga,
      unidadeMedida: input.unidadeMedida.trim(),
    })
    .returning()
  return row
}
