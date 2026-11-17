<script setup lang="ts">
const { t } = useI18n()
useHead({ title: t('about.title') })
</script>

<template>
  <article class="k-container max-w-3xl py-16">
    <h1 class="text-4xl font-bold">{{ t('about.title') }}</h1>
    <div class="mt-8 space-y-5 text-lg leading-relaxed text-muted">
      <p>{{ t('about.p1') }}</p>
      <p>{{ t('about.p2') }}</p>
      <p>{{ t('about.p3') }}</p>
    </div>
  </article>
</template>
