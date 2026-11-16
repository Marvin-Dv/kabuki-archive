<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const logoSrc = `${useRuntimeConfig().app.baseURL}favicon.svg`
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
    <div class="k-container flex h-16 items-center justify-between gap-4">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5" :aria-label="t('site.name')">
        <img :src="logoSrc" alt="" width="30" height="30" class="rounded-lg" />
        <span class="font-display text-lg font-bold tracking-tight">
          Kabuki <span class="text-accent">Archive</span>
        </span>
      </NuxtLink>

      <nav :aria-label="t('nav.menu')" class="hidden items-center gap-6 text-sm font-medium sm:flex">
        <NuxtLink :to="localePath('/')" class="text-muted transition-colors hover:text-ink">
          {{ t('nav.home') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/about')" class="text-muted transition-colors hover:text-ink">
          {{ t('nav.about') }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
