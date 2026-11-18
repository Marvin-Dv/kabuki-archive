<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const logoSrc = `${useRuntimeConfig().app.baseURL}favicon.svg`

// `exact`: o Início só fica ativo na própria página; as demais também em subpáginas.
const links = [
  { to: '/', key: 'home', exact: true },
  { to: '/characters', key: 'characters', exact: false },
  { to: '/about', key: 'about', exact: false },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
    <div class="k-container flex flex-wrap items-center justify-between gap-x-4 sm:h-16 sm:flex-nowrap">
      <NuxtLink
        :to="localePath('/')"
        class="flex h-14 items-center gap-2.5 sm:h-auto"
        :aria-label="t('site.name')"
      >
        <img :src="logoSrc" alt="" width="28" height="28" class="rounded-lg" />
        <span class="font-display text-base font-bold tracking-tight">
          Kabuki <span class="text-accent">Archive</span>
        </span>
      </NuxtLink>

      <div class="flex items-center gap-2 sm:order-last">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <nav
        :aria-label="t('nav.menu')"
        class="-mx-1 flex w-full gap-1 overflow-x-auto pb-2 sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center sm:overflow-visible sm:pb-0"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.key"
          :to="localePath(link.to)"
          :active-class="link.exact ? undefined : 'is-active'"
          exact-active-class="is-active"
          class="k-nav-link"
        >
          {{ t(`nav.${link.key}`) }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
