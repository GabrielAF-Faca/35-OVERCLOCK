<script setup lang="ts">
withDefaults(defineProps<{ size?: number; withWordmark?: boolean }>(), {
  size: 32,
  withWordmark: true,
})
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="url(#glm-grad)" />
      <!-- nós do grafo -->
      <circle cx="14" cy="16" r="4" fill="white" />
      <circle cx="34" cy="13" r="4" fill="white" />
      <circle cx="24" cy="28" r="4.5" fill="white" />
      <circle cx="14" cy="36" r="3.5" fill="#A6F4C5" />
      <circle cx="35" cy="35" r="3.5" fill="#A6F4C5" />
      <!-- arestas -->
      <path
        d="M14 16L24 28M34 13L24 28M24 28L14 36M24 28L35 35"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.85"
      />
      <defs>
        <linearGradient id="glm-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#12B76A" />
          <stop offset="1" stop-color="#027A48" />
        </linearGradient>
      </defs>
    </svg>
    <span v-if="withWordmark" class="flex flex-col leading-none">
      <span class="text-lg font-extrabold tracking-tight text-glm-900">GLM</span>
      <span class="text-[10px] font-medium uppercase tracking-wider text-glm-600">
        Logística & Mercado
      </span>
    </span>
  </span>
</template>
