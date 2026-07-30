<script setup lang="ts">
import IconBadge from '~/components/common/badge/IconBadge.vue'
import FileTree from '~/components/common/structure/FileTree.vue'

type SkillKey =
  | 'vue-3'
  | 'vue-router'
  | 'pinia'
  | 'vite'
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'nuxt-3'
  | 'nitro'
  | 'tailwind-css'
  | 'unocss'
  | 'python'
  | 'django'
  | 'flask'
  | 'express'
  | 'sqlite'
  | 'mysql'
  | 'postgresql'
  | 'supabase'
  | 'vitest'

interface SkillDefinition {
  label: string
  icon: string
  iconClass: string
}

interface FileTreeNode {
  id: string
  label: string
  type: 'folder' | 'item'
  icon?: string
  iconClass?: string
  children?: FileTreeNode[]
}

const props = withDefaults(
  defineProps<{
    skills?: string[]
    isOwnProfile?: boolean
  }>(),
  {
    skills: () => [],
    isOwnProfile: false,
  },
)

const SKILL_DEFINITIONS: Record<
  SkillKey,
  SkillDefinition
> = {
  'vue-3': {
    label: 'Vue 3',
    icon: 'simple-icons:vuedotjs',
    iconClass: 'text-[#42B883]',
  },
  'vue-router': {
    label: 'Vue Router',
    icon: 'simple-icons:vuerouter',
    iconClass: 'text-[#42B883]',
  },
  'pinia': {
    label: 'Pinia',
    icon: 'simple-icons:pinia',
    iconClass: 'text-[#FFD859]',
  },
  'vite': {
    label: 'Vite',
    icon: 'simple-icons:vite',
    iconClass: 'text-[#646CFF]',
  },
  'html': {
    label: 'HTML',
    icon: 'simple-icons:html5',
    iconClass: 'text-[#E34F26]',
  },
  'css': {
    label: 'CSS',
    icon: 'simple-icons:css',
    iconClass: 'text-[#663399]',
  },
  'javascript': {
    label: 'JavaScript',
    icon: 'simple-icons:javascript',
    iconClass: 'text-[#F7DF1E]',
  },
  'typescript': {
    label: 'TypeScript',
    icon: 'simple-icons:typescript',
    iconClass: 'text-[#3178C6]',
  },
  'nuxt-3': {
    label: 'Nuxt',
    icon: 'simple-icons:nuxtdotjs',
    iconClass: 'text-[#00DC82]',
  },
  'nitro': {
    label: 'Nitro',
    icon: 'lucide:zap',
    iconClass: 'text-[#00DC82]',
  },
  'tailwind-css': {
    label: 'Tailwind CSS',
    icon: 'simple-icons:tailwindcss',
    iconClass: 'text-[#06B6D4]',
  },
  'unocss': {
    label: 'UnoCSS',
    icon: 'simple-icons:unocss',
    iconClass: 'text-slate-900',
  },
  'python': {
    label: 'Python',
    icon: 'simple-icons:python',
    iconClass: 'text-[#3776AB]',
  },
  'django': {
    label: 'Django',
    icon: 'simple-icons:django',
    iconClass: 'text-[#092E20]',
  },
  'flask': {
    label: 'Flask',
    icon: 'simple-icons:flask',
    iconClass: 'text-slate-900',
  },
  'express': {
    label: 'Express',
    icon: 'simple-icons:express',
    iconClass: 'text-slate-900',
  },
  'sqlite': {
    label: 'SQLite',
    icon: 'simple-icons:sqlite',
    iconClass: 'text-[#003B57]',
  },
  'mysql': {
    label: 'MySQL',
    icon: 'simple-icons:mysql',
    iconClass: 'text-[#4479A1]',
  },
  'postgresql': {
    label: 'PostgreSQL',
    icon: 'simple-icons:postgresql',
    iconClass: 'text-[#4169E1]',
  },
  'supabase': {
    label: 'Supabase',
    icon: 'simple-icons:supabase',
    iconClass: 'text-[#3FCF8E]',
  },
  'vitest': {
    label: 'Vitest',
    icon: 'simple-icons:vitest',
    iconClass: 'text-[#6E9F18]',
  },
}

