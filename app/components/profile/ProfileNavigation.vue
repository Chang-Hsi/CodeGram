<script setup lang="ts">
type ProfileTab = 'posts' | 'about' | 'projects' | 'replies'

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
      <div class="min-w-0 flex-1 overflow-x-auto">
        <div class="flex min-w-max items-center">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="relative flex h-14 items-center justify-center px-4 text-sm font-semibold transition sm:px-5"
            :class="
              modelValue === tab.value
                ? 'text-blue-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            "
            @click="emit('update:modelValue', tab.value)"
          >
            {{ tab.label }}

            <span
              v-if="modelValue === tab.value"
              class="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-blue-600"
            />
          </button>
        </div>
      </div>

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