<script setup lang="ts">
const route = useRoute()
const postId = computed(() => String(route.params.id ?? ''))

useSeoMeta({
  title: () => `貼文 ${postId.value} · CodeGram`,
})
</script>

<template>
  <main class="min-h-dvh bg-slate-100 px-4 py-8">
    <section class="mx-auto max-w-[680px] rounded-2xl bg-white p-6 shadow-sm">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        返回動態牆
      </NuxtLink>

      <div class="mt-8 text-center">
        <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon name="lucide:file-text" class="size-6" />
        </span>
        <h1 class="mt-4 text-xl font-bold text-slate-950">
          CodeGram 貼文
        </h1>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          貼文 ID：<code class="break-all rounded bg-slate-100 px-1.5 py-0.5">{{ postId }}</code>
        </p>
        <p class="mt-2 text-sm text-slate-500">
          此穩定網址已可分享；接上貼文查詢 API 後，這裡會載入完整貼文與留言。
        </p>
      </div>
    </section>
  </main>
</template>
