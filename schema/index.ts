import type { ZodTypeAny } from 'zod'
import { character } from './character'

export * from './common'
export * from './character'

/**
 * Coleções validadas pelo pipeline: nome da pasta em data/generated/ → schema.
 * Cada fase nova adiciona entradas aqui (lightcones, relics, enemies, materials...).
 */
export const collections: Record<string, ZodTypeAny> = {
  characters: character,
}
