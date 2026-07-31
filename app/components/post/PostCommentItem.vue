<script setup lang="ts">
import type { PostComment, PostCommentComposerPayload } from '~/types/comment'
import type { PostAuthor } from '~/types/post'
import ImageGallery from '~/components/common/image/ImageGallery.vue'

const props = withDefaults(defineProps<{
  comment: PostComment
  currentUser: PostAuthor
  isReply?: boolean
  replyLoading?: boolean
  replyError?: string
  replyingTo?: PostComment
  isLikePending: (commentId: string) => boolean
  onLike: (commentId: string) => Promise<void>
  onUpdate: (commentId: string, payload: PostCommentComposerPayload) => Promise<void>
  onRemove: (commentId: string) => Promise<void>
  onSubmitReply: (payload: PostCommentComposerPayload) => Promise<void>
}>(), {
  isReply: false,
  replyLoading: false,
  replyError: '',
  replyingTo: undefined,
})

const emit = defineEmits<{
  reply: [comment: PostComment]
  cancelReply: []
  loadReplies: [rootId: string]
}>()

const menuOpen = ref(false)
const editing = ref(false)
const deleting = ref(false)
const deletePending = ref(false)
const actionError = ref('')
const repliesVisible = ref(false)
const replyComposer = useTemplateRef<{ focus: () => void }>('replyComposer')
const ownsReplyComposer = computed(() => (
  !props.isReply
  && Boolean(props.replyingTo)
  && (props.replyingTo?.rootId ?? props.replyingTo?.id) === props.comment.id
))
const galleryImages = computed(() => props.comment.images.map(image => ({
  id: image.id,
  src: image.url,
  alt: image.alt,
})))

async function saveEdit(payload: PostCommentComposerPayload) {
  await props.onUpdate(props.comment.id, payload)
  editing.value = false
}

async function deleteComment() {
  if (deletePending.value) return
  deletePending.value = true
  actionError.value = ''
  try {
    await props.onRemove(props.comment.id)
    deleting.value = false
  }
  catch (caught: unknown) {
    actionError.value = caught instanceof Error ? caught.message : '留言刪除失敗。'
  }
  finally {
    deletePending.value = false
  }
}

watch(
  () => props.comment.replies?.length ?? 0,
  (length, previous) => {
    if (length > previous) repliesVisible.value = true
  },
)

watch(ownsReplyComposer, (active) => {
  if (!active) return
  repliesVisible.value = true
  nextTick(() => replyComposer.value?.focus())
}, { immediate: true })

function showReplies() {
  repliesVisible.value = true
  if ((props.comment.replies?.length ?? 0) < props.comment.replyCount) {
    emit('loadReplies', props.comment.id)
  }
}
</script>

