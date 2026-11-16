import { describe, expect, it } from 'vitest'
import type { CharacterCard } from '../utils/catalog'
import {
  applyFilters,
  defaultFilters,
  hasActiveFilters,
  normalizeText,
  parseFilters,
  serializeFilters,
  toggle,
} from '../utils/filters'

const card = (
  id: number,
  en: string,
  rarity: 4 | 5,
  element: CharacterCard['element'],
  path: CharacterCard['path'],
  extra: Record<string, string> = {},
): CharacterCard => ({
  id,
  slug: en.startsWith('{') ? `trailblazer-${id}` : en.toLowerCase().replace(/\W+/g, '-'),
  name: { en, ...extra },
  rarity,
  element,
  path,
  icon: null,
  patchReleaseDate: null,
})

const cards = [
  card(1306, 'Sparkle', 5, 'Quantum', 'Harmony', { 'pt-BR': 'Sparkle', ja: '花火' }),
  card(1001, 'March 7th', 4, 'Ice', 'Preservation', { 'pt-BR': '7 de Março' }),
  card(1308, 'Acheron', 5, 'Lightning', 'Nihility'),
  card(1310, 'Firefly', 5, 'Fire', 'Destruction', { 'pt-BR': 'Vagalume' }),
  card(8001, '{NICKNAME}', 5, 'Physical', 'Destruction'),
  card(8002, '{NICKNAME}', 5, 'Fire', 'Destruction'),
]
const ids = (list: CharacterCard[]) => list.map((c) => c.id)
const run = (over: Partial<ReturnType<typeof defaultFilters>>, locale = 'en') =>
  applyFilters(cards, { ...defaultFilters(), ...over }, locale, 'Trailblazer')

describe('parseFilters / serializeFilters', () => {
  it('lê a query e descarta valores inválidos', () => {
    const state = parseFilters({
      q: '  spark ',
      element: 'Fire,Inexistente,Ice',
      path: 'Hunt',
      rarity: '5,3,abc',
      sort: 'rarity',
    })
    expect(state).toEqual({
      q: 'spark',
      elements: ['Fire', 'Ice'],
      paths: ['Hunt'],
      rarities: [5],
      sort: 'rarity',
    })
  })

  it('aceita array na query (?a=1&a=2) usando o primeiro valor', () => {
    expect(parseFilters({ element: ['Wind', 'Fire'] }).elements).toEqual(['Wind'])
  })

  it('sort inválido volta ao padrão', () => {
    expect(parseFilters({ sort: 'qualquer' }).sort).toBe('name')
  })

  it('query vazia dá o estado padrão', () => {
    expect(parseFilters({})).toEqual(defaultFilters())
  })

  it('só serializa o que difere do padrão', () => {
    expect(serializeFilters(defaultFilters())).toEqual({})
    expect(serializeFilters({ ...defaultFilters(), elements: ['Fire', 'Ice'], sort: 'rarity' })).toEqual({
      element: 'Fire,Ice',
      sort: 'rarity',
    })
  })

  it('ida e volta preserva o estado', () => {
    const state = { q: 'abc', elements: ['Wind'], paths: ['Hunt', 'Harmony'], rarities: [4], sort: 'rarity' as const }
    expect(parseFilters(serializeFilters(state))).toEqual(state)
  })

  it('ordenar sozinho não conta como filtro ativo', () => {
    expect(hasActiveFilters({ ...defaultFilters(), sort: 'rarity' })).toBe(false)
    expect(hasActiveFilters({ ...defaultFilters(), q: 'x' })).toBe(true)
  })
})

describe('applyFilters', () => {
  it('sem filtros devolve tudo, ordenado por nome (protagonistas resolvidos como Trailblazer)', () => {
    expect(run({}).map((c) => c.id)).toEqual([1308, 1310, 1001, 1306, 8001, 8002])
  })

  it('ordena pelo nome do idioma da interface', () => {
    // pt-BR: "7 de Março", "Acheron", "Firefly" (Vagalume), "Sparkle", Trailblazer
    const names = run({}, 'pt-BR').map((c) => c.id)
    expect(names).toEqual([1001, 1308, 1306, 8001, 8002, 1310]) // "7…", Acheron, Sparkle, Trailblazer…, Vagalume
  })

  it('combina grupos com E e valores do mesmo grupo com OU', () => {
    expect(ids(run({ elements: ['Fire', 'Ice'] })).sort()).toEqual([1001, 1310, 8002])
    expect(ids(run({ elements: ['Fire', 'Ice'], rarities: [5] })).sort()).toEqual([1310, 8002])
    expect(ids(run({ paths: ['Destruction'], elements: ['Fire'] })).sort()).toEqual([1310, 8002])
  })

  it('busca ignora acentos e maiúsculas', () => {
    expect(ids(run({ q: 'MARCO' }))).toEqual([1001]) // pt-BR "7 de Março"
  })

  it('busca encontra o nome em qualquer idioma, mesmo com a interface em outro', () => {
    expect(ids(run({ q: '花火' }, 'pt-BR'))).toEqual([1306])
    expect(ids(run({ q: 'vagalume' }, 'en'))).toEqual([1310])
  })

  it('busca também olha o slug', () => {
    expect(ids(run({ q: 'march-7' }))).toEqual([1001])
  })

  it('ordenar por raridade põe 5★ antes de 4★, desempatando por nome', () => {
    const result = run({ sort: 'rarity' })
    expect(result[result.length - 1].id).toBe(1001)
    expect(result.slice(0, 2).map((c) => c.name.en)).toEqual(['Acheron', 'Firefly'])
  })

  it('busca encontra o protagonista pelo nome resolvido, não pelo marcador', () => {
    expect(ids(run({ q: 'trailblazer' }))).toEqual([8001, 8002])
    expect(ids(run({ q: 'nickname' }))).toEqual([])
    expect(applyFilters(cards, { ...defaultFilters(), q: 'desbravador' }, 'pt-BR', 'Desbravador').map((c) => c.id)).toEqual([8001, 8002])
  })

  it('personagens com o mesmo nome mantêm ordem estável por id', () => {
    expect(ids(run({ paths: ['Destruction'], elements: ['Physical', 'Fire'], q: 'trailblazer' }))).toEqual([8001, 8002])
  })

  it('não altera a lista original', () => {
    const before = ids([...cards])
    run({ sort: 'rarity' })
    expect(ids([...cards])).toEqual(before)
  })
})

describe('helpers', () => {
  it('toggle liga e desliga sem mutar', () => {
    const list = ['a']
    expect(toggle(list, 'b')).toEqual(['a', 'b'])
    expect(toggle(list, 'a')).toEqual([])
    expect(list).toEqual(['a'])
  })

  it('normalizeText remove acentos', () => {
    expect(normalizeText('Março')).toBe('marco')
  })
})
