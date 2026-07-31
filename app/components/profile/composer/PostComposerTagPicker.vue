<script setup lang="ts">
import { POST_COMPOSER_LIMITS } from '~/utils/postComposer'

defineProps<{
  open: boolean
  tags: string[]
}>()

const emit = defineEmits<{
  add: [tag: string]
  remove: [tag: string]
  close: []
}>()

const tagInput = ref('')
const inputElement = useTemplateRef<HTMLInputElement>('tagInputElement')

watch(
  () => tagInput.value,
  value => tagInput.value = value.replace(/\s{2,}/g, ' '),
)

function addTag() {
  if (!tagInput.value.trim()) {
    return
  }
  emit('add', tagInput.value)
  tagInput.value = ''
  nextTick(() => inputElement.value?.focus())
}
</script>

<template>
  <div
    v-if="open"
    class="absolute bottom-12 left-0 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
    role="dialog"
    aria-label="管理貼文標籤"
    @keydown.esc.prevent="emit('close')"
  >
    <div class="flex items-center gap-2">
      <label class="sr-only" for="post-tag-input">新增標籤</label>
      <input
        id="post-tag-input"
        ref="tagInputElement"
        v-model="tagInput"
        type="text"
        :maxlength="POST_COMPOSER_LIMITS.maxTagLength + 4"
        placeholder="例如 Nuxt、TypeScript"
        class="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        @keydown.enter.prevent="addTag"
      >
      <button
        type="button"
        :disabled="!tagInput.trim() || tags.length >= POST_COMPOSER_LIMITS.maxTags"
        class="h-9 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        @click="addTag"
      >
        加入
      </button>
    </div>

    <p class="mt-2 text-xs text-slate-500">
      最多 {{ POST_COMPOSER_LIMITS.maxTags }} 個標籤，空格會轉為連字號。
    </p>

    <div
      v-if="tags.length"
      class="mt-3 flex flex-wrap gap-2"
    >
      <span
        v-for="tag in tags"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-blue-700"
      >
        #{{ tag }}
        <button
          type="button"
          :aria-label="`移除標籤 ${tag}`"
          class="flex size-5 items-center justify-center rounded-full hover:bg-blue-100"
          @click="emit('remove', tag)"
        >
          <Icon name="lucide:x" class="size-3" />
        </button>
      </span>
    </div>
  </div>
</template>
