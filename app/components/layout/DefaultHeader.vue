<script setup lang="ts">
import VercelTabs from '~/components/common/tabs/VercelTabs.vue'

const centerNavigation = [
  {
    label: '首頁',
    value: '/',
    icon: 'lucide:house',
  },
  {
    label: '影音',
    value: '/reels',
    icon: 'lucide:clapperboard',
  },
  {
    label: '社團',
    value: '/groups',
    icon: 'lucide:users-round',
  },
  {
    label: 'Marketplace',
    value: '/marketplace',
    icon: 'lucide:store',
  },
  {
    label: '朋友',
    value: '/friends',
    icon: 'lucide:users',
  },
] as const

type CenterNavigationValue =
  typeof centerNavigation[number]['value']

const route = useRoute()
const router = useRouter()

const activeNavigation = computed<
  CenterNavigationValue
>({
  get() {
    const matchedNavigation
      = centerNavigation.find((item) => {
        if (item.value === '/') {
          return route.path === '/'
        }

        return route.path === item.value
          || route.path.startsWith(
            `${item.value}/`,
          )
      })

    return matchedNavigation?.value ?? '/'
  },
  set(value) {
    if (route.path !== value) {
      void router.push(value)
    }
  },
})

const actionButtons = [
  {
    label: '功能選單',
    icon: 'lucide:grid-3x3',
  },
  {
    label: '訊息',
    icon: 'lucide:message-circle',
  },
  {
    label: '通知',
    icon: 'lucide:bell',
  },
]
</script>

<template>
  <header
    class="sticky top-0 z-50 h-14 border-b border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
  >
    <div
      class="grid h-full grid-cols-[1fr_auto] items-center gap-3 px-3 lg:grid-cols-[minmax(260px,1fr)_minmax(420px,680px)_minmax(260px,1fr)] lg:px-4"
    >
      <div class="flex min-w-0 items-center gap-2">
        <NuxtLink
          to="/"
          aria-label="CodeGram 首頁"
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-black text-white shadow-sm"
        >
          C
        </NuxtLink>

        <label
          class="hidden h-10 w-full max-w-60 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-slate-500 sm:flex"
        >
          <Icon
            name="lucide:search"
            class="size-4.5 shrink-0"
          />

          <input
            type="search"
            aria-label="搜尋 CodeGram"
            placeholder="搜尋 CodeGram"
            class="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
          >
        </label>
      </div>

      <VercelTabs
        v-model="activeNavigation"
        :tabs="centerNavigation"
        aria-label="主要導覽"
        appearance="navigation"
        icon-only
        :icon-size="25"
        class="hidden h-full w-full lg:block"
      />

      <div class="flex items-center justify-end gap-2">
        <button
          v-for="button in actionButtons"
          :key="button.label"
          type="button"
          :aria-label="button.label"
          class="hidden size-10 items-center justify-center rounded-full bg-[#e4e6eb] text-slate-800 transition hover:bg-slate-300 sm:flex"
        >
          <Icon
            :name="button.icon"
            class="size-5"
          />
        </button>

        <NuxtLink
          to="/profile/1"
          aria-label="前往個人檔案"
          class="size-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 ring-offset-2 transition hover:ring-2 hover:ring-blue-500"
        >
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=85"
            alt="使用者頭像"
            class="size-full object-cover"
          >
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
