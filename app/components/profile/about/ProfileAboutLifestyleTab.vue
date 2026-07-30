<script setup lang="ts">
defineProps<{
  emptyText: string
}>()
</script>

<template>
  <div class="mt-6">
    <div
      class="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center"
    >
      <Icon name="lucide:notebook-tabs" class="size-8 text-slate-300" />
      <p class="mt-3 text-sm text-slate-500">{{ emptyText }}</p>
    </div>
  </div>
</template>
