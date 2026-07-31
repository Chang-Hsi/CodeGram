<script setup lang="ts">
import type { PostAuthor, ProfilePost } from '~/types/post'
import type { PostComposerPayload } from '~/types/postComposer'
import type { SharedPostReference } from '~/types/postShare'

const props = defineProps<{
  open: boolean
  post: ProfilePost
  currentUser: PostAuthor
  sharedPost: SharedPostReference
  submitting: boolean
  canNativeShare: boolean
  error: string
  message: string
  onDirectShare: () => Promise<void>
  onQuoteShare: (payload: PostComposerPayload) => Promise<void>
  onCopyLink: () => Promise<void>
  onNativeShare: () => Promise<void>
}>()

const emit = defineEmits<{
  close: []
}>()

const dialog = useTemplateRef<HTMLElement>('dialog')

watch(() => props.open, (open) => {
  if (open) nextTick(() => dialog.value?.focus())
})

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )]
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable.at(-1)!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 sm:items-center sm:p-4"
      @mousedown.self="emit('close')"
      @keydown.esc.prevent="emit('close')"
    >
      <section
        ref="dialog"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        class="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-slate-50 shadow-2xl outline-none sm:max-w-xl sm:rounded-2xl"
        @keydown="trapFocus"
      >
        <header class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 id="share-dialog-title" class="font-semibold text-slate-950">
            分享貼文
          </h2>
          <button
            type="button"
            aria-label="關閉分享視窗"
            class="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            @click="emit('close')"
          >
            <Icon name="lucide:x" class="size-5" />
          </button>
        </header>

        <div class="space-y-3 p-4">
          <button
            type="button"
            :disabled="submitting"
            class="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
            @click="onDirectShare"
          >
            <span class="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon name="lucide:repeat-2" class="size-5" />
            </span>
            <span>
              <span class="block text-sm font-semibold text-slate-900">分享到自己的動態</span>
              <span class="text-xs text-slate-500">不加文字，直接分享原貼文</span>
            </span>
          </button>

          <div class="rounded-xl border border-slate-200 bg-white p-3">
            <p class="mb-2 text-sm font-semibold text-slate-800">
              加上你的想法
            </p>
            <ProfilePostComposer
              :display-name="currentUser.displayName"
              :avatar-url="currentUser.avatarUrl"
              :draft-scope="`share:${post.id}`"
              :submit-post="onQuoteShare"
            />
            <SharedPostPreview :shared-post="sharedPost" />
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              class="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100"
              @click="onCopyLink"
            >
              <Icon name="lucide:copy" class="size-4" />
              複製貼文連結
            </button>
            <button
              v-if="canNativeShare"
              type="button"
              class="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100"
              @click="onNativeShare"
            >
              <Icon name="lucide:share" class="size-4" />
              更多分享方式
            </button>
          </div>

          <p
            v-if="error || message"
            class="rounded-lg px-3 py-2 text-sm"
            :class="error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'"
            :role="error ? 'alert' : 'status'"
            aria-live="polite"
          >
            {{ error || message }}
          </p>
        </div>
      </section>
    </div>
  </Teleport>
</template>
