// Adaptador do StarRailRes (https://github.com/Mar-7th/StarRailRes).
//
// Lê `index_new/<idioma>/*.json` e normaliza para os schemas do projeto.
// As funções `normalize*` são puras (recebem as tabelas já carregadas) para
// poderem ser testadas com fixtures, sem rede.

import {
  LOCALES,
  type Character,
  type ItemAmount,
  type LightCone,
  type Locale,
  type Material,
  type Property,
  type PropertyValue,
} from '../../schema'
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
  max_sp?: number
  ranks?: Array<string | number>
  skills?: Array<string | number>
  skill_trees?: Array<string | number>
  icon?: string
  preview?: string
  portrait?: string
}
interface RawSkill {
  id: string | number
  name: string
  type?: string
  type_text?: string
  effect_text?: string
  simple_desc?: string
  max_level?: number
  icon?: string
  desc?: string
  params?: number[][]
}
interface RawAmount {
  id: string | number
  num: number
}
interface RawRank {
  id: string | number
  name: string
  rank: number
  desc?: string
  params?: number[][]
  icon?: string
  materials?: RawAmount[]
  level_up_skills?: RawAmount[]
}
interface RawTree {
  id: string | number
  name: string
  max_level: number
  desc?: string
  params?: number[][]
  anchor: string
  pre_points?: Array<string | number>
  level_up_skills?: RawAmount[]
  icon?: string
  levels?: Array<{
    promotion: number
    level: number
    properties?: Array<{ type: string; value: number }>
    materials?: RawAmount[]
  }>
}
interface RawScale {
  base: number
  step: number
}
interface RawPromotion {
  id: string | number
  values: Array<Record<string, RawScale>>
  materials: RawAmount[][]
}
interface RawItem {
  id: string | number
  name: string
  type: string
  sub_type: string
  rarity: number
  icon?: string
  come_from?: string[]
}
interface RawProperty {
  type: string
  name: string
  percent: boolean
  order: number
  icon?: string
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
  properties?: Array<Array<{ type: string; value: number }>>
}

type Table<T> = Record<string, T>

/** Tabelas de um idioma. */
export interface LangTables {
  characters: Table<RawCharacter>
  characterSkills: Table<RawSkill>
  characterRanks: Table<RawRank>
  lightCones: Table<RawLightCone>
  lightConeRanks: Table<RawLightConeRank>
  characterSkillTrees?: Table<RawTree>
  items?: Table<RawItem>
  properties?: Table<RawProperty>
  /** Só no inglês: números não mudam de idioma para idioma. */
  characterPromotions?: Table<RawPromotion>
  lightConePromotions?: Table<RawPromotion>
}
export type AllTables = Partial<Record<Locale, LangTables>>

/** Arquivos lidos em todos os idiomas (têm texto). */
const FILES = {
  characters: 'characters.json',
  characterSkills: 'character_skills.json',
  characterRanks: 'character_ranks.json',
  characterSkillTrees: 'character_skill_trees.json',
  lightCones: 'light_cones.json',
  lightConeRanks: 'light_cone_ranks.json',
  items: 'items.json',
  properties: 'properties.json',
} as const

