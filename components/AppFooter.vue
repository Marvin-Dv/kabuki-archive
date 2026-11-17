<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-24 border-t border-line bg-bg-soft">
    <div class="k-container flex flex-col gap-3 py-10 text-sm text-muted">
      <p class="max-w-3xl leading-relaxed">{{ t('footer.disclaimer') }}</p>
      <p>© {{ year }} Kabuki Archive · MIT</p>
    </div>
  </footer>
</template>
