<script setup lang="ts">
import { markRaw, shallowRef, triggerRef } from 'vue'
import {
  VueFlow,
  useVueFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeTypesObject,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import GlmNode from '~/components/flow/GlmNode.vue'
import {
  ROLES,
  ROLE_CONFIG,
  canConnect,
  tipoToRole,
  type RoleKey,
  type NodeEntity,
  type FlowNode,
  type FlowEdge,
} from '#shared/domain'
import {
  getChainInfo,
  calcResultados,
  type ResultadoFluxo,
} from '#shared/chain'

const { money, number } = useFormat()
const { styleOf } = useRoleStyle()
const { user } = useUserSession()
const meuPapel = computed<RoleKey | null>(() =>
  tipoToRole(user.value?.tipoUsuario),
)

const nodeTypes = { glm: markRaw(GlmNode) } as unknown as NodeTypesObject

const vfNodes = shallowRef<Node[]>([])
const vfEdges = shallowRef<Edge[]>([])
let nodeSeq = 1
let edgeSeq = 1

const {
  addEdges,
  removeNodes,
  removeEdges,
  onConnect,
  onEdgeClick,
  fitView,
  screenToFlowCoordinate,
} = useVueFlow()

const { data: me } = await useFetch<NodeEntity>('/api/me')

const toastMsg = ref('')
const toastKind = ref<'success' | 'error' | 'info'>('info')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function toast(msg: string, kind: 'success' | 'error' | 'info' = 'info') {
  toastMsg.value = msg
  toastKind.value = kind
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastMsg.value = ''), 3200)
}

interface RawNode {
  id: string
  position: { x: number; y: number }
  data: { role: RoleKey; entity: NodeEntity | null }
}
interface RawEdge {
  id: string
  source: string
  target: string
  data?: { frete: FlowEdge['frete'] }
  label?: string
  style?: Record<string, unknown>
  labelBgStyle?: Record<string, unknown>
  labelStyle?: Record<string, unknown>
}
function toFlowNodes(): FlowNode[] {
  return (vfNodes.value as unknown as RawNode[]).map((n) => ({
    id: n.id,
    type: n.data.role,
    x: n.position.x,
    y: n.position.y,
    dbId: n.data.entity?.id ?? null,
    dbData: n.data.entity ?? null,
  }))
}
function toFlowEdges(): FlowEdge[] {
  return (vfEdges.value as unknown as RawEdge[]).map((e) => ({
    id: e.id,
    from: e.source,
    to: e.target,
    frete: e.data?.frete ?? null,
  }))
}

const resultados = ref<ResultadoFluxo[]>([])
const totalGeral = computed(() =>
  resultados.value.reduce((s, r) => s + r.receita, 0),
)

function refreshDerived() {
  const fn = toFlowNodes()
  const fe = toFlowEdges()
  for (const e of vfEdges.value as unknown as RawEdge[]) {
    const from = fn.find((n) => n.id === e.source)
    const to = fn.find((n) => n.id === e.target)
    const col = from ? ROLE_CONFIG[from.type].color : '#94a3b8'
    e.label = edgeLabel(fn, fe, from, to, e)
    e.style = { stroke: col, strokeWidth: 2 }
    e.labelBgStyle = { fill: '#fff' }
    e.labelStyle = { fill: col, fontWeight: 700, fontSize: '11px' }
  }
  triggerRef(vfEdges)
  resultados.value = calcResultados(fn, fe)
}

