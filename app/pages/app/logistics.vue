<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Logística · GLM' })
</script>

<template>
  <PagePlaceholder
    icon="lucide:truck"
    title="Logística"
    description="Gerencie transportadoras, rotas e capacidade de frete para otimizar o escoamento da produção."
  />
</template>
