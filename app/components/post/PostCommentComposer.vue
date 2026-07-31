<script setup lang="ts">
import type { PostCommentComposerPayload } from '~/types/comment'
import type { PostAuthor } from '~/types/post'
import type {
  PendingPostComposerImage,
  PostComposerCodeLanguage,
  PostComposerContent,
  PostComposerImage,
  PostComposerJson,
} from '~/types/postComposer'
import {
  POST_COMPOSER_IMAGE_TYPES,
  isComposerContentEmpty,
  uploadPostImages,
  validateImageFiles,
} from '~/utils/postComposer'

const props = withDefaults(defineProps<{
  currentUser: PostAuthor
  initialContent?: PostComposerContent
  initialImages?: PostComposerImage[]
  replyingTo?: PostAuthor
  submitLabel?: string
  onSubmit: (payload: PostCommentComposerPayload) => Promise<void>
}>(), {
  initialContent: () => ({ json: null, html: '', text: '' }),
  initialImages: () => [],
  replyingTo: undefined,
  submitLabel: '送出',
})

const emit = defineEmits<{
  cancelContext: []
}>()

const editor = useTemplateRef<{
  insertEmoji: (emoji: string) => void
  toggleInlineCode: () => void
  insertCodeBlock: (language: PostComposerCodeLanguage, code: string) => void
  clear: () => void
  focus: () => void
}>('editor')
const imageInput = useTemplateRef<HTMLInputElement>('imageInput')
const content = ref<PostComposerContent>(props.initialContent)
const initialJson = ref<PostComposerJson | null>(props.initialContent.json)
const existingImages = ref<PostComposerImage[]>([...props.initialImages])
const pendingImages = ref<PendingPostComposerImage[]>([])
const submitting = ref(false)
const error = ref('')
const emojiOpen = ref(false)
const codeOpen = ref(false)

const canSubmit = computed(() => (
  !submitting.value
  && !isComposerContentEmpty(
    content.value.text,
    existingImages.value.length + pendingImages.value.length,
  )
))

watch(() => props.initialContent, (next) => {
  content.value = next
  initialJson.value = next.json
}, { deep: true })

watch(() => props.initialImages, (next) => {
  existingImages.value = next.map(image => ({ ...image }))
}, { deep: true })

function revokePendingPreviews() {
  pendingImages.value.forEach(image => URL.revokeObjectURL(image.previewUrl))
}

function addImages(files: File[]) {
  const result = validateImageFiles(files)
  pendingImages.value.push(...result.valid.map(file => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    loadFailed: false,
  })))
  error.value = result.errors.join(' ')
}

function selectImages(event: Event) {
  const input = event.target as HTMLInputElement
  addImages(Array.from(input.files ?? []))
  input.value = ''
}

function removePendingImage(id: string) {
  const image = pendingImages.value.find(item => item.id === id)
  if (image) URL.revokeObjectURL(image.previewUrl)
  pendingImages.value = pendingImages.value.filter(item => item.id !== id)
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = ''
  try {
    const uploadedImages = await uploadPostImages(pendingImages.value)
    await props.onSubmit({
      content: content.value,
      images: [...existingImages.value, ...uploadedImages],
    })
    editor.value?.clear()
    revokePendingPreviews()
    content.value = { json: null, html: '', text: '' }
    initialJson.value = null
    existingImages.value = []
    pendingImages.value = []
  }
  catch (caught: unknown) {
    error.value = caught instanceof Error ? caught.message : '留言送出失敗。'
  }
  finally {
    submitting.value = false
  }
}

function handleEscape() {
  if (emojiOpen.value) {
    emojiOpen.value = false
    return
  }
  if (
    content.value.text.trim()
    || existingImages.value.length
    || pendingImages.value.length
  ) {
    error.value = '尚有未送出的內容，請使用取消按鈕確認離開回覆。'
    return
  }
  emit('cancelContext')
}

function insertCode(language: PostComposerCodeLanguage, code: string) {
  editor.value?.insertCodeBlock(language, code)
  codeOpen.value = false
}

onBeforeUnmount(revokePendingPreviews)

defineExpose({
  focus: () => editor.value?.focus(),
})
</script>

