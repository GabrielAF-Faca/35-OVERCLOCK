<script setup lang="ts">
import {
  ROLES,
  CULTURAS,
  MESES,
  roleToTipo,
  type RoleKey,
} from '#shared/domain'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { fetch: refreshSession } = useUserSession()
const { styleOf } = useRoleStyle()

const role = ref<RoleKey>('produtor')
const form = reactive<Record<string, string | number | null>>({
  name: '',
  email: '',
  password: '',
})
const loading = ref(false)
const error = ref('')

const camposPorPapel: Record<
  RoleKey,
  {
    key: string
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
    { key: 'cidade', label: 'Cidade', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
  ],
  agroindustria: [
    { key: 'cultura', label: 'Cultura', type: 'culturas' },
    { key: 'demanda', label: 'Demanda (t)', type: 'number' },
    { key: 'cotacao', label: 'Cotação (R$/t)', type: 'number' },
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

function selecionarPapel(r: RoleKey) {
  role.value = r
  for (const key of Object.keys(form)) {
    if (!['name', 'email', 'password'].includes(key)) delete form[key]
  }
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { ...form, tipoUsuario: roleToTipo(role.value) },
    })
    await refreshSession()
    await navigateTo('/app')
  } catch (e) {
    error.value =
      (e as { statusMessage?: string }).statusMessage ??
      'Não foi possível criar a conta.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8 lg:hidden">
      <NuxtLink to="/"><GlmLogo /></NuxtLink>
    </div>

    <h1 class="text-2xl font-bold tracking-tight text-slate-900">
      Crie sua conta
    </h1>
    <p class="mt-2 text-sm text-slate-500">
      Escolha seu papel na cadeia e comece a montar seus fluxos.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <span class="label">Papel no sistema</span>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <button
            v-for="r in ROLES"
            :key="r"
            type="button"
            class="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[11px] font-semibold ring-1 transition"
            :class="
              role === r
                ? 'bg-glm-50 text-glm-700 ring-glm-300'
                : 'bg-white text-slate-500 ring-slate-200 hover:ring-glm-200'
            "
            @click="selecionarPapel(r)"
          >
            <span
              class="flex size-8 items-center justify-center rounded-lg"
              :class="styleOf(r).iconBg"
            >
              <Icon :name="styleOf(r).icon" size="16" />
            </span>
            {{ styleOf(r).label }}
          </button>
        </div>
      </div>

      <div>
        <label class="label" for="name">Nome</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          required
          class="input"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label class="label" for="email">E-mail</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="input"
          placeholder="voce@fazenda.com.br"
        />
      </div>

      <div>
        <label class="label" for="password">Senha</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          required
          class="input"
          placeholder="Mínimo de 8 caracteres"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="f in camposPorPapel[role]" :key="f.key">
          <label class="label">{{ f.label }}</label>
          <select
            v-if="f.type === 'culturas'"
            v-model="form[f.key]"
            class="input"
          >
            <option v-for="c in CULTURAS" :key="c" :value="c">{{ c }}</option>
          </select>
          <select
            v-else-if="f.type === 'meses'"
            v-model="form[f.key]"
            class="input"
          >
            <option v-for="m in MESES" :key="m" :value="m">{{ m }}</option>
          </select>
          <input
            v-else
            v-model="form[f.key]"
            :type="f.type === 'number' ? 'number' : 'text'"
            step="any"
            min="0"
            class="input"
          />
        </div>
      </div>

      <p
        v-if="error"
        class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
      >
        <Icon name="lucide:alert-circle" size="16" />
        {{ error }}
      </p>

      <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
        <Icon
          v-if="loading"
          name="lucide:loader-2"
          size="18"
          class="animate-spin"
        />
        <span>{{ loading ? 'Criando conta...' : 'Criar conta' }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Já tem conta?
      <NuxtLink
        to="/login"
        class="font-semibold text-glm-700 hover:text-glm-800"
        >Entrar</NuxtLink
      >
    </p>
  </div>
</template>
