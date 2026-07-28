<template>
  <div class="min-h-dvh bg-neutral-950 text-white">
    <header
      class="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4"
    >
      <NuxtLink
        to="/"
        class="rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur"
      >
        返回首頁
      </NuxtLink>

      <span class="font-semibold">
        CodeGram
      </span>
    </header>

    <main class="min-h-dvh">
      <slot />
    </main>
  </div>
</template>