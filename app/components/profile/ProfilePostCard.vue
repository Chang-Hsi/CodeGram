<script setup lang="ts">
import type { PostAuthor, ProfilePost } from '~/types/post'
import type { PostComposerPayload } from '~/types/postComposer'
import ImageGallery from '~/components/common/image/ImageGallery.vue'
import { mockPostCommentAdapter } from '~/adapters/mockPostCommentAdapter'
import { mockPostShareAdapter } from '~/adapters/mockPostShareAdapter'
import { useOptimisticLike } from '~/composables/useOptimisticLike'
import { usePostShare } from '~/composables/usePostShare'
import { createSharedPostReference } from '~/utils/postShare'

const props = defineProps<{
  post: ProfilePost
  currentUser?: PostAuthor
}>()

const emit = defineEmits<{
  likeChange: [postId: string, liked: boolean, count: number]
  commentCountChange: [postId: string, count: number]
  shareCountChange: [postId: string, count: number]
  shareCreated: [post: ProfilePost]
}>()

const fallbackUser: PostAuthor = {
  id: 'current-user',
  displayName: 'Chang-Hsi',
  username: '1',
}

const activeUser = computed(() => props.currentUser ?? fallbackUser)
const commentsOpen = ref(false)
const commentsMounted = ref(false)
const focusCommentComposer = ref(false)
const localCommentCount = ref(props.post.commentCount ?? 0)
const localShareCount = ref(props.post.shareCount ?? 0)
const likeError = ref('')
const shareButton = useTemplateRef<HTMLButtonElement>('shareButton')

watch(() => props.post.id, () => {
  commentsOpen.value = false
  commentsMounted.value = false
  localCommentCount.value = props.post.commentCount ?? 0
  localShareCount.value = props.post.shareCount ?? 0
})

watch(() => props.post.commentCount, value => {
  localCommentCount.value = value ?? 0
})

watch(() => props.post.shareCount, value => {
  localShareCount.value = value ?? 0
})

const {
  isLiked,
  likeCount: localLikeCount,
  pending: likePending,
  toggle: commitLike,
} = useOptimisticLike(
  () => props.post.liked ?? false,
  () => props.post.likeCount ?? 0,
  async liked => {
    await new Promise(resolve => setTimeout(resolve, 120))
    return {
      liked,
      likeCount: Math.max(
        0,
        localLikeCount.value + (liked === isLiked.value ? 0 : liked ? 1 : -1),
      ),
    }
  },
)

const share = usePostShare(
  () => props.post,
  () => activeUser.value,
  mockPostShareAdapter,
)

const avatarFallback = computed(() => (
  props.post.author.displayName.trim().slice(0, 1).toUpperCase() || 'C'
))

const galleryImages = computed(() => (props.post.images ?? []).map((image, index) => (
  typeof image === 'string'
    ? {
        id: `${props.post.id}-image-${index}`,
        src: image,
        alt: `貼文圖片 ${index + 1}`,
      }
    : {
        id: image.id,
        src: image.url,
        alt: image.alt,
      }
)))

async function toggleLike() {
  likeError.value = ''
  try {
    await commitLike()
    emit('likeChange', props.post.id, isLiked.value, localLikeCount.value)
  }
  catch {
    likeError.value = '按讚失敗，已還原原本狀態。'
  }
}

function openComments(focus = false) {
  focusCommentComposer.value = focus
  commentsMounted.value = true
  commentsOpen.value = true
}

function toggleComments() {
  if (commentsOpen.value) {
    commentsOpen.value = false
    return
  }
  openComments(true)
}

function updateCommentCount(count: number) {
  localCommentCount.value = count
  emit('commentCountChange', props.post.id, count)
}

function registerShare(created: ProfilePost) {
  localShareCount.value += 1
  emit('shareCountChange', props.post.id, localShareCount.value)
  emit('shareCreated', created)
}

async function directShare() {
  const created = await share.createShare()
  if (created) registerShare(created)
}

async function quoteShare(payload: PostComposerPayload) {
  const created = await share.createShare(payload.content, payload.tags)
  if (!created) throw new Error(share.error.value || '分享失敗')
  registerShare(created)
}

function closeShareDialog() {
  share.open.value = false
  nextTick(() => shareButton.value?.focus())
}
</script>

