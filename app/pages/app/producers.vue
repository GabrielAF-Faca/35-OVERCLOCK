<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Produtores · GLM' })
</script>

<template>
  <PagePlaceholder
    icon="lucide:tractor"
    title="Produtores"
    description="Cadastre produtores rurais, volumes de produção e capacidade para incluí-los nos seus grafos."
  />
</template>
