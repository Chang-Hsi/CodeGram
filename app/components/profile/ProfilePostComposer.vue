<script setup lang="ts">
import type {
  PostComposerCodeLanguage,
  PostComposerPayload,
  PostComposerSubmitHandler,
} from '~/types/postComposer'

const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    displayName: string
    draftScope?: string
    submitPost?: PostComposerSubmitHandler
  }>(),
  {
    avatarUrl: '',
    draftScope: 'feed',
    submitPost: undefined,
  },
)

const emit = defineEmits<{
  submitted: [payload: PostComposerPayload]
}>()

const editor = useTemplateRef<{
  insertEmoji: (emoji: string) => void
  toggleInlineCode: () => void
  insertCodeBlock: (language: PostComposerCodeLanguage, code: string) => void
  undo: () => void
  redo: () => void
  clear: () => void
  focus: () => void
}>('editor')

const draftKey = computed(
  () => `codegram:post-draft:${props.draftScope}:${props.displayName}`,
)

const {
  initialContent,
  images,
  tags,
  isExpanded,
  isSubmitting,
  errorMessage,
  draftNotice,
  canSubmit,
  updateContent,
  addImages,
  removeImage,
  markImageFailed,
  addTag,
  removeTag,
  clear,
  submit,
} = usePostComposer(() => draftKey.value, props.submitPost)

const emojiOpen = ref(false)
const tagOpen = ref(false)
const codeDialogOpen = ref(false)
const showDiscardConfirm = ref(false)

const avatarFallback = computed(() => (
  props.displayName.trim().slice(0, 1).toUpperCase() || 'C'
))

function closePopovers() {
  emojiOpen.value = false
  tagOpen.value = false
}

function toggleEmoji() {
  tagOpen.value = false
  emojiOpen.value = !emojiOpen.value
}

function toggleTags() {
  emojiOpen.value = false
  tagOpen.value = !tagOpen.value
}

function insertEmoji(emoji: string) {
  editor.value?.insertEmoji(emoji)
  emojiOpen.value = false
}

function insertCodeBlock(language: PostComposerCodeLanguage, code: string) {
  editor.value?.insertCodeBlock(language, code)
  codeDialogOpen.value = false
}

function handleCollapse() {
  closePopovers()
  isExpanded.value = false
}

function handleDiscard() {
  clear()
  editor.value?.clear()
  showDiscardConfirm.value = false
  isExpanded.value = false
}

async function handleSubmit() {
  closePopovers()
  const payload = await submit()
  if (payload) {
    editor.value?.clear()
    emit('submitted', payload)
  }
}

function handleGlobalEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  if (emojiOpen.value || tagOpen.value) {
    closePopovers()
  }
}

