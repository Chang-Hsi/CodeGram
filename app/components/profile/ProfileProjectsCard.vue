<script setup lang="ts">
interface ProfileProject {
  id: number | string
  name: string
  description: string
  technologies: string[]
  url?: string
  accentColor?: string
}

withDefaults(
  defineProps<{
    projects?: ProfileProject[]
    isOwnProfile?: boolean
  }>(),
  {
    projects: () => [],
    isOwnProfile: false,
  },
)
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl font-bold text-slate-950">
        精選專案
      </h2>

      <button
        v-if="projects.length > 2"
        type="button"
        class="text-sm font-semibold text-blue-600 hover:underline"
      >
        查看全部
      </button>
    </div>

    <div
      v-if="projects.length"
      class="mt-4 space-y-3"
    >
      <component
        :is="project.url ? 'a' : 'article'"
        v-for="project in projects.slice(0, 2)"
        :key="project.id"
        :href="project.url"
        :target="project.url ? '_blank' : undefined"
        :rel="project.url ? 'noopener noreferrer' : undefined"
        class="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
      >
        <div
          class="h-2"
          :style="{
            backgroundColor: project.accentColor || '#2563eb',
          }"
        />

        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3
                class="truncate font-semibold text-slate-950 group-hover:text-blue-600"
              >
                {{ project.name }}
              </h3>

              <p class="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                {{ project.description }}
              </p>
            </div>

            <Icon
              v-if="project.url"
              name="lucide:external-link"
              class="mt-0.5 size-4 shrink-0 text-slate-400"
            />
          </div>

          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="technology in project.technologies"
              :key="technology"
              class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            >
              {{ technology }}
            </span>
          </div>
        </div>
      </component>
    </div>

    <p
      v-else
      class="mt-4 text-sm text-slate-400"
    >
      尚未新增精選專案
    </p>

    <button
      v-if="isOwnProfile"
      type="button"
      class="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      新增精選專案
    </button>
  </section>
</template>