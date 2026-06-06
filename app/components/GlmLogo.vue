<script setup lang="ts">
withDefaults(defineProps<{ size?: number; withWordmark?: boolean; light?: boolean }>(), {
  size: 32,
  withWordmark: true,
  light: false,
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
      <rect
        width="48"
        height="48"
        rx="12"
        :fill="light ? 'rgba(255,255,255,0.15)' : 'url(#glm-grad)'"
        :stroke="light ? 'rgba(255,255,255,0.3)' : 'none'"
        stroke-width="1.5"
      />
      <circle cx="14" cy="16" r="4" :fill="light ? 'rgba(255,255,255,0.9)' : 'white'" />
      <circle cx="34" cy="13" r="4" :fill="light ? 'rgba(255,255,255,0.9)' : 'white'" />
      <circle cx="24" cy="28" r="4.5" :fill="light ? 'rgba(255,255,255,0.9)' : 'white'" />
      <circle cx="14" cy="36" r="3.5" :fill="light ? 'rgba(255,255,255,0.35)' : '#A6F4C5'" />
      <circle cx="35" cy="35" r="3.5" :fill="light ? 'rgba(255,255,255,0.35)' : '#A6F4C5'" />
      <path
        d="M14 16L24 28M34 13L24 28M24 28L14 36M24 28L35 35"
        :stroke="light ? 'rgba(255,255,255,0.7)' : 'white'"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.85"
      />
      <defs>
        <linearGradient v-if="!light" id="glm-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#12B76A" />
          <stop offset="1" stop-color="#027A48" />
        </linearGradient>
      </defs>
    </svg>
    <span v-if="withWordmark" class="flex flex-col leading-none">
      <span
        class="text-lg font-extrabold tracking-tight"
        :class="light ? 'text-white' : 'text-glm-900'"
      >GLM</span>
      <span
        class="text-[10px] font-medium uppercase tracking-wider"
        :class="light ? 'text-white/70' : 'text-glm-600'"
      >
        Grãos, Lavoura & Mercado
      </span>
    </span>
  </span>
</template>
