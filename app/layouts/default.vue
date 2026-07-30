<script setup lang="ts">
import DefaultHeader from '~/components/layout/DefaultHeader.vue'
import DefaultLeftNavigation from '~/components/layout/DefaultLeftNavigation.vue'
import DefaultRightSidebar from '~/components/layout/DefaultRightSidebar.vue'
</script>

<template>
  <div class="min-h-dvh bg-[#f0f2f5] text-slate-950">
    <DefaultHeader />

    <div
      class="mx-auto grid w-full grid-cols-1 items-start gap-5 px-3 pb-20 pt-4 sm:px-4 lg:grid-cols-[260px_minmax(0,680px)] lg:justify-center lg:pb-8 xl:grid-cols-[280px_minmax(0,680px)_320px] xl:justify-between"
    >
      <DefaultLeftNavigation />

      <main class="min-w-0">
        <slot />
      </main>

      <DefaultRightSidebar />
    </div>

    <nav
      aria-label="手機版主要導覽"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div class="grid h-16 grid-cols-5">
        <NuxtLink
          v-for="item in [
            { label: '首頁', icon: 'lucide:house', to: '/' },
            { label: '社團', icon: 'lucide:users-round', to: '/groups' },
            { label: '建立', icon: 'lucide:circle-plus', to: '/' },
            { label: '通知', icon: 'lucide:bell', to: '/notifications' },
            { label: '我的', icon: 'lucide:user-round', to: '/profile/1' },
          ]"
          :key="item.label"
          :to="item.to"
          :aria-label="item.label"
          class="flex items-center justify-center text-slate-500 transition hover:text-blue-600"
          active-class="text-blue-600"
        >
          <Icon
            :name="item.icon"
            class="size-6"
          />
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
