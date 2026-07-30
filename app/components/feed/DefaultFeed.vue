<script setup lang="ts">
import ProfilePostCard from '~/components/profile/ProfilePostCard.vue'
import ProfilePostComposer from '~/components/profile/ProfilePostComposer.vue'

const currentUser = {
  displayName: 'Chang-Hsi',
  username: '1',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=85',
}

const posts = [
  {
    id: 1,
    author: {
      displayName: 'Yu-Ting Lin',
      username: 'yuting',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85',
    },
    content:
      '最近把 Nuxt 專案的元件結構重新整理了一輪。\n\n把頁面、資料流與純 UI 元件分開之後，功能增加時真的輕鬆很多。分享幾個這次整理的畫面 ✨',
    createdAt: '1 小時',
    visibility: 'public' as const,
    tags: ['Nuxt', 'Vue3', 'Frontend'],
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=85',
    ],
    likeCount: 128,
    commentCount: 24,
    shareCount: 8,
    liked: false,
  },
  {
    id: 2,
    author: {
      displayName: 'Alex Chen',
      username: 'alex',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85',
    },
    content:
      '今天完成了團隊內部 Design System 的第一個版本。從顏色、字體到互動狀態都整理成共用規範，接下來會逐步把舊頁面遷移過去。',
    createdAt: '3 小時',
    visibility: 'public' as const,
    tags: ['DesignSystem', 'TypeScript', 'UIUX'],
    likeCount: 76,
    commentCount: 13,
    shareCount: 4,
    liked: true,
  },
  {
    id: 3,
    author: {
      displayName: 'Mina Wang',
      username: 'mina',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
    },
    content:
      '週末參加了前端社群的小聚，聽到很多關於效能優化與無障礙設計的實務經驗。技術交流最棒的地方，就是能看到同一個問題有這麼多不同解法。',
    createdAt: '昨天 20:18',
    visibility: 'public' as const,
    tags: ['Community', 'WebPerformance', 'A11y'],
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85',
    ],
    likeCount: 203,
    commentCount: 31,
    shareCount: 12,
    liked: false,
  },
]
</script>

<template>
  <div class="mx-auto w-full max-w-[680px] space-y-4">
    <ProfilePostComposer
      :avatar-url="currentUser.avatarUrl"
      :display-name="currentUser.displayName"
    />

    <section
      class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"
        >
          <Icon
            name="lucide:plus"
            class="size-5"
          />
        </button>

        <div>
          <h2 class="text-sm font-semibold text-slate-900">
            建立即時動態
          </h2>

          <p class="mt-0.5 text-sm text-slate-500">
            分享照片、程式畫面或今天的開發進度。
          </p>
        </div>
      </div>
    </section>

    <ProfilePostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
    />
  </div>
</template>
