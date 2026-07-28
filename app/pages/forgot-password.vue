<script setup lang="ts">
const email = ref('')
const isSubmitted = ref(false)
const statusMessage = ref('')

const {
  isLoading,
  errorMessage,
  clearAuthError,
  requestPasswordReset,
} = useAuthActions()

const sendPasswordResetEmail = async (
  successMessage?: string,
) => {
  if (isLoading.value) {
    return
  }

  clearAuthError()
  statusMessage.value = ''

  const result = await requestPasswordReset(email.value)

  if (!result.success) {
    return
  }

  statusMessage.value = successMessage || result.message
  isSubmitted.value = true
}

const handleSubmit = async () => {
  await sendPasswordResetEmail()
}

const handleResend = async () => {
  await sendPasswordResetEmail(
    '重設密碼信已重新寄出，請查看電子信箱',
  )
}

const handleChangeEmail = () => {
  clearAuthError()
  statusMessage.value = ''
  isSubmitted.value = false
}

watch(email, () => {
  if (!isSubmitted.value) {
    clearAuthError()
  }
})

useSeoMeta({
  title: '忘記密碼｜CodeGram',
  description: '申請重設 CodeGram 帳號密碼',
})

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <AuthShell>
    <AuthFormCard
      :title="isSubmitted ? '請查看電子信箱' : '忘記密碼？'"
      :description="
        isSubmitted
          ? '我們已寄出重設密碼信，請依照信件中的說明設定新密碼。'
          : '輸入註冊時使用的電子信箱，我們會寄送重設密碼連結。'
      "
    >
      <!-- 尚未寄出重設密碼信 -->
      <form
        v-if="!isSubmitted"
        class="space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <label
            for="forgot-password-email"
            class="text-sm font-medium text-slate-700"
          >
            電子信箱
          </label>

          <div class="relative">
            <Icon
              name="lucide:mail"
              class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />

            <input
              id="forgot-password-email"
              v-model.trim="email"
              type="email"
              name="email"
              autocomplete="email"
              required
              placeholder="name@example.com"
              :disabled="isLoading"
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
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

          <Icon
            v-else
            name="lucide:send"
            class="size-4"
          />

          <span>
            {{ isLoading ? '寄送中…' : '寄送重設密碼信' }}
          </span>
        </button>
      </form>

      <!-- 已寄出重設密碼信 -->
      <div
        v-else
        class="space-y-6"
      >
        <div class="flex justify-center">
          <div class="flex size-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Icon
              name="lucide:mail-check"
              class="size-9"
            />
          </div>
        </div>

        <div class="space-y-3 text-center">
          <p class="text-sm leading-6 text-slate-500">
            重設密碼信將寄送至
          </p>

          <p class="break-all text-sm font-semibold text-slate-950">
            {{ email }}
          </p>

          <p class="text-sm leading-6 text-slate-500">
            請點擊信件中的連結，返回 CodeGram 設定新密碼。
          </p>
        </div>

        <div
          v-if="statusMessage"
          role="status"
          class="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <Icon
            name="lucide:circle-check"
            class="mt-0.5 size-4 shrink-0"
          />

          <span>{{ statusMessage }}</span>
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

        <div class="space-y-3">
          <button
            type="button"
            :disabled="isLoading"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleResend"
          >
            <Icon
              v-if="isLoading"
              name="lucide:loader-circle"
              class="size-4 animate-spin"
            />

            <Icon
              v-else
              name="lucide:refresh-cw"
              class="size-4"
            />

            <span>
              {{ isLoading ? '寄送中…' : '重新寄送' }}
            </span>
          </button>

          <button
            type="button"
            :disabled="isLoading"
            class="flex h-11 w-full items-center justify-center text-sm font-medium text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleChangeEmail"
          >
            使用其他電子信箱
          </button>
        </div>
      </div>

      <template #footer>
        <p class="text-center text-sm text-slate-500">
          想起密碼了？

          <NuxtLink
            to="/login"
            class="font-semibold text-blue-600 transition hover:text-blue-500"
          >
            返回登入
          </NuxtLink>
        </p>
      </template>
    </AuthFormCard>
  </AuthShell>
</template>