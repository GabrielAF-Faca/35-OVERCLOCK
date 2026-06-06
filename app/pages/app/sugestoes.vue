<script setup lang="ts">
import type { RoleKey } from '#shared/domain'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Sugestões · GLM' })

const { money, number } = useFormat()
const { styleOf } = useRoleStyle()
const { user } = useUserSession()

interface Sugestao {
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

const ehProdutor = computed(() => user.value?.tipoUsuario === 'PRODUTOR')

const { data } = await useFetch<{
  cultura: string | null
  quantidade: number
  itens: Sugestao[]
}>('/api/sugestoes', {
  default: () => ({ cultura: null, quantidade: 0, itens: [] }),
})

const rankClass = (i: number) =>
  i === 0
    ? 'bg-amber-100 text-amber-700'
    : i === 1
      ? 'bg-slate-200 text-slate-600'
      : i === 2
        ? 'bg-orange-100 text-orange-700'
        : 'bg-slate-100 text-slate-500'
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur"
    >
      <div>
        <h1 class="flex items-center gap-2 text-base font-bold text-slate-900">
          <Icon name="lucide:lightbulb" size="18" class="text-glm-600" />
          Melhores destinos
        </h1>
        <p class="text-xs text-slate-400">
          <template v-if="data.cultura">
            Baseado em {{ number(data.quantidade) }} t de {{ data.cultura }} ·
            valores sem frete.
          </template>
          <template v-else>Ranking de destinos para sua safra.</template>
        </p>
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto p-5">
      <p
        v-if="!ehProdutor"
        class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200"
      >
        Sugestões estão disponíveis apenas para produtores.
      </p>

      <p
        v-else-if="!data.itens.length"
        class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200"
      >
        Nenhuma cooperativa, agroindústria ou exportadora encontrada para a
        cultura
        <b>{{ data.cultura ?? '—' }}</b
        >.
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="(s, i) in data.itens"
          :key="s.id"
          class="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold"
              :class="rankClass(i)"
              >{{ i + 1 }}</span
            >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-xl"
              :class="styleOf(s.tipo).iconBg"
            >
              <Icon :name="styleOf(s.tipo).icon" size="18" />
            </span>
            <div class="min-w-0">
              <p
                class="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900"
              >
                {{ s.nome }}
                <span
                  v-if="s.bonus > 0"
                  class="rounded-full bg-glm-50 px-1.5 py-0.5 text-[10px] font-bold text-glm-700"
                  >+{{ money(s.bonus) }}/t bônus</span
                >
                <span
                  v-if="s.descontoTransporte > 0"
                  class="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700"
                  >-{{ money(s.descontoTransporte) }} frete</span
                >
              </p>
              <p class="truncate text-xs text-slate-400">
                {{ styleOf(s.tipo).label }} · {{ s.cidade ?? '—' }}/{{
                  s.estado ?? ''
                }}
                · {{ money(s.cotacaoEfetiva) }}/t
              </p>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-sm font-extrabold text-glm-700">
              {{ money(s.receitaBruta) }}
            </p>
            <p class="text-[10px] text-slate-400">receita bruta</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
