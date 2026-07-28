<template>
  <div class="min-h-dvh bg-neutral-100 text-neutral-950">
    <!-- 電腦版頂部導覽 -->
    <header
      class="sticky top-0 z-50 hidden h-14 border-b border-neutral-200 bg-white lg:block"
    >
      <div class="mx-auto flex h-full items-center justify-between px-4">
        <NuxtLink
          to="/"
          class="text-xl font-bold tracking-tight text-blue-600"
        >
          CodeGram
        </NuxtLink>

        <div class="w-full max-w-[520px] px-6">
          <div
            class="flex h-10 items-center rounded-full bg-neutral-100 px-4 text-sm text-neutral-500"
          >
            搜尋 CodeGram
          </div>
        </div>

        <NuxtLink
          to="/login"
          class="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          登入
        </NuxtLink>
      </div>
    </header>

    <!-- 手機版頂部導覽 -->
    <header
      class="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden"
    >
      <NuxtLink
        to="/"
        class="text-xl font-bold tracking-tight text-blue-600"
      >
        CodeGram
      </NuxtLink>

      <NuxtLink
        to="/login"
        class="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700"
      >
        登入
      </NuxtLink>
    </header>

    <div class="mx-auto flex w-full">
      <!-- 電腦版左側導覽 -->
      <aside
        class="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[280px] shrink-0 p-4 lg:block"
      >
        <nav class="space-y-2">
          <NuxtLink
            to="/"
            class="block rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm"
          >
            首頁
          </NuxtLink>

          <NuxtLink
            to="/reels"
            class="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-white"
          >
            Reels
          </NuxtLink>

          <div class="rounded-xl px-4 py-3 text-sm text-neutral-400">
            社團（尚未建立）
          </div>

          <div class="rounded-xl px-4 py-3 text-sm text-neutral-400">
            Marketplace（尚未建立）
          </div>
        </nav>
      </aside>

      <!-- 頁面主要內容 -->
      <main class="min-w-0 flex-1 pb-20 lg:pb-6">
        <slot />
      </main>

      <!-- 電腦版右側欄位 -->
      <aside
        class="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[320px] shrink-0 p-4 xl:block"
      >
        <div class="rounded-2xl bg-white p-4 shadow-sm">
          <h2 class="font-semibold text-neutral-900">
            CodeGram
          </h2>

          <p class="mt-2 text-sm leading-6 text-neutral-500">
            右側欄位未來將顯示推薦社團、熱門技術與聯絡人。
          </p>
        </div>
      </aside>
    </div>

    <!-- 手機版底部導覽 -->
    <nav
      class="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div class="grid h-16 grid-cols-3">
        <NuxtLink
          to="/"
          class="flex items-center justify-center text-sm font-medium text-blue-600"
        >
          首頁
        </NuxtLink>

        <NuxtLink
          to="/reels"
          class="flex items-center justify-center text-sm font-medium text-neutral-600"
        >
          Reels
        </NuxtLink>

        <NuxtLink
          to="/login"
          class="flex items-center justify-center text-sm font-medium text-neutral-600"
        >
          我的
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>