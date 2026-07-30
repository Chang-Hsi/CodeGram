<script setup lang="ts">
import AutoCompleteInput from '~/components/common/forms/AutoCompleteInput.vue'
import LableInput from '~/components/common/forms/LableInput.vue'
import LocationSelector from '~/components/common/forms/LocationSelector.vue'

interface SkillOption {
  value: string
  label: string
  description?: string
  icon?: string
}

interface OccupationOption {
  value: string
  label: string
  description?: string
  icon?: string
  skills: SkillOption[]
}

defineProps<{
  displayName: string
  username: string
  headline: string
  location: string

  isEditing: boolean
  displayNameDraft: string
  usernameDraft: string
  headlineDraft: string
  locationDraft: string
}>()

const emit = defineEmits<{
  'update:displayNameDraft': [value: string]
  'update:usernameDraft': [value: string]
  'update:headlineDraft': [value: string]
  'update:locationDraft': [value: string]
}>()

const occupationOptions: OccupationOption[] = [
  {
    value: 'frontend-engineer',
    label: 'Frontend Engineer',
    description: '負責網站介面、互動與前端架構',
    icon: 'lucide:monitor-smartphone',
    skills: [
      {
        value: 'vue-3',
        label: 'Vue 3',
        description: 'Vue Composition API 與元件開發',
        icon: 'logos:vue',
      },
      {
        value: 'nuxt',
        label: 'Nuxt',
        description: 'Vue 全端框架與 SSR',
        icon: 'logos:nuxt-icon',
      },
      {
        value: 'typescript',
        label: 'TypeScript',
        description: '型別安全的 JavaScript',
        icon: 'logos:typescript-icon',
      },
      {
        value: 'javascript',
        label: 'JavaScript',
        description: '網頁程式語言',
        icon: 'logos:javascript',
      },
      {
        value: 'html-5',
        label: 'HTML 5',
        description: '語意化網頁結構',
        icon: 'logos:html-5',
      },
      {
        value: 'css-3',
        label: 'CSS 3',
        description: '網頁版面與視覺樣式',
        icon: 'logos:css-3',
      },
      {
        value: 'tailwind-css',
        label: 'Tailwind CSS',
        description: 'Utility-first CSS 框架',
        icon: 'logos:tailwindcss-icon',
      },
      {
        value: 'uno-css',
        label: 'UnoCSS',
        description: '即時原子化 CSS 引擎',
        icon: 'logos:unocss',
      },
      {
        value: 'pinia',
        label: 'Pinia',
        description: 'Vue 狀態管理工具',
        icon: 'logos:pinia',
      },
      {
        value: 'vue-router',
        label: 'Vue Router',
        description: 'Vue 官方路由管理工具',
        icon: 'logos:vue',
      },
      {
        value: 'vite',
        label: 'Vite',
        description: '快速的前端建置工具',
        icon: 'logos:vitejs',
      },
    ],
  },
  {
    value: 'backend-engineer',
    label: 'Backend Engineer',
    description: '負責 API、商業邏輯與伺服器架構',
    icon: 'lucide:server-cog',
    skills: [
      {
        value: 'node-js',
        label: 'Node.js',
        icon: 'logos:nodejs-icon',
      },
      {
        value: 'nestjs',
        label: 'NestJS',
        icon: 'logos:nestjs',
      },
      {
        value: 'express',
        label: 'Express',
        icon: 'simple-icons:express',
      },
      {
        value: 'python',
        label: 'Python',
        icon: 'logos:python',
      },
      {
        value: 'django',
        label: 'Django',
        icon: 'logos:django-icon',
      },
      {
        value: 'flask',
        label: 'Flask',
        icon: 'simple-icons:flask',
      },
      {
        value: 'java',
        label: 'Java',
        icon: 'logos:java',
      },
      {
        value: 'spring-boot',
        label: 'Spring Boot',
        icon: 'logos:spring-icon',
      },
      {
        value: 'go',
        label: 'Go',
        icon: 'logos:go',
      },
      {
        value: 'rest-api',
        label: 'REST API',
        icon: 'lucide:waypoints',
      },
      {
        value: 'graphql',
        label: 'GraphQL',
        icon: 'logos:graphql',
      },
    ],
  },
  {
    value: 'full-stack-engineer',
    label: 'Full Stack Engineer',
    description: '同時負責前端、後端與資料庫開發',
    icon: 'lucide:layers-3',
    skills: [
      {
        value: 'vue-3',
        label: 'Vue 3',
        icon: 'logos:vue',
      },
      {
        value: 'nuxt',
        label: 'Nuxt',
        icon: 'logos:nuxt-icon',
      },
      {
        value: 'typescript',
        label: 'TypeScript',
        icon: 'logos:typescript-icon',
      },
      {
        value: 'node-js',
        label: 'Node.js',
        icon: 'logos:nodejs-icon',
      },
      {
        value: 'nestjs',
        label: 'NestJS',
        icon: 'logos:nestjs',
      },
      {
        value: 'postgresql',
        label: 'PostgreSQL',
        icon: 'logos:postgresql',
      },
      {
        value: 'mysql',
        label: 'MySQL',
        icon: 'logos:mysql',
      },
      {
        value: 'docker',
        label: 'Docker',
        icon: 'logos:docker-icon',
      },
      {
        value: 'git',
        label: 'Git',
        icon: 'logos:git-icon',
      },
    ],
  },
  {
    value: 'ui-ux-designer',
    label: 'UI / UX Designer',
    description: '負責產品介面、流程與使用者體驗',
    icon: 'lucide:palette',
    skills: [
      {
        value: 'figma',
        label: 'Figma',
        icon: 'logos:figma',
      },
      {
        value: 'design-system',
        label: 'Design System',
        icon: 'lucide:component',
      },
      {
        value: 'user-research',
        label: 'User Research',
        icon: 'lucide:users-round',
      },
      {
        value: 'prototyping',
        label: 'Prototyping',
        icon: 'lucide:panels-top-left',
      },
      {
        value: 'wireframe',
        label: 'Wireframe',
        icon: 'lucide:layout-template',
      },
      {
        value: 'responsive-design',
        label: 'Responsive Design',
        icon: 'lucide:monitor-smartphone',
      },
    ],
  },
  {
    value: 'devops-engineer',
    label: 'DevOps Engineer',
    description: '負責部署、自動化與雲端基礎設施',
    icon: 'lucide:cloud-cog',
    skills: [
      {
        value: 'docker',
        label: 'Docker',
        icon: 'logos:docker-icon',
      },
      {
        value: 'kubernetes',
        label: 'Kubernetes',
        icon: 'logos:kubernetes',
      },
      {
        value: 'github-actions',
        label: 'GitHub Actions',
        icon: 'logos:github-actions',
      },
      {
        value: 'aws',
        label: 'AWS',
        icon: 'logos:aws',
      },
      {
        value: 'google-cloud',
        label: 'Google Cloud',
        icon: 'logos:google-cloud',
      },
      {
        value: 'nginx',
        label: 'Nginx',
        icon: 'logos:nginx',
      },
      {
        value: 'terraform',
        label: 'Terraform',
        icon: 'logos:terraform-icon',
      },
      {
        value: 'linux',
        label: 'Linux',
        icon: 'logos:linux-tux',
      },
    ],
  },
  {
    value: 'mobile-engineer',
    label: 'Mobile App Engineer',
    description: '負責 iOS、Android 或跨平台 App',
    icon: 'lucide:smartphone',
    skills: [
      {
        value: 'flutter',
        label: 'Flutter',
        icon: 'logos:flutter',
      },
      {
        value: 'react-native',
        label: 'React Native',
        icon: 'logos:react',
      },
      {
        value: 'swift',
        label: 'Swift',
        icon: 'logos:swift',
      },
      {
        value: 'kotlin',
        label: 'Kotlin',
        icon: 'logos:kotlin-icon',
      },
      {
        value: 'capacitor',
        label: 'Capacitor',
        icon: 'logos:capacitorjs-icon',
      },
      {
        value: 'ionic',
        label: 'Ionic',
        icon: 'logos:ionic-icon',
      },
    ],
  },
  {
    value: 'data-engineer',
    label: 'Data Engineer',
    description: '負責資料管線、資料庫與分析平台',
    icon: 'lucide:database-zap',
    skills: [
      {
        value: 'python',
        label: 'Python',
        icon: 'logos:python',
      },
      {
        value: 'sql',
        label: 'SQL',
        icon: 'lucide:database',
      },
      {
        value: 'postgresql',
        label: 'PostgreSQL',
        icon: 'logos:postgresql',
      },
      {
        value: 'big-query',
        label: 'BigQuery',
        icon: 'logos:google-cloud',
      },
      {
        value: 'apache-spark',
        label: 'Apache Spark',
        icon: 'simple-icons:apachespark',
      },
      {
        value: 'airflow',
        label: 'Apache Airflow',
        icon: 'simple-icons:apacheairflow',
      },
      {
        value: 'pandas',
        label: 'Pandas',
        icon: 'simple-icons:pandas',
      },
    ],
  },
]
</script>

