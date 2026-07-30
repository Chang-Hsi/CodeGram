<script setup lang="ts">
import { computed, ref } from "vue"

interface FolderProject {
  id: number | string
  name: string
  description: string
  technologies: string[]
  url?: string
  accentColor?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    projects?: FolderProject[]
    folderColor?: string
  }>(),
  {
    title: "作品集",
    projects: () => [],
    folderColor: "#fb923c",
  },
)

const isOpen = ref(false)

const visibleProjects = computed(() => {
  return props.projects.slice(0, 3)
})

const projectCountText = computed(() => {
  return `${props.projects.length} 個專案`
})

const toggleFolder = () => {
  isOpen.value = !isOpen.value
}

const getProjectCardStyle = (
  project: FolderProject,
  index: number,
) => {
  const total = visibleProjects.value.length

  let translateX = 0
  let rotate = 0

  if (total === 2) {
    const layouts = [
      {
        translateX: -40,
        rotate: -8,
      },
      {
        translateX: 40,
        rotate: 8,
      },
    ]

    translateX = layouts[index]?.translateX ?? 0
    rotate = layouts[index]?.rotate ?? 0
  }

  if (total >= 3) {
    const layouts = [
      {
        translateX: -62,
        rotate: -10,
      },
      {
        translateX: 0,
        rotate: 0,
      },
      {
        translateX: 62,
        rotate: 10,
      },
    ]

    translateX = layouts[index]?.translateX ?? 0
    rotate = layouts[index]?.rotate ?? 0
  }

  const accentColor = project.accentColor || "#2563eb"

  return {
    "--card-x": `${translateX}px`,
    "--card-rotate": `${rotate}deg`,
    "--card-delay": `${index * 70}ms`,
    "--card-accent": accentColor,
    zIndex: 20 + index,
  }
}
</script>

<template>
  <article
    class="w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 pb-5 pt-4"
  >
    <div
      class="folder-stage relative mx-auto h-[270px] w-full max-w-[330px]"
      :class="{
        'is-open': isOpen,
      }"
      :style="{
        '--folder-color': folderColor,
      }"
    >
      <!-- 資料夾背板 -->
      <div
        class="folder-back pointer-events-none absolute bottom-3 left-1/2 z-10 h-[122px] w-[190px] -translate-x-1/2"
      >
        <div class="folder-tab absolute left-0 top-0 h-9 w-24" />

        <div
          class="absolute inset-x-0 bottom-0 top-6 rounded-[18px] bg-[var(--folder-color)] shadow-[0_16px_30px_rgba(15,23,42,0.13)]"
        />

        <div
          class="absolute inset-x-3 bottom-3 top-10 rounded-xl bg-black/10"
        />
      </div>

      <!-- 從資料夾彈出的專案卡片 -->
      <component
        :is="project.url ? 'a' : 'article'"
        v-for="(project, index) in visibleProjects"
        :key="project.id"
        :href="project.url"
        :target="project.url ? '_blank' : undefined"
        :rel="project.url ? 'noopener noreferrer' : undefined"
        :aria-label="
          project.url
            ? `開啟專案：${project.name}`
            : project.name
        "
        class="project-card absolute left-1/2 bottom-[86px] h-[172px] w-[142px] overflow-hidden rounded-xl border border-white/60 text-left shadow-[0_14px_28px_rgba(15,23,42,0.24)] outline-none"
        :class="{
          'cursor-pointer focus-visible:ring-4 focus-visible:ring-blue-500/20':
            project.url,
          'cursor-default': !project.url,
        }"
        :style="getProjectCardStyle(project, index)"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(145deg,var(--card-accent),#0f172a_78%)]"
        />

        <div
          class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.32),transparent_38%)]"
        />

        <div class="relative flex h-full flex-col p-3 text-white">
          <div class="flex items-start justify-between gap-2">
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm"
            >
              <Icon
                name="lucide:folder-code"
                class="size-4"
              />
            </div>

            <Icon
              v-if="project.url"
              name="lucide:external-link"
              class="mt-0.5 size-4 shrink-0 text-white/80"
            />
          </div>

          <div class="mt-auto">
            <h3 class="line-clamp-1 text-sm font-bold">
              {{ project.name }}
            </h3>

            <p class="mt-1 line-clamp-2 text-[11px] leading-4 text-white/75">
              {{ project.description }}
            </p>

            <div class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="technology in project.technologies.slice(0, 3)"
                :key="technology"
                class="max-w-full truncate rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm"
              >
                {{ technology }}
              </span>
            </div>
          </div>
        </div>
      </component>

      <!-- 資料夾前面板與點擊區域 -->
      <button
        type="button"
        class="folder-button absolute bottom-3 left-1/2 z-40 h-[116px] w-[190px] -translate-x-1/2 outline-none"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? `收合${title}` : `展開${title}`"
        @click="toggleFolder"
      >
        <span
          class="folder-front absolute inset-x-0 bottom-0 h-[100px] overflow-hidden rounded-[18px] bg-[var(--folder-color)] shadow-[0_14px_26px_rgba(15,23,42,0.18)]"
        >
          <span
            class="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.32),transparent_38%,rgba(255,255,255,0.08)_72%,transparent)]"
          />

          <span
            class="absolute inset-x-5 top-3 h-px bg-white/30"
          />
        </span>
      </button>
    </div>

    <div class="-mt-2 text-center">
      <h3 class="font-bold text-slate-950">
        {{ title }}
      </h3>

      <p class="mt-0.5 text-sm text-slate-400">
        {{ projectCountText }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.folder-stage {
  perspective: 900px;
}

.folder-tab {
  border-radius: 16px 16px 0 0;
  background: color-mix(
    in srgb,
    var(--folder-color) 85%,
    white
  );
}

.project-card {
  opacity: 0;
  pointer-events: none;
  transform:
    translateX(-50%)
    translateY(72px)
    rotate(0deg)
    scale(0.82);
  transform-origin: center bottom;
  transition:
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms ease,
    box-shadow 240ms ease;
}

.folder-stage.is-open .project-card {
  opacity: 1;
  pointer-events: auto;
  transform:
    translateX(calc(-50% + var(--card-x)))
    translateY(-22px)
    rotate(var(--card-rotate))
    scale(1);
  transition-delay: var(--card-delay);
}

.folder-stage.is-open .project-card:hover {
  z-index: 50 !important;
  transform:
    translateX(calc(-50% + var(--card-x)))
    translateY(-32px)
    rotate(var(--card-rotate))
    scale(1.04);
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.3);
}

.folder-front {
  transform: rotateX(0deg);
  transform-origin: center bottom;
  transition:
    transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 240ms ease;
}

.folder-button:hover .folder-front {
  filter: brightness(1.03);
}

.folder-button:focus-visible .folder-front {
  box-shadow:
    0 14px 26px rgba(15, 23, 42, 0.18),
    0 0 0 4px rgba(59, 130, 246, 0.16);
}

.folder-stage.is-open .folder-front {
  transform: rotateX(-18deg) translateY(5px);
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .folder-front {
    transition-duration: 1ms;
  }
}
</style>