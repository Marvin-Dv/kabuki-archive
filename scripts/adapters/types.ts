// Contrato comum dos adaptadores de ingestão. Cada fonte expõe `run`, e o
// orquestrador isola falhas: uma fonte quebrada não derruba as outras.

import type { Character, LightCone, Material, Property } from '../../schema'

export interface AdapterContext {
  /** URL (https://...) ou pasta local de onde ler os índices. */
  baseUrl: string
  /** Pasta de cache bruto (data/raw/<fonte>). */
  rawDir: string
  /** Lê só do cache, sem rede. */
  offline: boolean
}

export interface AdapterResult {
  characters: Character[]
  lightcones: LightCone[]
  materials: Material[]
  properties: Property[]
  /** Avisos não fatais (entidades ignoradas, campos ausentes...). */
  warnings: string[]
}

export interface Adapter {
  name: string
  run(ctx: AdapterContext): Promise<AdapterResult>
}
