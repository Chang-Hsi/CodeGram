<script setup lang="ts">
import CardFolder from "~/components/common/card/CardFolder.vue"

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
    <CardFolder
      v-if="projects.length"
      class="mt-4"
      title="專案作品集"
      :projects="projects"
    />

    <div
      v-else
      class="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center"
    >
      <Icon
        name="lucide:folder-code"
        class="mx-auto size-8 text-slate-300"
      />

      <p class="mt-2 text-sm text-slate-400">
        尚未新增精選專案
      </p>
    </div>
  </section>
</template>
