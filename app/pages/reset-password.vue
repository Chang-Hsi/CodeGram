<script setup lang="ts">
type PasswordResetState =
  | 'checking'
  | 'form'
  | 'success'
  | 'failed'

const route = useRoute()
const supabase = useSupabaseClient()

const {
  isLoading,
  errorMessage,
  clearAuthError,
  updatePassword,
} = useAuthActions()

const formData = reactive({
  password: '',
  confirmPassword: '',
})

const passwordResetState = ref<PasswordResetState>('checking')
const localErrorMessage = ref('')
const successMessage = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

let verificationTimer: ReturnType<typeof setTimeout> | undefined
let redirectTimer: ReturnType<typeof setTimeout> | undefined
let unsubscribeAuth: (() => void) | undefined

const displayedErrorMessage = computed(() => {
  return localErrorMessage.value || errorMessage.value
})

const callbackErrorMessage = computed(() => {
  const queryError = route.query.error
  const queryErrorCode = route.query.error_code
  const queryErrorDescription = route.query.error_description

  if (
    typeof queryError === 'string'
    || typeof queryErrorCode === 'string'
    || typeof queryErrorDescription === 'string'
  ) {
    return '重設密碼連結無效或已經過期，請重新申請。'
  }

  if (import.meta.client && route.hash) {
    const hashParams = new URLSearchParams(route.hash.slice(1))

    if (
      hashParams.get('error')
      || hashParams.get('error_code')
      || hashParams.get('error_description')
    ) {
      return '重設密碼連結無效或已經過期，請重新申請。'
    }
  }

  return ''
})

const clearTimers = () => {
  if (verificationTimer) {
    clearTimeout(verificationTimer)
    verificationTimer = undefined
  }

  if (redirectTimer) {
    clearTimeout(redirectTimer)
    redirectTimer = undefined
  }
}

const markSessionReady = () => {
  if (passwordResetState.value !== 'checking') {
    return
  }

  if (verificationTimer) {
    clearTimeout(verificationTimer)
    verificationTimer = undefined
  }

  passwordResetState.value = 'form'
}

const handleSubmit = async () => {
  if (isLoading.value) {
    return
  }

  clearAuthError()
  localErrorMessage.value = ''
  successMessage.value = ''

  if (formData.password.length < 8) {
    localErrorMessage.value = '密碼至少需要 8 個字元'
    return
  }

  if (formData.password !== formData.confirmPassword) {
    localErrorMessage.value = '兩次輸入的密碼不一致'
    return
  }

  const result = await updatePassword(formData.password)

  if (!result.success) {
    return
  }

  successMessage.value = result.message
  passwordResetState.value = 'success'

  redirectTimer = setTimeout(() => {
    void navigateTo('/login', {
      replace: true,
    })
  }, 2500)
}

watch(
  () => [
    formData.password,
    formData.confirmPassword,
  ],
  () => {
    localErrorMessage.value = ''
    clearAuthError()
  },
)

onMounted(async () => {
  if (callbackErrorMessage.value) {
    passwordResetState.value = 'failed'
    return
  }

  // 先監聽 Supabase 的 recovery session 事件
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (
      session
      && (
        event === 'PASSWORD_RECOVERY'
        || event === 'SIGNED_IN'
        || event === 'INITIAL_SESSION'
      )
    ) {
      markSessionReady()
    }
  })

  unsubscribeAuth = () => {
    data.subscription.unsubscribe()
  }

  // 避免頁面掛載前 session 已經建立，導致漏接事件
  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    passwordResetState.value = 'failed'
    return
  }

  if (sessionData.session) {
    markSessionReady()
    return
  }

  // 等待 Supabase 處理網址中的 PKCE recovery code
  verificationTimer = setTimeout(() => {
    if (passwordResetState.value === 'checking') {
      passwordResetState.value = 'failed'
    }
  }, 10000)
})

onBeforeUnmount(() => {
  clearTimers()
  unsubscribeAuth?.()
})

