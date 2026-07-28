type AuthActionResult = {
  success: boolean
  message: string
  requiresEmailConfirmation?: boolean
}

type RegisterWithEmailPayload = {
  displayName: string
  email: string
  password: string
}

type SupabaseAuthErrorLike = {
  code?: string
  message?: string
}

const getAuthErrorMessage = (error: unknown) => {
  const authError = error as SupabaseAuthErrorLike

  switch (authError.code) {
    case 'invalid_credentials':
      return '電子信箱或密碼不正確'

    case 'email_not_confirmed':
      return '電子信箱尚未完成驗證，請先查看驗證信'

    case 'email_exists':
    case 'user_already_exists':
      return '這個電子信箱已經註冊過了'

    case 'weak_password':
      return '密碼強度不足，請使用至少 8 個字元'

    case 'same_password':
      return '新密碼不能與目前密碼相同'

    case 'email_address_invalid':
      return '電子信箱格式不正確'

    case 'email_address_not_authorized':
      return '目前 Supabase 尚未允許寄信到這個電子信箱'

    case 'email_provider_disabled':
    case 'signup_disabled':
      return '目前尚未開放 Email 註冊'

    case 'over_email_send_rate_limit':
      return '信件寄送次數過多，請稍後再試'

    case 'over_request_rate_limit':
      return '操作次數過多，請稍後再試'

    case 'otp_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found':
      return '重設密碼連結已經過期，請重新申請'

    case 'bad_code_verifier':
      return '無法驗證重設密碼連結，請使用申請時的瀏覽器重新開啟'

    case 'session_expired':
    case 'session_not_found':
      return '重設密碼狀態已失效，請重新申請重設密碼信'

    case 'reauthentication_needed':
      return '基於安全考量，請重新驗證身分後再修改密碼'

    default:
      return authError.message || '驗證服務發生錯誤，請稍後再試'
  }
}

export const useAuthActions = () => {
  const supabase = useSupabaseClient()

  const isLoading = ref(false)
  const errorMessage = ref('')

  const clearAuthError = () => {
    errorMessage.value = ''
  }

  const getRedirectUrl = (path: string) => {
    if (import.meta.server) {
      return path
    }

    return new URL(path, window.location.origin).toString()
  }

  const executeAuthAction = async (
    action: () => Promise<AuthActionResult>,
  ): Promise<AuthActionResult> => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const result = await action()

      if (!result.success) {
        errorMessage.value = result.message
      }

      return result
    } catch (error: unknown) {
      const message = getAuthErrorMessage(error)

      errorMessage.value = message

      return {
        success: false,
        message,
      }
    } finally {
      isLoading.value = false
    }
  }

  const registerWithEmail = async (
    payload: RegisterWithEmailPayload,
  ): Promise<AuthActionResult> => {
    return executeAuthAction(async () => {
      const email = payload.email.trim().toLowerCase()
      const displayName = payload.displayName.trim()

      const { data, error } = await supabase.auth.signUp({
        email,
        password: payload.password,
        options: {
          emailRedirectTo: getRedirectUrl('/confirm'),
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) {
        throw error
      }

      const requiresEmailConfirmation = data.session === null

      return {
        success: true,
        requiresEmailConfirmation,
        message: requiresEmailConfirmation
          ? '註冊成功，驗證信已寄出，請前往信箱完成驗證'
          : '註冊成功',
      }
    })
  }

  const loginWithEmail = async (
    emailValue: string,
    password: string,
  ): Promise<AuthActionResult> => {
    return executeAuthAction(async () => {
      const email = emailValue.trim().toLowerCase()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.session || !data.user) {
        return {
          success: false,
          message: '登入失敗，沒有取得有效的登入狀態',
        }
      }

      return {
        success: true,
        message: '登入成功',
      }
    })
  }

  const resendConfirmationEmail = async (
    emailValue: string,
  ): Promise<AuthActionResult> => {
    return executeAuthAction(async () => {
      const email = emailValue.trim().toLowerCase()

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getRedirectUrl('/confirm'),
        },
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: '驗證信已重新寄出，請查看電子信箱',
      }
    })
  }

  // 忘記密碼：寄送重設密碼信
  const requestPasswordReset = async (
    emailValue: string,
  ): Promise<AuthActionResult> => {
    return executeAuthAction(async () => {
      const email = emailValue.trim().toLowerCase()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password'),
      })

      if (error) {
        throw error
      }

      // 不透露電子信箱是否已經註冊
      return {
        success: true,
        message: '如果這個電子信箱已註冊，我們會寄送一封重設密碼信',
      }
    })
  }

  // 重設密碼：更新目前 recovery session 的密碼
  const updatePassword = async (
    password: string,
  ): Promise<AuthActionResult> => {
    return executeAuthAction(async () => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        return {
          success: false,
          message: '密碼更新失敗，沒有取得有效的使用者資料',
        }
      }

      // 更新完成後登出目前瀏覽器的 recovery session
      await supabase.auth.signOut({
        scope: 'local',
      })

      return {
        success: true,
        message: '密碼已更新，請使用新密碼重新登入',
      }
    })
  }

  const logout = async (): Promise<AuthActionResult> => {
    return executeAuthAction(async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: '已登出',
      }
    })
  }

  return {
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    clearAuthError,
    registerWithEmail,
    loginWithEmail,
    resendConfirmationEmail,
    requestPasswordReset,
    updatePassword,
    logout,
  }
}