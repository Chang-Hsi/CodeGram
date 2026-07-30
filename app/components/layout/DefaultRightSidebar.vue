<script setup lang="ts">
const contacts = [
  {
    name: 'Yu-Ting Lin',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=85',
  },
  {
    name: 'Alex Chen',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=85',
  },
  {
    name: 'Mina Wang',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=85',
  },
  {
    name: 'Kevin Wu',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=85',
  },
]
</script>

<template>
  <aside
    class="sticky top-[72px] hidden max-h-[calc(100dvh-88px)] overflow-y-auto pl-2 xl:block"
  >
    <section>
      <h2 class="px-2 text-[17px] font-semibold text-slate-500">
        贊助
      </h2>

      <a
        href="#"
        class="mt-2 grid grid-cols-[112px_1fr] items-center gap-3 rounded-lg p-2 transition hover:bg-slate-200/80"
      >
        <div
          class="h-28 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 p-3 text-white"
        >
          <Icon
            name="lucide:rocket"
            class="size-7"
          />

          <p class="mt-5 text-sm font-bold">
            前端開發者大會
          </p>
        </div>

        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-900">
            2026 Frontend Summit
          </p>

          <p class="mt-1 text-xs text-slate-500">
            frontend-summit.dev
          </p>
        </div>
      </a>

      <a
        href="#"
        class="mt-1 grid grid-cols-[112px_1fr] items-center gap-3 rounded-lg p-2 transition hover:bg-slate-200/80"
      >
        <div
          class="flex h-28 flex-col justify-between overflow-hidden rounded-lg bg-amber-300 p-3 text-slate-950"
        >
          <Icon
            name="lucide:graduation-cap"
            class="size-7"
          />

          <p class="text-sm font-black">
            Nuxt 實戰工作坊
          </p>
        </div>

        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-900">
            輸入優惠碼 CODEGRAM
          </p>

          <p class="mt-1 text-xs text-slate-500">
            nuxt-workshop.tw
          </p>
        </div>
      </a>
    </section>

    <div class="my-4 h-px bg-slate-300" />

    <section>
      <div class="flex items-center justify-between px-2">
        <h2 class="text-[17px] font-semibold text-slate-500">
          聯絡人
        </h2>

        <div class="flex items-center gap-1">
          <button
            type="button"
            aria-label="搜尋聯絡人"
            class="flex size-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200"
          >
            <Icon
              name="lucide:search"
              class="size-4.5"
            />
          </button>

          <button
            type="button"
            aria-label="聯絡人選項"
            class="flex size-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200"
          >
            <Icon
              name="lucide:ellipsis"
              class="size-5"
            />
          </button>
        </div>
      </div>

      <button
        v-for="contact in contacts"
        :key="contact.name"
        type="button"
        class="flex min-h-12 w-full items-center gap-3 rounded-lg px-2 text-left transition hover:bg-slate-200/80"
      >
        <span class="relative size-9 shrink-0">
          <img
            :src="contact.avatar"
            :alt="contact.name"
            class="size-full rounded-full object-cover"
          >

          <span
            class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#f0f2f5] bg-emerald-500"
          />
        </span>

        <span class="truncate text-[15px] font-semibold text-slate-900">
          {{ contact.name }}
        </span>
      </button>
    </section>
  </aside>
</template>
