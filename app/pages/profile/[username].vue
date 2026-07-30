<script setup lang="ts">
import CtaMarquee from "~/components/common/card/CtaMarquee.vue";
import type {
  EducationExperience,
  ProfileProject,
  WorkExperience,
} from "~/types/profile";

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

const workExperiences = ref<WorkExperience[]>([
  {
    id: "pixelcraft-frontend",
    company: "PixelCraft Studio",
    jobTitle: "初階前端工程師",
    startDate: "2018-07-01",
    endDate: "2020-03-31",
    description:
      "參與品牌官網與活動頁開發，建立共用 UI 元件，並改善行動裝置的載入速度與操作體驗。",
    tags: ["JavaScript", "HTML", "CSS"],
  },
  {
    id: "cloudtech-frontend",
    company: "CloudTech Solutions",
    jobTitle: "前端工程師",
    startDate: "2020-04-01",
    endDate: "2022-08-31",
    description:
      "負責企業後台系統前端架構，導入 Vue 3 與 TypeScript，降低重複程式碼並提升團隊交付效率。",
    tags: ["Vue 3", "TypeScript", "Pinia"],
  },
  {
    id: "nextwave-senior-frontend",
    company: "NextWave Digital",
    jobTitle: "資深前端工程師",
    startDate: "2022-09-01",
    endDate: "2024-12-31",
    description:
      "主導設計系統與前端效能優化，協助建立程式碼審查流程，並帶領團隊完成多項核心產品改版。",
    tags: ["Nuxt", "Design System", "Web Performance"],
  },
  {
    id: "codegram-current",
    company: "CodeGram",
    jobTitle: "前端工程師",
    startDate: "2025-01-01",
    description:
      "負責 CodeGram 社群產品的前端開發與架構設計，持續改善個人檔案、貼文與互動功能的使用者體驗。",
    tags: ["Nuxt", "Vue 3", "TypeScript"],
  },
]);

const educationExperiences = ref<EducationExperience[]>([
  {
    id: "elementary-school",
    school: "桃園市立青溪國民小學",
    educationLevel: "國小",
    startDate: "2005-09-01",
    endDate: "2011-06-30",
    description: "完成基礎教育，參與校內資訊與閱讀相關活動。",
    tags: ["基礎教育"],
  },
  {
    id: "junior-high-school",
    school: "桃園市立青溪國民中學",
    educationLevel: "國中",
    startDate: "2011-09-01",
    endDate: "2014-06-30",
    description: "開始接觸程式設計與資訊科技，參與校內電腦社團。",
    tags: ["資訊科技", "電腦社"],
  },
  {
    id: "senior-high-school",
    school: "國立桃園高級中等學校",
    educationLevel: "高中",
    startDate: "2014-09-01",
    endDate: "2017-06-30",
    description: "修習自然科學與資訊課程，完成校內網站專題。",
    tags: ["自然組", "網站專題"],
  },
  {
    id: "university",
    school: "國立臺北科技大學",
    educationLevel: "大學",
    startDate: "2017-09-01",
    endDate: "2021-06-30",
    description: "主修資訊工程，專注於網頁應用、軟體工程與使用者介面開發。",
    tags: ["資訊工程", "軟體工程", "Web"],
  },
  {
    id: "graduate-school",
    school: "國立臺灣科技大學",
    educationLevel: "研究所",
    startDate: "2021-09-01",
    endDate: "2023-06-30",
    description: "研究前端架構與人機互動，完成以 Web 使用者體驗為主題的論文。",
    tags: ["人機互動", "前端架構", "UX"],
  },
]);

const hobbies = ref(["reading", "music", "photography"]);
const hobbyOther = ref("");

const interests = ref(["frontend", "ai", "open-source"]);
const interestOther = ref("");

const isOwnProfile = computed(() => {
  // 第一版先視為目前登入會員自己的頁面。
  // 日後建立會員 Store 後，再與登入會員 username 比對。
  return true;
});

const createProjectImages = (projectKey: string) => {
  return Array.from({ length: 8 }, (_, index) => {
    return `https://picsum.photos/seed/codegram-${projectKey}-${index + 1}/960/720`;
  });
};

