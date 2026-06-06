<script setup lang="ts">
defineProps<{ icon: string; title: string; description: string }>()
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="flex h-16 shrink-0 items-center border-b border-glm-100 bg-white/80 px-5 backdrop-blur">
      <h1 class="text-base font-bold text-slate-900">{{ title }}</h1>
    </header>
    <div class="flex flex-1 items-center justify-center p-6">
      <div class="max-w-sm text-center">
        <div class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-glm-100 text-glm-700">
          <Icon :name="icon" size="30" />
        </div>
        <h2 class="mt-5 text-lg font-semibold text-slate-900">{{ title }}</h2>
        <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
        <span class="mt-5 inline-block rounded-full bg-glm-50 px-3 py-1 text-xs font-semibold text-glm-700">
          Em breve
        </span>
      </div>
    </div>
  </div>
</template>
