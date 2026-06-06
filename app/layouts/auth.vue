<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <div
      class="relative hidden overflow-hidden bg-gradient-to-br from-glm-700 via-glm-600 to-glm-800 p-12 lg:flex lg:flex-col lg:justify-between"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-20"
        style="
          background-image: radial-gradient(
            circle at 1px 1px,
            white 1px,
            transparent 0
          );
          background-size: 28px 28px;
        "
      />
      <NuxtLink to="/" class="relative">
        <GlmLogo light :size="36" />
      </NuxtLink>

      <div class="relative max-w-md text-white">
        <h2 class="text-3xl font-bold leading-tight">
          Do produtor ao mercado, conectado por grafos.
        </h2>
        <p class="mt-4 text-glm-100">
          Modele cadeias produtivas, encontre as melhores rotas logísticas e
          aproxime cooperativas, transportadoras e compradores em um só lugar.
        </p>
        <div class="mt-8 flex items-center gap-6 text-sm text-glm-100">
          <div>
            <p class="text-2xl font-bold text-white">+1.200</p>
            <p>produtores conectados</p>
          </div>
          <div class="h-10 w-px bg-white/20" />
          <div>
            <p class="text-2xl font-bold text-white">38%</p>
            <p>menos custo logístico</p>
          </div>
        </div>
      </div>

      <p class="relative text-sm text-glm-200">Feito para o campo 🌱</p>
    </div>

    <div class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>