<template>
  <div
    class="flex min-w-0 items-start gap-2"
    @keydown.esc="handleEscape"
  >
    <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-semibold text-white">
      <img
        v-if="currentUser.avatarUrl"
        :src="currentUser.avatarUrl"
        :alt="`${currentUser.displayName} 的頭像`"
        class="size-full object-cover"
      >
      <span v-else>{{ currentUser.displayName.slice(0, 1) }}</span>
    </div>

    <div class="min-w-0 flex-1">
      <div
        v-if="replyingTo"
        class="mb-1.5 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-700"
      >
        <span>正在回覆 {{ replyingTo.displayName }}</span>
        <button
          type="button"
          aria-label="取消回覆"
          class="rounded p-1 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="emit('cancelContext')"
        >
          <Icon name="lucide:x" class="size-3.5" />
        </button>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10">
        <ClientOnly>
          <ProfileComposerPostComposerEditor
            ref="editor"
            :initial-content="initialJson"
            placeholder="寫下留言…"
            @update="content = $event"
            @images-pasted="addImages"
            @submit-shortcut="submit"
          />
        </ClientOnly>

        <div
          v-if="existingImages.length || pendingImages.length"
          class="grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto border-t border-slate-200 p-2 sm:grid-cols-4"
        >
          <div
            v-for="image in existingImages"
            :key="image.id"
            class="group relative overflow-hidden rounded-lg bg-slate-200"
          >
            <img :src="image.url" :alt="image.alt" class="aspect-square size-full object-cover">
            <button
              type="button"
              :aria-label="`移除圖片 ${image.alt}`"
              class="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-slate-950/75 text-white"
              @click="existingImages = existingImages.filter(item => item.id !== image.id)"
            >
              <Icon name="lucide:x" class="size-3.5" />
            </button>
          </div>
          <div
            v-for="image in pendingImages"
            :key="image.id"
            class="group relative overflow-hidden rounded-lg bg-slate-200"
          >
            <img
              v-if="!image.loadFailed"
              :src="image.previewUrl"
              :alt="image.file.name"
              class="aspect-square size-full object-cover"
              @error="image.loadFailed = true"
            >
            <div v-else class="flex aspect-square items-center justify-center text-slate-500">
              <Icon name="lucide:image-off" class="size-5" />
            </div>
            <button
              type="button"
              :aria-label="`移除圖片 ${image.file.name}`"
              class="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-slate-950/75 text-white"
              @click="removePendingImage(image.id)"
            >
              <Icon name="lucide:x" class="size-3.5" />
            </button>
          </div>
        </div>

        <div class="relative flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-2 py-1.5">
          <div class="flex items-center">
            <input
              ref="imageInput"
              type="file"
              class="sr-only"
              multiple
              :accept="POST_COMPOSER_IMAGE_TYPES.join(',')"
              @change="selectImages"
            >
            <button
              type="button"
              aria-label="加入圖片"
              class="flex size-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              @click="imageInput?.click()"
            >
              <Icon name="lucide:image-plus" class="size-4" />
            </button>
            <button
              type="button"
              aria-label="切換行內程式碼"
              class="flex size-8 items-center justify-center rounded-lg text-pink-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              @click="editor?.toggleInlineCode()"
            >
              <Icon name="lucide:code" class="size-4" />
            </button>
            <button
              type="button"
              aria-label="加入程式碼區塊"
              class="flex size-8 items-center justify-center rounded-lg text-blue-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              @click="codeOpen = true"
            >
              <Icon name="lucide:square-code" class="size-4" />
            </button>
            <button
              type="button"
              aria-label="加入表情符號"
              :aria-expanded="emojiOpen"
              class="flex size-8 items-center justify-center rounded-lg text-amber-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              @click="emojiOpen = !emojiOpen"
            >
              <Icon name="lucide:smile" class="size-4" />
            </button>

            <ProfileComposerPostComposerEmojiPicker
              :open="emojiOpen"
              @select="(emoji) => { editor?.insertEmoji(emoji); emojiOpen = false }"
              @close="emojiOpen = false"
            />
          </div>

          <button
            type="button"
            :disabled="!canSubmit"
            class="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            @click="submit"
          >
            <Icon
              :name="submitting ? 'lucide:loader-circle' : 'lucide:send'"
              class="size-3.5"
              :class="submitting ? 'animate-spin' : ''"
            />
            {{ submitting ? '處理中' : submitLabel }}
          </button>
        </div>
      </div>

      <p v-if="error" class="mt-1.5 text-xs text-red-600" role="alert">
        {{ error }}
      </p>
    </div>

    <ProfileComposerPostComposerCodeDialog
      :open="codeOpen"
      @insert="insertCode"
      @close="codeOpen = false"
    />
  </div>
</template>
