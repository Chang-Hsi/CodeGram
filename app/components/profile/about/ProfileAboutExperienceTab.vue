<script setup lang="ts">
defineProps<{
  section: 'work' | 'education'
  work: string
  education: string
  headline: string
  emptyText: string
}>()
</script>

<template>
  <div class="mt-6">
    <div v-if="section === 'work' && work" class="flex items-start gap-3">
      <Icon name="lucide:briefcase-business" class="mt-0.5 size-5 text-slate-500" />
      <div>
        <p class="font-semibold text-slate-900">{{ work }}</p>
        <p class="mt-1 text-sm text-slate-500">
          {{ headline || '工作經歷' }}
        </p>
      </div>
    </div>

    <div
      v-else-if="section === 'education' && education"
      class="flex items-start gap-3"
    >
      <Icon name="lucide:graduation-cap" class="mt-0.5 size-5 text-slate-500" />
      <div>
        <p class="font-semibold text-slate-900">{{ education }}</p>
        <p class="mt-1 text-sm text-slate-500">學歷</p>
      </div>
    </div>

    <p v-else class="text-sm text-slate-500">
      {{ emptyText }}
    </p>
  </div>
</template>
