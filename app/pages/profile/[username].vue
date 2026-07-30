<script setup lang="ts">
definePageMeta({
  layout: false,
});

type ProfileTab = "posts" | "about" | "projects" | "replies";
type PostFilter = "all" | "original";

const route = useRoute();

const activeTab = ref<ProfileTab>("posts");
const activePostFilter = ref<PostFilter>("all");

const routeUsername = computed(() => {
  const username = route.params.username;

  if (Array.isArray(username)) {
    return username[0] || "changhsi";
  }

  return username || "changhsi";
});

const profile = reactive({
  displayName: "Chang-Hsi",
  username: routeUsername.value,
  headline: "Frontend Engineer・Vue 3 / Nuxt / TypeScript",
  avatarUrl:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=320&q=85",
  coverUrl:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85",
  bio: "專注於 Vue 3、Nuxt 與前端使用者體驗。\n喜歡把複雜的需求整理成簡單、直覺的產品。",
  work: "CodeGram",
  education: "National Taipei University of Technology",
  location: "台灣桃園市",
  website: "https://example.com",
  githubUrl: "https://github.com/example",
  postCount: 128,
  followingCount: 286,
  followerCount: 1248,
  skills: [
    "Vue 3",
    "Pinia",
    "Vite",
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Nuxt 3",
    "Nitro",
    "Tailwind CSS",
    "UnoCSS",
    "Python",
    "Django",
    "Flask",
    "Express",
    "SQLite",
    "MySQL",
    "PostgreSQL",
    "Supabase",
    "Vitest",
  ],
});

const isOwnProfile = computed(() => {
  // 第一版先視為目前登入會員自己的頁面。
  // 日後建立會員 Store 後，再與登入會員 username 比對。
  return true;
});

const projects = [
  {
    id: 1,
    name: "my-portfolio",
    description:
      "TW Douli Portfolio 是一個個人作品集網站，主要用來展示個人介紹、服務項目、技術堆疊、參與專案與作品詳情。",
    technologies: ["Nuxt", "TypeScript", "Tailwind CSS"],
    url: "https://my-portfolio-liard-two-87.vercel.app/",
    accentColor: "#389dc6",
  },
  {
    id: 2,
    name: "e-shopping",
    description:
      "商城系統，包含篩選商品、品牌（商城）、票券、訂單、優惠券、評價、購物車等企劃實作。",
    technologies: ["Vue 3", "Pinia", "Vite"],
    url: "https://e-shopping-liart.vercel.app/",
    accentColor: "#ee4d2d",
  },
  {
    id: 3,
    name: "CRM SYSTEM",
    description: "本CRM系統之核心目標，是建立一套 B2B 的整合型營運平台，涵蓋客戶管理、商機管理、夥伴管理等功能。",
    technologies: ["Nuxt", "Supabase", "Stripe"],
    url: "https://crm-liard-gamma.vercel.app/",
    accentColor: "#ffffff",
  },
];

const posts = ref([
  {
    id: 1,
    kind: "original",
    author: {
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    },
    content:
      "最近把 CodeGram 的登入、註冊、驗證信與重設密碼流程完成了。\n\n這次採用 Nuxt＋Supabase Auth，前端只需要專注在登入狀態與使用者體驗，整體開發流程比自行建立 Auth API 清楚很多。",
    createdAt: "2 小時",
    visibility: "public" as const,
    tags: ["Nuxt", "Supabase", "Frontend"],
    likeCount: 36,
    commentCount: 8,
    shareCount: 2,
    liked: true,
  },
  {
    id: 2,
    kind: "original",
    author: {
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    },
    content:
      "今天整理了一套 Vue 3 元件拆分方式：\n\n1. 頁面只負責組合與資料流\n2. 表單行為抽到 composable\n3. 可重用畫面拆成 components\n4. 型別集中管理\n\n元件不是拆得越細越好，重點是每個元件是否具備清楚且穩定的責任。",
    createdAt: "昨天 21:36",
    visibility: "public" as const,
    tags: ["Vue3", "CleanCode", "ComponentDesign"],
    images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
    ],
    likeCount: 92,
    commentCount: 17,
    shareCount: 11,
    liked: false,
  },
  {
    id: 3,
    kind: "reply",
    author: {
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    },
    content:
      "我自己會優先選擇 computed 處理衍生資料，只有在需要執行副作用時才使用 watch。這樣資料來源和轉換關係會更容易追蹤。",
    createdAt: "7 月 26 日",
    visibility: "followers" as const,
    tags: ["Vue3", "Computed", "Watch"],
    likeCount: 24,
    commentCount: 4,
    shareCount: 0,
    liked: false,
  },
]);

