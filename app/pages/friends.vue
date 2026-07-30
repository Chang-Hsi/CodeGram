<script setup lang="ts">
import FriendRequestsSection from '~/components/friends/FriendRequestsSection.vue'
import FriendSuggestionsSection from '~/components/friends/FriendSuggestionsSection.vue'

useSeoMeta({
  title: '朋友｜CodeGram',
  description: 'CodeGram 朋友頁面',
})

const friendRequests = [
  {
    id: 'request-1',
    name: '鈴木 穗乃美',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=88',
    mutualFriendCount: 5,
  },
  {
    id: 'request-2',
    name: '賴知紅',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=88',
    mutualFriendCount: 2,
  },
]

const friendSuggestions = [
  {
    id: 'suggestion-1',
    name: '王博',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=88',
    followerCount: '1,724',
  },
  {
    id: 'suggestion-2',
    name: '李青青',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=88',
    mutualFriendCount: 2,
  },
  {
    id: 'suggestion-3',
    name: 'Dennis Chen',
    avatarUrl:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=640&q=88',
    mutualFriendCount: 6,
  },
  {
    id: 'suggestion-4',
    name: 'Shinchin Lin',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=640&q=88',
    followerCount: '2,031',
  },
  {
    id: 'suggestion-5',
    name: '陳介中',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=88',
    followerCount: '1.3 萬',
  },
  {
    id: 'suggestion-6',
    name: 'Lin Hung Chang',
    avatarUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=640&q=88',
    followerCount: '2,799',
  },
  {
    id: 'suggestion-7',
    name: '陳寶媛',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=88',
    mutualFriendCount: 3,
  },
  {
    id: 'suggestion-8',
    name: 'Kevin Wu',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=88',
    mutualFriendCount: 9,
  },
]
</script>

<template>
  <div class="space-y-4 pb-10">
    <FriendRequestsSection
      :friends="friendRequests"
    />

    <FriendSuggestionsSection
      :friends="friendSuggestions"
    />
  </div>
</template>
