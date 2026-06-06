<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Grafo · GLM' })

const { user } = useUserSession()
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Topbar -->
    <header class="flex h-16 shrink-0 items-center justify-between border-b border-glm-100 bg-white/80 px-5 backdrop-blur">
      <div>
        <h1 class="flex items-center gap-2 text-base font-bold text-slate-900">
          Cadeia produtiva
          <span class="rounded-full bg-glm-100 px-2 py-0.5 text-[11px] font-semibold text-glm-700">rascunho</span>
        </h1>
        <p class="text-xs text-slate-400">Olá, {{ user?.name?.split(' ')[0] }} - arraste os nós e conecte os fluxos.</p>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn-ghost">
          <Icon name="lucide:share-2" size="16" />
          Compartilhar
        </button>
        <button class="btn-primary">
          <Icon name="lucide:save" size="16" />
          Salvar
        </button>
      </div>
    </header>

    <!-- Canvas -->
    <div class="relative min-h-0 flex-1">
      <FlowGlmFlowEditor />
    </div>
  </div>
</template>
