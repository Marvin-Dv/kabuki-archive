import { z } from 'zod'
import { assetPath, embargoFields, localizedText, paramTable, path } from './common'

/** Habilidade do cone de luz, com os 5 níveis de sobreposição. */
export const lightConeSkill = z.object({
  name: localizedText,
  /** Template com placeholders; `params[0]` é a sobreposição 1, `params[4]` a 5. */
  description: localizedText,
  params: paramTable.default([]),
})

export const lightCone = z.object({
  /** ID numérico estável do jogo (chave primária). */
  id: z.number().int().positive(),
  /** Usado na URL: /light-cones/<slug>. */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: localizedText,
  rarity: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  path,
  ...embargoFields,
  /** Texto de ambientação do cone. */
  description: localizedText.optional(),
  skill: lightConeSkill.optional(),
  images: z
    .object({
      icon: assetPath.optional(),
      preview: assetPath.optional(),
      portrait: assetPath.optional(),
    })
    .default({}),
})

export type LightCone = z.infer<typeof lightCone>