function edgeLabel(
  fn: FlowNode[],
  fe: FlowEdge[],
  from: FlowNode | undefined,
  to: FlowNode | undefined,
  e: RawEdge,
): string {
  if (!from || !to) return ''
  const frete = e.data?.frete ?? null

  if (from.type === 'produtor') {
    if (!from.dbData) return 'Vincule o produtor'
    return `${number(from.dbData.quantidade ?? 0)} t — ${from.dbData.cultura ?? ''}`
  }

  if (to.type === 'transportador') {
    return frete?.label ?? 'Configure o frete'
  }

  if (from.type === 'transportador' && to.type === 'cooperativa') {
    return frete?.label ?? 'Configure o frete'
  }

  if (to.type === 'agroindustria' || to.type === 'exportadora') {
    const info = getChainInfo(fn, fe, to.id)
    if (!info?.prodNode?.dbData) return 'Conecte um produtor'
    const qtd = info.prodNode.dbData.quantidade ?? 0
    const receita =
      (info.cotacao + info.bonus) * qtd -
      Math.max(0, info.totalFrete - info.coopDiscount)
    return money(receita)
  }
  return ''
}

function addNode(role: RoleKey) {
  const id = `n${nodeSeq++}`
  const offset = (vfNodes.value.length % 5) * 40
  const center = screenToFlowCoordinate({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  })
  let entity: NodeEntity | null = null
  if (role === 'produtor' && meuPapel.value === 'produtor' && me.value) {
    entity = me.value
  }
  const novo = {
    id,
    type: 'glm',
    position: { x: center.x - 130 + offset, y: center.y - 80 + offset },
    data: { role, entity, onSelect: openSelector, onRemove: removeNode },
  } as unknown as Node
  vfNodes.value = [...vfNodes.value, novo]
  if (!entity) openSelector(id)
  refreshDerived()
}

function removeNode(id: string) {
  removeNodes([id])
  nextTick(refreshDerived)
}

function clearCanvas() {
  if (!confirm('Limpar o canvas? O fluxo atual será perdido.')) return
  vfNodes.value = []
  vfEdges.value = []
  resultados.value = []
}

onConnect((conn: Connection) => {
  const from = vfNodes.value.find((n) => n.id === conn.source)
  const to = vfNodes.value.find((n) => n.id === conn.target)
  if (!from || !to || from.id === to.id) return
  const fr = from.data.role as RoleKey
  const tr = to.data.role as RoleKey
  if (!canConnect(fr, tr)) {
    toast(
      `${ROLE_CONFIG[fr].label} → ${ROLE_CONFIG[tr].label} não é válida`,
      'error',
    )
    return
  }
  if (vfEdges.value.some((e) => e.source === from.id && e.target === to.id)) {
    toast('Conexão já existe', 'error')
    return
  }
  const id = `e${edgeSeq++}`
  addEdges([{ id, source: from.id, target: to.id, data: { frete: null } }])
  const needsFrete =
    fr === 'transportador' || (fr === 'cooperativa' && tr === 'transportador')
  if (needsFrete) openFrete(id)
  else toast('Conexão criada', 'success')
  nextTick(refreshDerived)
})

function removeEdge(id: string) {
  removeEdges([id])
  nextTick(refreshDerived)
}

onEdgeClick(({ edge }) => {
  if (confirm('Remover esta conexão?')) removeEdge(edge.id)
})

const selOpen = ref(false)
const selNodeId = ref<string | null>(null)
const selRole = ref<RoleKey>('produtor')
const selQuery = ref('')
const selItems = ref<NodeEntity[]>([])
const selLoading = ref(false)

async function openSelector(nodeId: string) {
  const node = vfNodes.value.find((n) => n.id === nodeId)
  if (!node) return
  selNodeId.value = nodeId
  selRole.value = node.data.role as RoleKey
  selQuery.value = ''
  selItems.value = []
  selOpen.value = true
  selLoading.value = true
  try {
    const tipo = ROLE_CONFIG[selRole.value].tipo
    let items = await $fetch<NodeEntity[]>('/api/participants', {
      query: { tipo },
    })

    if (
      selRole.value === 'cooperativa' &&
      meuPapel.value === 'produtor' &&
      me.value?.cultura
    ) {
      items = items.filter((i) => i.cultura === me.value!.cultura)
    }
    selItems.value = items
  } finally {
    selLoading.value = false
  }
}

