import { z } from 'zod'
import {
  assetPath,
  element,
  embargoFields,
  itemAmount,
  localizedText,
  paramTable,
  path,
  propertyValue,
  statScale,
} from './common'

const skillType = z.enum([
  'Basic',
  'Skill',
  'Ultimate',
  'Talent',
  'Technique',
  'Memosprite',
  'Other',
])

export const skill = z.object({
  id: z.number().int(),
  type: skillType,
  name: localizedText,
  /** Template com placeholders (`#1[i]%`); renderize com `utils/template.ts`. */
  description: localizedText.optional(),
  /** Valores por nível; `params[nivel - 1][n - 1]` alimenta o placeholder `#n`. */
  params: paramTable.optional(),
  icon: assetPath.optional(),
  /** Nível máximo da habilidade (sem eidolons). */
  maxLevel: z.number().int().positive().optional(),
  /** Resumo de uma linha. */
  summary: localizedText.optional(),
  /** Rótulo do tipo no idioma do jogo (ex.: "Basic ATK"). */
  typeText: localizedText.optional(),
  /** Alvo no idioma do jogo (ex.: "Single Target"). */
  targetText: localizedText.optional(),
})

export const eidolon = z.object({
  rank: z.number().int().min(1).max(6),
  name: localizedText,
  description: localizedText.optional(),
  params: paramTable.optional(),
  icon: assetPath.optional(),
  /** Item de eidolon (ex.: "March 7th: Preservation's Eidolon") consumido ao ativar. */
  materials: z.array(itemAmount).default([]),
  /** Eidolons que sobem o nível de habilidades (ex.: E3/E5 → +2). */
  levelUpSkills: z.array(z.object({ id: z.number().int(), num: z.number().int() })).default([]),
})

/** Nível de um traço: exigência de ascensão/nível, bônus e custo. */
export const traceLevel = z.object({
  /** Ascensão mínima do personagem (0–6). */
  promotion: z.number().int().min(0).max(6),
  /** Nível mínimo do personagem (0 = sem exigência de nível). */
  level: z.number().int().min(0),
  properties: z.array(propertyValue).default([]),
  materials: z.array(itemAmount).default([]),
})

/**
 * Nó da árvore de traços. Três tipos, distinguíveis pelos campos:
 * - `skillIds` não vazio                → sobe o nível de uma habilidade (um nível por entrada de `levels`);
 * - `levels[0].properties` não vazio    → bônus de atributo (ex.: "DMG Boost: Ice", com `name`);
 * - nenhum dos dois                     → traço menor com habilidade própria (ex.: "Purify", com `description`).
 */
export const trace = z.object({
  id: z.number().int().positive(),
  /** Posição na árvore ("Point06"). */
  anchor: z.string(),
  name: localizedText.optional(),
  description: localizedText.optional(),
  params: paramTable.optional(),
  icon: assetPath.optional(),
  maxLevel: z.number().int().positive(),
  /** Traços que precisam estar liberados antes deste. */
  prerequisites: z.array(z.number().int()).default([]),
  skillIds: z.array(z.number().int()).default([]),
  levels: z.array(traceLevel).default([]),
})

/** Atributos de um personagem em uma ascensão (ver `utils/stats.ts`). */
export const characterStats = z.object({
  hp: statScale,
  atk: statScale,
  def: statScale,
  spd: statScale,
  taunt: statScale,
  critRate: statScale,
  critDmg: statScale,
})

export const character = z.object({
  /** ID numérico estável do jogo (chave primária). */
  id: z.number().int().positive(),
  /** Usado na URL: /characters/<slug>. */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: localizedText,
  rarity: z.union([z.literal(4), z.literal(5)]),
  path,
  element,
  ...embargoFields,
  /** Lore e descrição curta (HoYoWiki). */
  description: localizedText.optional(),
  images: z
    .object({
      icon: assetPath.optional(),
      preview: assetPath.optional(),
      portrait: assetPath.optional(),
    })
    .default({}),
  skills: z.array(skill).default([]),
  eidolons: z.array(eidolon).max(6).default([]),
  /** Energia máxima da Perícia Suprema. */
  maxEnergy: z.number().int().positive().optional(),
  /** Atributos nas 7 ascensões (0 a 6), da menor para a maior. */
  stats: z.array(characterStats).length(7).optional(),
  /** Materiais para subir de cada ascensão (de 0→1 até 5→6). */
  ascension: z.array(z.array(itemAmount)).length(6).optional(),
  traces: z.array(trace).default([]),
  /** Todos os materiais que o personagem usa (ascensão, traços, eidolons); liga com a coleção `materials`. */
  materialIds: z.array(z.number().int()).default([]),
})

export type Character = z.infer<typeof character>
