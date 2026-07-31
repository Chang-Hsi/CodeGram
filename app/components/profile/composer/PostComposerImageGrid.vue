<script setup lang="ts">
import type { PendingPostComposerImage } from '~/types/postComposer'

defineProps<{
  images: PendingPostComposerImage[]
}>()

const emit = defineEmits<{
  remove: [id: string]
  loadFailed: [id: string]
}>()
</script>

<template>
  <div
    v-if="images.length"
    class="grid max-h-[28rem] gap-2 overflow-y-auto px-4 pb-3"
    :class="images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
  >
    <div
      v-for="(image, index) in images"
      :key="image.id"
      class="group relative min-h-32 overflow-hidden rounded-xl bg-slate-100"
      :class="images.length === 3 && index === 0 ? 'col-span-2' : ''"
    >
      <img
        v-if="!image.loadFailed"
        :src="image.previewUrl"
        :alt="image.file.name"
        class="h-44 w-full object-cover sm:h-52"
        @error="emit('loadFailed', image.id)"
      >

      <div
        v-else
        class="flex h-44 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-slate-500 sm:h-52"
      >
        <Icon
          name="lucide:image-off"
          class="size-7"
        />
        圖片預覽載入失敗
      </div>

      <button
        type="button"
        :aria-label="`移除圖片 ${image.file.name}`"
        class="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-slate-950/75 text-white shadow-sm transition hover:bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        @click="emit('remove', image.id)"
      >
        <Icon
          name="lucide:x"
          class="size-4"
        />
      </button>
    </div>
  </div>
</template>
