<script setup lang="ts">
interface FriendCardData {
  id: number | string
  name: string
  avatarUrl: string
  mutualFriendCount?: number
  followerCount?: string
}

const props = withDefaults(
  defineProps<{
    friend: FriendCardData
    variant?: 'request' | 'suggestion'
  }>(),
  {
    variant: 'suggestion',
  },
)

const subtitle = computed(() => {
  if (props.friend.mutualFriendCount) {
    return `${props.friend.mutualFriendCount} 位共同朋友`
  }

  if (props.friend.followerCount) {
    return `${props.friend.followerCount} 人追蹤`
  }

  return 'CodeGram 使用者'
})
</script>

<template>
  <article
    class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.16)]"
  >
    <NuxtLink
      :to="`/profile/${friend.id}`"
      class="block aspect-square overflow-hidden bg-slate-200"
      :aria-label="`查看 ${friend.name} 的個人檔案`"
    >
      <img
        :src="friend.avatarUrl"
        :alt="friend.name"
        class="size-full object-cover transition duration-300 hover:scale-[1.03]"
      >
    </NuxtLink>

    <div class="flex flex-1 flex-col p-3">
      <NuxtLink
        :to="`/profile/${friend.id}`"
        class="truncate text-[16px] font-bold text-slate-950 hover:underline"
      >
        {{ friend.name }}
      </NuxtLink>

      <div
        class="mt-1 flex min-h-5 items-center gap-1.5 text-[13px] text-slate-500"
      >
        <span
          v-if="friend.mutualFriendCount"
          class="flex -space-x-1.5"
          aria-hidden="true"
        >
          <span
            class="size-5 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-violet-500"
          />
          <span
            class="size-5 rounded-full border-2 border-white bg-gradient-to-br from-amber-300 to-rose-400"
          />
        </span>

        <span class="truncate">
          {{ subtitle }}
        </span>
      </div>

      <div class="mt-auto space-y-2 pt-3">
        <button
          type="button"
          class="h-9 w-full rounded-lg text-sm font-semibold transition"
          :class="
            variant === 'request'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          "
        >
          {{
            variant === 'request'
              ? '確認'
              : '加朋友'
          }}
        </button>

        <button
          type="button"
          class="h-9 w-full rounded-lg bg-slate-200 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
        >
          {{
            variant === 'request'
              ? '刪除'
              : '移除'
          }}
        </button>
      </div>
    </div>
  </article>
</template>
