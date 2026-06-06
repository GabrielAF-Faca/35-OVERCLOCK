<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Cooperativas · GLM' })
</script>

<template>
  <PagePlaceholder
    icon="lucide:building-2"
    title="Cooperativas"
    description="Organize cooperativas, associados e capacidade de armazenagem para conectar oferta e demanda."
  />
</template>