/** Arquivos só numéricos: lidos apenas em inglês. */
const EN_ONLY_FILES = {
  characterPromotions: 'character_promotions.json',
  lightConePromotions: 'light_cone_promotions.json',
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

/** Lista de textos por idioma (ex.: onde obter um item). Null se nenhum idioma tiver itens. */
function localizedList(
  tables: AllTables,
  pick: (t: LangTables) => string[] | undefined,
): { en: string[]; [k: string]: string[] } | null {
  const out: Record<string, string[]> = {}
  for (const locale of LOCALES) {
    const list = tables[locale] ? pick(tables[locale]!) : undefined
    if (list?.length) out[locale] = list.map((item) => item.trim()).filter(Boolean)
  }
  if (!Object.keys(out).length) return null
  return { en: [], ...out } as { en: string[]; [k: string]: string[] }
}

const cleanAsset = (value?: string) => (value ? value.replace(/^\/+/, '') : undefined)

const amounts = (list?: RawAmount[]): ItemAmount[] =>
  (list ?? []).map((m) => ({ id: Number(m.id), num: Number(m.num) })).filter((m) => m.num > 0)

const properties = (list?: Array<{ type: string; value: number }>): PropertyValue[] =>
  (list ?? []).map((p) => ({ type: p.type, value: p.value }))

/** [{ hp: {base, step}, ... }] por ascensão, com os nomes do schema. Null se faltar algo. */
function statRows<K extends string>(
  values: Array<Record<string, RawScale>> | undefined,
  map: Record<K, string>,
): Array<Record<K, RawScale>> | null {
  if (!values || values.length !== 7) return null
  const rows = values.map((row) => {
    const out = {} as Record<K, RawScale>
    for (const [target, source] of Object.entries(map) as Array<[K, string]>) {
      const scale = row[source]
      if (!scale || typeof scale.base !== 'number' || typeof scale.step !== 'number') return null
      out[target] = { base: scale.base, step: scale.step }
    }
    return out
  })
  return rows.every(Boolean) ? (rows as Array<Record<K, RawScale>>) : null
}

/** Materiais por ascensão: a fonte traz 7 listas (a última, vazia, é o fim da escada). */
const ascensionSteps = (materials?: RawAmount[][]): ItemAmount[][] | null =>
  materials && materials.length >= 6 ? materials.slice(0, 6).map(amounts) : null

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
      const summary = localized(tables, (t) => t.characterSkills[String(skillId)]?.simple_desc)
      const typeText = localized(tables, (t) => t.characterSkills[String(skillId)]?.type_text)
      const targetText = localized(tables, (t) => t.characterSkills[String(skillId)]?.effect_text)
      return [
        compact({
          id: Number(skillId),
          type: SKILL_TYPE_MAP[base.type ?? ''] ?? 'Other',
          name: skillName,
          description: description ?? undefined,
          params: base.params?.length ? base.params : undefined,
          icon: cleanAsset(base.icon),
          maxLevel: base.max_level || undefined,
          summary: summary ?? undefined,
          typeText: typeText ?? undefined,
          targetText: targetText ?? undefined,
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
          icon: cleanAsset(base.icon),
          materials: amounts(base.materials),
          levelUpSkills: (base.level_up_skills ?? []).map((l) => ({ id: Number(l.id), num: Number(l.num) })),
        }),
      ]
    })
    eidolons.sort((a, b) => a.rank - b.rank)

    const traces = buildTraces(raw, tables, warnings, id)

    const promotion = en.characterPromotions?.[key]
    const stats = statRows(promotion?.values, {
      hp: 'hp',
      atk: 'atk',
      def: 'def',
      spd: 'spd',
      taunt: 'taunt',
      critRate: 'crit_rate',
      critDmg: 'crit_dmg',
    })
    const ascension = ascensionSteps(promotion?.materials)
    if (!stats || !ascension) warnings.push(`characters/${id} (${raw.name}): sem atributos/ascensão completos em character_promotions.json`)

    // Todo material que o personagem usa, para ligar com a coleção `materials`.
    const used = new Set<number>()
    for (const step of ascension ?? []) for (const m of step) used.add(m.id)
    for (const t of traces) for (const level of t.levels) for (const m of level.materials) used.add(m.id)
    for (const e of eidolons) for (const m of e.materials as ItemAmount[]) used.add(m.id)

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
      ...compact({
        maxEnergy: raw.max_sp || undefined,
        stats: (stats ?? undefined) as Character['stats'],
        ascension: ascension ?? undefined,
      }),
      traces,
      materialIds: [...used].sort((a, b) => a - b),
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
      if (skillName && skillDesc) {
        skill = {
          name: skillName,
          description: skillDesc,
          params: rank.params ?? [],
          properties: (rank.properties ?? []).map(properties),
        }
      }
    } else {
      warnings.push(`lightcones/${id} (${raw.name}): sem entrada em light_cone_ranks.json`)
    }

    const promotion = en.lightConePromotions?.[key]
    const stats = statRows(promotion?.values, { hp: 'hp', atk: 'atk', def: 'def' })
    const ascension = ascensionSteps(promotion?.materials)
    if (!stats || !ascension) warnings.push(`lightcones/${id} (${raw.name}): sem atributos/ascensão completos em light_cone_promotions.json`)

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
        stats: (stats ?? undefined) as LightCone['stats'],
        ascension: ascension ?? undefined,
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

