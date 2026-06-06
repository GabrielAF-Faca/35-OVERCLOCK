<script setup lang="ts">
import { ROLE_CONFIG, tipoToRole } from '#shared/domain'

const { user, clear } = useUserSession()

const role = computed(() => tipoToRole(user.value?.tipoUsuario))
const isAdmin = computed(() => user.value?.tipoUsuario === 'ADMIN')

const nav = computed(() => {
  const items = [{ to: '/app', label: 'Grafo', icon: 'lucide:share-2' }]
  if (role.value === 'produtor')
    items.push({
      to: '/app/sugestoes',
      label: 'Sugestões',
      icon: 'lucide:lightbulb',
    })
  if (role.value === 'transportador')
    items.push({ to: '/app/agenda', label: 'Agenda', icon: 'lucide:calendar' })
  items.push({
    to: '/app/meus-dados',
    label: isAdmin.value ? 'Dados gerais' : 'Meus dados',
    icon: 'lucide:clipboard-list',
  })
  return items
})

const papelLabel = computed(() =>
  isAdmin.value
    ? 'Administrador'
    : role.value
      ? ROLE_CONFIG[role.value].label
      : '—',
)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

const initials = computed(() =>
  (user.value?.name ?? 'GLM')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-glm-50/40">
    <aside
      class="hidden w-64 shrink-0 flex-col border-r border-glm-100 bg-white/80 backdrop-blur md:flex"
    >
      <div class="flex h-16 items-center border-b border-glm-100 px-5">
        <NuxtLink to="/app">
          <GlmLogo />
        </NuxtLink>
      </div>

      <nav class="flex-1 space-y-1 p-3">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-glm-50 hover:text-glm-800"
          active-class="!bg-glm-100 !text-glm-800"
        >
          <Icon
            :name="item.icon"
            size="18"
            class="text-glm-500 group-hover:text-glm-600"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="border-t border-glm-100 p-3">
        <div class="flex items-center gap-3 rounded-xl px-2 py-2">
          <div
            class="flex size-9 items-center justify-center rounded-full bg-glm-600 text-xs font-bold text-white"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800">
              {{ user?.name }}
            </p>
            <p class="truncate text-xs text-slate-400">{{ papelLabel }}</p>
          </div>
          <button
            class="rounded-lg p-1.5 text-slate-400 transition hover:bg-glm-50 hover:text-glm-700"
            title="Sair"
            @click="logout"
          >
            <Icon name="lucide:log-out" size="18" />
          </button>
        </div>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <slot />
    </div>
  </div>
</template>
