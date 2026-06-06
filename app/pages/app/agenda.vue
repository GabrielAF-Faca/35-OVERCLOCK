<script setup lang="ts">
import { MESES, type RoleKey } from '#shared/domain'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Agenda · GLM' })

const { money, number } = useFormat()
const { styleOf } = useRoleStyle()
const { user } = useUserSession()

interface AgendaItem {
  fluxo: string
  origem: string
  destino: string
  tipoDestino: RoleKey | '—'
  qtd: number
  custo: number
  mes: string
}

const ehTransportador = computed(
  () => user.value?.tipoUsuario === 'TRANSPORTADOR',
)

const { data: itens } = await useFetch<AgendaItem[]>('/api/agenda', {
  default: () => [],
})

const porMes = computed(() =>
  MESES.map((mes) => ({
    mes,
    itens: itens.value.filter((i) => i.mes === mes),
  })).filter((g) => g.itens.length),
)

const totalMes = (lista: AgendaItem[]) => lista.reduce((s, i) => s + i.custo, 0)
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur"
    >
      <div>
        <h1 class="flex items-center gap-2 text-base font-bold text-slate-900">
          <Icon name="lucide:calendar" size="18" class="text-glm-600" />
          Agenda de transportes
        </h1>
        <p class="text-xs text-slate-400">
          {{ user?.name }} · {{ itens.length }} registro(s) em fluxos salvos.
        </p>
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto p-5">
      <p
        v-if="!ehTransportador"
        class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200"
      >
        A agenda está disponível apenas para transportadores.
      </p>

      <p
        v-else-if="!itens.length"
        class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200"
      >
        Agenda vazia. Adicione seu nó de transportador a um fluxo no canvas e
        salve o fluxo para que ele apareça aqui.
      </p>

      <div v-else class="space-y-6">
        <section v-for="g in porMes" :key="g.mes">
          <h2
            class="mb-2 border-b-2 border-slate-200 pb-1 text-sm font-bold text-slate-900"
          >
            {{ g.mes }}
          </h2>
          <div class="overflow-hidden rounded-xl ring-1 ring-slate-200">
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="bg-slate-50 text-left text-[11px] uppercase text-slate-400"
                >
                  <th class="px-4 py-2 font-semibold">Origem</th>
                  <th class="px-4 py-2 font-semibold">Destino</th>
                  <th class="px-4 py-2 font-semibold">Tipo</th>
                  <th class="px-4 py-2 text-right font-semibold">Qtd</th>
                  <th class="px-4 py-2 text-right font-semibold">Frete</th>
                  <th class="px-4 py-2 font-semibold">Fluxo</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(i, idx) in g.itens"
                  :key="idx"
                  class="border-t border-slate-100"
                >
                  <td class="px-4 py-2 text-slate-700">{{ i.origem }}</td>
                  <td class="px-4 py-2 text-slate-700">{{ i.destino }}</td>
                  <td class="px-4 py-2 text-slate-500">
                    <span
                      v-if="i.tipoDestino !== '—'"
                      class="inline-flex items-center gap-1.5"
                    >
                      <Icon :name="styleOf(i.tipoDestino).icon" size="14" />
                      {{ styleOf(i.tipoDestino).label }}
                    </span>
                    <template v-else>—</template>
                  </td>
                  <td class="px-4 py-2 text-right text-slate-700">
                    {{ i.qtd > 0 ? `${number(i.qtd)} t` : '—' }}
                  </td>
                  <td class="px-4 py-2 text-right font-semibold text-slate-800">
                    {{ i.custo > 0 ? money(i.custo) : '—' }}
                  </td>
                  <td class="px-4 py-2 text-[11px] text-slate-400">
                    {{ i.fluxo }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-if="totalMes(g.itens) > 0"
            class="mt-1.5 inline-block rounded-md bg-glm-50 px-3 py-1 text-xs font-bold text-glm-700"
          >
            Total do mês: {{ money(totalMes(g.itens)) }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
