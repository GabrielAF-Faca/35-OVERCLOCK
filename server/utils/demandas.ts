import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { demandas, culturas, users } from '../db/schema'

export async function listDemandas() {
  return db
    .select({
      id: demandas.id,
      quantidadeNecessaria: demandas.quantidadeNecessaria,
      precoMaximoAceitavel: demandas.precoMaximoAceitavel,
      distanciaMaximaKm: demandas.distanciaMaximaKm,
      compradorId: users.id,
      compradorNome: users.name,
      culturaId: culturas.id,
      culturaNome: culturas.nome,
      unidadeMedida: culturas.unidadeMedida,
    })
    .from(demandas)
    .innerJoin(users, eq(demandas.usuarioId, users.id))
    .innerJoin(culturas, eq(demandas.culturaId, culturas.id))
    .orderBy(desc(demandas.createdAt))
}

export async function createDemanda(input: {
  usuarioId: string
  culturaId: string
  quantidadeNecessaria: number
  precoMaximoAceitavel: number
  distanciaMaximaKm: number
}) {
  const [row] = await db
    .insert(demandas)
    .values({
      id: genId('dmd'),
      usuarioId: input.usuarioId,
      culturaId: input.culturaId,
      quantidadeNecessaria: String(input.quantidadeNecessaria),
      precoMaximoAceitavel: String(input.precoMaximoAceitavel),
      distanciaMaximaKm: input.distanciaMaximaKm,
    })
    .returning()
  return row
}
