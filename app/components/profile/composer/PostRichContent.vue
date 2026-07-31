<script setup lang="ts">
import type { PostComposerContent } from '~/types/postComposer'

defineProps<{
  content: PostComposerContent
}>()
</script>

<template>
  <div class="space-y-2 text-[15px] leading-6 text-slate-800">
    <ProfileComposerPostRichContentNode
      v-if="content.json"
      :node="content.json"
    />
    <p v-else class="whitespace-pre-wrap">
      {{ content.text }}
    </p>
  </div>
</template>