/** Árvore de traços: estrutura e custos vêm do inglês; nomes e descrições, de cada idioma. */
function buildTraces(raw: RawCharacter, tables: AllTables, warnings: string[], characterId: number): Character['traces'] {
  const en = tables.en!
  const traces: Character['traces'] = []
  for (const treeId of raw.skill_trees ?? []) {
    const key = String(treeId)
    const base = en.characterSkillTrees?.[key]
    if (!base) {
      warnings.push(`characters/${characterId}: traço ${key} ausente em character_skill_trees.json`)
      continue
    }
    const name = localized(tables, (t) => t.characterSkillTrees?.[key]?.name)
    const description = localized(tables, (t) => t.characterSkillTrees?.[key]?.desc)
    traces.push(
      compact({
        id: Number(treeId),
        anchor: base.anchor,
        name: name ?? undefined,
        description: description ?? undefined,
        params: base.params?.length ? base.params : undefined,
        icon: cleanAsset(base.icon),
        maxLevel: base.max_level,
        prerequisites: (base.pre_points ?? []).map(Number),
        skillIds: (base.level_up_skills ?? []).map((l) => Number(l.id)),
        levels: (base.levels ?? []).map((l) => ({
          promotion: l.promotion,
          level: l.level,
          properties: properties(l.properties),
          materials: amounts(l.materials),
        })),
      }) as Character['traces'][number],
    )
  }
  return traces
}

/** Materiais realmente usados (o catálogo do jogo tem 4 mil itens; só ~230 importam aqui). */
export function normalizeMaterials(
  tables: AllTables,
  ids: Set<number>,
  existingSlugs: Map<number, string> = new Map(),
): { items: Material[]; warnings: string[] } {
  const en = tables.en
  const warnings: string[] = []
  const items: Material[] = []
  if (!en?.items) return { items, warnings: ['materials: faltam as tabelas de itens'] }

  const taken = new Set<string>(existingSlugs.values())
  for (const id of [...ids].sort((a, b) => a - b)) {
    const key = String(id)
    const raw = en.items[key]
    if (!raw) {
      warnings.push(`materials/${id}: item usado, mas ausente em items.json — ignorado`)
      continue
    }
    const name = localized(tables, (t) => t.items?.[key]?.name)
    if (!name || ![1, 2, 3, 4, 5].includes(raw.rarity)) {
      warnings.push(`materials/${id} (${raw.name}): nome ou raridade inválidos (${raw.rarity}) — ignorado`)
      continue
    }
    const sources = localizedList(tables, (t) => t.items?.[key]?.come_from)
    items.push(
      compact({
        id,
        slug: existingSlugs.get(id) ?? uniqueSlug(name.en, id, taken),
        name,
        rarity: raw.rarity,
        type: raw.type,
        subType: raw.sub_type,
        announcedAt: null,
        patchReleaseDate: null,
        icon: cleanAsset(raw.icon),
        sources: sources ?? undefined,
      }) as Material,
    )
  }
  return { items, warnings }
}

