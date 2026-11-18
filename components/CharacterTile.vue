<script setup lang="ts">
// Card de personagem da lista. Ainda não é um link: a página de detalhe vem na sequência.
// Recorte (`preview`) que "vaza" pelo topo do card, ícones oficiais de elemento e caminho
// no canto esquerdo, estrelas de raridade e, quando o dado existir, a versão de lançamento.
import type { CharacterCard } from '../utils/catalog'
import { assetUrl, elementIcon, pathIcon } from '../utils/assets'
import { displayName } from '../utils/catalog'

const props = defineProps<{ card: CharacterCard }>()
const { t, locale } = useI18n()

const name = computed(() => displayName(props.card.name, locale.value, t('characters.trailblazer')))
// Sem recorte, cai para o ícone quadrado (que não vaza do card).
const hasPreview = computed(() => Boolean(props.card.preview))
const art = computed(() => assetUrl(props.card.preview ?? props.card.icon))
const elementName = computed(() => t(`elements.${props.card.element}`))
const pathName = computed(() => t(`paths.${props.card.path}`))
const elementSrc = computed(() => assetUrl(elementIcon(props.card.element)))
const pathSrc = computed(() => assetUrl(pathIcon(props.card.path)))
const elementColor = computed(() => `var(--el-${props.card.element.toLowerCase()})`)
</script>

<template>
  <article
    class="k-card k-char relative aspect-[11/15] !overflow-visible"
    :class="card.rarity === 5 ? 'k-char-5' : 'k-char-4'"
    :style="{ '--el': elementColor }"
  >
    <div aria-hidden="true" class="k-char-glow absolute inset-0 rounded-[inherit]" />

    <img
      v-if="art"
      :src="art"
      alt=""
      width="376"
      height="512"
      loading="lazy"
      decoding="async"
      class="absolute left-1/2 -translate-x-1/2 object-contain"
      :class="hasPreview ? '-top-[7%] w-[94%]' : 'top-[12%] w-[55%] rounded-xl'"
    />

    <div class="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
      <span
        class="k-char-chip"
        :title="elementName"
        :style="{ borderColor: 'color-mix(in srgb, var(--el) 60%, transparent)' }"
      >
        <img
          v-if="elementSrc"
          :src="elementSrc"
          :alt="elementName"
          width="24"
          height="24"
          class="h-6 w-6"
          loading="lazy"
        />
      </span>
      <span class="k-char-chip" :title="pathName">
        <img
          v-if="pathSrc"
          :src="pathSrc"
          :alt="pathName"
          width="22"
          height="22"
          class="h-[22px] w-[22px] opacity-90"
          loading="lazy"
        />
      </span>
    </div>

    <div class="k-char-info absolute inset-x-0 bottom-0 rounded-b-[inherit] px-3.5 pb-3.5 pt-9">
      <h3 class="truncate font-display text-base font-semibold" :title="name">{{ name }}</h3>
      <div class="mt-2 flex items-end justify-between gap-2">
        <span
          class="flex gap-[3px]"
          role="img"
          :aria-label="t('characters.rarityLabel', { n: card.rarity })"
        >
          <svg
            v-for="i in card.rarity"
            :key="i"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            aria-hidden="true"
            class="k-char-star"
          >
            <path
              d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.4 1.3-6.6L2.5 9.4l6.6-.8z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span
          v-if="card.version"
          class="text-right leading-none"
          :title="t('characters.releasedIn', { v: card.version })"
        >
          <span class="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {{ t('characters.version') }}
          </span>
          <span class="k-char-version mt-[3px] block font-display text-[26px] font-bold">{{
            card.version
          }}</span>
        </span>
      </div>
    </div>
  </article>
</template>
