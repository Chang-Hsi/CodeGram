<script setup lang="ts">
import Fripplebutton from "~/components/common/button/Fripplebutton.vue";
import RuixenDialog from "~/components/common/dialog/RuixenDialog.vue";
import LableInput from "~/components/common/forms/LableInput.vue";
import PromptTextarea from "~/components/common/forms/PromptTextarea.vue";

type DialogMode = "bio" | "details";

interface ProfileDetailsPayload {
  work: string;
  education: string;
  location: string;
  website: string;
  githubUrl: string;
}

const props = withDefaults(
  defineProps<{
    bio?: string;
    work?: string;
    education?: string;
    location?: string;
    website?: string;
    githubUrl?: string;
    isOwnProfile?: boolean;

    // 建議父層傳入包含會員 ID 的 key，避免不同帳號共用草稿
    bioDraftStorageKey?: string;
  }>(),
  {
    bio: "",
    work: "",
    education: "",
    location: "",
    website: "",
    githubUrl: "",
    isOwnProfile: false,
    bioDraftStorageKey: "codegram:profile-intro:bio-draft",
  },
);

const emit = defineEmits<{
  saveBio: [bio: string];
  saveDetails: [details: ProfileDetailsPayload];
}>();

const isDialogOpen = ref(false);
const dialogMode = ref<DialogMode>("bio");
const bioDraft = ref("");

const promptTextareaRef = ref<InstanceType<typeof PromptTextarea>>();

const detailsDraft = reactive<ProfileDetailsPayload>({
  work: "",
  education: "",
  location: "",
  website: "",
  githubUrl: "",
});

const dialogTitle = computed(() => {
  return dialogMode.value === "bio" ? "編輯個人簡介" : "編輯詳細資料";
});

const dialogDescription = computed(() => {
  return dialogMode.value === "bio"
    ? "簡單介紹自己，讓其他工程師更快認識你。"
    : "補充工作、學歷、所在地與個人網站資訊。";
});

const dialogIcon = computed(() => {
  return dialogMode.value === "bio"
    ? "lucide:notebook-pen"
    : "lucide:badge-info";
});

const getDisplayUrl = (url: string) => {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
};

const openDialog = (mode: DialogMode) => {
  dialogMode.value = mode;

  if (mode === "bio") {
    /*
     * 先載入正式資料。
     * PromptTextarea 掛載後若找到本機草稿，
     * 會再以本機草稿覆蓋 bioDraft。
     */
    bioDraft.value = props.bio;
  } else {
    Object.assign(detailsDraft, {
      work: props.work,
      education: props.education,
      location: props.location,
      website: props.website,
      githubUrl: props.githubUrl,
    });
  }

  isDialogOpen.value = true;
};

const saveDialog = () => {
  if (dialogMode.value === "bio") {
    const normalizedBio = bioDraft.value.trim();

    emit("saveBio", normalizedBio);

    /*
     * 這裡才是原本 Dialog 的正式儲存操作，
     * 因此正式送出後清除本機草稿。
     */
    promptTextareaRef.value?.clearDraft();
  } else {
    emit("saveDetails", {
      work: detailsDraft.work.trim(),
      education: detailsDraft.education.trim(),
      location: detailsDraft.location.trim(),
      website: detailsDraft.website.trim(),
      githubUrl: detailsDraft.githubUrl.trim(),
    });
  }

  isDialogOpen.value = false;
};
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <h2 class="text-xl font-bold text-slate-950">
      個人簡介
    </h2>

    <p
      v-if="bio"
      class="mt-4 whitespace-pre-line text-center text-sm leading-6 text-slate-700"
    >
      {{ bio }}
    </p>

    <p
      v-else
      class="mt-4 text-center text-sm text-slate-400"
    >
      尚未填寫個人簡介
    </p>

    <Fripplebutton
      v-if="isOwnProfile"
      type="button"
      ripple-color="rgba(15, 23, 42, 0.14)"
      class="mt-4 h-9 w-full rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
      @click="openDialog('bio')"
    >
      編輯個人簡介
    </Fripplebutton>

    <ul class="mt-4 space-y-3 text-sm text-slate-700">
      <li
        v-if="work"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:briefcase-business"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <span>
          任職於

          <strong class="font-semibold text-slate-900">
            {{ work }}
          </strong>
        </span>
      </li>

      <li
        v-if="education"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:graduation-cap"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <span>
          就讀過

          <strong class="font-semibold text-slate-900">
            {{ education }}
          </strong>
        </span>
      </li>

      <li
        v-if="location"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:map-pin"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <span>
          居住在

          <strong class="font-semibold text-slate-900">
            {{ location }}
          </strong>
        </span>
      </li>

      <li
        v-if="website"
        class="flex items-start gap-3"
      >
        <Icon
          name="lucide:globe"
          class="mt-0.5 size-5 shrink-0 text-slate-500"
        />

        <a
          :href="website"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 break-all font-semibold text-blue-600 hover:underline"
        >
          {{ getDisplayUrl(website) }}
        </a>
      </li>

      <li
        v-if="githubUrl"
        class="flex items-start gap-3"
      >
        <Icon
          name="simple-icons:github"
          class="mt-0.5 size-5 shrink-0 text-slate-700"
        />

        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 break-all font-semibold text-blue-600 hover:underline"
        >
          {{ getDisplayUrl(githubUrl) }}
        </a>
      </li>
    </ul>

    <Fripplebutton
      v-if="isOwnProfile"
      type="button"
      ripple-color="rgba(15, 23, 42, 0.14)"
      class="mt-4 h-9 w-full rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
      @click="openDialog('details')"
    >
      編輯詳細資料
    </Fripplebutton>

    <RuixenDialog
      v-model="isDialogOpen"
      :title="dialogTitle"
      :description="dialogDescription"
      :icon="dialogIcon"
      @confirm="saveDialog"
    >
      <!-- 個人簡介表單 -->
      <div
        v-if="dialogMode === 'bio'"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <label
            for="profile-bio"
            class="text-sm font-semibold text-slate-800"
          >
            個人簡介
          </label>

          <span
            class="text-xs"
            :class="
              bioDraft.length >= 280
                ? 'text-amber-600'
                : 'text-slate-400'
            "
          >
            {{ bioDraft.length }} / 300
          </span>
        </div>

        <PromptTextarea
          id="profile-bio"
          ref="promptTextareaRef"
          v-model="bioDraft"
          :storage-key="bioDraftStorageKey"
          :maxlength="300"
          :rows="7"
          placeholder="介紹你的專長、興趣或目前正在進行的專案……"
        />
      </div>

      <!-- 詳細資料表單 -->
      <div
        v-else
        class="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <LableInput
          id="profile-work"
          v-model="detailsDraft.work"
          label="任職公司"
          type="text"
          autocomplete="organization"
          placeholder="例如：CodeGram"
        />

        <LableInput
          id="profile-education"
          v-model="detailsDraft.education"
          label="學歷"
          type="text"
          placeholder="例如：國立臺灣大學"
        />

        <LableInput
          id="profile-location"
          v-model="detailsDraft.location"
          label="居住地"
          type="text"
          autocomplete="address-level2"
          placeholder="例如：桃園市"
        />

        <LableInput
          id="profile-website"
          v-model="detailsDraft.website"
          label="個人網站"
          type="url"
          autocomplete="url"
          placeholder="https://example.com"
        />

        <div class="sm:col-span-2">
          <LableInput
            id="profile-github"
            v-model="detailsDraft.githubUrl"
            label="GitHub"
            type="url"
            autocomplete="url"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </RuixenDialog>
  </section>
</template>