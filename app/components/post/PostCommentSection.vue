<script setup lang="ts">
import { mockPostCommentAdapter } from '~/adapters/mockPostCommentAdapter'
import type {
  CommentSort,
  PostComment,
  PostCommentAdapter,
  PostCommentComposerPayload,
} from '~/types/comment'
import type { PostAuthor } from '~/types/post'

const props = withDefaults(defineProps<{
  postId: string
  currentUser: PostAuthor
  initialCount?: number
  adapter?: PostCommentAdapter
  autoFocus?: boolean
}>(), {
  initialCount: 0,
  adapter: () => mockPostCommentAdapter,
  autoFocus: false,
})

const emit = defineEmits<{
  countChange: [count: number]
}>()

const {
  sortedComments,
  sort,
  total,
  nextCursor,
  loaded,
  loading,
  loadingMore,
  error,
  pendingLikes,
  loadingReplies,
  replyErrors,
  load,
  loadMore,
  loadReplies,
  changeSort,
  create,
  update,
  remove,
  toggleLike,
} = usePostComments(props.postId, props.adapter, props.initialCount)

const replyingTo = ref<PostComment>()
const composer = useTemplateRef<{ focus: () => void }>('composer')
const liveMessage = ref('')

watch(total, count => emit('countChange', count), { immediate: true })

onMounted(async () => {
  await load()
  if (props.autoFocus) nextTick(() => composer.value?.focus())
})

async function submitRootComment(payload: PostCommentComposerPayload) {
  const created = await create({
    parentId: null,
    rootId: null,
    author: props.currentUser,
    content: payload.content,
    images: payload.images,
  })
  liveMessage.value = '留言已送出。'
  scrollToComment(created.id)
}

async function submitReply(payload: PostCommentComposerPayload) {
  const target = replyingTo.value
  if (!target) throw new Error('找不到要回覆的留言。')
  const created = await create({
    parentId: target.id,
    rootId: target.rootId ?? target.id,
    replyTo: target.author,
    author: props.currentUser,
    content: payload.content,
    images: payload.images,
  })
  replyingTo.value = undefined
  liveMessage.value = '回覆已送出。'
  scrollToComment(created.id)
}

function scrollToComment(commentId: string) {
  nextTick(() => {
    const escapedId = typeof CSS !== 'undefined' && CSS.escape
      ? CSS.escape(commentId)
      : commentId.replaceAll('"', '\\"')
    document.querySelector(`[data-comment-id="${escapedId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

async function updateComment(id: string, payload: PostCommentComposerPayload) {
  await update(id, payload.content, payload.images)
  liveMessage.value = '留言已更新。'
}

async function removeComment(id: string) {
  await remove(id)
  liveMessage.value = '留言已刪除。'
}

async function likeComment(id: string) {
  try {
    await toggleLike(id)
  }
  catch {
    liveMessage.value = '按讚失敗，狀態已還原。'
  }
}

function reply(comment: PostComment) {
  replyingTo.value = comment
}

const sortLabels: Record<CommentSort, string> = {
  relevant: '最相關',
  newest: '最新',
  oldest: '最舊',
}
</script>

<template>
  <section
    :id="`post-comments-${postId}`"
    class="border-t border-slate-200 px-4 pb-4 pt-3"
    aria-label="貼文留言"
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-sm font-semibold text-slate-800">
        {{ total }} 則留言
      </p>
      <label class="flex items-center gap-2 text-xs text-slate-500">
        <span class="sr-only">留言排序</span>
        <select
          :value="sort"
          class="h-8 rounded-lg border border-slate-200 bg-white px-2 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          @change="changeSort(($event.target as HTMLSelectElement).value as CommentSort)"
        >
          <option v-for="(label, value) in sortLabels" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </label>
    </div>

    <PostCommentComposer
      v-show="!replyingTo"
      ref="composer"
      :current-user="currentUser"
      :on-submit="submitRootComment"
    />

    <div class="mt-4" aria-live="polite">
      <div v-if="loading" class="space-y-4" aria-label="正在載入留言">
        <div v-for="index in 3" :key="index" class="flex animate-pulse gap-2">
          <div class="size-8 rounded-full bg-slate-200" />
          <div class="h-16 flex-1 rounded-2xl bg-slate-100" />
        </div>
      </div>

      <div v-else-if="error && !loaded" class="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
        <p>{{ error }}</p>
        <button type="button" class="mt-2 font-semibold underline" @click="load(true)">
          重試
        </button>
      </div>

      <div v-else class="space-y-4">
        <PostCommentItem
          v-for="comment in sortedComments"
          :key="comment.id"
          :comment="comment"
          :current-user="currentUser"
          :is-like-pending="(id) => pendingLikes.has(id)"
          :reply-loading="loadingReplies.has(comment.id)"
          :reply-error="replyErrors.get(comment.id)"
          :replying-to="replyingTo"
          :on-like="likeComment"
          :on-update="updateComment"
          :on-remove="removeComment"
          :on-submit-reply="submitReply"
          @reply="reply"
          @cancel-reply="replyingTo = undefined"
          @load-replies="loadReplies"
        />

        <p v-if="!sortedComments.length" class="py-5 text-center text-sm text-slate-500">
          還沒有留言，成為第一個參與討論的人吧。
        </p>

        <button
          v-if="nextCursor"
          type="button"
          :disabled="loadingMore"
          class="text-sm font-semibold text-slate-600 hover:underline disabled:opacity-50"
          @click="loadMore"
        >
          {{ loadingMore ? '載入中…' : '查看更多留言' }}
        </button>
      </div>
    </div>

    <p class="sr-only" aria-live="polite">
      {{ liveMessage }}
    </p>
  </section>
</template>
