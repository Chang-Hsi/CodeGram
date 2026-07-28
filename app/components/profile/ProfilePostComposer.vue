<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    displayName: string
  }>(),
  {
    avatarUrl: '',
  },
)

const emit = defineEmits<{
  submit: [content: string]
}>()

const content = ref('')
const isExpanded = ref(false)

const avatarFallback = computed(() => {
  return props.displayName.trim().slice(0, 1).toUpperCase() || 'C'
})

const handleSubmit = () => {
  const normalizedContent = content.value.trim()

  if (!normalizedContent) {
    return
  }

  emit('submit', normalizedContent)

  content.value = ''
  isExpanded.value = false
}
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="`${displayName} 的頭像`"
          class="size-full object-cover"
        >

        <span v-else>
          {{ avatarFallback }}
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <textarea
          v-model="content"
          :rows="isExpanded ? 4 : 1"
          :placeholder="`${displayName}，分享一些技術想法吧！`"
          class="block min-h-10 w-full resize-none rounded-2xl bg-slate-100 px-4 py-2.5 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-500 hover:bg-slate-200 focus:bg-slate-100 focus:ring-2 focus:ring-blue-500/20"
          @focus="isExpanded = true"
        />
      </div>
    </div>

    <template v-if="isExpanded">
      <div class="my-3 h-px bg-slate-200" />

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1">
          <button
            type="button"
            aria-label="加入圖片"
            class="flex size-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
          >
            <Icon
              name="lucide:image"
              class="size-5"
            />
          </button>

          <button
            type="button"
            aria-label="加入程式碼"
            class="flex size-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50"
          >
            <Icon
              name="lucide:code-xml"
              class="size-5"
            />
          </button>

          <button
            type="button"
            aria-label="加入標籤"
            class="flex size-9 items-center justify-center rounded-lg text-violet-600 transition hover:bg-violet-50"
          >
            <Icon
              name="lucide:tag"
              class="size-5"
            />
          </button>

          <button
            type="button"
            aria-label="加入表情符號"
            class="flex size-9 items-center justify-center rounded-lg text-amber-500 transition hover:bg-amber-50"
          >
            <Icon
              name="lucide:smile"
              class="size-5"
            />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="h-9 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            @click="isExpanded = false"
          >
            取消
          </button>

          <button
            type="button"
            :disabled="!content.trim()"
            class="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            @click="handleSubmit"
          >
            <Icon
              name="lucide:send"
              class="size-4"
            />

            發布
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="my-3 h-px bg-slate-200" />

      <div class="grid grid-cols-3 gap-1">
        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          @click="isExpanded = true"
        >
          <Icon
            name="lucide:image"
            class="size-5 text-emerald-600"
          />

          <span class="hidden sm:inline">圖片</span>
        </button>

        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          @click="isExpanded = true"
        >
          <Icon
            name="lucide:code-xml"
            class="size-5 text-blue-600"
          />

          <span class="hidden sm:inline">程式碼</span>
        </button>

        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          @click="isExpanded = true"
        >
          <Icon
            name="lucide:file-text"
            class="size-5 text-violet-600"
          />

          <span class="hidden sm:inline">技術文章</span>
        </button>
      </div>
    </template>
  </section>
</template>