const projects: ProfileProject[] = [
  {
    id: 1,
    name: "TW Douli Portfolio",
    description:
      "個人作品集網站，用來展示個人介紹、服務項目、技術堆疊、參與專案與作品詳情，並針對不同裝置提供響應式瀏覽體驗。",
    technologies: ["Nuxt", "Vue 3", "TypeScript", "Tailwind CSS", "Vercel"],
    technologyLogos: [
      { name: "Nuxt", icon: "logos:nuxt-icon" },
      { name: "Vue 3", icon: "logos:vue" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
      { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
      { name: "Vercel", icon: "logos:vercel-icon" },
    ],
    images: [
      "https://i.pinimg.com/736x/b4/ad/7e/b4ad7ed353ff737c9ff76145cfaa9ab8.jpg",
      "https://i.pinimg.com/736x/18/07/30/1807304d7c1a8395707451fbdd7012f2.jpg",
      "https://i.pinimg.com/1200x/b0/c0/92/b0c09230630c07244677284b1c56ead1.jpg",
      "https://i.pinimg.com/736x/b5/a7/10/b5a71051311ed8a1e9fe59fd228f6ae3.jpg",
      "https://i.pinimg.com/1200x/eb/8c/6f/eb8c6f33fca096148882bd939e50f2d8.jpg",
      "https://i.pinimg.com/1200x/f8/bb/23/f8bb23c4f59ada471fb76ba145de835c.jpg",
      "https://i.pinimg.com/1200x/0e/ac/05/0eac0533cc045dc4b6eb70a0edaf2c26.jpg",
      "https://i.pinimg.com/736x/0d/94/26/0d9426f57994ef83507a706d1e0ba2b9.jpg",
    ],
    url: "https://my-portfolio-liard-two-87.vercel.app/",
    accentColor: "#db4b82",
  },
  {
    id: 2,
    name: "E-Shopping",
    description:
      "完整的電子商城系統，包含商品與品牌篩選、購物車、票券、優惠券、訂單管理及商品評價等功能。",
    technologies: ["Vue 3", "Pinia", "Vite", "TypeScript", "JavaScript"],
    technologyLogos: [
      { name: "Vue 3", icon: "logos:vue" },
      { name: "Pinia", icon: "logos:pinia" },
      { name: "Vite", icon: "logos:vitejs" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
      { name: "JavaScript", icon: "logos:javascript" },
    ],
    images: [
      "https://i.pinimg.com/1200x/3e/c8/4e/3ec84efae92ecd030b3fbae143e7fe14.jpg",
      "https://i.pinimg.com/736x/7d/d5/d2/7dd5d2e3907724b9495bd9a021a661d2.jpg",
      "https://i.pinimg.com/736x/7e/81/68/7e816850ec67b8daa6a154984c2c35f0.jpg",
      "https://i.pinimg.com/736x/4d/7b/df/4d7bdfe815dc23adecee5c68e0b11f49.jpg",
      "https://i.pinimg.com/736x/ff/ae/f8/ffaef81fc7bf7bb9d24653fc399a97da.jpg",
      "https://i.pinimg.com/736x/7a/2e/86/7a2e86beefb5eeb52ad6db8e9c238e0b.jpg",
      "https://i.pinimg.com/1200x/01/3a/de/013ade27b955c777a3d84264c2f4099c.jpg",
      "https://i.pinimg.com/736x/77/4a/e8/774ae85fbd8e47f7e445a39f0b4a028a.jpg",
    ],
    url: "https://e-shopping-liart.vercel.app/",
    accentColor: "#6c5ce7",
  },
  {
    id: 3,
    name: "CRM System",
    description:
      "提供 B2B 客戶管理、商機追蹤、夥伴管理與營運資料整合的管理平台，協助團隊集中處理客戶與業務流程。",
    technologies: ["Nuxt", "Supabase", "PostgreSQL", "Stripe", "TypeScript"],
    technologyLogos: [
      { name: "Nuxt", icon: "logos:nuxt-icon" },
      { name: "Supabase", icon: "logos:supabase-icon" },
      { name: "PostgreSQL", icon: "logos:postgresql" },
      { name: "Stripe", icon: "logos:stripe" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
    ],
    images: [
      "https://i.pinimg.com/736x/fd/98/51/fd9851dfb5f7dc14bcba2ad31ed0ecc9.jpg",
      "https://i.pinimg.com/736x/6f/98/15/6f98150fef526ad2fc0f7c1044ec74f9.jpg",
      "https://i.pinimg.com/736x/51/c7/fb/51c7fbabd996c949b2634a6a31cbd36b.jpg",
      "https://i.pinimg.com/1200x/60/50/53/6050538302aa73d0f77d4896a28e104c.jpg",
      "https://i.pinimg.com/1200x/60/54/05/605405d1b801db2341decd0c379cee7e.jpg",
      "https://i.pinimg.com/736x/13/59/35/135935eb980a797f0f1219a48d703884.jpg",
      "https://i.pinimg.com/1200x/49/ec/b6/49ecb6925da7b1ff43c763445aba3ca2.jpg",
      "https://i.pinimg.com/1200x/1c/49/c6/1c49c653e5a5813b2fc5f0e9703298a8.jpg",
    ],
    url: "https://crm-liard-gamma.vercel.app/",
    accentColor: "#4f8edc",
  },
  {
    id: 4,
    name: "CodeGram",
    description:
      "以軟體工程師為核心的技術社群，提供個人檔案、技術貼文、專案展示、互動回覆與工程師交流功能。",
    technologies: ["Nuxt", "Vue 3", "Pinia", "Supabase", "Tailwind CSS", "TypeScript"],
    technologyLogos: [
      { name: "Nuxt", icon: "logos:nuxt-icon" },
      { name: "Vue 3", icon: "logos:vue" },
      { name: "Pinia", icon: "logos:pinia" },
      { name: "Supabase", icon: "logos:supabase-icon" },
      { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
    ],
    images: [
      "https://i.pinimg.com/736x/0c/53/b0/0c53b061b245dafdf696f2201beb0338.jpg",
      "https://i.pinimg.com/1200x/14/20/0a/14200aaad3727065aafdee8ada87ee5f.jpg",
      "https://i.pinimg.com/736x/19/39/06/19390603f5fe1d8b0b149cffee0d8648.jpg",
      "https://i.pinimg.com/1200x/09/78/37/0978378253f29ceb9ed6b20d058f2e09.jpg",
      "https://i.pinimg.com/1200x/27/d6/d3/27d6d3ea4d361eaa2ab0f1d78bcc511b.jpg",
      "https://i.pinimg.com/1200x/00/64/ee/0064eea637e208a93c816ce148e36023.jpg",
      "https://i.pinimg.com/1200x/3a/0b/01/3a0b019ea7a4a6f64499a6c4caf1aa6c.jpg",
      "https://i.pinimg.com/736x/7c/88/fa/7c88fa3a92d3828338cff02d460c7747.jpg",
    ],
    url: "https://example.com/",
    accentColor: "#7367f0",
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

const handleSaveIntro = (payload: { bio: string }) => {
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

const handleSaveWorkExperiences = (experiences: WorkExperience[]) => {
  workExperiences.value = experiences;

  const currentExperience = experiences.find(
    (experience) => !experience.endDate,
  );
  const latestExperience = [...experiences].sort((experienceA, experienceB) => {
    return experienceB.startDate.localeCompare(experienceA.startDate);
  })[0];

  profile.work = currentExperience?.company || latestExperience?.company || "";
};

const handleSaveEducationExperiences = (experiences: EducationExperience[]) => {
  educationExperiences.value = experiences;

  const currentEducation = experiences.find(
    (experience) => !experience.endDate,
  );
  const latestEducation = [...experiences].sort((educationA, educationB) => {
    return educationB.startDate.localeCompare(educationA.startDate);
  })[0];

  profile.education = currentEducation?.school || latestEducation?.school || "";
};

const handleSaveHobbies = (payload: {
  values: string[];
  customValue: string;
}) => {
  hobbies.value = payload.values;
  hobbyOther.value = payload.customValue;
};

const handleSaveInterests = (payload: {
  values: string[];
  customValue: string;
}) => {
  interests.value = payload.values;
  interestOther.value = payload.customValue;
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
      <div v-else-if="activeTab === 'about'" class="space-y-4">
        <ProfileAboutSection
          :display-name="profile.displayName"
          :username="profile.username"
          :bio="profile.bio"
          :headline="profile.headline"
          :work="profile.work"
          :work-experiences="workExperiences"
          :education-experiences="educationExperiences"
          :education="profile.education"
          :location="profile.location"
          :website="profile.website"
          :github-url="profile.githubUrl"
          :skills="profile.skills"
          :hobbies="hobbies"
          :hobby-other="hobbyOther"
          :interests="interests"
          :interest-other="interestOther"
          :is-own-profile="isOwnProfile"
          @save-intro="handleSaveIntro"
          @save-details="handleSaveDetails"
          @save-work-experiences="handleSaveWorkExperiences"
          @save-education-experiences="handleSaveEducationExperiences"
          @save-hobbies="handleSaveHobbies"
          @save-interests="handleSaveInterests"
        />

        <ProfileFriendsSection :is-own-profile="isOwnProfile" />

        <ProfilePhotosSection :is-own-profile="isOwnProfile" />
      </div>

      <!-- 專案分頁 -->
      <div
        v-else-if="activeTab === 'projects'"
        class="space-y-6"
      >
        <CtaMarquee
          v-for="project in projects"
          :key="project.id"
          :project="project"
          :speed="34"
          pause-on-hover
        />

        <div
          v-if="!projects.length"
          class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500"
        >
          尚未新增專案作品
        </div>
      </div>

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
