<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Produtores · GLM' })

const { money, number } = useFormat()

interface Participant {
  id: string
  name: string
  cpfCnpj: string | null
  latitude: number | null
  longitude: number | null
  enderecoFormatado: string | null
}
interface Cultura {
  id: string
  nome: string
  unidadeMedida: string
}
interface Oferta {
  id: string
  quantidadeDisponivel: string
  precoUnitarioDesejado: string
  produtorNome: string
  culturaNome: string
  unidadeMedida: string
}

const { data: produtores, refresh: refreshProdutores } = await useFetch<
  Participant[]
>('/api/participants', { query: { tipo: 'PRODUTOR' }, default: () => [] })
const { data: culturas } = await useFetch<Cultura[]>('/api/culturas', {
  default: () => [],
})
const { data: ofertas, refresh: refreshOfertas } = await useFetch<Oferta[]>(
  '/api/ofertas',
  { default: () => [] },
)

const erro = ref('')

const novoProdutor = reactive({
  name: '',
  email: '',
  cpfCnpj: '',
  latitude: null as number | null,
  longitude: null as number | null,
  enderecoFormatado: '',
})
const salvandoProdutor = ref(false)

async function criarProdutor() {
  erro.value = ''
  salvandoProdutor.value = true
  try {
    await $fetch('/api/participants', {
      method: 'POST',
      body: { ...novoProdutor, tipoUsuario: 'PRODUTOR' },
    })
    Object.assign(novoProdutor, {
      name: '',
      email: '',
      cpfCnpj: '',
      latitude: null,
      longitude: null,
      enderecoFormatado: '',
    })
    await refreshProdutores()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvandoProdutor.value = false
  }
}

const novaOferta = reactive({
  usuarioId: '',
  culturaId: '',
  quantidadeDisponivel: null as number | null,
  precoUnitarioDesejado: null as number | null,
  dataDisponibilidade: '',
})
const salvandoOferta = ref(false)

async function criarOferta() {
  erro.value = ''
  salvandoOferta.value = true
  try {
    await $fetch('/api/ofertas', { method: 'POST', body: novaOferta })
    Object.assign(novaOferta, {
      usuarioId: '',
      culturaId: '',
      quantidadeDisponivel: null,
      precoUnitarioDesejado: null,
      dataDisponibilidade: '',
    })
    await refreshOfertas()
  } catch (e) {
    erro.value =
      (e as { statusMessage?: string }).statusMessage ?? 'Erro ao salvar'
  } finally {
    salvandoOferta.value = false
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur"
    >
      <div>
        <h1 class="text-base font-bold text-slate-900">Produtores</h1>
        <p class="text-xs text-slate-400">
          Cadastre produtores e suas ofertas — os nós de origem do grafo.
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
        <!-- Novo produtor -->
        <form class="card space-y-4" @submit.prevent="criarProdutor">
          <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="lucide:tractor" size="18" class="text-glm-600" />
            Novo produtor
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label">Nome / Razão social</label>
              <input v-model="novoProdutor.name" class="input" required />
            </div>
            <div>
              <label class="label">E-mail</label>
              <input
                v-model="novoProdutor.email"
                type="email"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">CPF / CNPJ</label>
              <input v-model="novoProdutor.cpfCnpj" class="input" />
            </div>
            <div>
              <label class="label">Latitude</label>
              <input
                v-model.number="novoProdutor.latitude"
                type="number"
                step="any"
                class="input"
                placeholder="-12.5453"
              />
            </div>
            <div>
              <label class="label">Longitude</label>
              <input
                v-model.number="novoProdutor.longitude"
                type="number"
                step="any"
                class="input"
                placeholder="-55.7211"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Endereço</label>
              <input
                v-model="novoProdutor.enderecoFormatado"
                class="input"
                placeholder="Sorriso - MT"
              />
            </div>
          </div>
          <button class="btn-primary w-full" :disabled="salvandoProdutor">
            <Icon name="lucide:plus" size="16" />
            Cadastrar produtor
          </button>
        </form>

        <!-- Nova oferta -->
        <form class="card space-y-4" @submit.prevent="criarOferta">
          <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon name="lucide:wheat" size="18" class="text-glm-600" />
            Nova oferta
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="label">Produtor</label>
              <select v-model="novaOferta.usuarioId" class="input" required>
                <option value="" disabled>Selecione</option>
                <option v-for="p in produtores" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Cultura</label>
              <select v-model="novaOferta.culturaId" class="input" required>
                <option value="" disabled>Selecione</option>
                <option v-for="c in culturas" :key="c.id" :value="c.id">
                  {{ c.nome }} ({{ c.unidadeMedida }})
                </option>
              </select>
            </div>
            <div>
              <label class="label">Quantidade disponível</label>
              <input
                v-model.number="novaOferta.quantidadeDisponivel"
                type="number"
                step="any"
                min="0"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">Preço unitário (R$)</label>
              <input
                v-model.number="novaOferta.precoUnitarioDesejado"
                type="number"
                step="any"
                min="0"
                class="input"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Disponível a partir de</label>
              <input
                v-model="novaOferta.dataDisponibilidade"
                type="date"
                class="input"
              />
            </div>
          </div>
          <button
            class="btn-primary w-full"
            :disabled="salvandoOferta || !produtores.length || !culturas.length"
          >
            <Icon name="lucide:plus" size="16" />
            Registrar oferta
          </button>
          <p
            v-if="!produtores.length || !culturas.length"
            class="text-xs text-slate-400"
          >
            Cadastre um produtor e tenha culturas no catálogo para registrar
            ofertas.
          </p>
        </form>
      </div>

      <!-- Lista de ofertas -->
      <div class="card mt-5 !p-0 overflow-hidden">
        <div class="border-b border-slate-100 px-6 py-4">
          <h2 class="text-sm font-bold text-slate-900">
            Ofertas registradas
            <span class="ml-1 text-slate-400">({{ ofertas.length }})</span>
          </h2>
        </div>
        <div
          v-if="!ofertas.length"
          class="px-6 py-10 text-center text-sm text-slate-400"
        >
          Nenhuma oferta registrada ainda.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-slate-100 text-left text-xs text-slate-400"
            >
              <th class="px-6 py-3 font-medium">Produtor</th>
              <th class="px-6 py-3 font-medium">Cultura</th>
              <th class="px-6 py-3 font-medium text-right">Quantidade</th>
              <th class="px-6 py-3 font-medium text-right">Preço unitário</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in ofertas"
              :key="o.id"
              class="border-b border-slate-50 last:border-0 hover:bg-glm-50/40"
            >
              <td class="px-6 py-3 font-medium text-slate-800">
                {{ o.produtorNome }}
              </td>
              <td class="px-6 py-3 text-slate-600">{{ o.culturaNome }}</td>
              <td class="px-6 py-3 text-right text-slate-600">
                {{ number(o.quantidadeDisponivel) }} {{ o.unidadeMedida }}
              </td>
              <td class="px-6 py-3 text-right font-medium text-slate-800">
                {{ money(o.precoUnitarioDesejado) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
