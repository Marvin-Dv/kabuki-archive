import type { ZodTypeAny } from 'zod'
import { character } from './character'
import { lightCone } from './lightcone'
import { material, property } from './material'

export * from './common'
export * from './character'
export * from './lightcone'
export * from './material'

/**
 * Coleções validadas pelo pipeline: nome da pasta em data/generated/ → schema.
 * Cada fase nova adiciona entradas aqui (lightcones, relics, enemies, materials...).
 */
export const collections: Record<string, ZodTypeAny> = {
  characters: character,
  lightcones: lightCone,
  materials: material,
  properties: property,
}
