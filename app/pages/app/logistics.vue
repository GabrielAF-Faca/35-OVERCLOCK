<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Logística · GLM' })

const { money, number } = useFormat()

type TipoCarga = 'GRANEL' | 'REFRIGERADO' | 'VIVO' | 'SACA'
const TIPOS_CARGA: TipoCarga[] = ['GRANEL', 'REFRIGERADO', 'VIVO', 'SACA']

interface Participant {
  id: string
  name: string
  enderecoFormatado: string | null
}
interface Veiculo {
  id: string
  capacidadeMaxima: string
  precoPorKm: string
  tiposCargaSuportados: TipoCarga[]
  transportadorNome: string
}

const { data: transportadores, refresh: refreshTransp } = await useFetch<
  Participant[]
>('/api/participants', {
  query: { tipo: 'TRANSPORTADOR' },
  default: () => [],
})
const { data: produtores } = await useFetch<Participant[]>(
  '/api/participants',
  {
    query: { tipo: 'PRODUTOR' },
    default: () => [],
  },
)
const { data: cooperativas } = await useFetch<Participant[]>(
  '/api/participants',
  {
    query: { tipo: 'COOPERATIVA' },
    default: () => [],
  },
)
const { data: agroindustrias } = await useFetch<Participant[]>(
  '/api/participants',
  { query: { tipo: 'AGROINDUSTRIA' }, default: () => [] },
)

const todosProprietarios = computed(() => [
  ...transportadores.value,
  ...produtores.value,
  ...cooperativas.value,
  ...agroindustrias.value,
])

const { data: veiculos, refresh: refreshVeiculos } = await useFetch<Veiculo[]>(
  '/api/veiculos',
  { default: () => [] },
)

const erro = ref('')

const novoTransp = reactive({
  name: '',
  email: '',
  cpfCnpj: '',
  latitude: null as number | null,
  longitude: null as number | null,
  enderecoFormatado: '',
})
const salvandoTransp = ref(false)

async function criarTransportador() {
  erro.value = ''
  salvandoTransp.value = true
  try {
    await $fetch('/api/participants', {
      method: 'POST',
      body: { ...novoTransp, tipoUsuario: 'TRANSPORTADOR' },
    })
    Object.assign(novoTransp, {
      name: '',
      email: '',
      cpfCnpj: '',
      latitude: null,
      longitude: null,
      enderecoFormatado: '',
    })
    await refreshTransp()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvandoTransp.value = false
  }
}

const novoVeiculo = reactive({
  usuarioId: '',
  capacidadeMaxima: null as number | null,
  precoPorKm: null as number | null,
  tiposCargaSuportados: [] as TipoCarga[],
})
const salvandoVeiculo = ref(false)

