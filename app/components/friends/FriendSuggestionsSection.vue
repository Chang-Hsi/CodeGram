<script setup lang="ts">
import AnimatedMasonry from '~/components/common/card/AnimatedMasonry.vue'

interface FriendSuggestion {
  id: number | string
  name: string
  avatarUrl: string
  mutualFriendCount?: number
  followerCount?: string
}

const props = defineProps<{
  friends: FriendSuggestion[]
}>()

const emit = defineEmits<{
  'show-all': []
  'add-friend': [
    friendId: number | string,
  ]
  dismiss: [
    friendId: number | string,
  ]
}>()

const dismissedFriendIds = ref(
  new Set<string>(),
)

const visibleFriends = computed(() => {
  return props.friends.filter((friend) => {
    return !dismissedFriendIds.value.has(
      String(friend.id),
    )
  })
})

const masonryFriends = computed(() => {
  return visibleFriends.value.map(
    (friend) => {
      let description =
        '你可能認識這位使用者'

      if (
        friend.mutualFriendCount !==
        undefined
      ) {
        description = `${friend.mutualFriendCount} 位共同朋友`
      } else if (
        friend.followerCount
      ) {
        description = `${friend.followerCount} 位追蹤者`
      }

      return {
        id: friend.id,
        title: friend.name,
        imageUrl: friend.avatarUrl,
        imageAlt: `${friend.name}的個人照片`,
        description,
        actionLabel: '加朋友',
      }
    },
  )
})

const handleAddFriend = (
  item: {
    id: number | string
  },
) => {
  emit(
    'add-friend',
    item.id,
  )
}

const handleDismiss = (
  item: {
    id: number | string
  },
) => {
  dismissedFriendIds.value = new Set([
    ...dismissedFriendIds.value,
    String(item.id),
  ])

  emit(
    'dismiss',
    item.id,
  )
}
</script>

<template>
  <section
    v-if="friends.length"
    class="pt-4 mt-6 border-t-2"
  >
    <div
      class="mb-4 flex items-center justify-between gap-4"
    >
      <div>
        <h2
          class="text-xl font-bold text-slate-950"
        >
          你可能認識的人
        </h2>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          根據共同朋友與追蹤關係推薦
        </p>
      </div>

      <button
        type="button"
        class="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        @click="emit('show-all')"
      >
        顯示全部
      </button>
    </div>

    <AnimatedMasonry
      :items="masonryFriends"
      aria-label="你可能認識的人"
      @primary-action="
        handleAddFriend
      "
      @dismiss="handleDismiss"
    />
  </section>
</template>