const selRankable = computed(() =>
  ['cooperativa', 'agroindustria', 'exportadora', 'transportador'].includes(
    selRole.value,
  ),
)
const selLowerBetter = computed(() => selRole.value === 'transportador')

function selScore(i: NodeEntity): number {
  if (selRole.value === 'agroindustria')
    return (i.cotacao ?? 0) + (i.bonus ?? 0)
  if (selRole.value === 'cooperativa' || selRole.value === 'exportadora')
    return i.cotacao ?? 0
  if (selRole.value === 'transportador') return i.precoPorTonelada ?? 0
  return 0
}

const selFiltered = computed(() => {
  const q = selQuery.value.toLowerCase()
  let items = q
    ? selItems.value.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.cidade ?? '').toLowerCase().includes(q) ||
          (i.cultura ?? '').toLowerCase().includes(q),
      )
    : selItems.value
  if (selRankable.value) {
    items = [...items].sort((a, b) =>
      selLowerBetter.value
        ? selScore(a) - selScore(b)
        : selScore(b) - selScore(a),
    )
  }
  return items
})

const selBestId = computed(() => {
  if (!selRankable.value || selFiltered.value.length < 2) return null
  const top = selFiltered.value[0]
  return top && selScore(top) > 0 ? top.id : null
})

function pickEntity(entity: NodeEntity) {
  const node = vfNodes.value.find((n) => n.id === selNodeId.value)
  if (node) node.data = { ...node.data, entity }
  triggerRef(vfNodes)
  selOpen.value = false
  refreshDerived()
  toast('Dados vinculados', 'success')
}

function selTag(i: NodeEntity): string {
  if (selRole.value === 'produtor') return `${number(i.quantidade ?? 0)} t`
  if (selRole.value === 'transportador')
    return `${money(i.precoPorTonelada ?? 0)}/t`
  return `${money(i.cotacao ?? 0)}/t`
}

const freteOpen = ref(false)
const freteEdgeId = ref<string | null>(null)
const freteQtd = ref<number | null>(null)

const freteEdge = computed(() =>
  vfEdges.value.find((e) => e.id === freteEdgeId.value),
)
const freteTransportador = computed<NodeEntity | null>(() => {
  const e = freteEdge.value
  if (!e) return null
  const from = vfNodes.value.find((n) => n.id === e.source)
  const to = vfNodes.value.find((n) => n.id === e.target)
  if ((from?.data.role as RoleKey) === 'transportador')
    return from!.data.entity as NodeEntity
  return (to?.data.entity as NodeEntity) ?? null
})
const fretePreco = computed(
  () => freteTransportador.value?.precoPorTonelada ?? 0,
)
const freteCusto = computed(() => (freteQtd.value ?? 0) * fretePreco.value)

function openFrete(edgeId: string) {
  freteEdgeId.value = edgeId
  const e = vfEdges.value.find((x) => x.id === edgeId)

  let autoQtd = 0
  if (e) {
    const from = vfNodes.value.find((n) => n.id === e.source)
    const upstream = vfEdges.value.find(
      (x) =>
        x.target === from?.id &&
        (vfNodes.value.find((n) => n.id === x.source)?.data.role as RoleKey) ===
          'produtor',
    )
    const prod = upstream
      ? vfNodes.value.find((n) => n.id === upstream.source)
      : null
    autoQtd =
      (prod?.data.entity as NodeEntity | null)?.quantidade ??
      (from?.data.entity as NodeEntity | null)?.quantidade ??
      0
  }
  freteQtd.value = autoQtd || null
  freteOpen.value = true
}

function confirmFrete() {
  const e = freteEdge.value
  const qtd = freteQtd.value ?? 0
  if (!e || qtd <= 0) return
  const custo = qtd * fretePreco.value
  e.data = {
    ...e.data,
    frete: { qtd, custo, label: `${money(custo)} · ${number(qtd)} t` },
  }
  triggerRef(vfEdges)
  freteOpen.value = false
  refreshDerived()
  toast(`Frete configurado: ${money(custo)}`, 'success')
}

