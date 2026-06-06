<script setup lang="ts">
const features = [
  {
    icon: 'lucide:share-2',
    title: 'Grafos visuais',
    text: 'Modele a cadeia produtiva como um grafo: produtores, cooperativas, transporte e compradores em um canvas estilo n8n.',
  },
  {
    icon: 'lucide:route',
    title: 'Rotas inteligentes',
    text: 'Visualize fluxos de escoamento e identifique os melhores caminhos logísticos para reduzir custo e tempo.',
  },
  {
    icon: 'lucide:handshake',
    title: 'Conexões diretas',
    text: 'Aproxime o produtor rural de cooperativas e mercado, sem intermediários desnecessários.',
  },
  {
    icon: 'lucide:bar-chart-3',
    title: 'Decisão com dados',
    text: 'Capacidade, distância e demanda em cada nó para você decidir com clareza.',
  },
]

const audiences = [
  { icon: 'lucide:tractor', title: 'Produtores rurais', text: 'Encontre o melhor destino e rota para a sua produção.' },
  { icon: 'lucide:building-2', title: 'Cooperativas', text: 'Organize a oferta dos associados e otimize o escoamento.' },
  { icon: 'lucide:truck', title: 'Transportadoras', text: 'Preencha rotas e reduza viagens ociosas.' },
]
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-glm-50 via-white to-white"
      />
      <div
        class="pointer-events-none absolute -top-24 right-0 -z-10 size-[480px] rounded-full bg-glm-200/40 blur-3xl"
      />

      <div class="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div
          class="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-glm-100 px-4 py-1.5 text-sm font-medium text-glm-700"
        >
          <span class="size-2 animate-pulse rounded-full bg-glm-500" />
          Novo · grafos para o agronegócio
        </div>

        <h1
          class="mx-auto max-w-3xl text-center text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl"
        >
          Conecte o
          <span class="bg-gradient-to-r from-glm-600 to-glm-500 bg-clip-text text-transparent">
            produtor rural
          </span>
          à logística e ao mercado
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-600">
          O GLM transforma cadeias produtivas em grafos interativos. Modele, conecte e otimize
          o caminho da produção — do campo à cooperativa, da transportadora ao comprador.
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <NuxtLink to="/register" class="btn-primary px-6 py-3 text-base">
            Começar gratuitamente
            <Icon name="lucide:arrow-right" size="18" />
          </NuxtLink>
          <NuxtLink to="/login" class="btn-ghost px-6 py-3 text-base">
            <Icon name="lucide:play" size="16" />
            Ver demonstração
          </NuxtLink>
        </div>

        <!-- Mock do canvas -->
        <div class="mt-16 rounded-3xl border border-glm-100 bg-white/60 p-2 shadow-xl shadow-glm-900/5">
          <div class="rounded-2xl bg-glm-50/60 p-6 sm:p-10">
            <div class="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
              <div
                v-for="(step, i) in [
                  { icon: 'lucide:tractor', label: 'Produtor' },
                  { icon: 'lucide:building-2', label: 'Cooperativa' },
                  { icon: 'lucide:truck', label: 'Logística' },
                  { icon: 'lucide:store', label: 'Mercado' },
                ]"
                :key="step.label"
                class="relative"
              >
                <div class="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-glm-100">
                  <div class="flex size-11 items-center justify-center rounded-xl bg-glm-100 text-glm-700">
                    <Icon :name="step.icon" size="22" />
                  </div>
                  <span class="text-sm font-semibold text-slate-700">{{ step.label }}</span>
                </div>
                <Icon
                  v-if="i < 3"
                  name="lucide:arrow-right"
                  class="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-glm-400 sm:block"
                  size="20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUTO / FEATURES -->
    <section id="produto" class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Uma plataforma, toda a cadeia
        </h2>
        <p class="mt-4 text-slate-600">
          Visual, colaborativa e construída para a realidade do campo brasileiro.
        </p>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="f in features" :key="f.title" class="card transition hover:-translate-y-1 hover:shadow-md">
          <div class="flex size-12 items-center justify-center rounded-xl bg-glm-100 text-glm-700">
            <Icon :name="f.icon" size="24" />
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ f.text }}</p>
        </div>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section id="como-funciona" class="border-y border-glm-100 bg-glm-50/40">
      <div class="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <span class="text-sm font-semibold uppercase tracking-wider text-glm-600">Como funciona</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Arraste, conecte, otimize
          </h2>
          <ol class="mt-8 space-y-6">
            <li v-for="(s, i) in [
              { t: 'Mapeie os atores', d: 'Adicione produtores, cooperativas, transportadoras e compradores como nós.' },
              { t: 'Crie as conexões', d: 'Ligue os nós para representar fluxos de produção e escoamento.' },
              { t: 'Otimize a cadeia', d: 'Veja capacidade, distância e custo para tomar a melhor decisão.' },
            ]" :key="i" class="flex gap-4">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-glm-600 text-sm font-bold text-white">
                {{ i + 1 }}
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">{{ s.t }}</h3>
                <p class="mt-1 text-sm text-slate-600">{{ s.d }}</p>
              </div>
            </li>
          </ol>
        </div>

        <div class="rounded-3xl border border-glm-100 bg-white p-8 shadow-sm">
          <div class="space-y-3">
            <div v-for="n in ['Fazenda Boa Vista', 'Coop. Vale Verde', 'TransAgro Logística', 'Mercado Central']" :key="n"
              class="flex items-center gap-3 rounded-xl bg-glm-50/70 px-4 py-3 ring-1 ring-glm-100">
              <span class="size-2.5 rounded-full bg-glm-500" />
              <span class="text-sm font-medium text-slate-700">{{ n }}</span>
              <Icon name="lucide:check" size="16" class="ml-auto text-glm-600" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PARA QUEM -->
    <section id="para-quem" class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Para quem é o GLM</h2>
      </div>
      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <div v-for="a in audiences" :key="a.title" class="card text-center">
          <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-glm-100 text-glm-700">
            <Icon :name="a.icon" size="28" />
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ a.title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ a.text }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div class="overflow-hidden rounded-3xl bg-gradient-to-br from-glm-700 to-glm-600 px-8 py-14 text-center shadow-xl">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">Pronto para conectar o seu agronegócio?</h2>
        <p class="mx-auto mt-4 max-w-xl text-glm-100">
          Crie sua conta gratuita e monte o primeiro grafo da sua cadeia produtiva em minutos.
        </p>
        <NuxtLink to="/register" class="btn mt-8 bg-white px-6 py-3 text-base font-semibold text-glm-700 hover:bg-glm-50">
          Criar conta gratuita
          <Icon name="lucide:arrow-right" size="18" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
