/**
 * Cálculo de receita líquida da cadeia. Puro (sem I/O) — usado no canvas (client)
 * e disponível ao server. Portado de `index_regra.html` (getChainInfo/upResults).
 */
import type { FlowNode, FlowEdge } from './domain'

export interface ChainInfo {
  prodNode: FlowNode | null
  totalFrete: number
  cotacao: number
  coopDiscount: number
  bonus: number
}

/** BFS reverso a partir de um destino final. (index_regra.html:3497) */
export function getChainInfo(
  nodes: FlowNode[],
  edges: FlowEdge[],
  destId: string,
): ChainInfo | null {
  const destNode = nodes.find((n) => n.id === destId)
  if (!destNode) return null

  let prodNode: FlowNode | null = null
  let totalFrete = 0
  let cotacao = 0
  let coopDiscount = 0
  const bonus =
    destNode.type === 'agroindustria' ? (destNode.dbData?.bonus ?? 0) : 0

  const queue: string[] = [destId]
  const visited = new Set<string>()

  while (queue.length) {
    const currId = queue.shift()!
    if (visited.has(currId)) continue
    visited.add(currId)

    for (const inEdge of edges.filter((e) => e.to === currId)) {
      const fn = nodes.find((n) => n.id === inEdge.from)
      if (!fn) continue

      if (fn.type === 'transportador' && inEdge.frete?.custo) {
        totalFrete += inEdge.frete.custo
      }
      if (fn.type === 'cooperativa' && fn.dbData?.cotacao && !cotacao) {
        cotacao = fn.dbData.cotacao
        coopDiscount = fn.dbData.descontoTransporte ?? 0
      }
      if (fn.type === 'produtor' && fn.dbData) {
        prodNode = fn
      }
      if (!visited.has(inEdge.from)) queue.push(inEdge.from)
    }
  }

  if (!cotacao && destNode.dbData?.cotacao) cotacao = destNode.dbData.cotacao
  return { prodNode, totalFrete, cotacao, coopDiscount, bonus }
}

/** (cotação + bônus) × qtd − max(0, freteTotal − descontoCoop). (index_regra.html:3556) */
export function calcReceita(info: ChainInfo, qtd: number): number {
  const efCot = info.cotacao + info.bonus
  const netFrete = Math.max(0, info.totalFrete - info.coopDiscount)
  return efCot * qtd - netFrete
}

export function freteCusto(qtd: number, precoTon: number): number {
  return qtd * precoTon
}

export interface ResultadoFluxo {
  destId: string
  produtorNome: string
  destinoNome: string
  cotacaoEfetiva: number
  quantidade: number
  totalFrete: number
  coopDiscount: number
  receita: number
}

/** Resultados de todos os destinos finais alcançados. (index_regra.html:3598) */
export function calcResultados(
  nodes: FlowNode[],
  edges: FlowEdge[],
): ResultadoFluxo[] {
  const destIds = new Set<string>()
  for (const e of edges) {
    const to = nodes.find((n) => n.id === e.to)
    if (to && (to.type === 'agroindustria' || to.type === 'exportadora')) {
      destIds.add(to.id)
    }
  }

  const out: ResultadoFluxo[] = []
  for (const destId of destIds) {
    const info = getChainInfo(nodes, edges, destId)
    if (!info || !info.prodNode?.dbData) continue
    const destNode = nodes.find((n) => n.id === destId)
    const qtd = info.prodNode.dbData.quantidade ?? 0
    out.push({
      destId,
      produtorNome: info.prodNode.dbData.name ?? 'Produtor',
      destinoNome: destNode?.dbData?.name ?? '—',
      cotacaoEfetiva: info.cotacao + info.bonus,
      quantidade: qtd,
      totalFrete: info.totalFrete,
      coopDiscount: info.coopDiscount,
      receita: calcReceita(info, qtd),
    })
  }
  return out
}
