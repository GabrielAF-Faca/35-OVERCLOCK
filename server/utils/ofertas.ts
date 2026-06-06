import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { ofertas, culturas, users } from '../db/schema'

export async function listOfertas() {
  return db
    .select({
      id: ofertas.id,
      quantidadeDisponivel: ofertas.quantidadeDisponivel,
      precoUnitarioDesejado: ofertas.precoUnitarioDesejado,
      dataDisponibilidade: ofertas.dataDisponibilidade,
      produtorId: users.id,
      produtorNome: users.name,
      produtorTipo: users.tipoUsuario,
      culturaId: culturas.id,
      culturaNome: culturas.nome,
      tipoCarga: culturas.tipoCarga,
      unidadeMedida: culturas.unidadeMedida,
    })
    .from(ofertas)
    .innerJoin(users, eq(ofertas.usuarioId, users.id))
    .innerJoin(culturas, eq(ofertas.culturaId, culturas.id))
    .orderBy(desc(ofertas.createdAt))
}

export async function createOferta(input: {
  usuarioId: string
  culturaId: string
  quantidadeDisponivel: number
  precoUnitarioDesejado: number
  dataDisponibilidade?: string | null
}) {
  const [row] = await db
    .insert(ofertas)
    .values({
      id: genId('ofr'),
      usuarioId: input.usuarioId,
      culturaId: input.culturaId,
      quantidadeDisponivel: String(input.quantidadeDisponivel),
      precoUnitarioDesejado: String(input.precoUnitarioDesejado),
      dataDisponibilidade: input.dataDisponibilidade || null,
    })
    .returning()
  return row
}
