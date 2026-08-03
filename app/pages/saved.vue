<script setup lang="ts">
import type { Component } from 'vue'
import type { ProfilePost } from '~/types/post'
import type { MarqueePathItem } from '~/components/common/MarqueeAlongSvgPath.vue'
import MarqueeAlongSvgPath from '~/components/common/MarqueeAlongSvgPath.vue'
import GradientShimmer from '~/components/works/GradientShimmer.vue'
import OrbitingCircles from '~/components/works/OrbitingCircles.vue'
import PhoneMockups from '~/components/works/PhoneMockups.vue'

interface SavedShowcaseEntry {
  post: ProfilePost
  component: Component
  componentProps: Record<string, unknown>
  slotContent?: string
  previewLabel: string
}

const currentUser = {
  id: 'current-user',
  displayName: 'Chang-Hsi',
  username: '1',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=85',
}

const marqueeItems: MarqueePathItem[] = [
  { id: 'vue', label: 'Vue 3', icon: 'logos:vue' },
  { id: 'nuxt', label: 'Nuxt', icon: 'logos:nuxt-icon' },
  { id: 'typescript', label: 'TypeScript', icon: 'logos:typescript-icon' },
  { id: 'tailwind', label: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
  { id: 'pinia', label: 'Pinia', icon: 'logos:pinia' },
  { id: 'vitest', label: 'Vitest', icon: 'logos:vitest' },
  { id: 'vite', label: 'Vite', icon: 'logos:vitejs' },
  { id: 'javascript', label: 'JavaScript', icon: 'logos:javascript' },
  { id: 'react', label: 'React', icon: 'logos:react' },
  { id: 'nodejs', label: 'Node.js', icon: 'logos:nodejs-icon' },
  { id: 'supabase', label: 'Supabase', icon: 'logos:supabase-icon' },
  { id: 'postgresql', label: 'PostgreSQL', icon: 'logos:postgresql' },
  { id: 'sass', label: 'Sass', icon: 'logos:sass' },
  { id: 'git', label: 'Git', icon: 'logos:git-icon' },
  { id: 'github', label: 'GitHub', icon: 'logos:github-icon' },
  { id: 'docker', label: 'Docker', icon: 'logos:docker-icon' },
]

const phoneMockupImages = [
  {
    src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=720&h=1460&q=90',
    alt: '行動應用程式首頁介面',
  },
  {
    src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=720&h=1460&q=90',
    alt: '手機上的內容瀏覽介面',
  },
  {
    src: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=720&h=1460&q=90',
    alt: '行動裝置上的產品介面',
  },
  {
    src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=720&h=1460&q=90',
    alt: '手機金融服務介面',
  },
  {
    src: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=720&h=1460&q=90',
    alt: '行動版設計作品畫面',
  },
]

const technologyOrbitGroups = [
  {
    radius: 105,
    duration: 14,
    tilt: -8,
    squash: 0.44,
    itemSize: 48,
    items: [
      { id: 'vue', name: 'Vue 3', icon: 'logos:vue' },
      { id: 'nuxt', name: 'Nuxt', icon: 'logos:nuxt-icon' },
      { id: 'typescript', name: 'TypeScript', icon: 'logos:typescript-icon' },
    ],
  },
  {
    radius: 172,
    duration: 21,
    reverse: true,
    tilt: 58,
    squash: 0.4,
    itemSize: 50,
    items: [
      { id: 'vite', name: 'Vite', icon: 'logos:vitejs' },
      { id: 'react', name: 'React', icon: 'logos:react' },
      { id: 'nodejs', name: 'Node.js', icon: 'logos:nodejs-icon' },
    ],
  },
  {
    radius: 238,
    duration: 29,
    tilt: -52,
    squash: 0.38,
    itemSize: 52,
    items: [
      { id: 'supabase', name: 'Supabase', icon: 'logos:supabase-icon' },
      { id: 'postgresql', name: 'PostgreSQL', icon: 'logos:postgresql' },
      { id: 'docker', name: 'Docker', icon: 'logos:docker-icon' },
      { id: 'git', name: 'Git', icon: 'logos:git-icon' },
    ],
  },
]

/*
 * 新增作品時只需：
 * 1. import 獨立元件。
 * 2. 在 showcaseEntries 加入一筆 post、component 與 componentProps。
 * 頁面會自動產生下一張作品貼文卡片。
 */
const showcaseEntries: SavedShowcaseEntry[] = [
  {
    post: {
      id: 'marquee-along-svg-path',
      author: currentUser,
      content: '最近完成了一個沿著 SVG 路徑持續移動的 Marquee 元件。\n支援自訂路徑、速度、方向、暫停互動與 reduced motion，並透過插槽自由設計每個移動項目的外觀。',
      createdAt: '1 小時',
      visibility: 'public',
      tags: ['Vue3', 'SVG', 'Animation', 'ComponentDesign'],
      likeCount: 128,
      commentCount: 6,
      shareCount: 8,
      liked: false,
    },
    component: MarqueeAlongSvgPath,
    componentProps: {
      items: marqueeItems,
      speed: 5,
      pauseOnHover: true,
      showPath: true,
      ariaLabel: '沿著 SVG 無限路徑移動的技術標籤',
    },
    previewLabel: 'MarqueeAlongSvgPath 元件互動預覽',
  },
  {
    post: {
      id: 'gradient-shimmer',
      author: currentUser,
      content: '這次製作了 GradientShimmer 文字動畫元件，讓一束彩色漸層像光線一樣掃過標題。\n支援自訂漸層、角度、速度、停頓時間與 easing，並會在捲動、離開畫面或啟用 reduced motion 時妥善暫停。',
      createdAt: '剛剛',
      visibility: 'public',
      tags: ['Vue3', 'WebAnimationsAPI', 'Gradient', 'Accessibility'],
      likeCount: 76,
      commentCount: 3,
      shareCount: 5,
      liked: false,
    },
    component: GradientShimmer,
    componentProps: {
      as: 'h2',
      duration: 1.6,
      spread: 4,
      angle: 105,
      pauseBetween: 900,
      easing: 'gentle',
      baseColor: '#334155',
      class: 'block text-center text-3xl font-black tracking-tight sm:text-5xl',
      gradient: [
        { color: '#06b6d4', position: 0 },
        { color: '#3b82f6', position: 0.3 },
        { color: '#8b5cf6', position: 0.68 },
        { color: '#ec4899', position: 1 },
      ],
    },
    slotContent: '_Make interfaces feel alive.',
    previewLabel: 'GradientShimmer 漸層文字動畫預覽',
  },
  {
    post: {
      id: 'phone-mockups',
      author: currentUser,
      content: '完成了一個適合展示 App 畫面的 PhoneMockups 輪播元件。\n中央裝置會保持焦點，左右畫面以景深方式排列；支援拖曳、觸控滑動、鍵盤方向鍵、指示器與自動播放。',
      createdAt: '剛剛',
      visibility: 'public',
      tags: ['Vue3', 'Carousel', 'ResponsiveDesign', 'TouchInteraction'],
      likeCount: 94,
      commentCount: 4,
      shareCount: 7,
      liked: false,
    },
    component: PhoneMockups,
    componentProps: {
      images: phoneMockupImages,
      autoplay: true,
      autoplayInterval: 5200,
    },
    previewLabel: 'PhoneMockups 手機畫面輪播互動預覽',
  },
  {
    post: {
      id: 'orbiting-circles',
      author: currentUser,
      content: '製作了一個具備立體景深的 OrbitingCircles 技術軌道元件。\n每組軌道都能獨立設定半徑、速度、方向、傾斜角度與圖示大小，Logo 經過球體前後時也會呈現自然的層次變化。',
      createdAt: '剛剛',
      visibility: 'public',
      tags: ['Vue3', 'CSSAnimation', 'Transform', 'DataVisualization'],
      likeCount: 112,
      commentCount: 5,
      shareCount: 9,
      liked: false,
    },
    component: OrbitingCircles,
    componentProps: {
      groups: technologyOrbitGroups,
      designSize: 560,
      showPaths: true,
      pauseOnHover: true,
      showGlow: true,
      ariaLabel: '前端技術 Logo 環繞地球運行的動畫',
    },
    previewLabel: 'OrbitingCircles 技術軌道互動預覽',
  },
]

useSeoMeta({
  title: '元件作品｜CodeGram',
  description: '以貼文形式展示可重用的前端 UI 元件作品',
})
</script>

<template>
  <section
    aria-labelledby="saved-showcase-title"
    class="space-y-4"
  >
    <header class="rounded-xl bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
      <div class="flex items-center gap-3">
        <span class="flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <Icon name="lucide:panels-top-left" class="size-5" />
        </span>

        <div>
          <h1
            id="saved-showcase-title"
            class="text-lg font-bold text-slate-950"
          >
            元件作品
          </h1>
          <p class="mt-0.5 text-sm text-slate-500">
            可直接操作的獨立 UI 元件與開發筆記
          </p>
        </div>
      </div>
    </header>

    <SavedItemCard
      v-for="entry in showcaseEntries"
      :key="entry.post.id"
      :post="entry.post"
      :current-user="currentUser"
      :preview-label="entry.previewLabel"
    >
      <template #preview>
        <component
          :is="entry.component"
          v-if="entry.slotContent"
          v-bind="entry.componentProps"
        >
          {{ entry.slotContent }}
        </component>

        <component
          :is="entry.component"
          v-else
          v-bind="entry.componentProps"
        />
      </template>
    </SavedItemCard>

    <SavedEmptyState v-if="!showcaseEntries.length" />
  </section>
</template>