onMounted(() => document.addEventListener('keydown', handleGlobalEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', handleGlobalEscape))
</script>

<template>
  <section
    class="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-slate-950/[0.02]"
    aria-label="建立貼文"
  >
    <div class="flex items-start gap-3 p-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="`${displayName} 的頭像`"
          class="size-full object-cover"
        >
        <span v-else>{{ avatarFallback }}</span>
      </div>

      <button
        v-if="!isExpanded"
        type="button"
        class="min-h-10 min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-left text-sm text-slate-500 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        @click="isExpanded = true"
      >
        {{ displayName }}，分享一些技術想法吧！
      </button>

      <div
        v-else
        class="min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10"
      >
        <ClientOnly>
          <ProfileComposerPostComposerEditor
            ref="editor"
            :initial-content="initialContent"
            :placeholder="`${displayName}，分享一些技術想法吧！`"
            @update="updateContent"
            @images-pasted="addImages"
            @focus="closePopovers"
            @submit-shortcut="handleSubmit"
          />
          <template #fallback>
            <div class="min-h-24 px-4 py-3 text-sm text-slate-400">
              正在載入編輯器…
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <ProfileComposerPostComposerImageGrid
      :images="images"
      @remove="removeImage"
      @load-failed="markImageFailed"
    />

    <div
      v-if="tags.length"
      class="flex flex-wrap gap-2 px-4 pb-3 sm:pl-[4.25rem]"
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
          class="flex size-5 items-center justify-center rounded-full hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="removeTag(tag)"
        >
          <Icon name="lucide:x" class="size-3" />
        </button>
      </span>
    </div>

    <div
      v-if="draftNotice || errorMessage"
      class="mx-4 mb-3 rounded-lg px-3 py-2 text-sm sm:ml-[4.25rem]"
      :class="errorMessage ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'"
      :role="errorMessage ? 'alert' : 'status'"
    >
      {{ errorMessage || draftNotice }}
    </div>

    <div
      v-if="isExpanded"
      class="border-t border-slate-200 px-3 py-2.5 sm:px-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="relative min-w-0">
          <ProfileComposerPostComposerToolbar
            :disabled="isSubmitting"
            :emoji-open="emojiOpen"
            :tag-open="tagOpen"
            @images="addImages"
            @inline-code="editor?.toggleInlineCode()"
            @code-block="codeDialogOpen = true"
            @toggle-emoji="toggleEmoji"
            @toggle-tags="toggleTags"
            @undo="editor?.undo()"
            @redo="editor?.redo()"
          />

          <ProfileComposerPostComposerEmojiPicker
            :open="emojiOpen"
            @select="insertEmoji"
            @close="emojiOpen = false"
          />

          <ProfileComposerPostComposerTagPicker
            :open="tagOpen"
            :tags="tags"
            @add="addTag"
            @remove="removeTag"
            @close="tagOpen = false"
          />
        </div>

        <div class="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            :disabled="isSubmitting"
            class="h-9 rounded-lg px-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            @click="showDiscardConfirm = true"
          >
            清除
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="h-9 rounded-lg px-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            @click="handleCollapse"
          >
            收合
          </button>
          <button
            type="button"
            :disabled="!canSubmit"
            class="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
            aria-label="發布貼文（Ctrl 或 Command 加 Enter）"
            @click="handleSubmit"
          >
            <Icon
              :name="isSubmitting ? 'lucide:loader-circle' : 'lucide:send'"
              class="size-4"
              :class="isSubmitting ? 'animate-spin' : ''"
            />
            {{ isSubmitting ? '發布中' : '發布' }}
          </button>
        </div>
      </div>

      <p class="mt-2 text-right text-[11px] text-slate-400">
        Ctrl / ⌘ + Enter 發布
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-3 border-t border-slate-200 px-2 py-1.5"
    >
      <button
        v-for="action in [
          { label: '圖片', icon: 'lucide:image', color: 'text-emerald-600' },
          { label: '程式碼', icon: 'lucide:code-xml', color: 'text-blue-600' },
          { label: '技術想法', icon: 'lucide:file-text', color: 'text-violet-600' },
        ]"
        :key="action.label"
        type="button"
        class="flex h-10 min-w-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="isExpanded = true"
      >
        <Icon :name="action.icon" class="size-5" :class="action.color" />
        <span class="hidden truncate sm:inline">{{ action.label }}</span>
      </button>
    </div>

    <ProfileComposerPostComposerCodeDialog
      :open="codeDialogOpen"
      @insert="insertCodeBlock"
      @close="codeDialogOpen = false"
    />

    <Teleport to="body">
      <div
        v-if="showDiscardConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
        @mousedown.self="showDiscardConfirm = false"
        @keydown.esc.prevent="showDiscardConfirm = false"
      >
        <section
          class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="discard-title"
        >
          <h2 id="discard-title" class="font-semibold text-slate-950">
            清除這篇貼文？
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            文字、圖片與標籤都會刪除，且無法復原。
          </p>
          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              @click="showDiscardConfirm = false"
            >
              返回
            </button>
            <button
              type="button"
              class="h-9 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-500"
              @click="handleDiscard"
            >
              清除草稿
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>
