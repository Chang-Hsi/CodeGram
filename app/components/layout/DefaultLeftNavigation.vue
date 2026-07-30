<script setup lang="ts">
const navigationItems = [
  {
    label: 'Chang-Hsi',
    icon: '',
    to: '/profile/1',
    avatar: true,
  },
  {
    label: '朋友',
    icon: 'lucide:users',
    to: '/friends',
    color: 'text-blue-500',
  },
  {
    label: '動態回顧',
    icon: 'lucide:history',
    to: '/',
    color: 'text-cyan-600',
  },
  {
    label: '我的珍藏',
    icon: 'lucide:bookmark',
    to: '/saved',
    color: 'text-violet-600',
  },
  {
    label: '社團',
    icon: 'lucide:users-round',
    to: '/groups',
    color: 'text-blue-600',
  },
  {
    label: 'Reels',
    icon: 'lucide:clapperboard',
    to: '/reels',
    color: 'text-rose-500',
  },
  {
    label: 'Marketplace',
    icon: 'lucide:store',
    to: '/marketplace',
    color: 'text-cyan-600',
  },
]

const shortcuts = [
  {
    label: 'Vue.js Taiwan',
    icon: 'logos:vue',
  },
  {
    label: 'Nuxt 開發者社群',
    icon: 'logos:nuxt-icon',
  },
  {
    label: 'TypeScript 技術交流',
    icon: 'logos:typescript-icon',
  },
  {
    label: 'Frontend Developers',
    icon: 'lucide:code-2',
  },
]
</script>

<template>
  <aside
    class="sticky top-[72px] hidden max-h-[calc(100dvh-88px)] overflow-y-auto pr-2 lg:block"
  >
    <nav aria-label="側邊導覽">
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.label"
        :to="item.to"
        class="flex min-h-12 items-center gap-3 rounded-lg px-2 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-200/80"
      >
        <span
          v-if="item.avatar"
          class="size-9 shrink-0 overflow-hidden rounded-full"
        >
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=85"
            alt=""
            class="size-full object-cover"
          >
        </span>

        <span
          v-else
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          :class="item.color"
        >
          <Icon
            :name="item.icon"
            class="size-5.5"
          />
        </span>

        <span class="truncate">
          {{ item.label }}
        </span>
      </NuxtLink>

    </nav>

    <div class="my-3 h-px bg-slate-300" />

    <section>
      <h2 class="px-2 text-[17px] font-semibold text-slate-500">
        你的捷徑
      </h2>

      <a
        v-for="shortcut in shortcuts"
        :key="shortcut.label"
        href="#"
        class="mt-1 flex min-h-12 items-center gap-3 rounded-lg px-2 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-200/80"
      >
        <span
          class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm"
        >
          <Icon
            :name="shortcut.icon"
            class="size-6"
          />
        </span>

        <span class="line-clamp-2">
          {{ shortcut.label }}
        </span>
      </a>
    </section>

    <footer class="px-2 pb-4 pt-5 text-xs leading-5 text-slate-500">
      隱私政策 · 使用條款 · 社群守則 · Cookie · CodeGram © 2026
    </footer>
  </aside>
</template>