<template>
  <article class="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
    <header class="flex items-start gap-3 px-4 pt-4">
      <NuxtLink
        :to="`/profile/${post.author.username}`"
        class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white"
      >
        <img
          v-if="post.author.avatarUrl"
          :src="post.author.avatarUrl"
          :alt="`${post.author.displayName} 的頭像`"
          class="size-full object-cover"
        >
        <span v-else>{{ avatarFallback }}</span>
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <NuxtLink
          :to="`/profile/${post.author.username}`"
          class="block truncate text-sm font-semibold text-slate-950 hover:underline"
        >
          {{ post.author.displayName }}
        </NuxtLink>
        <div class="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <span>{{ post.createdAt }}</span>
          <span aria-hidden="true">·</span>
          <Icon
            :name="post.visibility === 'followers' ? 'lucide:users' : 'lucide:earth'"
            class="size-3.5"
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="更多貼文選項"
        class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Icon name="lucide:ellipsis" class="size-5" />
      </button>
    </header>

    <div class="px-4 pb-3 pt-3">
      <ProfileComposerPostRichContent
        v-if="typeof post.content !== 'string'"
        :content="post.content"
      />
      <p v-else class="whitespace-pre-line text-[15px] leading-6 text-slate-800">
        {{ post.content }}
      </p>

      <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-x-2 gap-y-1">
        <button
          v-for="tag in post.tags"
          :key="tag"
          type="button"
          class="text-sm font-medium text-blue-600 hover:underline"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <SharedPostPreview
      v-if="post.sharedPost"
      :shared-post="post.sharedPost"
      class="mx-4 mb-4"
    />

    <ImageGallery
      v-if="post.images?.length"
      :images="galleryImages"
      layout="post"
      :gap="2"
      :max-visible="4"
    />

    <div class="px-4">
      <div class="flex min-h-11 items-center justify-between gap-4 text-sm text-slate-500">
        <button
          v-if="localLikeCount"
          type="button"
          class="flex items-center gap-1.5 hover:underline"
          @click="toggleLike"
        >
          <span class="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
            <Icon name="lucide:thumbs-up" class="size-3" />
          </span>
          {{ localLikeCount }}
        </button>
        <span v-else />

        <div class="flex items-center gap-3">
          <button
            v-if="localCommentCount"
            type="button"
            class="hover:underline"
            @click="openComments()"
          >
            {{ localCommentCount }} 則留言
          </button>
          <button
            v-if="localShareCount"
            type="button"
            class="hover:underline"
            @click="share.open.value = true"
          >
            {{ localShareCount }} 次分享
          </button>
        </div>
      </div>

      <p v-if="likeError" role="alert" class="pb-2 text-xs text-red-600">
        {{ likeError }}
      </p>

      <div class="grid grid-cols-3 border-t border-slate-200 py-1">
        <button
          type="button"
          :disabled="likePending"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-60"
          :class="isLiked ? 'text-blue-600' : 'text-slate-600'"
          @click="toggleLike"
        >
          <Icon name="lucide:thumbs-up" class="size-5" />
          讚
        </button>

        <button
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          :aria-expanded="commentsOpen"
          @click="toggleComments"
        >
          <Icon name="lucide:message-circle" class="size-5" />
          留言
        </button>

        <button
          ref="shareButton"
          type="button"
          class="flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          @click="share.open.value = true"
        >
          <Icon name="lucide:share-2" class="size-5" />
          分享
        </button>
      </div>
    </div>

    <PostCommentSection
      v-if="commentsMounted"
      v-show="commentsOpen"
      :post-id="post.id"
      :current-user="activeUser"
      :initial-count="localCommentCount"
      :adapter="mockPostCommentAdapter"
      :auto-focus="focusCommentComposer"
      @count-change="updateCommentCount"
    />

    <PostShareDialog
      :open="share.open.value"
      :post="post"
      :current-user="activeUser"
      :shared-post="createSharedPostReference(post)"
      :submitting="share.submitting.value"
      :can-native-share="share.canNativeShare.value"
      :error="share.error.value"
      :message="share.message.value"
      :on-direct-share="directShare"
      :on-quote-share="quoteShare"
      :on-copy-link="async () => { await share.copyLink() }"
      :on-native-share="async () => { await share.nativeShare() }"
      @close="closeShareDialog"
    />
  </article>
</template>
