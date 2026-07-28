<script setup lang="ts">
type ConfirmationState = "waiting" | "verifying" | "failed";

const route = useRoute();
const user = useSupabaseUser();

const { isLoading, errorMessage, clearAuthError, resendConfirmationEmail } =
  useAuthActions();

const confirmationState = ref<ConfirmationState>("verifying");
const successMessage = ref("");

let verificationTimer: ReturnType<typeof setTimeout> | undefined;

const email = computed(() => {
  const queryEmail = route.query.email;

  if (typeof queryEmail !== "string") {
    return "";
  }

  return queryEmail.trim().toLowerCase();
});

const callbackError = computed(() => {
  const queryError = route.query.error;
  const queryErrorDescription = route.query.error_description;

  if (
    typeof queryError === "string" ||
    typeof queryErrorDescription === "string"
  ) {
    return "驗證連結無效或已經過期，請重新申請驗證信。";
  }

  if (import.meta.client && route.hash) {
    const hashParams = new URLSearchParams(route.hash.slice(1));

    if (hashParams.get("error") || hashParams.get("error_description")) {
      return "驗證連結無效或已經過期，請重新申請驗證信。";
    }
  }

  return "";
});

const clearVerificationTimer = () => {
  if (!verificationTimer) {
    return;
  }

  clearTimeout(verificationTimer);
  verificationTimer = undefined;
};

const handleResendConfirmation = async () => {
  if (!email.value || isLoading.value) {
    return;
  }

  successMessage.value = "";
  clearAuthError();

  const result = await resendConfirmationEmail(email.value);

  if (!result.success) {
    return;
  }

  successMessage.value = result.message;
};

watch(
  user,
  (currentUser) => {
    if (!currentUser) {
      return;
    }

    clearVerificationTimer();
    void navigateTo("/");
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  if (callbackError.value) {
    confirmationState.value = "failed";
    return;
  }

  if (email.value) {
    confirmationState.value = "waiting";
    return;
  }

  confirmationState.value = "verifying";

  verificationTimer = setTimeout(() => {
    if (!user.value) {
      confirmationState.value = "failed";
    }
  }, 10000);
});

onBeforeUnmount(() => {
  clearVerificationTimer();
});

useSeoMeta({
  title: "驗證電子信箱｜CodeGram",
  description: "完成 CodeGram 電子信箱驗證",
});

definePageMeta({
  layout: "auth",
});
</script>

<template>
  <AuthShell>
    <div class="w-full max-w-md">
      <!-- 註冊完成：票券式確認卡 -->
      <section
        v-if="confirmationState === 'waiting'"
        class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-950/5"
      >
        <div class="relative overflow-hidden px-7 pb-7 pt-8 text-center">
          <!-- 飄落彩紙動畫 -->
          <div aria-hidden="true" class="confetti-container">
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
            <span class="confetti-piece" />
          </div>

          <div
            class="relative z-10 mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60"
          >
            <Icon name="lucide:check" class="size-10" />
          </div>

          <p
            class="relative z-10 mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600"
          >
            Registration complete
          </p>

          <h1
            class="relative z-10 mt-2 text-2xl font-bold tracking-tight text-slate-950"
          >
            註冊申請已送出
          </h1>

          <p class="relative z-10 mt-3 text-sm leading-6 text-slate-500">
            我們已將驗證信寄送至你的電子信箱
          </p>
        </div>

        <!-- 票券分隔線與左右缺口 -->
        <div class="relative border-t border-dashed border-slate-300">
          <span
            aria-hidden="true"
            class="absolute -left-3.5 top-1/2 size-7 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50"
          />
          <span
            aria-hidden="true"
            class="absolute -right-3.5 top-1/2 size-7 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50"
          />
        </div>

        <div class="px-7 py-7">
          <dl class="space-y-5">
            <div>
              <dt
                class="text-xs font-medium uppercase tracking-wider text-slate-400"
              >
                電子信箱
              </dt>

              <dd class="mt-1 break-all text-sm font-semibold text-slate-950">
                {{ email }}
              </dd>
            </div>

            <div class="grid grid-cols-2 gap-5">
              <div>
                <dt
                  class="text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  目前狀態
                </dt>

                <dd
                  class="mt-1 flex items-center gap-2 text-sm font-semibold text-amber-600"
                >
                  <span class="size-2 rounded-full bg-amber-400" />
                  等待信箱驗證
                </dd>
              </div>

              <div>
                <dt
                  class="text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  下一步
                </dt>

                <dd class="mt-1 text-sm font-semibold text-slate-950">
                  開啟驗證信
                </dd>
              </div>
            </div>
          </dl>

          <div class="my-6 border-t border-slate-100" />

          <p class="text-center text-sm leading-6 text-slate-500">
            請點擊信件中的驗證連結。完成後，系統會自動登入並返回 CodeGram 首頁。
          </p>

          <div
            v-if="successMessage"
            role="status"
            class="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <Icon name="lucide:circle-check" class="mt-0.5 size-4 shrink-0" />

            <span>{{ successMessage }}</span>
          </div>

          <div
            v-if="errorMessage"
            role="alert"
            class="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <Icon name="lucide:circle-alert" class="mt-0.5 size-4 shrink-0" />

            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="button"
            :disabled="isLoading"
            class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:bg-blue-400"
            @click="handleResendConfirmation"
          >
            <Icon
              v-if="isLoading"
              name="lucide:loader-circle"
              class="size-4 animate-spin"
            />

            <Icon v-else name="lucide:send" class="size-4" />

            <span>
              {{ isLoading ? "寄送中…" : "重新寄送驗證信" }}
            </span>
          </button>

          <!-- 參考原元件的票券條碼區，僅作視覺裝飾 -->
          <div class="mt-7 text-center">
            <div
              aria-hidden="true"
              class="ticket-barcode mx-auto h-9 w-44 opacity-75"
            />

            <p
              class="mt-2 text-[10px] font-medium tracking-[0.2em] text-slate-400"
            >
              CODEGRAM · EMAIL VERIFICATION
            </p>
          </div>
        </div>
      </section>

      <!-- 點擊驗證信後等待 Supabase 建立登入狀態 -->
      <section
        v-else-if="confirmationState === 'verifying'"
        class="rounded-[28px] border border-slate-200 bg-white px-7 py-10 text-center shadow-xl shadow-slate-950/5"
      >
        <div
          class="mx-auto flex size-20 items-center justify-center rounded-full bg-blue-50 text-blue-600"
        >
          <Icon name="lucide:loader-circle" class="size-9 animate-spin" />
        </div>

        <h1 class="mt-7 text-2xl font-bold tracking-tight text-slate-950">
          正在完成信箱驗證
        </h1>

        <p class="mt-3 text-sm leading-6 text-slate-500">
          請稍候，驗證完成後會自動返回首頁。
        </p>
      </section>

      <!-- 驗證失敗 -->
      <section
        v-else
        class="rounded-[28px] border border-slate-200 bg-white px-7 py-10 text-center shadow-xl shadow-slate-950/5"
      >
        <div
          class="mx-auto flex size-20 items-center justify-center rounded-full bg-red-50 text-red-600"
        >
          <Icon name="lucide:circle-alert" class="size-9" />
        </div>

        <h1 class="mt-7 text-2xl font-bold tracking-tight text-slate-950">
          無法完成信箱驗證
        </h1>

        <p class="mt-3 text-sm leading-6 text-slate-500">
          {{
            callbackError || "沒有取得有效的驗證資訊，驗證連結可能已經失效。"
          }}
        </p>

        <NuxtLink
          to="/register"
          class="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
        >
          重新註冊
        </NuxtLink>
      </section>

      <p class="mt-6 text-center text-sm text-slate-500">
        已經完成驗證？

        <NuxtLink
          to="/login"
          class="font-semibold text-blue-600 transition hover:text-blue-500"
        >
          返回登入
        </NuxtLink>
      </p>
    </div>
  </AuthShell>
