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

const activeFilter = ref('all')

const filters = [
  { label: '所有朋友', value: 'all' },
  { label: '壽星', value: 'birthday' },
  { label: '現居城市', value: 'city' },
  { label: '家鄉', value: 'hometown' },
  { label: '追蹤名單', value: 'following' },
]

const friends = [
  {
    id: 1,
    name: 'Ken Chang',
    mutualCount: 28,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 2,
    name: '盧柏皓',
    mutualCount: 29,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 3,
    name: 'Weijun Hong',
    mutualCount: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 4,
    name: '張庭睿',
    mutualCount: 22,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 5,
    name: '蘇允志',
    mutualCount: 31,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 6,
    name: 'Zoe Wu',
    mutualCount: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 7,
    name: 'Wei Han',
    mutualCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 8,
    name: '林宏祐',
    mutualCount: 30,
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=240&q=80',
  },
]
</script>

<template>
  <section
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)] sm:p-5"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-950">
        朋友
      </h2>

      <div class="flex items-center gap-1 sm:gap-2">
        <button
          v-if="isOwnProfile"
          type="button"
          class="rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          交友邀請
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          尋找朋友
        </button>
        <button
          type="button"
          aria-label="更多朋友選項"
          class="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        >
          <Icon name="lucide:ellipsis" class="size-5" />
        </button>
      </div>
    </div>

    <VercelTabs
      :model-value="activeFilter"
      :tabs="filters"
      aria-label="朋友篩選"
      class="mt-4"
      @update:model-value="activeFilter = $event"
    />

    <div class="mt-4 grid gap-2 sm:grid-cols-2">
      <article
        v-for="friend in friends"
        :key="friend.id"
        class="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-slate-300 hover:shadow-sm"
      >
        <img
          :src="friend.avatarUrl"
          :alt="`${friend.name} 的頭像`"
          class="size-16 shrink-0 rounded-lg object-cover sm:size-20"
          loading="lazy"
        >

        <div class="min-w-0 flex-1">
          <h3 class="truncate font-bold text-slate-950">
            {{ friend.name }}
          </h3>
          <p class="mt-0.5 text-sm text-slate-500">
            {{ friend.mutualCount }} 位共同朋友
          </p>
        </div>

        <button
          type="button"
          :aria-label="`${friend.name} 的更多選項`"
          class="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        >
          <Icon name="lucide:ellipsis" class="size-4" />
        </button>
      </article>
    </div>

    <button
      type="button"
      class="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
    >
      查看全部
    </button>
  </section>
</template>
