// Estado dos filtros da lista de personagens: leitura/escrita na URL e aplicação.
// Lógica pura (sem Vue), coberta por testes. Na URL só vai o que difere do padrão,
// então /characters limpo é a lista inteira e links compartilhados ficam curtos:
//   /characters?element=Fire,Ice&path=Hunt&rarity=5&q=sparkle&sort=rarity

import { ELEMENTS, PATHS } from '../schema/constants'
import { displayName, NICKNAME_TOKEN, type CharacterCard } from './catalog'

export const SORT_KEYS = ['name', 'rarity'] as const
export type SortKey = (typeof SORT_KEYS)[number]
export const RARITIES = [5, 4] as const

export interface FilterState {
  q: string
  elements: string[]
  paths: string[]
  rarities: number[]
  sort: SortKey
}

export const defaultFilters = (): FilterState => ({
  q: '',
  elements: [],
  paths: [],
  rarities: [],
  sort: 'name',
})

type QueryValue = string | null | undefined | Array<string | null>
const first = (value: QueryValue): string => {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' ? v : ''
}
const csv = (value: QueryValue): string[] =>
  first(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

/** Lê a query da URL ignorando qualquer valor inválido (links antigos ou editados à mão). */
export function parseFilters(query: Record<string, QueryValue>): FilterState {
  const sort = first(query.sort)
  return {
    q: first(query.q).trim().slice(0, 80),
    elements: csv(query.element).filter((v) => (ELEMENTS as readonly string[]).includes(v)),
    paths: csv(query.path).filter((v) => (PATHS as readonly string[]).includes(v)),
    rarities: csv(query.rarity)
      .map(Number)
      .filter((n) => (RARITIES as readonly number[]).includes(n)),
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortKey) : 'name',
  }
}

export function serializeFilters(state: FilterState): Record<string, string> {
  const query: Record<string, string> = {}
  if (state.q.trim()) query.q = state.q.trim()
  if (state.elements.length) query.element = state.elements.join(',')
  if (state.paths.length) query.path = state.paths.join(',')
  if (state.rarities.length) query.rarity = state.rarities.join(',')
  if (state.sort !== 'name') query.sort = state.sort
  return query
}

export const hasActiveFilters = (state: FilterState): boolean =>
  Object.keys(serializeFilters(state)).some((key) => key !== 'sort')

/** Liga/desliga um valor numa lista, sem alterar a original. */
export function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

/** Minúsculas e sem acentos: "Sílver" encontra "silver". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** Dentro de um grupo vale OU; entre grupos vale E. A busca olha o nome em todos os idiomas. */
export function applyFilters(
  cards: readonly CharacterCard[],
  state: FilterState,
  locale: string,
  nickname: string,
): CharacterCard[] {
  const needle = normalizeText(state.q.trim())

  const matches = cards.filter((card) => {
    if (state.elements.length && !state.elements.includes(card.element)) return false
    if (state.paths.length && !state.paths.includes(card.path)) return false
    if (state.rarities.length && !state.rarities.includes(card.rarity)) return false
    if (!needle) return true
    // O nome guardado do protagonista é "{NICKNAME}": busca no texto já resolvido.
    const names = Object.values(card.name).map((n) => n.split(NICKNAME_TOKEN).join(nickname))
    const haystack = [...names, card.slug].map(normalizeText)
    return haystack.some((text) => text.includes(needle))
  })

  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  const byName = (a: CharacterCard, b: CharacterCard) =>
    collator.compare(displayName(a.name, locale, nickname), displayName(b.name, locale, nickname)) ||
    a.id - b.id

  return [...matches].sort(
    state.sort === 'rarity' ? (a, b) => b.rarity - a.rarity || byName(a, b) : byName,
  )
}
