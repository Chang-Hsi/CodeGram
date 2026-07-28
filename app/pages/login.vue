<script setup lang="ts">
const route = useRoute()

const formData = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)

const {
  isLoading,
  errorMessage,
  clearAuthError,
  loginWithEmail,
} = useAuthActions()

const redirectPath = computed(() => {
  const redirect = route.query.redirect

  if (
    typeof redirect !== 'string'
    || !redirect.startsWith('/')
    || redirect.startsWith('//')
  ) {
    return '/'
  }

  return redirect
})

const handleSubmit = async () => {
  clearAuthError()

  const result = await loginWithEmail(
    formData.email,
    formData.password,
  )

  if (!result.success) {
    return
  }

  await navigateTo(redirectPath.value, {
    replace: true,
  })
}

watch(
  () => [
    formData.email,
    formData.password,
  ],
  () => {
    clearAuthError()
  },
)

useSeoMeta({
  title: '登入｜CodeGram',
  description: '登入 CodeGram 軟體工程師社群',
})

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <AuthShell>
    <AuthFormCard
      title="歡迎回來"
      description="登入帳號，繼續參與工程師社群的技術交流。"
    >
      <form
        class="space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <label
            for="login-email"
            class="text-sm font-medium text-slate-700"
          >
            電子信箱
          </label>

          <input
            id="login-email"
            v-model.trim="formData.email"
            type="email"
            name="email"
            autocomplete="email"
            required
            placeholder="name@example.com"
            :disabled="isLoading"
            class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-4">
            <label
              for="login-password"
              class="text-sm font-medium text-slate-700"
            >
              密碼
            </label>

            <NuxtLink
              to="/forgot-password"
              class="text-sm font-medium text-blue-600 transition hover:text-blue-500"
            >
              忘記密碼？
            </NuxtLink>
          </div>

          <div class="relative">
            <input
              id="login-password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              required
              placeholder="請輸入密碼"
              :disabled="isLoading"
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >

            <button
              type="button"
              :disabled="isLoading"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="size-5"
              />
            </button>
          </div>
        </div>

        <div
          v-if="errorMessage"
          role="alert"
          class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          <Icon
            name="lucide:circle-alert"
            class="mt-0.5 size-4 shrink-0"
          />

          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          <Icon
            v-if="isLoading"
            name="lucide:loader-circle"
            class="size-4 animate-spin"
          />

          <span>
            {{ isLoading ? '登入中…' : '登入' }}
          </span>
        </button>
      </form>

      <template #footer>
        <p class="text-center text-sm text-slate-500">
          還沒有帳號？

          <NuxtLink
            to="/register"
            class="font-semibold text-blue-600 transition hover:text-blue-500"
          >
            建立帳號
          </NuxtLink>
        </p>
      </template>
    </AuthFormCard>
  </AuthShell>
</template>