<template>
  <div
    class="min-w-0"
    :data-comment-id="comment.id"
  >
    <div class="flex min-w-0 items-start gap-2">
      <NuxtLink
        :to="`/profile/${comment.author.username}`"
        class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-semibold text-white"
      >
        <img
          v-if="comment.author.avatarUrl"
          :src="comment.author.avatarUrl"
          :alt="`${comment.author.displayName} 的頭像`"
          class="size-full object-cover"
        >
        <span v-else>{{ comment.author.displayName.slice(0, 1) }}</span>
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <PostCommentComposer
          v-if="editing"
          :current-user="currentUser"
          :initial-content="comment.content"
          :initial-images="comment.images"
          submit-label="儲存"
          :on-submit="saveEdit"
          @cancel-context="editing = false"
        />

        <template v-else>
          <div
            class="inline-block max-w-full rounded-2xl bg-slate-100 px-3 py-2"
            :class="comment.isDeleted ? 'text-slate-500' : ''"
          >
            <NuxtLink
              :to="`/profile/${comment.author.username}`"
              class="block truncate text-sm font-semibold text-slate-950 hover:underline"
            >
              {{ comment.author.displayName }}
              <span class="ml-1 font-normal text-slate-500">@{{ comment.author.username }}</span>
            </NuxtLink>
            <p
              v-if="comment.replyTo && !comment.isDeleted"
              class="mt-0.5 text-xs text-blue-600"
            >
              回覆 @{{ comment.replyTo.username }}
            </p>
            <ProfileComposerPostRichContent
              :content="comment.content"
            />
          </div>

          <ImageGallery
            v-if="comment.images.length && !comment.isDeleted"
            class="mt-1 max-w-md overflow-hidden rounded-xl"
            :images="galleryImages"
            layout="post"
            :gap="2"
            :max-visible="4"
          />

          <div class="mt-1 flex flex-wrap items-center gap-2 px-2 text-xs text-slate-500">
            <button
              type="button"
              :disabled="isLikePending(comment.id) || comment.isDeleted"
              class="font-semibold hover:underline disabled:opacity-50"
              :class="comment.liked ? 'text-blue-600' : ''"
              :aria-pressed="comment.liked"
              @click="onLike(comment.id)"
            >
              {{ comment.liked ? '已讚' : '讚' }}
            </button>
            <button
              v-if="!comment.isDeleted"
              type="button"
              class="font-semibold hover:underline"
              @click="emit('reply', comment)"
            >
              回覆
            </button>
            <span>{{ comment.createdAt }}</span>
            <span v-if="comment.isEdited">已編輯</span>
            <span v-if="comment.likeCount" class="inline-flex items-center gap-1">
              <Icon name="lucide:thumbs-up" class="size-3 text-blue-600" />
              {{ comment.likeCount }}
            </span>

            <div
              v-if="comment.canEdit || comment.canDelete"
              class="relative"
            >
              <button
                type="button"
                aria-label="留言選項"
                :aria-expanded="menuOpen"
                class="rounded p-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                @click="menuOpen = !menuOpen"
              >
                <Icon name="lucide:ellipsis" class="size-3.5" />
              </button>
              <div
                v-if="menuOpen"
                class="absolute left-0 top-7 z-20 w-28 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                @keydown.esc="menuOpen = false"
              >
                <button
                  v-if="comment.canEdit"
                  type="button"
                  class="block w-full rounded px-2 py-1.5 text-left hover:bg-slate-100"
                  @click="editing = true; menuOpen = false"
                >
                  編輯
                </button>
                <button
                  v-if="comment.canDelete"
                  type="button"
                  class="block w-full rounded px-2 py-1.5 text-left text-red-600 hover:bg-red-50"
                  @click="deleting = true; menuOpen = false"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </template>

        <div v-if="!isReply && (comment.replyCount || ownsReplyComposer)" class="mt-2">
          <template v-if="!repliesVisible">
            <button
              type="button"
              :disabled="replyLoading"
              class="text-xs font-semibold text-slate-600 hover:underline"
              @click="showReplies"
            >
              {{ replyLoading ? '載入中…' : `查看 ${comment.replyCount} 則回覆` }}
            </button>
            <p v-if="replyError" role="alert" class="mt-2 text-xs text-red-600">
              {{ replyError }}
              <button type="button" class="font-semibold underline" @click="showReplies">
                重試
              </button>
            </p>
          </template>
          <template v-else>
            <div class="space-y-3 border-l-2 border-slate-200 pl-3 sm:pl-4">
              <PostCommentItem
                v-for="reply in comment.replies"
                :key="reply.id"
                :comment="reply"
                :current-user="currentUser"
                is-reply
                :replying-to="replyingTo"
                :is-like-pending="isLikePending"
                :on-like="onLike"
                :on-update="onUpdate"
                :on-remove="onRemove"
                :on-submit-reply="onSubmitReply"
                @reply="emit('reply', $event)"
              />
              <PostCommentComposer
                v-if="ownsReplyComposer"
                ref="replyComposer"
                class="pt-1"
                :current-user="currentUser"
                :replying-to="replyingTo?.author"
                :on-submit="onSubmitReply"
                @cancel-context="emit('cancelReply')"
              />
            </div>
            <div class="mt-2 flex gap-3">
              <button
                v-if="(comment.replies?.length ?? 0) < comment.replyCount"
                type="button"
                :disabled="replyLoading"
                class="text-xs font-semibold text-slate-600 hover:underline"
                @click="emit('loadReplies', comment.id)"
              >
                {{ replyLoading ? '載入中…' : `查看另外 ${comment.replyCount - (comment.replies?.length ?? 0)} 則回覆` }}
              </button>
              <button
                type="button"
                class="text-xs font-semibold text-slate-500 hover:underline"
                @click="repliesVisible = false"
              >
                隱藏回覆
              </button>
            </div>
            <p v-if="replyError" role="alert" class="mt-2 text-xs text-red-600">
              {{ replyError }}
              <button type="button" class="font-semibold underline" @click="emit('loadReplies', comment.id)">
                重試
              </button>
            </p>
          </template>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="deleting"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
        @mousedown.self="deleting = false"
        @keydown.esc="deleting = false"
      >
        <section
          class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-comment-title"
        >
          <h2 id="delete-comment-title" class="font-semibold text-slate-950">
            刪除這則留言？
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            若已有回覆，留言將保留為「此留言已刪除」。
          </p>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="h-9 rounded-lg px-3 text-sm font-semibold hover:bg-slate-100" @click="deleting = false">
              返回
            </button>
            <button
              type="button"
              :disabled="deletePending"
              class="h-9 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              @click="deleteComment"
            >
              {{ deletePending ? '刪除中…' : '刪除' }}
            </button>
          </div>
          <p v-if="actionError" role="alert" class="mt-3 text-sm text-red-600">
            {{ actionError }}
          </p>
        </section>
      </div>
    </Teleport>
  </div>
</template>
