<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({
  inheritAttrs: false,
});

type InputValue = string | number | null | undefined;

type InputType =
  | "text"
  | "email"
  | "password"
  | "search"
  | "tel"
  | "url"
  | "number"
  | "date";

const props = withDefaults(
  defineProps<{
    modelValue?: InputValue;
    id: string;
    label: string;
    type?: InputType;
    placeholder?: string;
    error?: string;
    success?: string;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    required?: boolean;
  }>(),
  {
    modelValue: "",
    type: "text",
    placeholder: "",
    error: "",
    success: "",
    disabled: false,
    readonly: false,
    clearable: true,
    required: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  clear: [];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const attrs = useAttrs();

const normalizedValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return "";
  }

  return String(props.modelValue);
});

const hasValue = computed(() => {
  return normalizedValue.value.length > 0;
});

const showClearButton = computed(() => {
  return (
    props.clearable &&
    hasValue.value &&
    !props.disabled &&
    !props.readonly
  );
});

const message = computed(() => {
  return props.error || props.success;
});

const inputStateClass = computed(() => {
  if (props.error) {
    return [
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500/10",
    ];
  }

  if (props.success) {
    return [
      "border-emerald-500",
      "focus:border-emerald-500",
      "focus:ring-emerald-500/10",
    ];
  }

  return [
    "border-slate-300",
    "focus:border-blue-500",
    "focus:ring-blue-500/10",
  ];
});

const messageClass = computed(() => {
  return props.error ? "text-red-600" : "text-emerald-600";
});

const handleInput = (event: Event) => {
  const inputElement = event.target as HTMLInputElement;

  emit("update:modelValue", inputElement.value);
};

const handleClear = () => {
  emit("update:modelValue", "");
  emit("clear");
};
</script>

<template>
  <div class="w-full">
    <label
      :for="id"
      class="mb-2 block text-sm font-semibold text-slate-800"
    >
      {{ label }}

      <span
        v-if="required"
        class="ml-0.5 text-red-500"
        aria-hidden="true"
      >
        *
      </span>
    </label>

    <div class="relative">
      <input
        v-bind="attrs"
        :id="id"
        :value="normalizedValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="message ? `${id}-message` : undefined"
        class="h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        :class="[
          inputStateClass,
          showClearButton || error || success ? 'pr-10' : 'pr-3',
        ]"
        @input="handleInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />

      <button
        v-if="showClearButton"
        type="button"
        class="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        :aria-label="`清除${label}`"
        @click="handleClear"
      >
        <Icon
          name="lucide:x"
          class="size-4"
        />
      </button>

      <Icon
        v-else-if="error"
        name="lucide:circle-alert"
        class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-red-500"
      />

      <Icon
        v-else-if="success"
        name="lucide:circle-check"
        class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500"
      />
    </div>

    <p
      v-if="message"
      :id="`${id}-message`"
      class="mt-1.5 text-xs"
      :class="messageClass"
    >
      {{ message }}
    </p>
  </div>
</template>
