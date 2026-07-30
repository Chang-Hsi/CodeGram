<script setup lang="ts">
defineProps<{
  section: 'contact' | 'name'
  displayName: string
  username: string
}>()
</script>

<template>
  <div class="mt-6">
    <div v-if="section === 'contact'" class="flex items-start gap-3">
      <Icon name="lucide:at-sign" class="mt-0.5 size-5 text-slate-500" />
      <div>
        <p class="font-semibold text-slate-900">CodeGram</p>
        <p class="mt-1 text-sm text-slate-500">@{{ username }}</p>
      </div>
    </div>

    <div v-else class="flex items-start gap-3">
      <Icon name="lucide:id-card" class="mt-0.5 size-5 text-slate-500" />
      <div>
        <p class="font-semibold text-slate-900">{{ displayName }}</p>
        <p class="mt-1 text-sm text-slate-500">
          使用者名稱：{{ username }}
        </p>
      </div>
    </div>
  </div>
</template>
