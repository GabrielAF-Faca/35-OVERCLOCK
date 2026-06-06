<script setup lang="ts">
defineEmits<{ close: [] }>()
</script>

<template>
  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 px-4 py-3"
      >
        <h3 class="flex items-center gap-2 text-sm font-bold text-slate-900">
          <slot name="header" />
        </h3>
        <button
          class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          @click="$emit('close')"
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        class="flex justify-end gap-2 border-t border-slate-100 px-4 py-3"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
