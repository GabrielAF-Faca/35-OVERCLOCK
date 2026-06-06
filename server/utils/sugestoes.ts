import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { rowToParticipant } from './participants'
import { tipoToRole, type RoleKey } from '#shared/domain'

export interface Sugestao {
  id: string
  nome: string
  tipo: RoleKey
  cidade: string | null
  estado: string | null
  cultura: string | null
  cotacaoEfetiva: number
  bonus: number
  descontoTransporte: number
  receitaBruta: number
}

/**
 * Melhores destinos para a safra de um produtor: cooperativas, agroindústrias e
 * exportadoras da mesma cultura, ordenadas pela cotação efetiva.
 *   coop: cotacao · agro: cotacao + bonus · expo: cotacao
 * Porta de `index_regra.html:3134` (renderSuggestions).
 */
export async function sugestoesParaProdutor(produtorId: string): Promise<{
  cultura: string | null
  quantidade: number
  itens: Sugestao[]
}> {
  const [prodRow] = await db
    .select()
    .from(users)
    .where(eq(users.id, produtorId))
    .limit(1)

  if (!prodRow || prodRow.tipoUsuario !== 'PRODUTOR') {
    return { cultura: null, quantidade: 0, itens: [] }
  }

  const produtor = rowToParticipant(prodRow)
  const quantidade = produtor.quantidade ?? 0

  if (!produtor.cultura) {
    return { cultura: null, quantidade, itens: [] }
  }

  const rows = await db
    .select()
    .from(users)
    .where(
      and(
        inArray(users.tipoUsuario, [
          'COOPERATIVA',
          'AGROINDUSTRIA',
          'EXPORTADORA',
        ]),
        eq(users.cultura, produtor.cultura),
      ),
    )

  const itens: Sugestao[] = rows.map((row) => {
    const p = rowToParticipant(row)
    const tipo = tipoToRole(p.tipoUsuario)!
    const bonus = tipo === 'agroindustria' ? (p.bonus ?? 0) : 0
    const cotacaoEfetiva = (p.cotacao ?? 0) + bonus
    return {
      id: p.id,
      nome: p.name,
      tipo,
      cidade: p.cidade,
      estado: p.estado,
      cultura: p.cultura,
      cotacaoEfetiva,
      bonus,
      descontoTransporte:
        tipo === 'cooperativa' ? (p.descontoTransporte ?? 0) : 0,
      receitaBruta: cotacaoEfetiva * quantidade,
    }
  })

  itens.sort((a, b) => b.cotacaoEfetiva - a.cotacaoEfetiva)

  return { cultura: produtor.cultura, quantidade, itens }
}
