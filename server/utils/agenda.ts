import { db } from '../db'
import { fluxos } from '../db/schema'
import type { FlowNode, FlowEdge, RoleKey } from '#shared/domain'

export interface AgendaItem {
  fluxo: string
  origem: string
  destino: string
  tipoDestino: RoleKey | '—'
  qtd: number
  custo: number
  mes: string
}

/**
 * Agenda de transportes de um transportador: varre todos os fluxos salvos,
 * encontra nós do próprio transportador e traça origem (produtor/cooperativa,
 * subindo um nível se a origem imediata for cooperativa) e destinos.
 * Porta de `index_regra.html:3231` (renderAgenda).
 */
export async function agendaDoTransportador(
  transportadorId: string,
): Promise<AgendaItem[]> {
  const todos = await db.select().from(fluxos)
  const itens: AgendaItem[] = []

  for (const flow of todos) {
    const ns = flow.nodes as FlowNode[]
    const es = flow.edges as FlowEdge[]

    const meusNos = ns.filter(
      (n) => n.type === 'transportador' && n.dbId === transportadorId,
    )

    for (const tNode of meusNos) {
      const outEdges = es.filter((e) => e.from === tNode.id)

      const inEdge = es.find(
        (e) =>
          e.to === tNode.id &&
          ['produtor', 'cooperativa'].includes(
            ns.find((n) => n.id === e.from)?.type ?? '',
          ),
      )
      const srcNode = inEdge ? ns.find((n) => n.id === inEdge.from) : null

      let prodNode = srcNode
      if (srcNode?.type === 'cooperativa') {
        const pe = es.find(
          (e) =>
            e.to === srcNode.id &&
            ns.find((n) => n.id === e.from)?.type === 'produtor',
        )
        if (pe) prodNode = ns.find((n) => n.id === pe.from) ?? prodNode
      }

      const origemLabel = srcNode?.dbData?.name ?? '—'
      const mes = prodNode?.dbData?.mes ?? tNode.dbData?.mes ?? 'Março'
      const qtdBase =
        prodNode?.dbData?.quantidade ?? srcNode?.dbData?.quantidade ?? 0

      if (outEdges.length) {
        for (const oe of outEdges) {
          const dest = ns.find((n) => n.id === oe.to)
          itens.push({
            fluxo: flow.nome,
            origem: origemLabel,
            destino: dest?.dbData?.name ?? '—',
            tipoDestino: dest?.type ?? '—',
            qtd: oe.frete?.qtd ?? qtdBase,
            custo: oe.frete?.custo ?? 0,
            mes,
          })
        }
      } else {
        itens.push({
          fluxo: flow.nome,
          origem: origemLabel,
          destino: '(destino não conectado)',
          tipoDestino: '—',
          qtd: qtdBase,
          custo: 0,
          mes,
        })
      }
    }
  }

  return itens
}
