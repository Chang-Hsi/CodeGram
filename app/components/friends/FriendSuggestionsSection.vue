<script setup lang="ts">
import FriendCard from './FriendCard.vue'

interface FriendSuggestion {
  id: number | string
  name: string
  avatarUrl: string
  mutualFriendCount?: number
  followerCount?: string
}

defineProps<{
  friends: FriendSuggestion[]
}>()
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl font-bold text-slate-950">
        你可能認識的人
      </h2>

      <button
        type="button"
        class="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
      >
        顯示全部
      </button>
    </div>

    <div
      class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <FriendCard
        v-for="friend in friends"
        :key="friend.id"
        :friend="friend"
        variant="suggestion"
      />
    </div>
  </section>
</template>
