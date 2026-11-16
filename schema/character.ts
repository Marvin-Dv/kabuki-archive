import { z } from 'zod'
import { element, embargoFields, localizedText, path } from './common'

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
  description: localizedText.optional(),
})

export const eidolon = z.object({
  rank: z.number().int().min(1).max(6),
  name: localizedText,
  description: localizedText.optional(),
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
  skills: z.array(skill).default([]),
  eidolons: z.array(eidolon).max(6).default([]),
  /** IDs de materiais de ascensão e traços (ligação com a coleção de materiais). */
  materialIds: z.array(z.number().int()).default([]),
})

export type Character = z.infer<typeof character>
