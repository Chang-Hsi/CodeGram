import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    'shadcn-nuxt',
    '@nuxtjs/supabase',
  ],

  css: [
    '~/assets/css/tailwind.css',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  supabase: {
    redirect: false,
    useSsrCookies: true,
    types: false,
  },
})