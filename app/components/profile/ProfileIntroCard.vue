<script setup lang="ts">
withDefaults(
  defineProps<{
    bio?: string
    work?: string
    education?: string
    location?: string
    website?: string
    githubUrl?: string
    isOwnProfile?: boolean
  }>(),
  {
    bio: '',
    work: '',
    education: '',
    location: '',
    website: '',
    githubUrl: '',
    isOwnProfile: false,
  },
)

const getDisplayUrl = (url: string) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
}
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <h2 class="text-xl font-bold text-slate-950">
      個人簡介
    </h2>

    <p
      v-if="bio"
      class="mt-4 whitespace-pre-line text-center text-sm leading-6 text-slate-700"
    >
      {{ bio }}
    </p>

    <p
      v-else
      class="mt-4 text-center text-sm text-slate-400"
    >
      尚未填寫個人簡介
    </p>

    <NuxtLink
      v-if="isOwnProfile"
      to="/settings/profile"
      class="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      編輯個人簡介
    </NuxtLink>

    <ul class="mt-4 space-y-3 text-sm text-slate-700">
      <li
        v-if="work"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:briefcase-business"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <span>
          任職於
          <strong class="font-semibold text-slate-900">
            {{ work }}
          </strong>
        </span>
      </li>

      <li
        v-if="education"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:graduation-cap"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <span>
          就讀過
          <strong class="font-semibold text-slate-900">
            {{ education }}
          </strong>
        </span>
      </li>

      <li
        v-if="location"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:map-pin"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <span>
          居住在
          <strong class="font-semibold text-slate-900">
            {{ location }}
          </strong>
        </span>
      </li>

      <li
        v-if="website"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:globe"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <a
          :href="website"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 break-all font-semibold text-blue-600 hover:underline"
        >
          {{ getDisplayUrl(website) }}
        </a>
      </li>

      <li
        v-if="githubUrl"
        class="flex items-start gap-3"
      >
        <Icon
          name="simple-icons:github"
          class="mt-0.5 size-5 shrink-0 text-slate-700"
        />

        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 break-all font-semibold text-blue-600 hover:underline"
        >
          {{ getDisplayUrl(githubUrl) }}
        </a>
      </li>
    </ul>

    <NuxtLink
      v-if="isOwnProfile"
      to="/settings/profile"
      class="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      編輯詳細資料
    </NuxtLink>
  </section>
</template>