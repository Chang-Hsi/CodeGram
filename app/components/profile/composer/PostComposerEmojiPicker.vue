<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  select: [emoji: string]
  close: []
}>()

const emojis = [
  '😀', '😄', '😂', '😊', '😍', '🤔', '😎', '🥳',
  '👍', '👏', '🙌', '💪', '🔥', '✨', '💡', '🚀',
  '✅', '🎉', '❤️', '👀', '🧑‍💻', '🐛', '⚡', '📚',
]

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="open"
    class="absolute bottom-12 left-0 z-30 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
    role="dialog"
    aria-label="選擇表情符號"
    @keydown="handleKeydown"
  >
    <div class="mb-2 flex items-center justify-between">
      <p class="text-xs font-semibold text-slate-600">
        常用表情
      </p>
      <button
        type="button"
        aria-label="關閉表情符號選擇器"
        class="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        @click="emit('close')"
      >
        <Icon name="lucide:x" class="size-4" />
      </button>
    </div>

    <div class="grid grid-cols-8 gap-1">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        type="button"
        :aria-label="`插入 ${emoji}`"
        class="flex size-8 items-center justify-center rounded-lg text-lg transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="emit('select', emoji)"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>
