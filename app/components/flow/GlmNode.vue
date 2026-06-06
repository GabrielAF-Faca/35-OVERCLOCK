<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { type RoleKey, type NodeEntity } from '#shared/domain'

interface GlmNodeData {
  role: RoleKey
  entity: NodeEntity | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

const props = defineProps<{
  id: string
  data: GlmNodeData
  selected?: boolean
}>()

const { money, number } = useFormat()
const { styleOf } = useRoleStyle()

const style = computed(() => styleOf(props.data.role))

interface Field {
  k: string
  v: string
}

const fields = computed<Field[]>(() => {
  const d = props.data.entity
  if (!d) return []
  const role = props.data.role
  const loc = `${d.cidade ?? '—'}/${d.estado ?? ''}`
  if (role === 'produtor')
    return [
      { k: 'Cultura', v: d.cultura ?? '—' },
      { k: 'Quantidade', v: `${number(d.quantidade ?? 0)} t` },
      { k: 'Mês', v: d.mes ?? '—' },
      { k: 'Local', v: loc },
    ]
  if (role === 'cooperativa')
    return [
      { k: 'Cultura', v: d.cultura ?? '—' },
      { k: 'Compra', v: `${number(d.quantidade ?? 0)} t` },
      { k: 'Cotação', v: `${money(d.cotacao ?? 0)}/t` },
      { k: 'Local', v: loc },
    ]
  if (role === 'transportador')
    return [
      { k: 'Tonelagem', v: `${number(d.tonelagem ?? 0)} t` },
      { k: 'Preço/ton', v: `${money(d.precoPorTonelada ?? 0)}/t` },
      { k: 'Local', v: loc },
    ]
  const cot = (d.cotacao ?? 0) + (role === 'agroindustria' ? (d.bonus ?? 0) : 0)
  return [
    { k: 'Cultura', v: d.cultura ?? '—' },
    { k: 'Demanda', v: `${number(d.demanda ?? 0)} t` },
    {
      k: 'Cotação',
      v: `${money(cot)}/t${role === 'agroindustria' && (d.bonus ?? 0) > 0 ? ' (+bônus)' : ''}`,
    },
    { k: 'Local', v: loc },
  ]
})
</script>

<template>
  <div
    class="w-60 rounded-2xl bg-white p-3.5 shadow-sm ring-1 transition"
    :class="[style.ring, selected ? 'shadow-lg ring-2 ring-glm-500' : '']"
  >
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />

    <div class="flex items-start gap-3">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl"
        :class="style.iconBg"
      >
        <Icon :name="style.icon" size="20" />
      </div>
      <div class="min-w-0 flex-1">
        <span
          class="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          :class="style.tag"
        >
          {{ style.label }}
        </span>
        <p class="mt-1 truncate text-sm font-semibold text-slate-900">
          {{ data.entity?.name ?? 'Sem vínculo' }}
        </p>
      </div>
    </div>

    <dl
      v-if="data.entity"
      class="mt-3 space-y-1 border-t border-slate-100 pt-2.5"
    >
      <div
        v-for="f in fields"
        :key="f.k"
        class="flex items-center justify-between gap-2 text-[11px]"
      >
        <dt class="font-medium uppercase tracking-wide text-slate-400">
          {{ f.k }}
        </dt>
        <dd class="truncate font-semibold text-slate-600">{{ f.v }}</dd>
      </div>
    </dl>
    <p
      v-else
      class="mt-3 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400"
    >
      <Icon name="lucide:folder-open" size="14" />
      Clique em "Selecionar"
    </p>

    <div
      class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2"
    >
      <button
        class="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        title="Remover nó"
        @click.stop="data.onRemove(id)"
      >
        <Icon name="lucide:trash-2" size="14" />
      </button>
      <button
        class="flex items-center gap-1.5 rounded-lg bg-glm-50 px-2.5 py-1 text-[11px] font-semibold text-glm-700 transition hover:bg-glm-100"
        @click.stop="data.onSelect(id)"
      >
        <Icon name="lucide:link" size="13" />
        Selecionar
      </button>
    </div>
  </div>
</template>