const SKILL_ALIASES: Record<string, SkillKey> = {
  'vue': 'vue-3',
  'vue 3': 'vue-3',
  'vue3': 'vue-3',
  'vue.js': 'vue-3',

  'router': 'vue-router',
  'vue router': 'vue-router',
  'vue-router': 'vue-router',

  'pinia': 'pinia',
  'vite': 'vite',
  'html': 'html',
  'html5': 'html',
  'css': 'css',
  'css3': 'css',

  'javascript': 'javascript',
  'java script': 'javascript',
  'js': 'javascript',

  'typescript': 'typescript',
  'type script': 'typescript',
  'ts': 'typescript',

  'nuxt': 'nuxt-3',
  'nuxt 3': 'nuxt-3',
  'nuxt3': 'nuxt-3',
  'nuxt.js': 'nuxt-3',

  'nitro': 'nitro',

  'tailwind': 'tailwind-css',
  'tailwind css': 'tailwind-css',
  'tailwindcss': 'tailwind-css',

  'uno': 'unocss',
  'uno css': 'unocss',
  'unocss': 'unocss',

  'python': 'python',
  'django': 'django',
  'flask': 'flask',

  'express': 'express',
  'express.js': 'express',
  'expressjs': 'express',

  'sqlite': 'sqlite',
  'sqlite3': 'sqlite',

  'mysql': 'mysql',

  // 相容原本可能誤寫的名稱
  'msql': 'mysql',

  'postgres': 'postgresql',
  'postgres sql': 'postgresql',
  'postgresql': 'postgresql',

  'supabase': 'supabase',
  'vitest': 'vitest',
}

const normalizeSkillName = (skill: string) => {
  return skill
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
}

const resolveSkillKey = (
  skill: string,
): SkillKey | null => {
  const normalizedSkill = normalizeSkillName(skill)

  return SKILL_ALIASES[normalizedSkill] ?? null
}

const resolvedSkillKeys = computed<Set<SkillKey>>(() => {
  const result = new Set<SkillKey>()

  props.skills.forEach((skill) => {
    const skillKey = resolveSkillKey(skill)

    if (skillKey) {
      result.add(skillKey)
    }
  })

  return result
})

const hasSkill = (skillKey: SkillKey) => {
  return resolvedSkillKeys.value.has(skillKey)
}

const hasAnySkill = (skillKeys: SkillKey[]) => {
  return skillKeys.some(hasSkill)
}

const createSkillItem = (
  skillKey: SkillKey,
  idPrefix: string,
): FileTreeNode | null => {
  if (!hasSkill(skillKey)) {
    return null
  }

  const definition = SKILL_DEFINITIONS[skillKey]

  return {
    id: `${idPrefix}-${skillKey}`,
    label: definition.label,
    type: 'item',
    icon: definition.icon,
    iconClass: definition.iconClass,
  }
}

const compactNodes = (
  nodes: Array<FileTreeNode | null>,
): FileTreeNode[] => {
  return nodes.filter(
    (node): node is FileTreeNode => node !== null,
  )
}

const createFolder = (
  id: string,
  label: string,
  children: FileTreeNode[],
): FileTreeNode | null => {
  if (!children.length) {
    return null
  }

  return {
    id,
    label,
    type: 'folder',
    children,
  }
}

