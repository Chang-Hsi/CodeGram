<script setup lang="ts">
interface ProfilePost {
  id: number | string
  author: {
    displayName: string
    username: string
    avatarUrl?: string
  }
  content: string
  createdAt: string
  visibility?: 'public' | 'followers'
  tags?: string[]
  images?: string[]
  likeCount?: number
  commentCount?: number
  shareCount?: number
  liked?: boolean
}

const props = defineProps<{
  post: ProfilePost
}>()

const isLiked = ref(props.post.liked ?? false)
const localLikeCount = ref(props.post.likeCount ?? 0)

const avatarFallback = computed(() => {
  return (
    props.post.author.displayName
      .trim()
      .slice(0, 1)
      .toUpperCase() || 'C'
  )
})

const toggleLike = () => {
  isLiked.value = !isLiked.value
  localLikeCount.value += isLiked.value ? 1 : -1
}
</script>

<template>
  <article
    class="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <header class="flex items-start gap-3 px-4 pt-4">
      <NuxtLink
        :to="`/profile/${post.author.username}`"
        class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white"
      >
        <img
          v-if="post.author.avatarUrl"
          :src="post.author.avatarUrl"
          :alt="`${post.author.displayName} 的頭像`"
          class="size-full object-cover"
        >

        <span v-else>
          {{ avatarFallback }}
        </span>
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <NuxtLink
          :to="`/profile/${post.author.username}`"
          class="block truncate text-sm font-semibold text-slate-950 hover:underline"
        >
          {{ post.author.displayName }}
        </NuxtLink>

        <div class="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <span>{{ post.createdAt }}</span>
          <span>·</span>

          <Icon
            :name="
              post.visibility === 'followers'
                ? 'lucide:users'
                : 'lucide:earth'
            "
            class="size-3.5"
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="貼文選項"
        class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
      >
        <Icon
          name="lucide:ellipsis"
          class="size-5"
        />
      </button>
    </header>

    <div class="px-4 pb-3 pt-3">
      <p class="whitespace-pre-line text-[15px] leading-6 text-slate-800">
        {{ post.content }}
      </p>

      <div
        v-if="post.tags?.length"
        class="mt-3 flex flex-wrap gap-x-2 gap-y-1"
      >
        <button
          v-for="tag in post.tags"
          :key="tag"
          type="button"
          class="text-sm font-medium text-blue-600 hover:underline"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <div
      v-if="post.images?.length"
      class="grid gap-0.5 bg-slate-200"
      :class="
        post.images.length === 1
          ? 'grid-cols-1'
          : 'grid-cols-2'
      "
    >
      <img
        v-for="image in post.images.slice(0, 4)"
        :key="image"
        :src="image"
        alt="貼文附圖"
        class="h-64 w-full object-cover sm:h-72"
      >
    </div>

    <div class="px-4">
      <div
        class="flex min-h-11 items-center justify-between gap-4 text-sm text-slate-500"
      >
        <button
          v-if="localLikeCount"
          type="button"
          class="flex items-center gap-1.5 hover:underline"
        >
          <span
            class="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white"
          >
            <Icon
              name="lucide:thumbs-up"
              class="size-3"
            />
          </span>

          {{ localLikeCount }}
        </button>

        <span v-else />

        <div class="flex items-center gap-3">
          <button
            v-if="post.commentCount"
            type="button"
            class="hover:underline"
          >
            {{ post.commentCount }} 則留言
          </button>

          <button
            v-if="post.shareCount"
            type="button"
            class="hover:underline"
          >
            {{ post.shareCount }} 次分享
          </button>
        </div>
      </div>

      <div class="grid grid-cols-3 border-t border-slate-200 py-1">
        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition hover:bg-slate-100"
          :class="
            isLiked
              ? 'text-blue-600'
              : 'text-slate-600'
          "
          @click="toggleLike"
        >
          <Icon
            name="lucide:thumbs-up"
            class="size-5"
          />

          讚
        </button>

        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          <Icon
            name="lucide:message-circle"
            class="size-5"
          />

          留言
        </button>

        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          <Icon
            name="lucide:share-2"
            class="size-5"
          />

          分享
        </button>
      </div>
    </div>
  </article>
</template>