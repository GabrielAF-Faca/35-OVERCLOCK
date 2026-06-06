<script setup lang="ts">
import { markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import GlmNode from '~/components/flow/GlmNode.vue'

type Kind = 'producer' | 'cooperative' | 'logistics' | 'market'

const nodeTypes = { glm: markRaw(GlmNode) }

const nodes = ref<Node[]>([
  { id: 'p1', type: 'glm', position: { x: 40, y: 120 }, data: { kind: 'producer', label: 'Fazenda Boa Vista', subtitle: 'Soja · 800 sacas', metric: 'Capacidade 92%' } },
  { id: 'p2', type: 'glm', position: { x: 40, y: 300 }, data: { kind: 'producer', label: 'Sítio Três Rios', subtitle: 'Milho · 420 sacas', metric: 'Capacidade 64%' } },
  { id: 'c1', type: 'glm', position: { x: 360, y: 210 }, data: { kind: 'cooperative', label: 'Coop. Vale Verde', subtitle: '128 associados', metric: 'Armazenagem livre' } },
  { id: 'l1', type: 'glm', position: { x: 680, y: 210 }, data: { kind: 'logistics', label: 'TransAgro', subtitle: 'Rota BR-163', metric: '320 km · 2 caminhões' } },
  { id: 'm1', type: 'glm', position: { x: 1000, y: 210 }, data: { kind: 'market', label: 'Porto de Santos', subtitle: 'Exportação', metric: 'Demanda alta' } },
])

const edges = ref<Edge[]>([
  { id: 'e1', source: 'p1', target: 'c1', animated: true },
  { id: 'e2', source: 'p2', target: 'c1', animated: true },
  { id: 'e3', source: 'c1', target: 'l1', animated: true },
  { id: 'e4', source: 'l1', target: 'm1', animated: true },
])

const { onConnect, addEdges, addNodes, removeNodes, getSelectedNodes, fitView } = useVueFlow()

onConnect((connection: Connection) => {
  addEdges({ ...connection, id: `e_${Date.now()}`, animated: true })
})

let counter = 0
const samples: Record<Kind, { label: string; subtitle: string; metric: string }[]> = {
  producer: [{ label: 'Nova Fazenda', subtitle: 'Café · 200 sacas', metric: 'Capacidade 50%' }],
  cooperative: [{ label: 'Nova Cooperativa', subtitle: '40 associados', metric: 'Armazenagem livre' }],
  logistics: [{ label: 'Transportadora', subtitle: 'Rota a definir', metric: '1 caminhão' }],
  market: [{ label: 'Comprador', subtitle: 'Mercado interno', metric: 'Demanda média' }],
}

function addNode(kind: Kind) {
  counter++
  const sample = samples[kind][0]
  addNodes({
    id: `n_${Date.now()}_${counter}`,
    type: 'glm',
    position: { x: 200 + Math.random() * 300, y: 60 + Math.random() * 360 },
    data: { kind, ...sample },
  })
}

function deleteSelected() {
  const selected = getSelectedNodes.value
  if (selected.length) removeNodes(selected.map((n) => n.id))
}

const palette: { kind: Kind; label: string; icon: string }[] = [
  { kind: 'producer', label: 'Produtor', icon: 'lucide:tractor' },
  { kind: 'cooperative', label: 'Cooperativa', icon: 'lucide:building-2' },
  { kind: 'logistics', label: 'Logística', icon: 'lucide:truck' },
  { kind: 'market', label: 'Mercado', icon: 'lucide:store' },
]
</script>

<template>
  <div class="relative h-full w-full">
    <!-- Paleta flutuante -->
    <div class="absolute left-4 top-4 z-10 w-52 rounded-2xl border border-glm-100 bg-white/90 p-3 shadow-lg backdrop-blur">
      <p class="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Adicionar nó</p>
      <div class="space-y-1">
        <button
          v-for="item in palette"
          :key="item.kind"
          class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-glm-50 hover:text-glm-800"
          @click="addNode(item.kind)"
        >
          <Icon :name="item.icon" size="16" class="text-glm-500" />
          {{ item.label }}
          <Icon name="lucide:plus" size="14" class="ml-auto text-slate-300" />
        </button>
      </div>

      <div class="mt-2 border-t border-slate-100 pt-2">
        <button
          class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
          @click="deleteSelected"
        >
          <Icon name="lucide:trash-2" size="16" />
          Remover selecionado
        </button>
        <button
          class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-glm-50"
          @click="() => fitView({ padding: 0.2 })"
        >
          <Icon name="lucide:maximize" size="16" class="text-glm-500" />
          Centralizar
        </button>
      </div>
    </div>

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 0.85, x: 0, y: 0 }"
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
