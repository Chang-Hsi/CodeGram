<script setup lang="ts">
defineProps<{
  website: string
  githubUrl: string
  emptyText: string
}>()
</script>

<template>
  <div class="mt-6 space-y-4">
    <a
      v-if="website"
      :href="website"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-3 text-sm font-medium text-blue-600 hover:underline"
    >
      <Icon name="lucide:globe-2" class="size-5" />
      {{ website }}
    </a>

    <a
      v-if="githubUrl"
      :href="githubUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-3 text-sm font-medium text-blue-600 hover:underline"
    >
      <Icon name="lucide:github" class="size-5" />
      {{ githubUrl }}
    </a>

    <p v-if="!website && !githubUrl" class="text-sm text-slate-500">
      {{ emptyText }}
    </p>
  </div>
</template>
