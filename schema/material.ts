import { z } from 'zod'
import { assetPath, embargoFields, localizedList, localizedText } from './common'

/** Item usado em ascensão, traços ou eidolons (inclui Créditos). */
export const material = z.object({
  /** ID do item no jogo (chave primária). */
  id: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: localizedText,
  rarity: z.number().int().min(1).max(5),
  /** Tipo do jogo (ex.: "Material", "Virtual"). */
  type: z.string(),
  /** Subtipo do jogo (ex.: "TracePath", "CommonMonsterDrop", "Eidolon"). */
  subType: z.string(),
  ...embargoFields,
  icon: assetPath.optional(),
  /** Onde obter, no idioma do jogo. */
  sources: localizedList.optional(),
})
export type Material = z.infer<typeof material>

/**
 * Nome de um atributo (HP, ATK, "DMG Boost: Ice"...) em cada idioma.
 * `id` é a ordem de exibição do jogo; `type` é a chave usada em `propertyValue.type`.
 */
export const property = z.object({
  id: z.number().int().positive(),
  type: z.string().min(1),
  name: localizedText,
  icon: assetPath.optional(),
  /** `true` → valor é fração (0.05 = 5%). */
  percent: z.boolean(),
})
export type Property = z.infer<typeof property>
