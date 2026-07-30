<script setup lang="ts">
import VercelTabs from '~/components/common/tabs/VercelTabs.vue'

type ProfileTab =
  | 'posts'
  | 'about'
  | 'projects'
  | 'replies'

defineProps<{
  modelValue: ProfileTab
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ProfileTab]
}>()

const tabs: Array<{
  label: string
  value: ProfileTab
}> = [
  {
    label: '貼文',
    value: 'posts',
  },
  {
    label: '關於',
    value: 'about',
  },
  {
    label: '專案',
    value: 'projects',
  },
  {
    label: '回覆',
    value: 'replies',
  },
]
</script>

<template>
  <div class="border-t border-slate-200 px-2 sm:px-4">
    <div class="flex items-center">
      <VercelTabs
        :model-value="modelValue"
        :tabs="tabs"
        aria-label="個人資料分頁"
        class="min-w-0 flex-1"
        @update:model-value="
          emit('update:modelValue', $event)
        "
      />

      <button
        type="button"
        aria-label="顯示更多分頁"
        class="ml-2 flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
      >
        <Icon
          name="lucide:ellipsis"
          class="size-5"
        />
      </button>
    </div>
  </div>
</template>