const filteredPosts = computed(() => {
  if (activeTab.value === "replies") {
    return posts.value.filter((post) => post.kind === "reply");
  }

  if (activePostFilter.value === "original") {
    return posts.value.filter((post) => post.kind === "original");
  }

  return posts.value;
});

const handleCreatePost = (content: string) => {
  posts.value.unshift({
    id: Date.now(),
    kind: "original",
    author: {
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    },
    content,
    createdAt: "剛剛",
    visibility: "public",
    tags: [],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    liked: false,
  });
};

const handleCoverSelected = (file: File) => {
  // 第一版已由 ProfileCover 顯示本機預覽。
  // 等會員資料 Store 完成後，再把圖片保存邏輯接到這裡。
  console.log("Selected cover file:", file.name);
};

const handleSaveIntro = (payload: {
  bio: string;
}) => {
  profile.bio = payload.bio;
};

const handleSaveDetails = (payload: {
  displayName: string;
  username: string;
  headline: string;
  location: string;
}) => {
  profile.displayName = payload.displayName;
  profile.username = payload.username;
  profile.headline = payload.headline;
  profile.location = payload.location;
};

watch(routeUsername, (username) => {
  profile.username = username;
});

useSeoMeta({
  title: () => `${profile.displayName}｜CodeGram`,
  description: () => `${profile.displayName} 的 CodeGram 工程師個人主頁`,
});
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- 個人頁上半部 -->
    <section class="bg-white shadow-sm">
      <div class="mx-auto max-w-[1100px]">
        <ProfileCover
          :cover-url="profile.coverUrl"
          :is-own-profile="isOwnProfile"
          @cover-selected="handleCoverSelected"
        />

        <ProfileHeader
          :avatar-url="profile.avatarUrl"
          :display-name="profile.displayName"
          :username="profile.username"
          :headline="profile.headline"
          :post-count="profile.postCount"
          :following-count="profile.followingCount"
          :follower-count="profile.followerCount"
          :is-own-profile="isOwnProfile"
          @edit="activeTab = 'about'"
        />

        <ProfileNavigation v-model="activeTab" />
      </div>
    </section>

    <!-- 個人頁內容 -->
    <main class="mx-auto max-w-[1100px] px-3 py-4 sm:px-4 lg:py-5">
      <!-- 貼文分頁 -->
      <div
        v-if="activeTab === 'posts'"
        class="grid items-start gap-4 lg:grid-cols-[380px_minmax(0,1fr)]"
      >
        <aside class="space-y-4 lg:sticky lg:top-20">
          <ProfileIntroCard
            :bio="profile.bio"
            :work="profile.work"
            :education="profile.education"
            :location="profile.location"
            :website="profile.website"
            :github-url="profile.githubUrl"
            :is-own-profile="isOwnProfile"
          />

          <ProfileSkillsCard
            :skills="profile.skills"
            :is-own-profile="isOwnProfile"
          />

          <ProfileProjectsCard
            :projects="projects"
            :is-own-profile="isOwnProfile"
          />

          <footer
            class="hidden px-2 pb-4 text-xs leading-5 text-slate-400 lg:block"
          >
            <div class="flex flex-wrap gap-x-3">
              <NuxtLink to="/" class="hover:underline"> 隱私政策 </NuxtLink>

              <NuxtLink to="/" class="hover:underline"> 使用條款 </NuxtLink>

              <NuxtLink to="/" class="hover:underline"> 社群守則 </NuxtLink>

              <NuxtLink to="/" class="hover:underline"> 說明中心 </NuxtLink>
            </div>

            <p class="mt-1">CodeGram © {{ new Date().getFullYear() }}</p>
          </footer>
        </aside>

        <section class="min-w-0 space-y-4">
          <ProfilePostComposer
            v-if="isOwnProfile"
            :avatar-url="profile.avatarUrl"
            :display-name="profile.displayName"
            @submit="handleCreatePost"
          />

          <ProfilePostFilters v-model="activePostFilter" />

          <ProfilePostCard
            v-for="post in filteredPosts"
            :key="post.id"
            :post="post"
          />

          <div
            v-if="!filteredPosts.length"
            class="rounded-xl bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
          >
            <div
              class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"
            >
              <Icon name="lucide:file-text" class="size-7" />
            </div>

            <h2 class="mt-4 font-semibold text-slate-900">尚無貼文</h2>

            <p class="mt-1 text-sm text-slate-500">
              發布第一篇技術貼文，與其他工程師分享你的想法。
            </p>
          </div>
        </section>
      </div>

      <!-- 關於分頁 -->
      <div
        v-else-if="activeTab === 'about'"
        class="space-y-4"
      >
        <ProfileAboutSection
          :display-name="profile.displayName"
          :username="profile.username"
          :bio="profile.bio"
          :headline="profile.headline"
          :work="profile.work"
          :education="profile.education"
          :location="profile.location"
          :website="profile.website"
          :github-url="profile.githubUrl"
          :skills="profile.skills"
          :is-own-profile="isOwnProfile"
          @save-intro="handleSaveIntro"
          @save-details="handleSaveDetails"
        />

        <ProfileFriendsSection :is-own-profile="isOwnProfile" />

        <ProfilePhotosSection :is-own-profile="isOwnProfile" />
      </div>

      <!-- 專案分頁 -->
      <section
        v-else-if="activeTab === 'projects'"
        class="rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.08)] sm:p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-950">專案作品</h2>

            <p class="mt-1 text-sm text-slate-500">
              個人開發與參與過的精選專案。
            </p>
          </div>

          <button
            v-if="isOwnProfile"
            type="button"
            class="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Icon name="lucide:plus" class="size-4" />

            新增專案
          </button>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="project in projects"
            :key="project.id"
            :href="project.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div
              class="flex h-36 items-center justify-center"
              :style="{
                background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}bb)`,
              }"
            >
              <Icon name="lucide:code-xml" class="size-12 text-white/90" />
            </div>

            <div class="p-4">
              <div class="flex items-start justify-between gap-3">
                <h3
                  class="font-semibold text-slate-950 group-hover:text-blue-600"
                >
                  {{ project.name }}
                </h3>

                <Icon
                  name="lucide:external-link"
                  class="size-4 shrink-0 text-slate-400"
                />
              </div>

              <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                {{ project.description }}
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span
                  v-for="technology in project.technologies"
                  :key="technology"
                  class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {{ technology }}
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>

      <!-- 回覆分頁 -->
      <div v-else class="mx-auto max-w-[680px] space-y-4">
        <div
          class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
        >
          <h2 class="text-xl font-bold text-slate-950">回覆</h2>

          <p class="mt-1 text-sm text-slate-500">
            {{ profile.displayName }} 在其他技術討論中的公開回覆。
          </p>
        </div>

        <ProfilePostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
        />

        <div
          v-if="!filteredPosts.length"
          class="rounded-xl bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
        >
          <Icon
            name="lucide:message-circle"
            class="mx-auto size-8 text-slate-300"
          />

          <p class="mt-3 text-sm text-slate-500">目前沒有公開回覆。</p>
        </div>
      </div>
    </main>
  </div>
</template>