/** Nomes dos atributos (HP, ATK, "DMG Boost: Ice"...) em cada idioma. */
export function normalizeProperties(tables: AllTables): { items: Property[]; warnings: string[] } {
  const en = tables.en
  const items: Property[] = []
  if (!en?.properties) return { items, warnings: ['properties: faltam as tabelas de propriedades'] }
  for (const [key, raw] of Object.entries(en.properties)) {
    const name = localized(tables, (t) => t.properties?.[key]?.name)
    if (!name) continue // propriedades internas, sem nome exibível
    items.push(
      compact({
        id: raw.order,
        type: raw.type,
        name,
        icon: cleanAsset(raw.icon),
        percent: raw.percent,
      }) as Property,
    )
  }
  items.sort((a, b) => a.id - b.id)
  return { items, warnings: [] }
}

// ── Adaptador ────────────────────────────────────────────────────────────────

async function loadTables(ctx: AdapterContext): Promise<{ tables: AllTables; warnings: string[] }> {
  const tables: AllTables = {}
  const warnings: string[] = []
  const source = { baseUrl: ctx.baseUrl, rawDir: ctx.rawDir, offline: ctx.offline }

  for (const locale of LOCALES) {
    const dir = LANG_DIR[locale]
    try {
      const loaded = {} as Record<string, unknown>
      // Em inglês também vêm os arquivos só numéricos (atributos e custos de ascensão).
      const files: Record<string, string> = locale === 'en' ? { ...FILES, ...EN_ONLY_FILES } : FILES
      for (const [field, file] of Object.entries(files)) {
        loaded[field] = await readJson(source, `index_new/${dir}/${file}`)
      }
      tables[locale] = loaded as unknown as LangTables
    } catch (error) {
      // Inglês é obrigatório; os demais idiomas são opcionais.
      if (locale === 'en') throw error
      warnings.push(`idioma ${locale} indisponível: ${(error as Error).message}`)
    }
  }
  return { tables, warnings }
}

/** Atributos usados em traços e cones que não têm nome em properties.json (a UI mostraria a chave crua). */
function unknownProperties(
  tables: AllTables,
  characters: Character[],
  lightcones: LightCone[],
  known: Property[],
): string[] {
  const names = new Set(known.map((p) => p.type))
  const used = new Set<string>()
  for (const c of characters) for (const t of c.traces) for (const l of t.levels) for (const p of l.properties) used.add(p.type)
  for (const lc of lightcones) for (const rows of lc.skill?.properties ?? []) for (const p of rows) used.add(p.type)
  return [...used].filter((type) => !names.has(type)).sort()
}

export function createStarRailResAdapter(existing: {
  characters: Map<number, string>
  lightcones: Map<number, string>
  materials: Map<number, string>
}): Adapter {
  return {
    name: 'starrailres',
    async run(ctx): Promise<AdapterResult> {
      const { tables, warnings } = await loadTables(ctx)
      const characters = normalizeCharacters(tables, existing.characters)
      const lightcones = normalizeLightCones(tables, existing.lightcones)

      // Só entram na coleção os materiais que algum personagem ou cone realmente usa.
      const used = new Set<number>()
      for (const c of characters.items) for (const id of c.materialIds) used.add(id)
      for (const lc of lightcones.items) for (const step of lc.ascension ?? []) for (const m of step) used.add(m.id)
      const materials = normalizeMaterials(tables, used, existing.materials)
      const properties = normalizeProperties(tables)

      const missing = unknownProperties(tables, characters.items, lightcones.items, properties.items)
      const extra = missing.length ? [`atributos sem nome em properties.json: ${missing.join(', ')}`] : []

      return {
        characters: characters.items,
        lightcones: lightcones.items,
        materials: materials.items,
        properties: properties.items,
        warnings: [
          ...warnings,
          ...characters.warnings,
          ...lightcones.warnings,
          ...materials.warnings,
          ...properties.warnings,
          ...extra,
        ],
      }
    },
  }
}
