import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { character, lightCone } from '../schema'
import {
  normalizeCharacters,
  normalizeLightCones,
  type AllTables,
  type LangTables,
} from '../scripts/adapters/starrailres'

const dir = join(import.meta.dirname, 'fixtures', 'starrailres', 'index_new')
const load = (lang: string): LangTables => {
  const read = (f: string) => JSON.parse(readFileSync(join(dir, lang, `${f}.json`), 'utf8'))
  return {
    characters: read('characters'),
    characterSkills: read('character_skills'),
    characterRanks: read('character_ranks'),
    lightCones: read('light_cones'),
    lightConeRanks: read('light_cone_ranks'),
  }
}
const tables: AllTables = { en: load('en'), 'pt-BR': load('pt') }

describe('normalizeCharacters', () => {
  const { items, warnings } = normalizeCharacters(tables)

  it('todo personagem gerado passa no schema', () => {
    for (const c of items) expect(character.safeParse(c).success).toBe(true)
  })

  it('converte path/element internos e junta idiomas', () => {
    const march = items.find((c) => c.id === 1001)!
    expect(march.path).toBe('Preservation')
    expect(march.element).toBe('Ice')
    expect(march.name).toEqual({ en: 'March 7th', 'pt-BR': 'March 7th' })
    expect(items.find((c) => c.id === 1005)!.element).toBe('Lightning')
  })

  it('traz skills e eidolons ordenados, com tradução e params', () => {
    const march = items.find((c) => c.id === 1001)!
    expect(march.skills.map((s) => s.type)).toEqual(['Basic', 'Skill'])
    expect(march.skills[0].name['pt-BR']).toBe('Flecha Gélida')
    expect(march.skills[0].params).toEqual([[0.5], [0.6]])
    expect(march.eidolons.map((e) => e.rank)).toEqual([1, 2])
  })

  it('remove a barra inicial dos assets', () => {
    expect(items.find((c) => c.id === 1001)!.images.icon).toBe('icon/character/1001.png')
  })

  it('desambigua slugs repetidos (Trailblazer)', () => {
    const slugs = items.filter((c) => c.id >= 8000).map((c) => c.slug)
    expect(slugs).toEqual(['trailblazer', 'trailblazer-8002'])
  })

  it('ignora path desconhecido com aviso, sem quebrar', () => {
    expect(items.find((c) => c.id === 9999)).toBeUndefined()
    expect(warnings.some((w) => w.includes('9999'))).toBe(true)
  })

  it('aceita o caminho Elation', () => {
    const elation = normalizeCharacters({
      en: {
        ...tables.en!,
        characters: { 1501: { id: '1501', name: 'Sparxie', rarity: 5, path: 'Elation', element: 'Fire' } },
      },
    })
    expect(elation.warnings).toEqual([])
    expect(character.safeParse(elation.items[0]).success).toBe(true)
    expect(elation.items[0].path).toBe('Elation')
  })

  it('nunca preenche announcedAt (embargo)', () => {
    expect(items.every((c) => c.announcedAt === null)).toBe(true)
  })

  it('protagonista {NICKNAME} ganha slug trailblazer-<id>', () => {
    const nick = normalizeCharacters({
      en: {
        ...tables.en!,
        characters: {
          8001: { id: '8001', name: '{NICKNAME}', rarity: 5, path: 'Warrior', element: 'Physical' },
          8002: { id: '8002', name: '{NICKNAME}', rarity: 5, path: 'Warrior', element: 'Physical' },
        },
      },
    })
    expect(nick.items.map((c) => c.slug)).toEqual(['trailblazer-8001', 'trailblazer-8002'])
  })

  it('preserva slugs já publicados', () => {
    const again = normalizeCharacters(tables, new Map([[1001, 'march-7th-antigo']]))
    expect(again.items.find((c) => c.id === 1001)!.slug).toBe('march-7th-antigo')
  })
})

describe('normalizeLightCones', () => {
  const { items, warnings } = normalizeLightCones(tables)

  it('todo cone gerado passa no schema', () => {
    for (const lc of items) expect(lightCone.safeParse(lc).success).toBe(true)
  })

  it('junta a habilidade de light_cone_ranks com 5 sobreposições', () => {
    const arrows = items.find((c) => c.id === 20000)!
    expect(arrows.path).toBe('Hunt')
    expect(arrows.skill?.name['pt-BR']).toBe('Pioneiro')
    expect(arrows.skill?.params).toHaveLength(5)
  })

  it('avisa quando falta a habilidade', () => {
    expect(items.find((c) => c.id === 23001)!.skill).toBeUndefined()
    expect(warnings.some((w) => w.includes('23001'))).toBe(true)
  })
})
