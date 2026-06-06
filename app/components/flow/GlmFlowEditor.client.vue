<script setup lang="ts">
import { markRaw } from 'vue'
import {
  VueFlow,
  useVueFlow,
  type Node,
  type Edge,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import GlmNode from '~/components/flow/GlmNode.vue'

const { money, number } = useFormat()

interface Oferta {
  id: string
  quantidadeDisponivel: string
  precoUnitarioDesejado: string
  produtorNome: string
  produtorTipo: string | null
  culturaId: string
  culturaNome: string
  tipoCarga: string
  unidadeMedida: string
}
interface Demanda {
  id: string
  quantidadeNecessaria: string
  precoMaximoAceitavel: string
  distanciaMaximaKm: number
  compradorNome: string
  compradorTipo: string | null
  culturaId: string
  culturaNome: string
  tipoCarga: string
  unidadeMedida: string
}
interface Veiculo {
  id: string
  capacidadeMaxima: string
  precoPorKm: string
  tiposCargaSuportados: string[]
  transportadorNome: string
}
interface RotaOtimizada {
  ofertaId: string
  veiculoId: string
  produtorNome: string
  transportadorNome: string
  quantidadeNegociada: number
  precoUnitario: number
  precoPorKm: number
  distanciaKm: number
  valorProduto: number
  valorFrete: number
  custoTotal: number
}

const nodeTypes = { glm: markRaw(GlmNode) }

const { data: ofertas, refresh: refreshOfertas } = await useFetch<Oferta[]>(
  '/api/ofertas',
  { default: () => [] },
)
const { data: demandas, refresh: refreshDemandas } = await useFetch<Demanda[]>(
  '/api/demandas',
  { default: () => [] },
)
const { data: veiculos, refresh: refreshVeiculos } = await useFetch<Veiculo[]>(
  '/api/veiculos',
  { default: () => [] },
)

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

function buildNodes() {
  // Layout: Produtor → Transportadora → Cooperativa → Transportadora → Agronegócio
  const col = {
    produtor: 40,
    transp1: 280,
    cooperativa: 520,
    transp2: 760,
    agronegocio: 1000,
  }
  const stepY = 150
  const out: Node[] = []

  // Col 1: Produtores (apenas ofertas de PRODUTOR)
  const ofertasProd = ofertas.value.filter((o) => o.produtorTipo === 'PRODUTOR')
  ofertasProd.forEach((o, i) => {
    out.push({
      id: `ofr-${o.id}`,
      type: 'glm',
      position: { x: col.produtor, y: 40 + i * stepY },
      data: {
        kind: 'producer',
        label: o.produtorNome,
        subtitle: `${o.culturaNome} · ${number(o.quantidadeDisponivel)} ${o.unidadeMedida}`,
        metric: `${money(o.precoUnitarioDesejado)} / un`,
      },
    })
  })

  // Col 2: Transportadoras 1ª perna (produtor → cooperativa)
  veiculos.value.forEach((v, i) => {
    out.push({
      id: `veh-l1-${v.id}`,
      type: 'glm',
      position: { x: col.transp1, y: 40 + i * stepY },
      data: {
        kind: 'logistics',
        label: v.transportadorNome,
        subtitle: `1ª perna · ${v.tiposCargaSuportados.join(', ')}`,
        metric: `${money(v.precoPorKm)}/km · cap ${number(v.capacidadeMaxima)}`,
      },
    })
  })

  // Col 3: Cooperativas (demandas de compra + ofertas de venda)
  const demandasCoop = demandas.value.filter(
    (d) => d.compradorTipo === 'COOPERATIVA',
  )
  const ofertasCoop = ofertas.value.filter(
    (o) => o.produtorTipo === 'COOPERATIVA',
  )

  demandasCoop.forEach((d, i) => {
    out.push({
      id: `dmd-${d.id}`,
      type: 'glm',
      position: { x: col.cooperativa, y: 40 + i * stepY },
      data: {
        kind: 'cooperative',
        entityId: d.id,
        selectable: true,
        label: d.compradorNome,
        subtitle: `Compra: ${d.culturaNome} · ${number(d.quantidadeNecessaria)} ${d.unidadeMedida}`,
        metric: `≤ ${money(d.precoMaximoAceitavel)} · raio ${d.distanciaMaximaKm}km`,
      },
    })
  })

  ofertasCoop.forEach((o, i) => {
    out.push({
      id: `ofr-${o.id}`,
      type: 'glm',
      position: {
        x: col.cooperativa,
        y: 40 + (demandasCoop.length + i) * stepY,
      },
      data: {
        kind: 'cooperative',
        label: o.produtorNome,
        subtitle: `Vende: ${o.culturaNome} · ${number(o.quantidadeDisponivel)} ${o.unidadeMedida}`,
        metric: `${money(o.precoUnitarioDesejado)} / un`,
      },
    })
  })

  // Col 4: Transportadoras 2ª perna (cooperativa → agronegócio)
  veiculos.value.forEach((v, i) => {
    out.push({
      id: `veh-l2-${v.id}`,
      type: 'glm',
      position: { x: col.transp2, y: 40 + i * stepY },
      data: {
        kind: 'logistics',
        label: v.transportadorNome,
        subtitle: `2ª perna · ${v.tiposCargaSuportados.join(', ')}`,
        metric: `${money(v.precoPorKm)}/km · cap ${number(v.capacidadeMaxima)}`,
      },
    })
  })

  // Col 5: Agronegócio (apenas demandas de AGROINDUSTRIA)
  const demandasAgro = demandas.value.filter(
    (d) => d.compradorTipo === 'AGROINDUSTRIA',
  )
  demandasAgro.forEach((d, i) => {
    out.push({
      id: `dmd-${d.id}`,
      type: 'glm',
      position: { x: col.agronegocio, y: 40 + i * stepY },
      data: {
        kind: 'market',
        entityId: d.id,
        selectable: true,
        label: d.compradorNome,
        subtitle: `${d.culturaNome} · ${number(d.quantidadeNecessaria)} ${d.unidadeMedida}`,
        metric: `≤ ${money(d.precoMaximoAceitavel)} · raio ${d.distanciaMaximaKm}km`,
      },
    })
  })

  nodes.value = out
}

function buildBaseEdges(): Edge[] {
  const out: Edge[] = []

  for (const d of demandas.value) {
    const dmd = `dmd-${d.id}`
    const leg = d.compradorTipo === 'COOPERATIVA' ? 'l1' : 'l2'

    // Aresta: oferta → demanda (fluxo do produto)
    for (const o of ofertas.value) {
      if (o.culturaId === d.culturaId) {
        out.push(aresta(`ofr-${o.id}`, dmd, false))
      }
    }

    // Aresta: transportadora → demanda (fluxo logístico da perna correta)
    for (const v of veiculos.value) {
      if (v.tiposCargaSuportados.includes(d.tipoCarga)) {
        out.push(aresta(`veh-${leg}-${v.id}`, dmd, false))
      }
    }
  }
  return out
}

buildNodes()
edges.value = buildBaseEdges()

const { onNodeClick, fitView } = useVueFlow()

const demandaSel = ref<Demanda | null>(null)
const rotas = ref<RotaOtimizada[]>([])
const rotaSelIdx = ref(0)
const otimizando = ref(false)
const erro = ref('')
const fechando = ref(false)

onNodeClick((e: NodeMouseEvent) => {
  const id = e.node.data?.entityId as string | undefined
  const kind = e.node.data?.kind as string | undefined
  if ((kind !== 'market' && kind !== 'cooperative') || !id) return
  const d = demandas.value.find((x) => x.id === id)
  if (d) selecionarDemanda(d)
})

async function selecionarDemanda(d: Demanda) {
  demandaSel.value = d
  rotas.value = []
  rotaSelIdx.value = 0
  erro.value = ''
  otimizando.value = true
  try {
    const res = await $fetch<{ rotas: RotaOtimizada[] }>(
      `/api/demandas/${d.id}/otimizar`,
    )
    rotas.value = res.rotas
    desenharArestas()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao otimizar'
  } finally {
    otimizando.value = false
  }
}

function desenharArestas() {
  if (!demandaSel.value) {
    edges.value = buildBaseEdges()
    return
  }
  const dmd = `dmd-${demandaSel.value.id}`
  const leg = demandaSel.value.compradorTipo === 'COOPERATIVA' ? 'l1' : 'l2'
  const sel = rotas.value[rotaSelIdx.value]
  const arestaOfr = sel ? `ofr-${sel.ofertaId}__${dmd}` : ''
  const arestaVeh = sel ? `veh-${leg}-${sel.veiculoId}__${dmd}` : ''

  const base = buildBaseEdges()
  for (const e of base) {
    if (e.id === arestaOfr || e.id === arestaVeh) {
      e.animated = true
      e.style = { stroke: '#039855', strokeWidth: 3 }
    }
  }
  edges.value = base
}

function aresta(source: string, target: string, realce: boolean): Edge {
  return {
    id: `${source}__${target}`,
    source,
    target,
    animated: realce,
    style: realce
      ? { stroke: '#039855', strokeWidth: 3 }
      : { stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' },
  }
}

function escolherRota(idx: number) {
  rotaSelIdx.value = idx
  desenharArestas()
}

function fecharPainel() {
  demandaSel.value = null
  rotas.value = []
  edges.value = buildBaseEdges()
}

async function fecharContrato() {
  const r = rotas.value[rotaSelIdx.value]
  if (!demandaSel.value || !r) return
  erro.value = ''
  fechando.value = true
  try {
    await $fetch('/api/contratos', {
      method: 'POST',
      body: {
        ofertaId: r.ofertaId,
        demandaId: demandaSel.value.id,
        veiculoId: r.veiculoId,
        quantidadeNegociada: r.quantidadeNegociada,
        valorTotalProduto: r.valorProduto,
        valorTotalFrete: r.valorFrete,
        distanciaRotaKm: r.distanciaKm,
      },
    })
    await recarregar()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao fechar'
  } finally {
    fechando.value = false
  }
}

async function recarregar() {
  await Promise.all([refreshOfertas(), refreshDemandas(), refreshVeiculos()])
  buildNodes()
  demandaSel.value = null
  rotas.value = []
  edges.value = buildBaseEdges()
}

const vazio = computed(
  () =>
    !ofertas.value.length && !demandas.value.length && !veiculos.value.length,
)
</script>

<template>
  <div class="relative h-full w-full">
    <!-- Painel de instruções / ações -->
    <div
      class="absolute left-4 top-4 z-10 w-60 rounded-2xl border border-glm-100 bg-white/90 p-3 shadow-lg backdrop-blur"
    >
      <p
        class="px-1 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400"
      >
        Otimização de grafo
      </p>
      <p class="px-1 pb-2 text-xs leading-relaxed text-slate-500">
        Clique em um nó de
        <span class="font-semibold text-emerald-700">cooperativa</span> ou
        <span class="font-semibold text-teal-700">agroindústria</span>
        para gerar o ranking de rotas de menor custo.
      </p>
      <div class="space-y-1 border-t border-slate-100 pt-2">
        <button
          class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-glm-50"
          @click="() => fitView({ padding: 0.2 })"
        >
          <Icon name="lucide:maximize" size="16" class="text-glm-500" />
          Centralizar
        </button>
        <button
          class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-glm-50"
          @click="recarregar"
        >
          <Icon name="lucide:refresh-cw" size="16" class="text-glm-500" />
          Recarregar dados
        </button>
      </div>
      <div
        class="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-400"
      >
        <p>
          <span class="font-semibold text-glm-700">{{ ofertas.length }}</span>
          ofertas ·
          <span class="font-semibold text-teal-700">{{ demandas.length }}</span>
          demandas ·
          <span class="font-semibold text-lime-700">{{ veiculos.length }}</span>
          veículos
        </p>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="vazio"
      class="absolute inset-0 z-10 flex items-center justify-center"
    >
      <div class="max-w-xs text-center">
        <div
          class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-glm-100 text-glm-700"
        >
          <Icon name="lucide:workflow" size="26" />
        </div>
        <p class="mt-4 text-sm font-semibold text-slate-700">Grafo vazio</p>
        <p class="mt-1 text-xs text-slate-400">
          Cadastre produtores, demandas e veículos para montar a cadeia e
          otimizar.
        </p>
      </div>
    </div>

    <!-- Painel de ranking -->
    <Transition name="page">
      <aside
        v-if="demandaSel"
        class="absolute right-4 top-4 bottom-4 z-10 flex w-80 flex-col overflow-hidden rounded-2xl border border-glm-100 bg-white/95 shadow-xl backdrop-blur"
      >
        <div
          class="flex items-start justify-between border-b border-slate-100 px-4 py-3"
        >
          <div class="min-w-0">
            <h3
              class="flex items-center gap-1.5 text-sm font-bold text-slate-900"
            >
              <Icon name="lucide:route" size="16" class="text-glm-600" />
              Ranking de rotas
            </h3>
            <p class="mt-0.5 truncate text-xs text-slate-400">
              {{ demandaSel.compradorNome }} · {{ demandaSel.culturaNome }}
            </p>
            <p class="text-[11px] text-slate-400">C = (Q × Pp) + (D × Pk)</p>
          </div>
          <button
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            @click="fecharPainel"
          >
            <Icon name="lucide:x" size="16" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <p
            v-if="erro"
            class="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
          >
            {{ erro }}
          </p>

          <div
            v-if="otimizando"
            class="py-10 text-center text-xs text-slate-400"
          >
            <Icon name="lucide:loader-circle" size="22" class="animate-spin" />
            <p class="mt-2">Varrendo o grafo…</p>
          </div>

          <div
            v-else-if="!rotas.length"
            class="py-10 text-center text-xs text-slate-400"
          >
            Nenhuma combinação Produtor + Transportador atende esta demanda
            dentro do raio e do preço.
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="(r, idx) in rotas"
              :key="r.ofertaId + r.veiculoId"
              class="cursor-pointer rounded-xl p-3 ring-1 transition"
              :class="
                idx === rotaSelIdx
                  ? 'bg-glm-50 ring-glm-300'
                  : 'bg-white ring-slate-200 hover:ring-glm-200'
              "
              @click="escolherRota(idx)"
            >
              <div class="flex items-center justify-between">
                <span
                  v-if="idx === 0"
                  class="rounded-full bg-glm-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                >
                  Melhor
                </span>
                <span v-else class="text-[11px] font-medium text-slate-400"
                  >#{{ idx + 1 }}</span
                >
                <span class="text-sm font-bold text-glm-700">{{
                  money(r.custoTotal)
                }}</span>
              </div>
              <p class="mt-1 truncate text-xs font-semibold text-slate-700">
                {{ r.produtorNome }}
                <Icon
                  name="lucide:arrow-right"
                  size="11"
                  class="mx-0.5 text-slate-300"
                />
                {{ r.transportadorNome }}
              </p>
              <div
                class="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-400"
              >
                <span>Q {{ number(r.quantidadeNegociada) }}</span>
                <span>D {{ number(r.distanciaKm) }}km</span>
                <span>Prod {{ money(r.valorProduto) }}</span>
                <span>Frete {{ money(r.valorFrete) }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="rotas.length" class="border-t border-slate-100 p-3">
          <button
            class="btn-primary w-full"
            :disabled="fechando"
            @click="fecharContrato"
          >
            <Icon name="lucide:handshake" size="16" />
            Fechar contrato (rota #{{ rotaSelIdx + 1 }})
          </button>
        </div>
      </aside>
    </Transition>

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 0.8, x: 0, y: 0 }"
      :min-zoom="0.3"
      :max-zoom="2"
      fit-view-on-init
      class="bg-glm-50/30"
    >
      <Background :gap="22" :size="1.4" pattern-color="#a6f4c5" />
      <Controls position="bottom-right" />
      <MiniMap
        pannable
        zoomable
        node-color="#12b76a"
        mask-color="rgb(5 96 58 / 0.08)"
      />
    </VueFlow>
  </div>
</template>