async function criarVeiculo() {
  erro.value = ''
  salvandoVeiculo.value = true
  try {
    await $fetch('/api/veiculos', { method: 'POST', body: novoVeiculo })
    Object.assign(novoVeiculo, {
      usuarioId: '',
      capacidadeMaxima: null,
      precoPorKm: null,
      tiposCargaSuportados: [],
    })
    await refreshVeiculos()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvandoVeiculo.value = false
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur"
    >
      <div>
        <h1 class="text-base font-bold text-slate-900">Logística</h1>
        <p class="text-xs text-slate-400">
          Transportadores e veículos — definem o peso (frete) das arestas.
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

      <div class="grid gap-5 lg:grid-cols-2">
        <!-- Novo transportador -->
        <form class="card space-y-4" @submit.prevent="criarTransportador">
          <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="lucide:building" size="18" class="text-glm-600" />
            Novo transportador
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label">Nome / Razão social</label>
              <input v-model="novoTransp.name" class="input" required />
            </div>
            <div>
              <label class="label">E-mail</label>
              <input
                v-model="novoTransp.email"
                type="email"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">CPF / CNPJ</label>
              <input v-model="novoTransp.cpfCnpj" class="input" />
            </div>
            <div>
              <label class="label">Latitude</label>
              <input
                v-model.number="novoTransp.latitude"
                type="number"
                step="any"
                class="input"
              />
            </div>
            <div>
              <label class="label">Longitude</label>
              <input
                v-model.number="novoTransp.longitude"
                type="number"
                step="any"
                class="input"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Base / Endereço</label>
              <input v-model="novoTransp.enderecoFormatado" class="input" />
            </div>
          </div>
          <button class="btn-primary w-full" :disabled="salvandoTransp">
            <Icon name="lucide:plus" size="16" />
            Cadastrar transportador
          </button>
        </form>

        <!-- Novo veículo -->
        <form class="card space-y-4" @submit.prevent="criarVeiculo">
          <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="lucide:truck" size="18" class="text-glm-600" />
            Novo veículo
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label">Proprietário do veículo</label>
              <select v-model="novoVeiculo.usuarioId" class="input" required>
                <option value="" disabled>Selecione</option>
                <optgroup label="Transportadores">
                  <option
                    v-for="t in transportadores"
                    :key="t.id"
                    :value="t.id"
                  >
                    {{ t.name }}
                  </option>
                </optgroup>
                <optgroup label="Produtores">
                  <option v-for="p in produtores" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </optgroup>
                <optgroup label="Cooperativas">
                  <option v-for="c in cooperativas" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </optgroup>
                <optgroup label="Agroindústrias">
                  <option v-for="a in agroindustrias" :key="a.id" :value="a.id">
                    {{ a.name }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div>
              <label class="label">Capacidade máxima</label>
              <input
                v-model.number="novoVeiculo.capacidadeMaxima"
                type="number"
                step="any"
                min="0"
                class="input"
                placeholder="36 (ton)"
                required
              />
            </div>
            <div>
              <label class="label">Preço por km (R$)</label>
              <input
                v-model.number="novoVeiculo.precoPorKm"
                type="number"
                step="any"
                min="0"
                class="input"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Tipos de carga suportados</label>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="t in TIPOS_CARGA"
                  :key="t"
                  class="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ring-1 transition"
                  :class="
                    novoVeiculo.tiposCargaSuportados.includes(t)
                      ? 'bg-glm-100 text-glm-800 ring-glm-300'
                      : 'bg-white text-slate-600 ring-slate-200 hover:ring-glm-200'
                  "
                >
                  <input
                    v-model="novoVeiculo.tiposCargaSuportados"
                    type="checkbox"
                    :value="t"
                    class="sr-only"
                  />
                  {{ t }}
                </label>
              </div>
            </div>
          </div>
          <button
            class="btn-primary w-full"
            :disabled="salvandoVeiculo || !todosProprietarios.length"
          >
            <Icon name="lucide:plus" size="16" />
            Registrar veículo
          </button>
          <p v-if="!todosProprietarios.length" class="text-xs text-slate-400">
            Cadastre um participante antes de registrar veículos.
          </p>
        </form>
      </div>

      <!-- Lista de veículos -->
      <div class="card mt-5 !p-0 overflow-hidden">
        <div class="border-b border-slate-100 px-6 py-4">
          <h2 class="text-sm font-bold text-slate-900">
            Frota disponível
            <span class="ml-1 text-slate-400">({{ veiculos.length }})</span>
          </h2>
        </div>
        <div
          v-if="!veiculos.length"
          class="px-6 py-10 text-center text-sm text-slate-400"
        >
          Nenhum veículo registrado ainda.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-slate-100 text-left text-xs text-slate-400"
            >
              <th class="px-6 py-3 font-medium">Transportador</th>
              <th class="px-6 py-3 font-medium text-right">Capacidade</th>
              <th class="px-6 py-3 font-medium text-right">Preço / km</th>
              <th class="px-6 py-3 font-medium">Cargas</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in veiculos"
              :key="v.id"
              class="border-b border-slate-50 last:border-0 hover:bg-glm-50/40"
            >
              <td class="px-6 py-3 font-medium text-slate-800">
                {{ v.transportadorNome }}
              </td>
              <td class="px-6 py-3 text-right text-slate-600">
                {{ number(v.capacidadeMaxima) }}
              </td>
              <td class="px-6 py-3 text-right font-medium text-slate-800">
                {{ money(v.precoPorKm) }}
              </td>
              <td class="px-6 py-3">
                <span
                  v-for="t in v.tiposCargaSuportados"
                  :key="t"
                  class="mr-1 inline-block rounded-full bg-glm-50 px-2 py-0.5 text-[11px] font-semibold text-glm-700"
                >
                  {{ t }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
