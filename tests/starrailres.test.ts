import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { character, lightCone } from '../schema'
import { material, property } from '../schema'
import {
  normalizeCharacters,
  normalizeLightCones,
  normalizeMaterials,
  normalizeProperties,
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
    characterSkillTrees: read('character_skill_trees'),
    lightCones: read('light_cones'),
    lightConeRanks: read('light_cone_ranks'),
    items: read('items'),
    properties: read('properties'),
    // Só o inglês tem os arquivos numéricos, como na fonte real.
    ...(lang === 'en'
      ? { characterPromotions: read('character_promotions'), lightConePromotions: read('light_cone_promotions') }
      : {}),
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

  describe('atributos, ascensão, traços e materiais (dados reais da March 7th)', () => {
    const march = items.find((c) => c.id === 1001)!

    it('traz os atributos das 7 ascensões, com o salto de cada ascensão', () => {
      expect(march.stats).toHaveLength(7)
      expect(march.stats![0].hp).toEqual({ base: 144, step: 7.2 })
      expect(march.stats![6].hp.base).toBe(489.6)
      expect(march.stats![6].critDmg).toEqual({ base: 0.5, step: 0 })
      expect(march.maxEnergy).toBe(120)
    })

    it('traz os materiais das 6 etapas de ascensão', () => {
      expect(march.ascension).toHaveLength(6)
      expect(march.ascension![0]).toEqual([
        { id: 2, num: 3200 },
        { id: 111011, num: 4 },
      ])
    })

    it('traz os 18 traços, com pré-requisitos e níveis de habilidade como números', () => {
      expect(march.traces).toHaveLength(18)
      const purify = march.traces.find((t) => t.id === 1001101)!
      expect(purify.name?.['pt-BR']).toBe('Pureza')
      expect(purify.prerequisites).toEqual([1001201])
      expect(purify.skillIds).toEqual([])
      const basic = march.traces.find((t) => t.id === 1001001)!
      expect(basic.skillIds).toEqual([100101])
      expect(basic.maxLevel).toBe(6)
      expect(basic.levels.length).toBe(6)
    })

    it('distingue os três tipos de traço', () => {
      const kinds = (t: (typeof march.traces)[number]) =>
        t.skillIds.length ? 'skill' : t.levels[0]?.properties.length ? 'stat' : 'minor'
      const count = (kind: string) => march.traces.filter((t) => kinds(t) === kind).length
      expect(count('skill')).toBe(5)
      expect(count('minor')).toBe(3)
      expect(count('stat')).toBe(10)
    })

    it('traços de atributo guardam o bônus e as exigências de nível', () => {
      const dmg = march.traces.find((t) => t.id === 1001201)!
      expect(dmg.levels[0].properties).toEqual([{ type: 'IceAddedRatio', value: 0.032 }])
      const late = march.traces.find((t) => t.id === 1001210)!
      expect(late.levels[0].level).toBe(80)
    })

    it('materialIds reúne ascensão, traços e eidolons, sem repetir e em ordem', () => {
      expect(march.materialIds).toEqual([...new Set(march.materialIds)].sort((a, b) => a - b))
      expect(march.materialIds).toContain(2) // Créditos
      expect(march.materialIds).toContain(11001) // item de eidolon
      expect(march.materialIds).toContain(110141) // material de traço
    })

    it('eidolons trazem o item consumido e os níveis de habilidade que sobem', () => {
      const e2 = march.eidolons.find((e) => e.rank === 2)!
      expect(e2.materials).toEqual([{ id: 11001, num: 1 }])
      expect(e2.levelUpSkills).toEqual([
        { id: 100102, num: 2 },
        { id: 100101, num: 1 },
      ])
    })

    it('habilidades trazem ícone, nível máximo e textos do jogo traduzidos', () => {
      const basic = march.skills.find((s) => s.id === 100101)!
      expect(basic.icon).toBe('icon/skill/1001_basic_atk.png')
      expect(basic.maxLevel).toBe(10)
      expect(basic.typeText?.['pt-BR']).toBe('ATQ Básico')
      expect(basic.targetText?.en).toBe('Single Target')
    })

    it('personagem sem dados de atributo gera aviso em vez de falhar', () => {
      const kafka = items.find((c) => c.id === 1005)!
      expect(kafka.stats).toBeUndefined()
      expect(kafka.ascension).toBeUndefined()
      expect(kafka.traces).toEqual([])
      expect(warnings.some((w) => w.includes('1005') && w.includes('character_promotions'))).toBe(true)
    })
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
    // Sem aviso de caminho desconhecido (pode haver aviso de atributos, pois o personagem é fictício).
    expect(elation.warnings.filter((w) => w.includes('desconhecidos'))).toEqual([])
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
    expect(arrows.skill?.name.en).toBe('Crisis')
    expect(arrows.skill?.params).toHaveLength(5)
    expect(arrows.skill?.properties).toHaveLength(5)
  })

  it('traz atributos reais por ascensão e os materiais para subir', () => {
    const arrows = items.find((c) => c.id === 20000)!
    expect(arrows.stats).toHaveLength(7)
    expect(arrows.stats![0]).toEqual({
      hp: { base: 38.4, step: 5.76 },
      atk: { base: 14.4, step: 2.16 },
      def: { base: 12, step: 1.8 },
    })
    expect(arrows.ascension).toHaveLength(6)
    expect(arrows.ascension![0]).toEqual([
      { id: 2, num: 3000 },
      { id: 111011, num: 4 },
    ])
  })

  it('avisa quando falta a habilidade', () => {
    expect(items.find((c) => c.id === 23001)!.skill).toBeUndefined()
    expect(warnings.some((w) => w.includes('23001'))).toBe(true)
  })
})

describe('normalizeMaterials', () => {
  const ids = new Set([2, 110141, 11001, 999999])
  const { items, warnings } = normalizeMaterials(tables, ids)

  it('gera só os itens pedidos e avisa dos que não existem na fonte', () => {
    expect(items.map((m) => m.id)).toEqual([2, 11001, 110141])
    expect(warnings.some((w) => w.includes('999999'))).toBe(true)
  })

  it('todo material passa no schema', () => {
    for (const m of items) expect(material.safeParse(m).success).toBe(true)
  })

  it('traz nomes nos idiomas disponíveis e onde obter', () => {
    const bronze = items.find((m) => m.id === 110141)!
    expect(bronze.name['pt-BR']).toBe('Resistência de Bronze')
    expect(bronze.subType).toBe('TracePath')
    expect(bronze.sources?.en).toContain('Embers Exchange')
    expect(bronze.sources?.['pt-BR']).toContain('Troca de Brasas')
  })

  it('não preenche announcedAt (embargo) e gera slug estável', () => {
    expect(items.every((m) => m.announcedAt === null)).toBe(true)
    expect(items.find((m) => m.id === 2)!.slug).toBe('credit')
    const again = normalizeMaterials(tables, new Set([2]), new Map([[2, 'creditos']]))
    expect(again.items[0].slug).toBe('creditos')
  })
})

describe('normalizeProperties', () => {
  const { items } = normalizeProperties(tables)

  it('traduz os atributos e passa no schema', () => {
    for (const p of items) expect(property.safeParse(p).success).toBe(true)
    const ice = items.find((p) => p.type === 'IceAddedRatio')!
    expect(ice.name.en).toBe('Ice DMG Boost')
    expect(ice.percent).toBe(true)
  })

  it('pula atributos internos sem nome exibível', () => {
    expect(items.find((p) => p.type === 'SpecialMaxSP')).toBeUndefined()
  })
})
