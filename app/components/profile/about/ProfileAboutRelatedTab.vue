<script setup lang="ts">
defineProps<{
  skills: string[]
  emptyText: string
}>()
</script>

<template>
  <div class="mt-6">
    <div v-if="skills.length" class="flex flex-wrap gap-2">
      <span
        v-for="skill in skills"
        :key="skill"
        class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
      >
        {{ skill }}
      </span>
    </div>

    <p v-else class="text-sm text-slate-500">
      {{ emptyText }}
    </p>
  </div>
</template>
