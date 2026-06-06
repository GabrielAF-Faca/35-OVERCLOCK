<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="min-h-screen">
    <header
      class="sticky top-0 z-50 border-b border-glm-100/80 bg-white/70 backdrop-blur-md"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <NuxtLink to="/" class="shrink-0">
          <GlmLogo />
        </NuxtLink>

        <nav class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="/#produto" class="transition hover:text-glm-700">Produto</a>
          <a href="/#como-funciona" class="transition hover:text-glm-700">Como funciona</a>
          <a href="/#para-quem" class="transition hover:text-glm-700">Para quem</a>
        </nav>

        <div class="flex items-center gap-2">
          <template v-if="loggedIn">
            <NuxtLink to="/app" class="btn-primary">
              Abrir painel
              <Icon name="lucide:arrow-right" size="16" />
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-ghost hidden sm:inline-flex">Entrar</NuxtLink>
            <NuxtLink to="/register" class="btn-primary">Criar conta</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="border-t border-glm-100 bg-white/60">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6"
      >
        <GlmLogo :size="24" />
        <p>© {{ new Date().getFullYear() }} GLM — Grafos de Logística e Mercado.</p>
        <p class="text-slate-400">Feito para o campo 🌱</p>
      </div>
    </footer>
  </div>
</template>
