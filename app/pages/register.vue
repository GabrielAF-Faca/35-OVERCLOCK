<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const { fetch: refreshSession } = useUserSession()

const form = reactive({ name: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

const strength = computed(() => {
  const p = form.password
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: form })
    await refreshSession()
    await navigateTo('/app')
  } catch (e: any) {
    error.value = e?.statusMessage || 'Não foi possível criar a conta.'
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

    <h1 class="text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h1>
    <p class="mt-2 text-sm text-slate-500">Comece a conectar sua cadeia produtiva hoje.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label" for="name">Nome</label>
        <input id="name" v-model="form.name" type="text" autocomplete="name" required
          class="input" placeholder="Seu nome" />
      </div>

      <div>
        <label class="label" for="email">E-mail</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" required
          class="input" placeholder="voce@fazenda.com.br" />
      </div>

      <div>
        <label class="label" for="password">Senha</label>
        <input id="password" v-model="form.password" type="password" autocomplete="new-password"
          required class="input" placeholder="Mínimo de 8 caracteres" />
        <div v-if="form.password" class="mt-2 flex gap-1.5">
          <span
            v-for="i in 4"
            :key="i"
            class="h-1.5 flex-1 rounded-full transition-colors"
            :class="i <= strength
              ? (strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : strength === 3 ? 'bg-leaf-400' : 'bg-glm-500')
              : 'bg-slate-200'"
          />
        </div>
      </div>

      <p v-if="error" class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        <Icon name="lucide:alert-circle" size="16" />
        {{ error }}
      </p>

      <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
        <Icon v-if="loading" name="lucide:loader-2" size="18" class="animate-spin" />
        <span>{{ loading ? 'Criando conta...' : 'Criar conta' }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Já tem conta?
      <NuxtLink to="/login" class="font-semibold text-glm-700 hover:text-glm-800">Entrar</NuxtLink>
    </p>
  </div>
</template>
