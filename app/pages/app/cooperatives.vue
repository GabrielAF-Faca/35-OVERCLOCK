<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Cooperativas · GLM' })

const { money, number } = useFormat()

interface Participant {
  id: string
  name: string
  tipoUsuario: string | null
  enderecoFormatado: string | null
}
interface Cultura {
  id: string
  nome: string
  unidadeMedida: string
}
interface Demanda {
  id: string
  quantidadeNecessaria: string
  precoMaximoAceitavel: string
  distanciaMaximaKm: number
  compradorNome: string
  culturaNome: string
  unidadeMedida: string
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

const { data: compradores, refresh: refreshCompradores } = await useFetch<
  Participant[]
>('/api/compradores', { default: () => [] })
const { data: culturas } = await useFetch<Cultura[]>('/api/culturas', {
  default: () => [],
})
const { data: demandas, refresh: refreshDemandas } = await useFetch<Demanda[]>(
  '/api/demandas',
  { default: () => [] },
)

const erro = ref('')

// --- Form: novo comprador ---
const novoComprador = reactive({
  name: '',
  email: '',
  tipoUsuario: 'COOPERATIVA' as 'COOPERATIVA' | 'AGROINDUSTRIA',
  cpfCnpj: '',
  latitude: null as number | null,
  longitude: null as number | null,
  enderecoFormatado: '',
})
const salvandoComprador = ref(false)

async function criarComprador() {
  erro.value = ''
  salvandoComprador.value = true
  try {
    await $fetch('/api/participants', { method: 'POST', body: novoComprador })
    Object.assign(novoComprador, {
      name: '',
      email: '',
      tipoUsuario: 'COOPERATIVA',
      cpfCnpj: '',
      latitude: null,
      longitude: null,
      enderecoFormatado: '',
    })
    await refreshCompradores()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvandoComprador.value = false
  }
}

// --- Form: nova demanda ---
const novaDemanda = reactive({
  usuarioId: '',
  culturaId: '',
  quantidadeNecessaria: null as number | null,
  precoMaximoAceitavel: null as number | null,
  distanciaMaximaKm: null as number | null,
})
const salvandoDemanda = ref(false)

async function criarDemanda() {
  erro.value = ''
  salvandoDemanda.value = true
  try {
    await $fetch('/api/demandas', { method: 'POST', body: novaDemanda })
    Object.assign(novaDemanda, {
      usuarioId: '',
      culturaId: '',
      quantidadeNecessaria: null,
      precoMaximoAceitavel: null,
      distanciaMaximaKm: null,
    })
    await refreshDemandas()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvandoDemanda.value = false
  }
}

// --- Otimização ---
const demandaAtiva = ref<Demanda | null>(null)
const rotas = ref<RotaOtimizada[]>([])
const otimizando = ref(false)
const fechandoIdx = ref<number | null>(null)

async function otimizar(demanda: Demanda) {
  erro.value = ''
  demandaAtiva.value = demanda
  rotas.value = []
  otimizando.value = true
  try {
    const res = await $fetch<{ rotas: RotaOtimizada[] }>(
      `/api/demandas/${demanda.id}/otimizar`,
    )
    rotas.value = res.rotas
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao otimizar'
  } finally {
    otimizando.value = false
  }
}

async function fecharContrato(rota: RotaOtimizada, idx: number) {
  if (!demandaAtiva.value) return
  erro.value = ''
  fechandoIdx.value = idx
  try {
    await $fetch('/api/contratos', {
      method: 'POST',
      body: {
        ofertaId: rota.ofertaId,
        demandaId: demandaAtiva.value.id,
        veiculoId: rota.veiculoId,
        quantidadeNegociada: rota.quantidadeNegociada,
        valorTotalProduto: rota.valorProduto,
        valorTotalFrete: rota.valorFrete,
        distanciaRotaKm: rota.distanciaKm,
      },
    })
    demandaAtiva.value = null
    rotas.value = []
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ??
      'Erro ao fechar contrato'
  } finally {
    fechandoIdx.value = null
  }
}

const tipoLabel: Record<string, string> = {
  COOPERATIVA: 'Cooperativa',
  AGROINDUSTRIA: 'Agroindústria',
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur"
    >
      <div>
        <h1 class="text-base font-bold text-slate-900">
          Cooperativas & Agroindústrias
        </h1>
        <p class="text-xs text-slate-400">
          Demandas de compra — destino do grafo e gatilho da otimização.
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
        <!-- Novo comprador -->
        <form class="card space-y-4" @submit.prevent="criarComprador">
          <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="lucide:building-2" size="18" class="text-glm-600" />
            Nova cooperativa / agroindústria
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="label">Nome / Razão social</label>
              <input v-model="novoComprador.name" class="input" required />
            </div>
            <div>
              <label class="label">Tipo</label>
              <select v-model="novoComprador.tipoUsuario" class="input">
                <option value="COOPERATIVA">Cooperativa</option>
                <option value="AGROINDUSTRIA">Agroindústria</option>
              </select>
            </div>
            <div>
              <label class="label">E-mail</label>
              <input
                v-model="novoComprador.email"
                type="email"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">CPF / CNPJ</label>
              <input v-model="novoComprador.cpfCnpj" class="input" />
            </div>
            <div>
              <label class="label">Latitude</label>
              <input
                v-model.number="novoComprador.latitude"
                type="number"
                step="any"
                class="input"
              />
            </div>
            <div>
              <label class="label">Longitude</label>
              <input
                v-model.number="novoComprador.longitude"
                type="number"
                step="any"
                class="input"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Endereço</label>
              <input v-model="novoComprador.enderecoFormatado" class="input" />
            </div>
          </div>
          <button class="btn-primary w-full" :disabled="salvandoComprador">
            <Icon name="lucide:plus" size="16" />
            Cadastrar
          </button>
        </form>

        <!-- Nova demanda -->
        <form class="card space-y-4" @submit.prevent="criarDemanda">
          <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="lucide:shopping-cart" size="18" class="text-glm-600" />
            Nova demanda
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="label">Comprador</label>
              <select v-model="novaDemanda.usuarioId" class="input" required>
                <option value="" disabled>Selecione</option>
                <option v-for="c in compradores" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Cultura</label>
              <select v-model="novaDemanda.culturaId" class="input" required>
                <option value="" disabled>Selecione</option>
                <option v-for="c in culturas" :key="c.id" :value="c.id">
                  {{ c.nome }} ({{ c.unidadeMedida }})
                </option>
              </select>
            </div>
            <div>
              <label class="label">Quantidade necessária</label>
              <input
                v-model.number="novaDemanda.quantidadeNecessaria"
                type="number"
                step="any"
                min="0"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">Preço máximo (R$)</label>
              <input
                v-model.number="novaDemanda.precoMaximoAceitavel"
                type="number"
                step="any"
                min="0"
                class="input"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Distância máxima (km)</label>
              <input
                v-model.number="novaDemanda.distanciaMaximaKm"
                type="number"
                step="1"
                min="1"
                class="input"
                required
              />
            </div>
          </div>
          <button
            class="btn-primary w-full"
            :disabled="
              salvandoDemanda || !compradores.length || !culturas.length
            "
          >
            <Icon name="lucide:plus" size="16" />
            Registrar demanda
          </button>
        </form>
      </div>

      <!-- Lista de demandas -->
      <div class="card mt-5 !p-0 overflow-hidden">
        <div class="border-b border-slate-100 px-6 py-4">
          <h2 class="text-sm font-bold text-slate-900">
            Demandas registradas
            <span class="ml-1 text-slate-400">({{ demandas.length }})</span>
          </h2>
        </div>
        <div
          v-if="!demandas.length"
          class="px-6 py-10 text-center text-sm text-slate-400"
        >
          Nenhuma demanda registrada ainda.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-slate-100 text-left text-xs text-slate-400"
            >
              <th class="px-6 py-3 font-medium">Comprador</th>
              <th class="px-6 py-3 font-medium">Cultura</th>
              <th class="px-6 py-3 font-medium text-right">Quantidade</th>
              <th class="px-6 py-3 font-medium text-right">Preço máx.</th>
              <th class="px-6 py-3 font-medium text-right">Raio</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="d in demandas"
              :key="d.id"
              class="border-b border-slate-50 last:border-0 hover:bg-glm-50/40"
            >
              <td class="px-6 py-3 font-medium text-slate-800">
                {{ d.compradorNome }}
              </td>
              <td class="px-6 py-3 text-slate-600">{{ d.culturaNome }}</td>
              <td class="px-6 py-3 text-right text-slate-600">
                {{ number(d.quantidadeNecessaria) }} {{ d.unidadeMedida }}
              </td>
              <td class="px-6 py-3 text-right text-slate-600">
                {{ money(d.precoMaximoAceitavel) }}
              </td>
              <td class="px-6 py-3 text-right text-slate-600">
                {{ d.distanciaMaximaKm }} km
              </td>
              <td class="px-6 py-3 text-right">
                <button
                  class="btn-ghost !px-3 !py-1.5 text-xs"
                  @click="otimizar(d)"
                >
                  <Icon name="lucide:zap" size="14" />
                  Otimizar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Painel de otimização -->
    <Teleport to="body">
      <div
        v-if="demandaAtiva"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
        @click.self="demandaAtiva = null"
      >
        <div
          class="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div
            class="flex items-start justify-between border-b border-slate-100 px-6 py-4"
          >
            <div>
              <h2
                class="flex items-center gap-2 text-base font-bold text-slate-900"
              >
                <Icon name="lucide:route" size="18" class="text-glm-600" />
                Rotas otimizadas
              </h2>
              <p class="mt-0.5 text-xs text-slate-400">
                {{ demandaAtiva.compradorNome }} ·
                {{ demandaAtiva.culturaNome }} · custo C = (Q × Pp) + (D × Pk)
              </p>
            </div>
            <button
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              @click="demandaAtiva = null"
            >
              <Icon name="lucide:x" size="18" />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-5">
            <div
              v-if="otimizando"
              class="py-12 text-center text-sm text-slate-400"
            >
              <Icon
                name="lucide:loader-circle"
                size="24"
                class="animate-spin"
              />
              <p class="mt-2">Calculando triangulações de menor custo…</p>
            </div>

            <div
              v-else-if="!rotas.length"
              class="py-12 text-center text-sm text-slate-400"
            >
              Nenhuma combinação Produtor + Transportador atende a esta demanda
              dentro do raio e do preço.
            </div>

            <ul v-else class="space-y-3">
              <li
                v-for="(rota, idx) in rotas"
                :key="rota.ofertaId + rota.veiculoId"
                class="rounded-2xl ring-1 transition"
                :class="
                  idx === 0
                    ? 'bg-glm-50/60 ring-glm-300'
                    : 'bg-white ring-slate-200'
                "
              >
                <div class="flex items-center justify-between gap-4 p-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span
                        v-if="idx === 0"
                        class="rounded-full bg-glm-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      >
                        Melhor custo
                      </span>
                      <span class="text-xs font-medium text-slate-400"
                        >#{{ idx + 1 }}</span
                      >
                    </div>
                    <p
                      class="mt-1 truncate text-sm font-semibold text-slate-800"
                    >
                      {{ rota.produtorNome }}
                      <Icon
                        name="lucide:arrow-right"
                        size="13"
                        class="mx-1 text-slate-300"
                      />
                      {{ rota.transportadorNome }}
                    </p>
                    <div
                      class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500"
                    >
                      <span>Q: {{ number(rota.quantidadeNegociada) }}</span>
                      <span>Pp: {{ money(rota.precoUnitario) }}</span>
                      <span>D: {{ number(rota.distanciaKm) }} km</span>
                      <span>Pk: {{ money(rota.precoPorKm) }}/km</span>
                    </div>
                    <div class="mt-1 text-xs text-slate-400">
                      Produto {{ money(rota.valorProduto) }} + Frete
                      {{ money(rota.valorFrete) }}
                    </div>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-[11px] font-medium uppercase text-slate-400">
                      Custo total
                    </p>
                    <p class="text-lg font-bold text-glm-700">
                      {{ money(rota.custoTotal) }}
                    </p>
                    <button
                      class="btn-primary mt-1.5 !px-3 !py-1.5 text-xs"
                      :disabled="fechandoIdx !== null"
                      @click="fecharContrato(rota, idx)"
                    >
                      <Icon name="lucide:handshake" size="14" />
                      Fechar
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
