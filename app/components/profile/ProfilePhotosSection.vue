<script setup lang="ts">
import VercelTabs from '~/components/common/tabs/VercelTabs.vue'

withDefaults(
  defineProps<{
    isOwnProfile?: boolean
  }>(),
  {
    isOwnProfile: false,
  },
)

const activeFilter = ref('tagged')

const filters = [
  { label: '有你在內的相片', value: 'tagged' },
  { label: '你的相片', value: 'photos' },
  { label: '相簿', value: 'albums' },
]

const photos = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=640&q=82&sat=-20',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=640&q=82',
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=640&q=82',
]
</script>

<template>
  <section
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)] sm:p-5"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-950">
        相片
      </h2>

      <div class="flex items-center gap-2">
        <button
          v-if="isOwnProfile"
          type="button"
          class="rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          新增相片／影片
        </button>
        <button
          type="button"
          aria-label="更多相片選項"
          class="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        >
          <Icon name="lucide:ellipsis" class="size-5" />
        </button>
      </div>
    </div>

    <VercelTabs
      :model-value="activeFilter"
      :tabs="filters"
      aria-label="相片篩選"
      class="mt-4"
      @update:model-value="activeFilter = $event"
    />

    <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      <button
        v-for="(photo, index) in photos"
        :key="`${photo}-${index}`"
        type="button"
        class="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
        :class="index < 6 ? '' : 'lg:hidden'"
        :aria-label="`查看第 ${index + 1} 張相片`"
      >
        <img
          :src="photo"
          alt=""
          class="size-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        >

        <span
          v-if="isOwnProfile"
          class="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-slate-950/65 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Icon name="lucide:pencil" class="size-3.5" />
        </span>
      </button>
    </div>

    <button
      type="button"
      class="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
    >
      查看全部
    </button>
  </section>
</template>
