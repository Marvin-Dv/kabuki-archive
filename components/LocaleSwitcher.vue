<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  locales.value.map((l) => (typeof l === 'string' ? { code: l, name: l } : { code: l.code, name: l.name ?? l.code })),
)

async function onChange(event: Event) {
  const code = (event.target as HTMLSelectElement).value
  const path = switchLocalePath(code as typeof locale.value)
  if (path) await navigateTo(path)
}
</script>

<template>
  <label class="relative">
    <span class="sr-only">{{ t('locale.label') }}</span>
    <select
      :value="locale"
      class="h-11 cursor-pointer appearance-none rounded-xl border border-line bg-surface pl-4 pr-9 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
      @change="onChange"
    >
      <option v-for="o in options" :key="o.code" :value="o.code">{{ o.name }}</option>
    </select>
    <svg
      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </label>
</template>
