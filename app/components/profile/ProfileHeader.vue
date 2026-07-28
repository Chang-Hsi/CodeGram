<script setup lang="ts">
import Iconbutton from '~/components/common/button/Iconbutton.vue'

const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    displayName: string
    username: string
    headline?: string
    postCount?: number
    followingCount?: number
    followerCount?: number
    isOwnProfile?: boolean
  }>(),
  {
    avatarUrl: '',
    headline: '',
    postCount: 0,
    followingCount: 0,
    followerCount: 0,
    isOwnProfile: false,
  },
)

const emit = defineEmits<{
  follow: []
  message: []
}>()

const avatarFallback = computed(() => {
  return props.displayName.trim().slice(0, 1).toUpperCase() || 'C'
})

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('zh-TW', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}
</script>

<template>
  <div class="relative px-4 pb-5 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-end">
      <div class="relative mx-auto -mt-16 shrink-0 md:mx-0">
        <div
          class="flex size-32 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-gradient-to-br from-blue-500 to-violet-600 text-4xl font-bold text-white shadow-sm sm:size-40"
        >
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="`${displayName} 的頭像`"
            class="size-full object-cover"
          >

          <span v-else>
            {{ avatarFallback }}
          </span>
        </div>

        <span
          class="absolute bottom-2 right-2 size-5 rounded-full border-[3px] border-white bg-emerald-500 sm:bottom-3 sm:right-3"
          aria-label="目前上線"
        />
      </div>

      <div
        class="min-w-0 flex-1 pt-4 text-center md:pb-1 md:pl-5 md:text-left"
      >
        <h1 class="truncate text-2xl font-bold text-slate-950 sm:text-3xl">
          {{ displayName }}
        </h1>

        <p
          v-if="headline"
          class="mt-2 text-sm text-slate-600"
        >
          {{ headline }}
        </p>

        <div
          class="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm md:justify-start"
        >
          <span class="text-slate-500">
            <strong class="font-semibold text-slate-900">
              {{ formatNumber(postCount) }}
            </strong>
            篇貼文
          </span>

          <button
            type="button"
            class="text-slate-500 transition hover:text-blue-600"
          >
            <strong class="font-semibold text-slate-900">
              {{ formatNumber(followingCount) }}
            </strong>
            人追蹤中
          </button>

          <button
            type="button"
            class="text-slate-500 transition hover:text-blue-600"
          >
            <strong class="font-semibold text-slate-900">
              {{ formatNumber(followerCount) }}
            </strong>
            位追蹤者
          </button>
        </div>
      </div>

      <div
        class="mt-5 flex items-center justify-center gap-2 md:mb-1 md:ml-4"
      >
        <!-- 改用 Iconbutton -->
        <Iconbutton
          v-if="isOwnProfile"
          to="/settings/profile"
          icon="lucide:pencil"
          size="compact"
          class="flex-1 md:flex-none"
        >
          編輯個人資料
        </Iconbutton>

        <template v-else>
          <button
            type="button"
            class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 md:flex-none"
            @click="emit('follow')"
          >
            <Icon
              name="lucide:user-plus"
              class="size-4"
            />

            追蹤
          </button>

          <button
            type="button"
            class="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 md:flex-none"
            @click="emit('message')"
          >
            <Icon
              name="lucide:message-circle"
              class="size-4"
            />

            傳送訊息
          </button>
        </template>

        <button
          type="button"
          aria-label="更多操作"
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        >
          <Icon
            name="lucide:ellipsis"
            class="size-5"
          />
        </button>
      </div>
    </div>
  </div>
</template>