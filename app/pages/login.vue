<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const { fetch: refreshSession } = useUserSession()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refreshSession()
    await navigateTo('/app')
  } catch (e: any) {
    error.value =
      e?.statusMessage || 'Não foi possível entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function fillDemo() {
  form.email = 'planalto@glm.app'
  form.password = 'glm12345'
}
</script>

<template>
  <div>
    <div class="mb-8 lg:hidden">
      <NuxtLink to="/"><GlmLogo /></NuxtLink>
    </div>

    <h1 class="text-2xl font-bold tracking-tight text-slate-900">
      Bem-vindo de volta
    </h1>
    <p class="mt-2 text-sm text-slate-500">Entre para acessar seus grafos.</p>

    <button
      type="button"
      class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-glm-300 bg-glm-50/60 px-4 py-2.5 text-sm font-medium text-glm-700 transition hover:bg-glm-50"
      @click="fillDemo"
    >
      <Icon name="lucide:sparkles" size="16" />
      Preencher com conta de demonstração
    </button>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
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
        <div class="flex items-center justify-between">
          <label class="label" for="password">Senha</label>
          <a
            href="#"
            class="text-xs font-medium text-glm-600 hover:text-glm-700"
            >Esqueceu?</a
          >
        </div>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          required
          class="input"
          placeholder="••••••••"
        />
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
        <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Ainda não tem conta?
      <NuxtLink
        to="/register"
        class="font-semibold text-glm-700 hover:text-glm-800"
        >Cadastre-se</NuxtLink
      >
    </p>
  </div>
</template>