</template>

<style scoped>
.ticket-barcode {
  background-image: repeating-linear-gradient(
    90deg,
    #0f172a 0,
    #0f172a 2px,
    transparent 2px,
    transparent 5px,
    #0f172a 5px,
    #0f172a 6px,
    transparent 6px,
    transparent 10px
  );
}

.confetti-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: -18px;
  display: block;
  width: 6px;
  height: 11px;
  border-radius: 2px;
  opacity: 0;
  animation-name: confetti-fall;
  animation-duration: 3.8s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.confetti-piece:nth-child(1) {
  left: 9%;
  background: #3b82f6;
  animation-delay: -0.4s;
}

.confetti-piece:nth-child(2) {
  left: 17%;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #f59e0b;
  animation-delay: -2.2s;
  animation-duration: 4.4s;
}

.confetti-piece:nth-child(3) {
  left: 26%;
  background: #10b981;
  animation-delay: -1.2s;
  animation-duration: 3.3s;
}

.confetti-piece:nth-child(4) {
  left: 35%;
  width: 8px;
  height: 5px;
  background: #8b5cf6;
  animation-delay: -3.1s;
  animation-duration: 4.1s;
}

.confetti-piece:nth-child(5) {
  left: 44%;
  background: #ef4444;
  animation-delay: -0.8s;
  animation-duration: 3.6s;
}

.confetti-piece:nth-child(6) {
  left: 53%;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #06b6d4;
  animation-delay: -2.7s;
  animation-duration: 4.6s;
}

.confetti-piece:nth-child(7) {
  left: 62%;
  background: #f97316;
  animation-delay: -1.6s;
  animation-duration: 3.5s;
}

.confetti-piece:nth-child(8) {
  left: 70%;
  width: 8px;
  height: 5px;
  background: #22c55e;
  animation-delay: -3.4s;
  animation-duration: 4.3s;
}

.confetti-piece:nth-child(9) {
  left: 78%;
  background: #6366f1;
  animation-delay: -0.2s;
  animation-duration: 3.9s;
}

.confetti-piece:nth-child(10) {
  left: 86%;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #eab308;
  animation-delay: -2s;
  animation-duration: 4.5s;
}

.confetti-piece:nth-child(11) {
  left: 22%;
  background: #ec4899;
  animation-delay: -3.5s;
  animation-duration: 4.2s;
}

.confetti-piece:nth-child(12) {
  left: 74%;
  background: #14b8a6;
  animation-delay: -1s;
  animation-duration: 3.7s;
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -16px, 0) rotate(0deg);
  }

  12% {
    opacity: 1;
  }

  45% {
    transform: translate3d(18px, 75px, 0) rotate(190deg);
  }

  75% {
    opacity: 1;
    transform: translate3d(-14px, 135px, 0) rotate(410deg);
  }

  100% {
    opacity: 0;
    transform: translate3d(10px, 205px, 0) rotate(680deg);
  }
}
</style>