<template>
  <div class="mt-6">
    <!-- 顯示模式 -->
    <div
      v-if="!isEditing"
      class="space-y-5"
    >
      <div class="flex items-start gap-3">
        <Icon
          name="lucide:user-round"
          class="mt-0.5 size-5 text-slate-500"
        />

        <div>
          <p class="font-semibold text-slate-900">
            {{ displayName }}
          </p>

          <p class="mt-1 text-sm text-slate-500">
            @{{ username }}
          </p>
        </div>
      </div>

      <div
        v-if="headline"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:badge-info"
          class="mt-0.5 size-5 text-slate-500"
        />

        <p class="text-sm leading-6 text-slate-700">
          {{ headline }}
        </p>
      </div>

      <div
        v-if="location"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:map-pin"
          class="mt-0.5 size-5 text-slate-500"
        />

        <p class="text-sm leading-6 text-slate-700">
          {{ location }}
        </p>
      </div>
    </div>

    <!-- 編輯模式 -->
    <div
      v-else
      class="space-y-5"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LableInput
          id="profile-display-name"
          :model-value="displayNameDraft"
          label="顯示名稱"
          type="text"
          autocomplete="nickname"
          placeholder="例如：王小明"
          required
          @update:model-value="
            emit('update:displayNameDraft', $event)
          "
        />

        <LableInput
          id="profile-username"
          :model-value="usernameDraft"
          label="使用者名稱"
          type="text"
          autocomplete="username"
          placeholder="例如：xiaoming"
          required
          @update:model-value="
            emit('update:usernameDraft', $event)
          "
        />
      </div>

      <AutoCompleteInput
        id="profile-headline"
        :model-value="headlineDraft"
        label="職業與專業技能"
        :options="occupationOptions"
        placeholder="搜尋職業，例如 Frontend Engineer"
        skill-placeholder="搜尋技能，例如 Vue 3"
        :max-skills="6"
        @update:model-value="
          emit('update:headlineDraft', $event)
        "
      />

      <LocationSelector
        id="profile-location"
        :model-value="locationDraft"
        label="所在地"
        placeholder="搜尋國家或地區，例如台灣"
        city-placeholder="搜尋城市，例如台北"
        @update:model-value="
          emit('update:locationDraft', $event)
        "
      />
    </div>
  </div>
</template>
