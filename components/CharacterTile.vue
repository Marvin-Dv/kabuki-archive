<script setup lang="ts">
// Card de personagem da lista. Ainda não é um link: a página de detalhe vem na sequência.
// Arte em proporção 4:5 (retrato; cai para o ícone quadrado se não houver retrato).
import type { CharacterCard } from '../utils/catalog'
import { assetUrl } from '../utils/assets'
import { displayName } from '../utils/catalog'

const props = defineProps<{ card: CharacterCard }>()
const { t, locale } = useI18n()

const name = computed(() => displayName(props.card.name, locale.value, t('characters.trailblazer')))
const art = computed(() => assetUrl(props.card.portrait ?? props.card.icon))
const elementColor = computed(() => `var(--el-${props.card.element.toLowerCase()})`)
</script>

<template>
  <article class="k-card overflow-hidden">
    <div class="relative aspect-[4/5] bg-surface-2">
      <img
        v-if="art"
        :src="art"
        alt=""
        width="400"
        height="500"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover object-top"
      />
      <span
        class="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-lg bg-bg/85 px-2 py-1 text-xs font-medium text-ink backdrop-blur"
      >
        <span aria-hidden="true" class="k-chip-dot" :style="{ '--chip': elementColor }" />
        {{ t(`elements.${card.element}`) }}
      </span>
    </div>
    <div class="p-3">
      <h3 class="truncate font-display text-sm font-semibold sm:text-base" :title="name">{{ name }}</h3>
      <p class="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
        <span class="truncate">{{ t(`paths.${card.path}`) }}</span>
        <span class="k-num shrink-0" :aria-label="`${card.rarity}★`">
          <span aria-hidden="true">{{ card.rarity }}★</span>
        </span>
      </p>
    </div>
  </article>
</template>
