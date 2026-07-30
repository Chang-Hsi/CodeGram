<script setup lang="ts">
import AnimatedTestimonials from '~/components/common/card/AnimatedTestimonials.vue'
import type { AnimatedTestimonialItem } from '~/components/common/card/AnimatedTestimonials.vue'

interface FriendRequest {
  id: string
  name: string
  avatarUrl: string
  mutualFriendCount: number
}

const props = defineProps<{
  friends: FriendRequest[]
}>()

const emit = defineEmits<{
  accept: [friendId: string]
  remove: [friendId: string]
}>()

const animatedFriendRequests = computed<
  AnimatedTestimonialItem[]
>(() => {
  return props.friends.map(friend => {
    const mutualFriendText =
      friend.mutualFriendCount > 0
        ? `你們有 ${friend.mutualFriendCount} 位共同朋友，可以先查看對方的個人檔案，或直接接受這個交友邀請。`
        : '對方想和你成為朋友，可以先查看個人檔案，了解更多資訊。'

    return {
      id: friend.id,
      name: friend.name,
      imageUrl: friend.avatarUrl,
      subtitle: '想和你成為朋友',
      description: mutualFriendText,
    }
  })
})
</script>

<template>
  <section
    v-if="friends.length"
    class="overflow-hidden rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8 lg:px-10"
  >
    <header
      class="mb-8 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <h2
          class="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          交友邀請
        </h2>

        <span
          class="flex min-w-7 items-center justify-center rounded-full bg-slate-950 px-2 py-1 text-xs font-semibold text-white"
        >
          {{ friends.length }}
        </span>
      </div>
    </header>

    <AnimatedTestimonials
      :items="animatedFriendRequests"
      :autoplay="false"
    >
      <template #actions="{ item }">
        <div
          class="flex flex-col gap-3 sm:flex-row"
        >
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            @click="
              emit(
                'accept',
                String(item.id),
              )
            "
          >
            確認邀請
          </button>

          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            @click="
              emit(
                'remove',
                String(item.id),
              )
            "
          >
            刪除
          </button>
        </div>
      </template>
    </AnimatedTestimonials>
  </section>
</template>