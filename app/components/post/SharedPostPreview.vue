<script setup lang="ts">
import type { SharedPostReference } from '~/types/postShare'
import type { PostComposerImage } from '~/types/postComposer'

defineProps<{
  sharedPost: SharedPostReference
}>()

const imageUrl = (image: string | PostComposerImage) => (
  typeof image === 'string' ? image : image.url
)

const postPath = (postId: string) => `/posts/${encodeURIComponent(postId)}`
</script>

<template>
  <NuxtLink
    :to="postPath(sharedPost.postId)"
    class="mt-3 block min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
  >
    <div v-if="sharedPost.unavailable" class="p-5 text-center text-sm text-slate-500">
      <Icon name="lucide:file-warning" class="mx-auto mb-2 size-6" />
      原始貼文目前無法查看
    </div>
    <template v-else>
      <div class="flex items-center gap-2 p-3">
        <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-semibold text-white">
          <img
            v-if="sharedPost.author.avatarUrl"
            :src="sharedPost.author.avatarUrl"
            :alt="`${sharedPost.author.displayName} 的頭像`"
            class="size-full object-cover"
          >
          <span v-else>{{ sharedPost.author.displayName.slice(0, 1) }}</span>
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">
            {{ sharedPost.author.displayName }}
          </p>
          <p class="text-xs text-slate-500">
            {{ sharedPost.createdAt }}
          </p>
        </div>
      </div>
      <p class="break-words px-3 pb-3 text-sm leading-6 text-slate-700">
        {{ sharedPost.contentPreview }}
      </p>
      <div v-if="sharedPost.tags.length" class="flex flex-wrap gap-1.5 px-3 pb-3">
        <span v-for="tag in sharedPost.tags" :key="tag" class="text-xs font-medium text-blue-600">
          #{{ tag }}
        </span>
      </div>
      <img
        v-if="sharedPost.images[0]"
        :src="imageUrl(sharedPost.images[0])"
        alt="原始貼文圖片"
        class="max-h-56 w-full object-cover"
      >
    </template>
  </NuxtLink>
</template>
