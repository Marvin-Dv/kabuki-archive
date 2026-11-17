import { z } from 'zod'
import { assetPath, embargoFields, itemAmount, localizedText, paramTable, path, propertyValue, statScale } from './common'

/** Habilidade do cone de luz, com os 5 níveis de sobreposição. */
export const lightConeSkill = z.object({
  name: localizedText,
  /** Template com placeholders; `params[0]` é a sobreposição 1, `params[4]` a 5. */
  description: localizedText,
  params: paramTable.default([]),
  /** Bônus de atributo por sobreposição (5 entradas; vazias quando a habilidade não dá atributo). */
  properties: z.array(z.array(propertyValue)).default([]),
})

/** Atributos do cone em uma ascensão (ver `utils/stats.ts`). */
export const lightConeStats = z.object({ hp: statScale, atk: statScale, def: statScale })

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
  /** Atributos nas 7 ascensões (0 a 6). */
  stats: z.array(lightConeStats).length(7).optional(),
  /** Materiais para subir de cada ascensão (de 0→1 até 5→6). */
  ascension: z.array(z.array(itemAmount)).length(6).optional(),
  images: z
    .object({
      icon: assetPath.optional(),
      preview: assetPath.optional(),
      portrait: assetPath.optional(),
    })
    .default({}),
})

export type LightCone = z.infer<typeof lightCone>
