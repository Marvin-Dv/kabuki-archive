<script setup lang="ts">
// Lista de personagens com filtros. O estado vive na query string (?element=Fire&rarity=5),
// então qualquer combinação vira um link compartilhável.
//
// Hidratação: o HTML pré-renderizado (SSG) é sempre a lista inteira. Só depois de montar
// no navegador lemos a query e aplicamos os filtros, para o cliente não divergir do servidor.
import index from '../../data/built/characters.json'
import { ELEMENTS, PATHS } from '../../schema/constants'
import type { CharacterCard } from '../../utils/catalog'
import {
  RARITIES,
  applyFilters,
  defaultFilters,
  hasActiveFilters,
  parseFilters,
  serializeFilters,
  type FilterState,
} from '../../utils/filters'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

useHead({ title: () => t('characters.title') })

const cards = index as unknown as CharacterCard[]
const nickname = computed(() => t('characters.trailblazer'))

const state = ref<FilterState>(defaultFilters())
const ready = ref(false)

const sameFilters = (a: FilterState, b: FilterState) =>
  JSON.stringify(serializeFilters(a)) === JSON.stringify(serializeFilters(b))

onMounted(() => {
  state.value = parseFilters(route.query)
  ready.value = true
})

// Filtros → URL
watch(
  state,
  (value) => {
    if (!ready.value || sameFilters(value, parseFilters(route.query))) return
    router.replace({ query: serializeFilters(value) })
  },
  { deep: true },
)

// URL → filtros (botões voltar/avançar do navegador)
watch(
  () => route.query,
  (query) => {
    if (!ready.value) return
    const parsed = parseFilters(query)
    if (!sameFilters(parsed, state.value)) state.value = parsed
  },
)

const results = computed(() => applyFilters(cards, state.value, locale.value, nickname.value))

const elementOptions = computed(() =>
  ELEMENTS.map((value) => ({
    value: value as string,
    label: t(`elements.${value}`),
    color: `var(--el-${value.toLowerCase()})`,
  })),
)
const pathOptions = computed(() =>
  PATHS.map((value) => ({ value: value as string, label: t(`paths.${value}`) })),
)
const rarityOptions = RARITIES.map((value) => ({ value: value as number, label: `${value}★` }))

const filtered = computed(() => hasActiveFilters(state.value))
const clear = () => {
  state.value = defaultFilters()
}
</script>

<template>
  <div class="k-container pt-10">
    <header>
      <h1 class="text-3xl font-bold sm:text-4xl">{{ t('characters.title') }}</h1>
      <p class="mt-2 max-w-2xl text-muted">{{ t('characters.subtitle') }}</p>
    </header>

    <section class="k-card mt-8 grid gap-5 p-5" :aria-label="t('characters.searchLabel')">
      <div class="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label class="block">
          <span class="sr-only">{{ t('characters.searchLabel') }}</span>
          <input
            v-model="state.q"
            type="search"
            class="k-input"
            maxlength="80"
            autocomplete="off"
            :placeholder="t('characters.searchPlaceholder')"
          />
        </label>
        <label class="flex items-center gap-2 text-sm text-muted">
          <span>{{ t('characters.sort') }}</span>
          <select v-model="state.sort" class="k-input w-auto">
            <option value="name">{{ t('characters.sortName') }}</option>
            <option value="rarity">{{ t('characters.sortRarity') }}</option>
          </select>
        </label>
      </div>

      <FilterChips v-model="state.elements" :label="t('characters.element')" :options="elementOptions" />
      <FilterChips v-model="state.paths" :label="t('characters.path')" :options="pathOptions" />
      <FilterChips v-model="state.rarities" :label="t('characters.rarity')" :options="rarityOptions" />
    </section>

    <div class="mt-6 flex items-center justify-between gap-3">
      <p class="text-sm text-muted" role="status" aria-live="polite">
        {{ t('characters.count', results.length) }}
      </p>
      <button v-if="filtered" type="button" class="k-btn k-btn-ghost !px-4 !py-1.5 text-sm" @click="clear">
        {{ t('characters.clear') }}
      </button>
    </div>

    <ul v-if="results.length" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      <li v-for="card in results" :key="card.id">
        <CharacterTile :card="card" />
      </li>
    </ul>
    <div v-else class="k-card mt-4 p-10 text-center">
      <p class="font-display text-xl font-bold">{{ t('characters.empty') }}</p>
      <p class="mt-2 text-muted">{{ t('characters.emptyHint') }}</p>
    </div>
  </div>
</template>
