// Adaptador do StarRailRes (https://github.com/Mar-7th/StarRailRes).
//
// Lê `index_new/<idioma>/*.json` e normaliza para os schemas do projeto.
// As funções `normalize*` são puras (recebem as tabelas já carregadas) para
// poderem ser testadas com fixtures, sem rede.

import { LOCALES, type Character, type Locale, type LightCone } from '../../schema'
import { readJson } from '../lib/source'
import { NICKNAME_TOKEN } from '../../utils/catalog'
import { uniqueSlug } from '../../utils/slug'
import type { Adapter, AdapterContext, AdapterResult } from './types'

/** Idioma do site → pasta do StarRailRes. */
export const LANG_DIR: Record<Locale, string> = {
  en: 'en',
  'pt-BR': 'pt',
  'zh-CN': 'cn',
  ja: 'jp',
  ko: 'kr',
}

/** Nomes internos do jogo → nomes usados no schema. */
export const PATH_MAP: Record<string, string> = {
  Warrior: 'Destruction',
  Rogue: 'Hunt',
  Mage: 'Erudition',
  Shaman: 'Harmony',
  Warlock: 'Nihility',
  Knight: 'Preservation',
  Priest: 'Abundance',
  Memory: 'Remembrance',
  Elation: 'Elation',
}

export const ELEMENT_MAP: Record<string, string> = {
  Physical: 'Physical',
  Fire: 'Fire',
  Ice: 'Ice',
  Thunder: 'Lightning',
  Wind: 'Wind',
  Quantum: 'Quantum',
  Imaginary: 'Imaginary',
}

const SKILL_TYPE_MAP: Record<string, string> = {
  Normal: 'Basic',
  BPSkill: 'Skill',
  Ultra: 'Ultimate',
  Talent: 'Talent',
  Maze: 'Technique',
  MazeNormal: 'Other',
}

// ── Formato bruto (apenas os campos que usamos) ──────────────────────────────

interface RawCharacter {
  id: string | number
  name: string
  rarity: number
  path: string
  element: string
  ranks?: Array<string | number>
  skills?: Array<string | number>
  icon?: string
  preview?: string
  portrait?: string
}
interface RawSkill {
  id: string | number
  name: string
  type?: string
  desc?: string
  params?: number[][]
}
interface RawRank {
  id: string | number
  name: string
  rank: number
  desc?: string
  params?: number[][]
}
interface RawLightCone {
  id: string | number
  name: string
  rarity: number
  path: string
  desc?: string
  icon?: string
  preview?: string
  portrait?: string
}
interface RawLightConeRank {
  id: string | number
  skill: string
  desc: string
  params?: number[][]
}

type Table<T> = Record<string, T>

/** Tabelas de um idioma. */
export interface LangTables {
  characters: Table<RawCharacter>
  characterSkills: Table<RawSkill>
  characterRanks: Table<RawRank>
  lightCones: Table<RawLightCone>
  lightConeRanks: Table<RawLightConeRank>
}
export type AllTables = Partial<Record<Locale, LangTables>>

const FILES = {
  characters: 'characters.json',
  characterSkills: 'character_skills.json',
  characterRanks: 'character_ranks.json',
  lightCones: 'light_cones.json',
  lightConeRanks: 'light_cone_ranks.json',
} as const

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Monta um texto localizado a partir da função que lê o campo em cada idioma. */
function localized(
  tables: AllTables,
  pick: (t: LangTables) => string | undefined,
): { en: string; [k: string]: string } | null {
  const out: Record<string, string> = {}
  for (const locale of LOCALES) {
    const value = tables[locale] ? pick(tables[locale]!)?.trim() : undefined
    if (value) out[locale] = value
  }
  return out.en ? (out as { en: string }) : null
}

const cleanAsset = (value?: string) => (value ? value.replace(/^\/+/, '') : undefined)

function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

// ── Normalização ─────────────────────────────────────────────────────────────