function cancelFrete() {
  freteOpen.value = false
}

const flowName = ref('Novo Fluxo')
const flowsOpen = ref(false)
const flowList = ref<{ id: string; nome: string; createdAt: string }[]>([])

async function saveFlow() {
  try {
    await $fetch('/api/fluxos', {
      method: 'POST',
      body: {
        nome: flowName.value,
        nodes: toFlowNodes(),
        edges: toFlowEdges(),
      },
    })
    toast(`Fluxo "${flowName.value}" salvo!`, 'success')
  } catch (err) {
    toast(mensagemErro(err), 'error')
  }
}

async function openFlows() {
  try {
    const url = '/api/fluxos'
    flowList.value =
      await $fetch<{ id: string; nome: string; createdAt: string }[]>(url)
    flowsOpen.value = true
  } catch (err) {
    toast(mensagemErro(err), 'error')
  }
}

async function loadFlow(id: string) {
  try {
    const url = `/api/fluxos/${id}`
    const flow = await $fetch<{
      nome: string
      nodes: FlowNode[]
      edges: FlowEdge[]
    }>(url)
    flowName.value = flow.nome
    vfNodes.value = flow.nodes.map((n) => ({
      id: n.id,
      type: 'glm',
      position: { x: n.x, y: n.y },
      data: {
        role: n.type,
        entity: n.dbData,
        onSelect: openSelector,
        onRemove: removeNode,
      },
    })) as unknown as Node[]
    vfEdges.value = flow.edges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      data: { frete: e.frete },
    })) as unknown as Edge[]
    nodeSeq =
      Math.max(
        0,
        ...flow.nodes.map((n) => Number(n.id.replace('n', '')) || 0),
      ) + 1
    edgeSeq =
      Math.max(
        0,
        ...flow.edges.map((e) => Number(e.id.replace('e', '')) || 0),
      ) + 1
    flowsOpen.value = false
    refreshDerived()
    nextTick(() => fitView({ padding: 0.2 }))
    toast(`Fluxo "${flow.nome}" carregado`, 'success')
  } catch (err) {
    toast(mensagemErro(err), 'error')
  }
}

function mensagemErro(err: unknown): string {
  return (err as { statusMessage?: string })?.statusMessage ?? 'Erro inesperado'
}

const vazio = computed(() => vfNodes.value.length === 0)
</script>

