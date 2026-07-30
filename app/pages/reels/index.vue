<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Reels｜CodeGram',
})
</script>

<template>
  <section
    class="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center rounded-xl bg-white px-4 py-20 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="text-center">
      <div
        class="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600"
      >
        <Icon
          name="lucide:clapperboard"
          class="size-8"
        />
      </div>

      <p class="mt-4 text-sm font-medium text-blue-600">
        REELS
      </p>

      <h1 class="mt-2 text-3xl font-bold text-slate-950">
        CodeGram Reels
      </h1>

      <p class="mt-3 text-sm leading-6 text-slate-500">
        Reels 頁面內容準備中。
      </p>
    </div>
  </section>
</template>
