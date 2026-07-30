<script setup lang="ts">
import MarqueeAlongSvgPath from '~/components/common/MarqueeAlongSvgPath.vue'

const props = defineProps<{
  skills: string[]
  emptyText: string
}>()

const skillIconMap: Record<
  string,
  string
> = {
  vue: 'logos:vue',
  'vue 3': 'logos:vue',
  vue3: 'logos:vue',
  'vue.js': 'logos:vue',

  nuxt: 'logos:nuxt-icon',
  'nuxt 3': 'logos:nuxt-icon',
  nuxt3: 'logos:nuxt-icon',
  'nuxt.js': 'logos:nuxt-icon',

  typescript: 'logos:typescript-icon',
  ts: 'logos:typescript-icon',

  javascript: 'logos:javascript',
  js: 'logos:javascript',

  html: 'logos:html-5',
  html5: 'logos:html-5',
  'html 5': 'logos:html-5',

  css: 'logos:css-3',
  css3: 'logos:css-3',
  'css 3': 'logos:css-3',

  tailwind: 'logos:tailwindcss-icon',
  tailwindcss: 'logos:tailwindcss-icon',
  'tailwind css': 'logos:tailwindcss-icon',

  unocss: 'logos:unocss',
  'uno css': 'logos:unocss',

  pinia: 'logos:pinia',
  vite: 'logos:vitejs',
  vitest: 'logos:vitest',

  react: 'logos:react',
  'react.js': 'logos:react',
  reactjs: 'logos:react',

  next: 'logos:nextjs-icon',
  nextjs: 'logos:nextjs-icon',
  'next.js': 'logos:nextjs-icon',

  node: 'logos:nodejs-icon',
  nodejs: 'logos:nodejs-icon',
  'node.js': 'logos:nodejs-icon',

  npm: 'logos:npm-icon',
  pnpm: 'logos:pnpm',
  yarn: 'logos:yarn',

  python: 'logos:python',
  django: 'logos:django-icon',
  flask: 'logos:flask',

  java: 'logos:java',
  spring: 'logos:spring-icon',
  'spring boot': 'logos:spring-icon',

  kotlin: 'logos:kotlin-icon',
  swift: 'logos:swift',
  flutter: 'logos:flutter',

  go: 'logos:go',
  golang: 'logos:go',

  docker: 'logos:docker-icon',
  kubernetes: 'logos:kubernetes',

  mysql: 'logos:mysql',
  postgresql: 'logos:postgresql',
  postgres: 'logos:postgresql',
  mongodb: 'logos:mongodb-icon',
  redis: 'logos:redis',

  git: 'logos:git-icon',
  github: 'logos:github-icon',
  gitlab: 'logos:gitlab',

  figma: 'logos:figma',

  supabase: 'logos:supabase-icon',
  firebase: 'logos:firebase',
  vercel: 'logos:vercel-icon',

  graphql: 'logos:graphql',
}

const normalizeSkillName = (
  skill: string,
) => {
  return skill
    .trim()
    .toLocaleLowerCase()
}

const getSkillIcon = (
  skill: string,
) => {
  const normalizedSkill
    = normalizeSkillName(skill)

  const exactIcon
    = skillIconMap[normalizedSkill]

  if (exactIcon) {
    return exactIcon
  }

  /*
   * 處理帶有版本號或額外文字的名稱，
   * 例如：
   *
   * Vue 3.5
   * Tailwind CSS v4
   * Nuxt 4
   */
  const matchedKey = Object.keys(
    skillIconMap,
  )
    .sort(
      (
        firstKey,
        secondKey,
      ) => {
        return (
          secondKey.length
          - firstKey.length
        )
      },
    )
    .find((key) => {
      return normalizedSkill.includes(key)
    })

  return matchedKey
    ? skillIconMap[matchedKey]
    : 'lucide:code-2'
}

const skillItems = computed(() => {
  return props.skills.map(
    (
      skill,
      index,
    ) => {
      return {
        id: `${skill}-${index}`,
        label: skill,
        icon: getSkillIcon(skill),
      }
    },
  )
})
</script>

<template>
  <div class="mt-6">
    <MarqueeAlongSvgPath
      v-if="skills.length"
      :items="skillItems"
      :speed="4.5"
      :minimum-item-count="14"
      :slow-down-factor="0.15"
      :rotate-along-path="true"
      :show-path="false"
      pause-on-hover
      aria-label="專業技能 Logo 動態展示"
      class="min-h-[270px]"
    >
      <template #default="{ item }">
        <!--
          使用完全不透明的白色方塊。
          在路徑交會處會完整覆蓋後方 Logo。
        -->
        <div
          class="flex size-[58px] items-center justify-center overflow-hidden rounded-[10px] border border-slate-200 bg-white opacity-100 shadow-[0_6px_18px_rgba(15,23,42,0.14)] transition-shadow hover:shadow-[0_10px_26px_rgba(15,23,42,0.2)]"
          :title="item.label"
          :aria-label="item.label"
        >
          <Icon
            :name="
              item.icon
              || 'lucide:code-2'
            "
            class="size-[58px]"
          />

          <span class="sr-only">
            {{ item.label }}
          </span>
        </div>
      </template>
    </MarqueeAlongSvgPath>

    <p
      v-else
      class="text-sm text-slate-500"
    >
      {{ emptyText }}
    </p>
  </div>
</template>
