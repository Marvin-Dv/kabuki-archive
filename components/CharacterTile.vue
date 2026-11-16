<script setup lang="ts">
// Card de personagem da lista. Ainda não é um link: a página de detalhe vem na sequência.
import type { CharacterCard } from '../utils/catalog'
import { assetUrl } from '../utils/assets'
import { displayName } from '../utils/catalog'

const props = defineProps<{ card: CharacterCard }>()
const { t, locale } = useI18n()

const name = computed(() => displayName(props.card.name, locale.value, t('characters.trailblazer')))
const icon = computed(() => assetUrl(props.card.icon))
const elementColor = computed(() => `var(--el-${props.card.element.toLowerCase()})`)
</script>

<template>
  <article class="k-card relative flex items-center gap-4 overflow-hidden p-4">
    <span aria-hidden="true" class="absolute inset-x-0 top-0 h-1" :style="{ background: elementColor }" />
    <img
      v-if="icon"
      :src="icon"
      alt=""
      width="72"
      height="72"
      loading="lazy"
      decoding="async"
      class="h-[72px] w-[72px] shrink-0 rounded-xl bg-surface-2 object-cover"
    />
    <span v-else aria-hidden="true" class="h-[72px] w-[72px] shrink-0 rounded-xl bg-surface-2" />
    <div class="min-w-0">
      <h3 class="truncate text-base font-bold" :title="name">{{ name }}</h3>
      <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
        <span aria-hidden="true" class="k-chip-dot" :style="{ '--chip': elementColor }" />
        {{ t(`elements.${card.element}`) }} · {{ t(`paths.${card.path}`) }}
      </p>
      <p class="mt-1 text-sm text-accent-2" :aria-label="`${card.rarity}★`">
        <span aria-hidden="true">{{ '★'.repeat(card.rarity) }}</span>
      </p>
    </div>
  </article>
</template>