const skillTree = computed<FileTreeNode[]>(() => {
  /*
   * Vue 3 與 Nuxt 表示實際使用的技術組合，
   * 所以 HTML、CSS、JavaScript、TypeScript、
   * Pinia、Vite 可以合理地重複出現在兩邊。
   */
  const vueFolder = hasAnySkill([
    'vue-3',
    'vue-router',
    'pinia',
  ])
    ? createFolder(
        'frontend-vue',
        'Vue 3',
        compactNodes([
          createSkillItem('vue-router', 'vue'),
          createSkillItem('pinia', 'vue'),
          createSkillItem('vite', 'vue'),
          createSkillItem('html', 'vue'),
          createSkillItem('css', 'vue'),
          createSkillItem('javascript', 'vue'),
          createSkillItem('typescript', 'vue'),
        ]),
      )
    : null

  const nuxtFolder = hasSkill('nuxt-3')
    ? createFolder(
        'frontend-nuxt',
        'Nuxt',
        compactNodes([
          createSkillItem('pinia', 'nuxt'),
          createSkillItem('vite', 'nuxt'),
          createSkillItem('nitro', 'nuxt'),
          createSkillItem('html', 'nuxt'),
          createSkillItem('css', 'nuxt'),
          createSkillItem('javascript', 'nuxt'),
          createSkillItem('typescript', 'nuxt'),
        ]),
      )
    : null

  const uiFolder = createFolder(
    'frontend-ui',
    'UI／樣式',
    compactNodes([
      createSkillItem('tailwind-css', 'ui'),
      createSkillItem('unocss', 'ui'),
    ]),
  )

  const frontendFolder = createFolder(
    'frontend',
    '前端開發',
    compactNodes([
      vueFolder,
      nuxtFolder,
      uiFolder,
    ]),
  )

  /*
   * Express 是 Node.js Web Framework，
   * 因此放在 Node.js 資料夾下會比直接與 Python 並列更準確。
   */
  const pythonFolder = hasAnySkill([
    'python',
    'django',
    'flask',
  ])
    ? createFolder(
        'backend-python',
        'Python',
        compactNodes([
          createSkillItem('django', 'python'),
          createSkillItem('flask', 'python'),
        ]),
      )
    : null

  const nodeFolder = hasSkill('express')
    ? createFolder(
        'backend-node',
        'Node.js',
        compactNodes([
          createSkillItem('express', 'node'),
        ]),
      )
    : null

  const backendFolder = createFolder(
    'backend',
    '後端開發',
    compactNodes([
      pythonFolder,
      nodeFolder,
    ]),
  )

  const databaseFolder = createFolder(
    'database',
    '資料庫',
    compactNodes([
      createSkillItem('sqlite', 'database'),
      createSkillItem('mysql', 'database'),
      createSkillItem('postgresql', 'database'),
    ]),
  )

  const cloudFolder = createFolder(
    'cloud',
    '雲端／BaaS',
    compactNodes([
      createSkillItem('supabase', 'cloud'),
    ]),
  )

  const testingFolder = createFolder(
    'testing',
    '測試與開發工具',
    compactNodes([
      createSkillItem('vitest', 'testing'),
    ]),
  )

  const unknownSkillLabels = Array.from(
    new Set(
      props.skills
        .map(skill => skill.trim())
        .filter(Boolean)
        .filter(skill => resolveSkillKey(skill) === null),
    ),
  )

  const otherFolder = createFolder(
    'other',
    '其他技術',
    unknownSkillLabels.map((skill, index) => ({
      id: `other-${index}`,
      label: skill,
      type: 'item',
      icon: 'lucide:code-2',
      iconClass: 'text-slate-500',
    })),
  )

  return compactNodes([
    frontendFolder,
    backendFolder,
    databaseFolder,
    cloudFolder,
    testingFolder,
    otherFolder,
  ])
})

const defaultExpandedSkillFolderIds = computed(() => {
  return skillTree.value
    .filter(node => {
      return node.type === 'folder' && Boolean(node.children?.length)
    })
    .map(node => node.id)
})
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl font-bold text-slate-950">
        技術專長
      </h2>

      <NuxtLink
        v-if="isOwnProfile"
        to="/settings/profile"
        aria-label="編輯技術專長"
        class="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Icon
          name="lucide:pencil"
          class="size-4"
        />
      </NuxtLink>
    </div>

    <FileTree
      v-if="skillTree.length"
      :nodes="skillTree"
      :default-open="false"
      :default-expanded-ids="defaultExpandedSkillFolderIds"
      aria-label="技術專長分類"
      class="mt-4"
    >
      <template #item="{ node }">
        <IconBadge
          :label="node.label"
          :icon="node.icon"
          :icon-class="node.iconClass"
          size="sm"
        />
      </template>
    </FileTree>

    <p
      v-else
      class="mt-4 text-sm text-slate-400"
    >
      尚未新增技術專長
    </p>
  </section>
</template>
