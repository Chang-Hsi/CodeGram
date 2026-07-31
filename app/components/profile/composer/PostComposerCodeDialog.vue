<script setup lang="ts">
import {
  POST_COMPOSER_CODE_LANGUAGES,
  type PostComposerCodeLanguage,
} from '~/types/postComposer'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  insert: [language: PostComposerCodeLanguage, code: string]
  close: []
}>()

const language = ref<PostComposerCodeLanguage>('typescript')
const code = ref('')

const languageLabels: Record<PostComposerCodeLanguage, string> = {
  vue: 'Vue',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  shell: 'Shell',
}

function insert() {
  emit('insert', language.value, code.value)
  code.value = ''
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      @mousedown.self="emit('close')"
      @keydown.esc.prevent="emit('close')"
    >
      <section
        class="w-full max-w-2xl rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="code-dialog-title"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 id="code-dialog-title" class="font-semibold text-slate-950">
              插入程式碼區塊
            </h2>
            <p class="mt-0.5 text-sm text-slate-500">
              選擇語言後貼上或輸入程式碼。
            </p>
          </div>
          <button
            type="button"
            aria-label="關閉程式碼視窗"
            class="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            @click="emit('close')"
          >
            <Icon name="lucide:x" class="size-5" />
          </button>
        </div>

        <label class="mt-4 block text-sm font-medium text-slate-700">
          語言
          <select
            v-model="language"
            class="mt-1.5 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          >
            <option
              v-for="item in POST_COMPOSER_CODE_LANGUAGES"
              :key="item"
              :value="item"
            >
              {{ languageLabels[item] }}
            </option>
          </select>
        </label>

        <label class="mt-3 block text-sm font-medium text-slate-700">
          程式碼
          <textarea
            v-model="code"
            rows="10"
            spellcheck="false"
            placeholder="const message = 'Hello, CodeGram'"
            class="mt-1.5 block max-h-[50vh] w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25"
          />
        </label>

        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            @click="emit('close')"
          >
            返回
          </button>
          <button
            type="button"
            class="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
            @click="insert"
          >
            插入
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
