<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface GlmNodeData {
  kind: 'producer' | 'cooperative' | 'logistics' | 'market'
  label: string
  subtitle?: string
  metric?: string
}

const props = defineProps<{
  data: GlmNodeData
  selected?: boolean
}>()

const palette: Record<
  GlmNodeData['kind'],
  { icon: string; ring: string; iconBg: string; tag: string; tagText: string; label: string }
> = {
  producer: {
    icon: 'lucide:tractor',
    ring: 'ring-glm-200',
    iconBg: 'bg-glm-100 text-glm-700',
    tag: 'bg-glm-50 text-glm-700',
    tagText: 'Produtor',
    label: 'Produtor',
  },
  cooperative: {
    icon: 'lucide:building-2',
    ring: 'ring-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    tag: 'bg-emerald-50 text-emerald-700',
    tagText: 'Cooperativa',
    label: 'Cooperativa',
  },
  logistics: {
    icon: 'lucide:truck',
    ring: 'ring-leaf-400/40',
    iconBg: 'bg-lime-100 text-lime-700',
    tag: 'bg-lime-50 text-lime-700',
    tagText: 'Logística',
    label: 'Logística',
  },
  market: {
    icon: 'lucide:store',
    ring: 'ring-teal-200',
    iconBg: 'bg-teal-100 text-teal-700',
    tag: 'bg-teal-50 text-teal-700',
    tagText: 'Mercado',
    label: 'Mercado',
  },
}

const style = computed(() => palette[props.data.kind])
</script>

<template>
  <div
    class="w-56 rounded-2xl bg-white p-3.5 shadow-sm ring-1 transition"
    :class="[style.ring, selected ? 'shadow-lg ring-2 ring-glm-500' : '']"
  >
    <Handle type="target" :position="Position.Left" />

    <div class="flex items-start gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="style.iconBg">
        <Icon :name="style.icon" size="20" />
      </div>
      <div class="min-w-0 flex-1">
        <span
          class="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          :class="style.tag"
        >
          {{ style.tagText }}
        </span>
        <p class="mt-1 truncate text-sm font-semibold text-slate-900">{{ data.label }}</p>
        <p v-if="data.subtitle" class="truncate text-xs text-slate-400">{{ data.subtitle }}</p>
      </div>
    </div>

    <div
      v-if="data.metric"
      class="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs font-medium text-slate-500"
    >
      <Icon name="lucide:gauge" size="13" class="text-glm-500" />
      {{ data.metric }}
    </div>

    <Handle type="source" :position="Position.Right" />
  </div>
</template>