useSeoMeta({
  title: '重設密碼｜CodeGram',
  description: '設定新的 CodeGram 帳號密碼',
})

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <AuthShell>
    <!-- 正在驗證連結 -->
    <AuthFormCard
      v-if="passwordResetState === 'checking'"
      title="正在驗證連結"
      description="請稍候，我們正在確認這個重設密碼連結。"
    >
      <div class="py-4 text-center">
        <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon
            name="lucide:loader-circle"
            class="size-9 animate-spin"
          />
        </div>

        <p class="mt-6 text-sm leading-6 text-slate-500">
          驗證完成後即可設定新密碼。
        </p>
      </div>
    </AuthFormCard>

    <!-- 設定新密碼 -->
    <AuthFormCard
      v-else-if="passwordResetState === 'form'"
      title="建立新密碼"
      description="請設定至少 8 個字元的新密碼。"
    >
      <form
        class="space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <label
            for="reset-password"
            class="text-sm font-medium text-slate-700"
          >
            新密碼
          </label>

          <div class="relative">
            <Icon
              name="lucide:lock-keyhole"
              class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />

            <input
              id="reset-password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="new-password"
              required
              minlength="8"
              placeholder="請輸入至少 8 個字元"
              :disabled="isLoading"
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >

            <button
              type="button"
              :disabled="isLoading"
              :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                class="size-5"
              />
            </button>
          </div>
        </div>

        <!-- 21st.dev 風格密碼強度顯示 -->
        <AuthPasswordStrengthMeter
          :password="formData.password"
        />

        <div class="space-y-2">
          <label
            for="reset-password-confirmation"
            class="text-sm font-medium text-slate-700"
          >
            確認新密碼
          </label>

          <div class="relative">
            <Icon
              name="lucide:lock-keyhole"
              class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />

            <input
              id="reset-password-confirmation"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              name="password-confirmation"
              autocomplete="new-password"
              required
              minlength="8"
              placeholder="請再次輸入新密碼"
              :disabled="isLoading"
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-14 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >

            <button
              type="button"
              :disabled="isLoading"
              :aria-label="
                showConfirmPassword
                  ? '隱藏確認密碼'
                  : '顯示確認密碼'
              "
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="
                  showConfirmPassword
                    ? 'lucide:eye-off'
                    : 'lucide:eye'
                "
                class="size-5"
              />
            </button>
          </div>

          <p
            v-if="
              formData.confirmPassword
              && formData.password === formData.confirmPassword
            "
            class="flex items-center gap-1.5 text-xs text-emerald-600"
          >
            <Icon
              name="lucide:circle-check"
              class="size-3.5"
            />

            兩次輸入的密碼一致
          </p>
        </div>

        <div
          v-if="displayedErrorMessage"
          role="alert"
          class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          <Icon
            name="lucide:circle-alert"
            class="mt-0.5 size-4 shrink-0"
          />

          <span>{{ displayedErrorMessage }}</span>
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
            name="lucide:key-round"
            class="size-4"
          />

          <span>
            {{ isLoading ? '更新中…' : '更新密碼' }}
          </span>
        </button>
      </form>

      <template #footer>
        <p class="text-center text-sm text-slate-500">
          不想修改密碼？

          <NuxtLink
            to="/login"
            class="font-semibold text-blue-600 transition hover:text-blue-500"
          >
            返回登入
          </NuxtLink>
        </p>
      </template>
    </AuthFormCard>

    <!-- 密碼更新成功 -->
    <AuthFormCard
      v-else-if="passwordResetState === 'success'"
      title="密碼已更新"
      description="現在可以使用新密碼登入 CodeGram。"
    >
      <div class="space-y-6 text-center">
        <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon
            name="lucide:circle-check"
            class="size-9"
          />
        </div>

        <div
          role="status"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {{ successMessage }}
        </div>

        <p class="text-sm text-slate-500">
          即將返回登入頁面……
        </p>

        <NuxtLink
          to="/login"
          replace
          class="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
        >
          立即前往登入
        </NuxtLink>
      </div>
    </AuthFormCard>

    <!-- 重設連結無效 -->
    <AuthFormCard
      v-else
      title="重設連結無效"
      description="這個重設密碼連結可能已經失效或使用過。"
    >
      <div class="space-y-6 text-center">
        <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Icon
            name="lucide:circle-alert"
            class="size-9"
          />
        </div>

        <p class="text-sm leading-6 text-slate-500">
          {{
            callbackErrorMessage
            || '沒有取得有效的重設密碼狀態，請重新申請重設密碼信。'
          }}
        </p>

        <NuxtLink
          to="/forgot-password"
          class="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
        >
          重新申請重設密碼信
        </NuxtLink>

        <NuxtLink
          to="/login"
          class="block text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          返回登入
        </NuxtLink>
      </div>
    </AuthFormCard>
  </AuthShell>
</template>