<template>
  <div class="relative flex h-full w-full">
    <aside
      class="z-10 flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-glm-100 bg-white/90 p-3 backdrop-blur"
    >
      <div>
        <p
          class="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Adicionar nó
        </p>
        <button
          v-for="role in ROLES"
          :key="role"
          class="mb-1 flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
          @click="addNode(role)"
        >
          <span
            class="flex size-6 items-center justify-center rounded-md"
            :class="styleOf(role).iconBg"
          >
            <Icon :name="styleOf(role).icon" size="14" />
          </span>
          {{ ROLE_CONFIG[role].label }}
          <Icon name="lucide:plus" size="14" class="ml-auto text-slate-300" />
        </button>
      </div>

      <div class="border-t border-slate-100 pt-3">
        <p
          class="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Resultados
        </p>
        <p v-if="!resultados.length" class="px-1 text-[10px] text-slate-400">
          Conecte destinos finais para ver a receita.
        </p>
        <div
          v-for="r in resultados"
          :key="r.destId"
          class="mb-1.5 rounded-lg border border-glm-100 bg-glm-50/60 p-2"
        >
          <p class="text-[9px] font-bold text-glm-700">
            {{ r.produtorNome }} → {{ r.destinoNome }}
          </p>
          <p class="text-sm font-extrabold text-glm-800">
            {{ money(r.receita) }}
          </p>
          <p class="text-[9px] text-slate-400">
            ({{ money(r.cotacaoEfetiva) }}/t × {{ number(r.quantidade) }} t) −
            frete {{ money(r.totalFrete) }}
          </p>
        </div>
        <div
          v-if="resultados.length"
          class="mt-1 rounded-lg bg-glm-600 px-2 py-1.5 text-center text-xs font-bold text-white"
        >
          {{ resultados.length }} fluxo(s) · {{ money(totalGeral) }}
        </div>
      </div>

      <div
        class="border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"
      >
        <p class="pb-1 font-bold uppercase tracking-wider text-slate-400">
          Legenda
        </p>
        <p>Produtor → Coop/Trans: toneladas</p>
        <p>→ Transportador: valor do frete</p>
        <p>→ Agro/Expo: receita líquida</p>
      </div>
    </aside>

    <div class="relative min-w-0 flex-1">
      <div
        class="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-glm-100 bg-white/90 p-2 shadow backdrop-blur"
      >
        <input
          v-model="flowName"
          class="w-40 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-glm-400"
          placeholder="Nome do fluxo"
        />
        <button class="btn-icon" title="Salvar fluxo" @click="saveFlow">
          <Icon name="lucide:save" size="16" />
        </button>
        <button class="btn-icon" title="Carregar fluxo" @click="openFlows">
          <Icon name="lucide:folder-open" size="16" />
        </button>
        <button class="btn-icon" title="Limpar" @click="clearCanvas">
          <Icon name="lucide:trash-2" size="16" />
        </button>
        <button
          class="btn-icon"
          title="Centralizar"
          @click="() => fitView({ padding: 0.2 })"
        >
          <Icon name="lucide:maximize" size="16" />
        </button>
      </div>

      <div
        v-if="vazio"
        class="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
      >
        <div class="text-center text-slate-400">
          <div
            class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-glm-100 text-glm-700"
          >
            <Icon name="lucide:workflow" size="26" />
          </div>
          <p class="mt-3 text-sm font-semibold text-slate-600">Canvas vazio</p>
          <p class="mt-1 text-xs">Adicione nós pelo painel à esquerda.</p>
        </div>
      </div>

      <VueFlow
        v-model:nodes="vfNodes"
        v-model:edges="vfEdges"
        :node-types="nodeTypes"
        :default-viewport="{ zoom: 0.85, x: 0, y: 0 }"
        :min-zoom="0.3"
        :max-zoom="2"
        class="bg-glm-50/30"
      >
        <Background :gap="22" :size="1.4" pattern-color="#a6f4c5" />
        <Controls position="bottom-right" />
        <MiniMap pannable zoomable node-color="#12b76a" />

        <template #edge-label="{ label }">
          <span>{{ label }}</span>
        </template>
      </VueFlow>

      <p
        class="absolute bottom-4 left-1/2 z-[5] -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-[11px] text-slate-400 shadow-sm ring-1 ring-slate-100"
      >
        Clique numa conexão para removê-la
      </p>
    </div>

    <GlmModal v-if="selOpen" @close="selOpen = false">
      <template #header>
        <Icon :name="styleOf(selRole).icon" size="16" class="text-glm-600" />
        Selecionar {{ ROLE_CONFIG[selRole].label }}
      </template>
      <input
        v-model="selQuery"
        class="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-glm-400"
        placeholder="Buscar por nome, cidade ou cultura…"
      />
      <p v-if="selLoading" class="py-6 text-center text-sm text-slate-400">
        Carregando…
      </p>
      <p
        v-else-if="!selFiltered.length"
        class="py-6 text-center text-sm text-slate-400"
      >
        Nenhum registro encontrado.
      </p>
      <div v-else class="max-h-72 space-y-1 overflow-y-auto">
        <button
          v-for="i in selFiltered"
          :key="i.id"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-white hover:shadow"
          :class="
            i.id === selBestId ? 'bg-glm-50 ring-1 ring-glm-200' : 'bg-slate-50'
          "
          @click="pickEntity(i)"
        >
          <span>
            <span
              class="flex items-center gap-1.5 text-sm font-semibold text-slate-800"
            >
              {{ i.name }}
              <span
                v-if="i.id === selBestId"
                class="rounded-full bg-glm-100 px-1.5 py-0.5 text-[10px] font-bold text-glm-700"
                >⭐ Melhor opção</span
              >
            </span>
            <span class="block text-[11px] text-slate-400"
              >{{ i.cidade ?? '—' }}/{{ i.estado ?? '' }}
              <template v-if="i.cultura"> · {{ i.cultura }}</template></span
            >
          </span>
          <span
            class="rounded-md px-2 py-0.5 text-[11px] font-bold"
            :class="styleOf(selRole).tag"
            >{{ selTag(i) }}</span
          >
        </button>
      </div>
    </GlmModal>

    <GlmModal v-if="freteOpen" @close="cancelFrete">
      <template #header>
        <Icon name="lucide:truck" size="16" class="text-amber-600" />
        Configurar frete
      </template>
      <div
        class="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs"
      >
        <div>
          <p class="font-bold uppercase text-slate-400">Transportador</p>
          <p class="font-semibold text-slate-800">
            {{ freteTransportador?.name ?? '—' }}
          </p>
        </div>
        <div>
          <p class="font-bold uppercase text-slate-400">Preço/ton</p>
          <p class="font-semibold text-amber-600">{{ money(fretePreco) }}/t</p>
        </div>
      </div>
      <label class="label">Quantidade a transportar (t)</label>
      <input
        v-model.number="freteQtd"
        type="number"
        min="0"
        class="input"
        placeholder="Ex: 500"
      />
      <div
        v-if="(freteQtd ?? 0) > 0"
        class="mt-3 rounded-lg border border-glm-100 bg-glm-50 p-3"
      >
        <p class="text-[10px] font-bold uppercase tracking-wide text-glm-700">
          Custo total do frete
        </p>
        <p class="text-lg font-extrabold text-glm-800">
          {{ money(freteCusto) }}
        </p>
        <p class="text-[10px] text-slate-500">
          {{ number(freteQtd ?? 0) }} t × {{ money(fretePreco) }}/t
        </p>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="cancelFrete">Cancelar</button>
        <button
          class="btn-primary"
          :disabled="(freteQtd ?? 0) <= 0"
          @click="confirmFrete"
        >
          Confirmar frete
        </button>
      </template>
    </GlmModal>

    <GlmModal v-if="flowsOpen" @close="flowsOpen = false">
      <template #header>
        <Icon name="lucide:folder-open" size="16" class="text-glm-600" />
        Fluxos salvos
      </template>
      <p
        v-if="!flowList.length"
        class="py-6 text-center text-sm text-slate-400"
      >
        Nenhum fluxo visível para você.
      </p>
      <div v-else class="max-h-72 space-y-1 overflow-y-auto">
        <button
          v-for="f in flowList"
          :key="f.id"
          class="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left transition hover:bg-white hover:shadow"
          @click="loadFlow(f.id)"
        >
          <span>
            <span class="block text-sm font-semibold text-slate-800">{{
              f.nome
            }}</span>
            <span class="block text-[11px] text-slate-400">{{
              new Date(f.createdAt).toLocaleString('pt-BR')
            }}</span>
          </span>
          <Icon name="lucide:arrow-right" size="14" class="text-slate-300" />
        </button>
      </div>
    </GlmModal>

    <Transition name="page">
      <div
        v-if="toastMsg"
        class="fixed bottom-6 right-6 z-50 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        :class="{
          'bg-glm-600': toastKind === 'success',
          'bg-red-500': toastKind === 'error',
          'bg-slate-800': toastKind === 'info',
        }"
      >
        {{ toastMsg }}
      </div>
    </Transition>
  </div>
</template>
