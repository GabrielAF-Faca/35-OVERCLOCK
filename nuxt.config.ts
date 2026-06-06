import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['nuxt-auth-utils', '@nuxt/icon', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'GLM - Grãos, Lavoura & Mercado',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'GLM conecta o produtor rural a cooperativas, logística e mercado por meio de grafos visuais.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  runtimeConfig: {
    session: {
      // password vem de NUXT_SESSION_PASSWORD em runtime
      password: '',
      maxAge: 60 * 60 * 24 * 7,
    },
  },

  icon: {
    mode: 'svg',
    serverBundle: { collections: ['lucide'] },
  },

  future: { compatibilityVersion: 4 },
})
