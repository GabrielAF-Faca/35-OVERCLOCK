<script setup lang="ts">
import { CULTURAS, MESES, tipoToRole, type RoleKey } from '#shared/domain'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Meus dados · GLM' })

const { money, number } = useFormat()
const { styleOf } = useRoleStyle()
const { user } = useUserSession()

interface Participant {
  id: string
  name: string
  email: string
  tipoUsuario: string | null
  cidade: string | null
  estado: string | null
  cultura: string | null
  mes: string | null
  quantidade: number | null
  demanda: number | null
  tonelagem: number | null
  cotacao: number | null
  bonus: number | null
  descontoTransporte: number | null
  precoPorTonelada: number | null
}

const isAdmin = computed(() => user.value?.tipoUsuario === 'ADMIN')
const role = computed<RoleKey | null>(() => tipoToRole(user.value?.tipoUsuario))

const camposPorPapel: Record<
  RoleKey,
  {
    key: keyof Participant
    label: string
    type: 'culturas' | 'meses' | 'number' | 'text'
  }[]
> = {
  produtor: [
    { key: 'cultura', label: 'Cultura', type: 'culturas' },
    { key: 'quantidade', label: 'Quantidade (t)', type: 'number' },
    { key: 'mes', label: 'Mês da safra', type: 'meses' },
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
  ],
  cooperativa: [
    { key: 'cultura', label: 'Cultura', type: 'culturas' },
    { key: 'quantidade', label: 'Capacidade de compra (t)', type: 'number' },
    { key: 'cotacao', label: 'Cotação (R$/t)', type: 'number' },
    {
      key: 'descontoTransporte',
      label: 'Desconto de frete (R$)',
      type: 'number',
    },
    { key: 'mes', label: 'Mês', type: 'meses' },
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
  ],
  transportador: [
    { key: 'tonelagem', label: 'Tonelagem (t)', type: 'number' },
    {
      key: 'precoPorTonelada',
      label: 'Preço por tonelada (R$)',
      type: 'number',
    },
    { key: 'mes', label: 'Mês', type: 'meses' },
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
  ],
  agroindustria: [
    { key: 'cultura', label: 'Cultura', type: 'culturas' },
    { key: 'demanda', label: 'Demanda (t)', type: 'number' },
    { key: 'cotacao', label: 'Cotação (R$/t)', type: 'number' },
    { key: 'bonus', label: 'Bônus ao produtor (R$/t)', type: 'number' },
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
  ],
  exportadora: [
    { key: 'cultura', label: 'Cultura', type: 'culturas' },
    { key: 'demanda', label: 'Demanda (t)', type: 'number' },
    { key: 'cotacao', label: 'Cotação (R$/t)', type: 'number' },
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
  ],
}

const form = reactive<Record<string, string | number | null>>({})
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')

const { data: me, refresh: refreshMe } = await useFetch<Participant>('/api/me')

watchEffect(() => {
  if (!me.value || !role.value) return
  form.name = me.value.name
  for (const f of camposPorPapel[role.value]) {
    form[f.key as string] = me.value[f.key] as string | number | null
  }
})

async function salvar() {
  if (!me.value) return
  erro.value = ''
  sucesso.value = ''
  salvando.value = true
  try {
    const url = `/api/participants/${me.value.id}`
    await $fetch(url, {
      method: 'PUT',
      body: { ...form },
    })
    await refreshMe()
    sucesso.value = 'Dados atualizados com sucesso.'
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvando.value = false
  }
}

const { data: todos, refresh: refreshTodos } = await useFetch<Participant[]>(
  '/api/participants',
  { default: () => [], immediate: false },
)
if (isAdmin.value) await refreshTodos()

async function excluir(p: Participant) {
  if (!confirm(`Excluir ${p.name}?`)) return
  try {
    const url = `/api/participants/${p.id}`
    await $fetch(url, { method: 'DELETE' })
    await refreshTodos()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao excluir'
  }
}

function papelDe(p: Participant): RoleKey | null {
  return tipoToRole(p.tipoUsuario as never)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur"
    >
      <div>
        <h1 class="text-base font-bold text-slate-900">
          {{ isAdmin ? 'Dados gerais' : 'Meus dados' }}
        </h1>
        <p class="text-xs text-slate-400">
          {{
            isAdmin
              ? 'Todos os participantes cadastrados.'
              : 'Atualize as informações do seu perfil na cadeia.'
          }}
        </p>
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto p-5">
      <p
        v-if="erro"
        class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
      >
        {{ erro }}
      </p>

      <div
        v-if="isAdmin"
        class="overflow-hidden rounded-2xl ring-1 ring-slate-200"
      >
        <table class="w-full text-sm">
          <thead>
            <tr
              class="bg-slate-50 text-left text-[11px] uppercase text-slate-400"
            >
              <th class="px-4 py-2.5 font-semibold">Nome</th>
              <th class="px-4 py-2.5 font-semibold">Papel</th>
              <th class="px-4 py-2.5 font-semibold">Local</th>
              <th class="px-4 py-2.5 font-semibold">Cultura</th>
              <th class="px-4 py-2.5 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in todos"
              :key="p.id"
              class="border-t border-slate-100 hover:bg-glm-50/40"
            >
              <td class="px-4 py-2.5 font-medium text-slate-800">
                {{ p.name }}
              </td>
              <td class="px-4 py-2.5">
                <span
                  v-if="papelDe(p)"
                  class="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                  :class="styleOf(papelDe(p)!).tag"
                >
                  <Icon :name="styleOf(papelDe(p)!).icon" size="12" />
                  {{ styleOf(papelDe(p)!).label }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-slate-500">
                {{ p.cidade ?? '—' }}/{{ p.estado ?? '' }}
              </td>
              <td class="px-4 py-2.5 text-slate-500">{{ p.cultura ?? '—' }}</td>
              <td class="px-4 py-2.5 text-right">
                <button
                  class="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Excluir"
                  @click="excluir(p)"
                >
                  <Icon name="lucide:trash-2" size="15" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form
        v-else-if="role"
        class="card max-w-2xl space-y-4"
        @submit.prevent="salvar"
      >
        <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon :name="styleOf(role).icon" size="18" class="text-glm-600" />
          {{ styleOf(role).label }}
        </h2>

        <div>
          <label class="label">Nome</label>
          <input v-model="form.name" class="input" required />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="f in camposPorPapel[role]" :key="f.key">
            <label class="label">{{ f.label }}</label>
            <select
              v-if="f.type === 'culturas'"
              v-model="form[f.key as string]"
              class="input"
            >
              <option v-for="c in CULTURAS" :key="c" :value="c">{{ c }}</option>
            </select>
            <select
              v-else-if="f.type === 'meses'"
              v-model="form[f.key as string]"
              class="input"
            >
              <option v-for="m in MESES" :key="m" :value="m">{{ m }}</option>
            </select>
            <input
              v-else
              v-model="form[f.key as string]"
              :type="f.type === 'number' ? 'number' : 'text'"
              step="any"
              min="0"
              class="input"
            />
          </div>
        </div>

        <p
          v-if="sucesso"
          class="rounded-lg bg-glm-50 px-3 py-2 text-sm font-medium text-glm-700"
        >
          {{ sucesso }}
        </p>

        <button class="btn-primary w-full" :disabled="salvando">
          <Icon name="lucide:save" size="16" />
          {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </form>

      <p v-else class="text-sm text-slate-400">
        Seu usuário não possui um papel de cadeia associado.
      </p>
    </div>
  </div>
</template>
