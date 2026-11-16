<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: t('site.tagline') })

// Cada coleção ganha um acento de elemento, para dar cor sem depender de arte do jogo.
const collections = [
  { key: 'characters', color: 'var(--el-fire)' },
  { key: 'lightcones', color: 'var(--el-ice)' },
  { key: 'relics', color: 'var(--el-quantum)' },
  { key: 'enemies', color: 'var(--el-lightning)' },
  { key: 'materials', color: 'var(--el-wind)' },
  { key: 'tools', color: 'var(--el-imaginary)' },
]
</script>

<template>
  <div>
    <section class="k-hero">
      <div class="k-container">
        <p class="k-badge mb-5">{{ t('home.eyebrow') }}</p>
        <h1 class="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] sm:text-6xl">
          {{ t('home.title') }}
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {{ t('home.subtitle') }}
        </p>
        <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#colecoes" class="k-btn k-btn-primary">{{ t('home.ctaPrimary') }}</a>
          <NuxtLink :to="localePath('/about')" class="k-btn k-btn-ghost">
            {{ t('home.ctaSecondary') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section id="colecoes" class="k-container scroll-mt-24 pt-6">
      <h2 class="text-3xl font-bold">{{ t('home.sectionTitle') }}</h2>
      <p class="mt-2 max-w-2xl text-muted">{{ t('home.sectionSubtitle') }}</p>

      <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="c in collections" :key="c.key" class="k-card relative overflow-hidden p-6">
          <span
            aria-hidden="true"
            class="absolute inset-x-0 top-0 h-1"
            :style="{ background: c.color }"
          />
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-xl font-bold">{{ t(`collections.${c.key}.name`) }}</h3>
            <span class="k-badge">{{ t('home.soon') }}</span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ t(`collections.${c.key}.desc`) }}
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>
