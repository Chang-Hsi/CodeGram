<script setup lang="ts">
import type { PostAuthor, ProfilePost } from '~/types/post'

defineProps<{
  post: ProfilePost
  currentUser?: PostAuthor
  previewLabel?: string
}>()

defineSlots<{
  preview: (props: { post: ProfilePost }) => unknown
}>()
</script>

<template>
  <ProfilePostCard
    :post="post"
    :current-user="currentUser"
  >
    <template #media="{ post: slottedPost }">
      <section
        class="relative isolate flex min-h-72 items-center overflow-hidden border-y border-slate-200 bg-slate-950 px-4 py-8 sm:min-h-80 sm:px-8"
        :aria-label="previewLabel || `${post.author.displayName} 的元件展示`"
      >
        <div
          aria-hidden="true"
          class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.2),transparent_45%),linear-gradient(145deg,#f8fafc,#eef2ff)]"
        />

        <div class="mx-auto w-full max-w-[620px]">
          <slot name="preview" :post="slottedPost" />
        </div>
      </section>
    </template>
  </ProfilePostCard>
</template>
