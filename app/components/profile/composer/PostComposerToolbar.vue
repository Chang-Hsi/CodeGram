<script setup lang="ts">
defineProps<{
  disabled: boolean
  emojiOpen: boolean
  tagOpen: boolean
}>()

const emit = defineEmits<{
  images: [files: File[]]
  inlineCode: []
  codeBlock: []
  toggleEmoji: []
  toggleTags: []
  undo: []
  redo: []
}>()

const imageInput = useTemplateRef<HTMLInputElement>('imageInput')

function chooseImages() {
  imageInput.value?.click()
}

function handleImages(event: Event) {
  const input = event.target as HTMLInputElement
  emit('images', Array.from(input.files ?? []))
  input.value = ''
}

const tools = [
  { key: 'image', label: '加入圖片', icon: 'lucide:image', color: 'text-emerald-600' },
  { key: 'inline-code', label: '切換行內程式碼', icon: 'lucide:code', color: 'text-pink-600' },
  { key: 'code-block', label: '加入程式碼區塊', icon: 'lucide:square-code', color: 'text-blue-600' },
  { key: 'emoji', label: '加入表情符號', icon: 'lucide:smile', color: 'text-amber-500' },
  { key: 'tag', label: '管理標籤', icon: 'lucide:tag', color: 'text-violet-600' },
] as const

function runTool(key: typeof tools[number]['key']) {
  if (key === 'image') chooseImages()
  if (key === 'inline-code') emit('inlineCode')
  if (key === 'code-block') emit('codeBlock')
  if (key === 'emoji') emit('toggleEmoji')
  if (key === 'tag') emit('toggleTags')
}
</script>

<template>
  <div class="flex min-w-0 flex-wrap items-center gap-0.5">
    <input
      ref="imageInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      class="sr-only"
      tabindex="-1"
      @change="handleImages"
    >

    <button
      v-for="tool in tools"
      :key="tool.key"
      type="button"
      :disabled="disabled"
      :aria-label="tool.label"
      :aria-expanded="tool.key === 'emoji' ? emojiOpen : tool.key === 'tag' ? tagOpen : undefined"
      class="flex size-9 items-center justify-center rounded-lg transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      :class="[
        tool.color,
        (tool.key === 'emoji' && emojiOpen) || (tool.key === 'tag' && tagOpen)
          ? 'bg-slate-100'
          : '',
      ]"
      @click="runTool(tool.key)"
    >
      <Icon :name="tool.icon" class="size-[18px]" />
    </button>

    <span class="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

    <button
      type="button"
      :disabled="disabled"
      aria-label="復原"
      class="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40"
      @click="emit('undo')"
    >
      <Icon name="lucide:undo-2" class="size-[18px]" />
    </button>
    <button
      type="button"
      :disabled="disabled"
      aria-label="重做"
      class="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40"
      @click="emit('redo')"
    >
      <Icon name="lucide:redo-2" class="size-[18px]" />
    </button>
  </div>
</template>