export function normalizeCharacters(
  tables: AllTables,
  existingSlugs: Map<number, string> = new Map(),
): { items: Character[]; warnings: string[] } {
  const en = tables.en
  const warnings: string[] = []
  const items: Character[] = []
  if (!en) return { items, warnings: ['characters: faltam as tabelas em inglês'] }

  const taken = new Set<string>(existingSlugs.values())

  for (const [key, raw] of Object.entries(en.characters)) {
    const id = Number(raw.id ?? key)
    const path = PATH_MAP[raw.path]
    const element = ELEMENT_MAP[raw.element]
    if (!path || !element || ![4, 5].includes(raw.rarity)) {
      warnings.push(`characters/${id} (${raw.name}): path/element/raridade desconhecidos (${raw.path}/${raw.element}/${raw.rarity}) — ignorado`)
      continue
    }

    const name = localized(tables, (t) => t.characters[key]?.name)!
    const skills = (raw.skills ?? []).flatMap((skillId) => {
      const base = en.characterSkills[String(skillId)]
      if (!base) return []
      const skillName = localized(tables, (t) => t.characterSkills[String(skillId)]?.name)
      if (!skillName) return []
      const description = localized(tables, (t) => t.characterSkills[String(skillId)]?.desc)
      return [
        compact({
          id: Number(skillId),
          type: SKILL_TYPE_MAP[base.type ?? ''] ?? 'Other',
          name: skillName,
          description: description ?? undefined,
          params: base.params?.length ? base.params : undefined,
        }),
      ]
    })

    const eidolons = (raw.ranks ?? []).flatMap((rankId) => {
      const base = en.characterRanks[String(rankId)]
      if (!base) return []
      const rankName = localized(tables, (t) => t.characterRanks[String(rankId)]?.name)
      if (!rankName) return []
      const description = localized(tables, (t) => t.characterRanks[String(rankId)]?.desc)
      return [
        compact({
          rank: base.rank,
          name: rankName,
          description: description ?? undefined,
          params: base.params?.length ? base.params : undefined,
        }),
      ]
    })
    eidolons.sort((a, b) => a.rank - b.rank)

    // O protagonista vem como "{NICKNAME}" (o nome é do jogador): o slug vira
    // "trailblazer-<id>", sempre com o ID, pois são 8+ entradas com o mesmo nome.
    const slugSource = name.en.includes(NICKNAME_TOKEN)
      ? `${name.en.split(NICKNAME_TOKEN).join('Trailblazer')} ${id}`
      : name.en
    const slug = existingSlugs.get(id) ?? uniqueSlug(slugSource, id, taken)
    items.push({
      id,
      slug,
      name,
      rarity: raw.rarity as 4 | 5,
      path: path as Character['path'],
      element: element as Character['element'],
      announcedAt: null,
      patchReleaseDate: null,
      skills: skills as Character['skills'],
      eidolons: eidolons as Character['eidolons'],
      materialIds: [],
      images: compact({
        icon: cleanAsset(raw.icon),
        preview: cleanAsset(raw.preview),
        portrait: cleanAsset(raw.portrait),
      }),
    })
  }

  items.sort((a, b) => a.id - b.id)
  return { items, warnings }
}

export function normalizeLightCones(
  tables: AllTables,
  existingSlugs: Map<number, string> = new Map(),
): { items: LightCone[]; warnings: string[] } {
  const en = tables.en
  const warnings: string[] = []
  const items: LightCone[] = []
  if (!en) return { items, warnings: ['lightcones: faltam as tabelas em inglês'] }

  const taken = new Set<string>(existingSlugs.values())

  for (const [key, raw] of Object.entries(en.lightCones)) {
    const id = Number(raw.id ?? key)
    const path = PATH_MAP[raw.path]
    if (!path || ![3, 4, 5].includes(raw.rarity)) {
      warnings.push(`lightcones/${id} (${raw.name}): path/raridade desconhecidos (${raw.path}/${raw.rarity}) — ignorado`)
      continue
    }

    const name = localized(tables, (t) => t.lightCones[key]?.name)!
    const description = localized(tables, (t) => t.lightCones[key]?.desc)

    // A habilidade do cone fica em light_cone_ranks.json, com a mesma chave do cone.
    const rank = en.lightConeRanks[key]
    let skill: LightCone['skill']
    if (rank) {
      const skillName = localized(tables, (t) => t.lightConeRanks[key]?.skill)
      const skillDesc = localized(tables, (t) => t.lightConeRanks[key]?.desc)
      if (skillName && skillDesc) skill = { name: skillName, description: skillDesc, params: rank.params ?? [] }
    } else {
      warnings.push(`lightcones/${id} (${raw.name}): sem entrada em light_cone_ranks.json`)
    }

    const slug = existingSlugs.get(id) ?? uniqueSlug(name.en, id, taken)
    items.push(
      compact({
        id,
        slug,
        name,
        rarity: raw.rarity as 3 | 4 | 5,
        path: path as LightCone['path'],
        announcedAt: null,
        patchReleaseDate: null,
        description: description ?? undefined,
        skill,
        images: compact({
          icon: cleanAsset(raw.icon),
          preview: cleanAsset(raw.preview),
          portrait: cleanAsset(raw.portrait),
        }),
      }) as LightCone,
    )
  }

  items.sort((a, b) => a.id - b.id)
  return { items, warnings }
}

// ── Adaptador ────────────────────────────────────────────────────────────────

async function loadTables(ctx: AdapterContext): Promise<{ tables: AllTables; warnings: string[] }> {
  const tables: AllTables = {}
  const warnings: string[] = []

  for (const locale of LOCALES) {
    const dir = LANG_DIR[locale]
    try {
      const loaded = {} as LangTables
      for (const [field, file] of Object.entries(FILES)) {
        ;(loaded as unknown as Record<string, unknown>)[field] = await readJson(
          { baseUrl: ctx.baseUrl, rawDir: ctx.rawDir, offline: ctx.offline },
          `index_new/${dir}/${file}`,
        )
      }
      tables[locale] = loaded
    } catch (error) {
      // Inglês é obrigatório; os demais idiomas são opcionais.
      if (locale === 'en') throw error
      warnings.push(`idioma ${locale} indisponível: ${(error as Error).message}`)
    }
  }
  return { tables, warnings }
}

export function createStarRailResAdapter(existing: {
  characters: Map<number, string>
  lightcones: Map<number, string>
}): Adapter {
  return {
    name: 'starrailres',
    async run(ctx): Promise<AdapterResult> {
      const { tables, warnings } = await loadTables(ctx)
      const characters = normalizeCharacters(tables, existing.characters)
      const lightcones = normalizeLightCones(tables, existing.lightcones)
      return {
        characters: characters.items,
        lightcones: lightcones.items,
        warnings: [...warnings, ...characters.warnings, ...lightcones.warnings],
      }
    },
  }
}
