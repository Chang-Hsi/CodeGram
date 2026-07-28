<script setup lang="ts">
const formData = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const validationError = ref('')

const {
  isLoading,
  errorMessage,
  clearAuthError,
  registerWithEmail,
} = useAuthActions()

const handleSubmit = async () => {
  validationError.value = ''
  clearAuthError()

  if (formData.password.length < 8) {
    validationError.value = '密碼至少需要 8 個字元。'
    return
  }

  if (formData.password !== formData.confirmPassword) {
    validationError.value = '兩次輸入的密碼不一致。'
    return
  }

  if (!formData.acceptedTerms) {
    validationError.value = '請先同意服務條款與隱私權政策。'
    return
  }

  const result = await registerWithEmail({
    displayName: formData.displayName,
    email: formData.email,
    password: formData.password,
  })

  if (!result.success) {
    return
  }

  if (result.requiresEmailConfirmation) {
    await navigateTo({
      path: '/confirm',
      query: {
        email: formData.email.trim().toLowerCase(),
      },
    })
    return
  }

  await navigateTo('/')
}

watch(
  () => [
    formData.displayName,
    formData.email,
    formData.password,
    formData.confirmPassword,
    formData.acceptedTerms,
  ],
  () => {
    validationError.value = ''
    clearAuthError()
  },
)

useSeoMeta({
  title: '建立帳號｜CodeGram',
  description: '註冊 CodeGram 軟體工程師社群',
})

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <AuthShell>
    <AuthFormCard
      title="建立 CodeGram 帳號"
      description="加入軟體工程師社群，分享技術、作品與開發經驗。"
    >
      <form
        class="space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <label
            for="register-display-name"
            class="text-sm font-medium text-slate-700"
          >
            顯示名稱
          </label>

          <input
            id="register-display-name"
            v-model.trim="formData.displayName"
            type="text"
            name="displayName"
            autocomplete="nickname"
            required
            placeholder="例如：Vue 開發者小明"
            class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
        </div>

        <div class="space-y-2">
          <label
            for="register-email"
            class="text-sm font-medium text-slate-700"
          >
            電子信箱
          </label>

          <input
            id="register-email"
            v-model.trim="formData.email"
            type="email"
            name="email"
            autocomplete="email"
            required
            placeholder="name@example.com"
            class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          >
        </div>

        <div class="space-y-2">
          <label
            for="register-password"
            class="text-sm font-medium text-slate-700"
          >
            密碼
          </label>

          <div class="relative">
            <input
              id="register-password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="new-password"
              minlength="8"
              required
              placeholder="至少輸入 8 個字元"
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >

            <button
              type="button"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
              :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="size-5"
              />
            </button>
          </div>

          <p class="text-xs text-slate-400">
            密碼至少需要 8 個字元。
          </p>
        </div>

        <div class="space-y-2">
          <label
            for="register-confirm-password"
            class="text-sm font-medium text-slate-700"
          >
            確認密碼
          </label>

          <div class="relative">
            <input
              id="register-confirm-password"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              name="confirmPassword"
              autocomplete="new-password"
              minlength="8"
              required
              placeholder="請再次輸入密碼"
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >

            <button
              type="button"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
              :aria-label="showConfirmPassword ? '隱藏確認密碼' : '顯示確認密碼'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="size-5"
              />
            </button>
          </div>
        </div>

        <label class="flex cursor-pointer items-start gap-3">
          <input
            v-model="formData.acceptedTerms"
            type="checkbox"
            name="acceptedTerms"
            required
            class="mt-0.5 size-4 shrink-0 accent-blue-600"
          >

          <span class="text-sm leading-5 text-slate-500">
            我已閱讀並同意 CodeGram 的服務條款與隱私權政策。
          </span>
        </label>

        <div
          v-if="validationError || errorMessage"
          role="alert"
          class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          <Icon
            name="lucide:circle-alert"
            class="mt-0.5 size-4 shrink-0"
          />

          <span>{{ validationError || errorMessage }}</span>
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
            {{ isLoading ? '建立帳號中…' : '建立帳號' }}
          </span>
        </button>
      </form>

      <template #footer>
        <p class="text-center text-sm text-slate-500">
          已經有帳號？

          <NuxtLink
            to="/login"
            class="font-semibold text-blue-600 hover:text-blue-500"
          >
            返回登入
          </NuxtLink>
        </p>
      </template>
    </AuthFormCard>
  </AuthShell>
</template>