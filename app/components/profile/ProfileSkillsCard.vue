<script setup lang="ts">
withDefaults(
  defineProps<{
    skills?: string[]
    isOwnProfile?: boolean
  }>(),
  {
    skills: () => [],
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

    <div
      v-if="skills.length"
      class="mt-4 flex flex-wrap gap-2"
    >
      <span
        v-for="skill in skills"
        :key="skill"
        class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
      >
        {{ skill }}
      </span>
    </div>

    <p
      v-else
      class="mt-4 text-sm text-slate-400"
    >
      尚未新增技術專長
    </p>
  </section>
</template>