import { z } from 'zod'
import { ELEMENTS, PATHS } from './constants'

// Listas e tipos básicos vivem em constants.ts (sem zod), para o front-end poder
// usá-los sem levar a biblioteca de validação para o navegador.
export * from './constants'

/**
 * Texto localizado. Exige ao menos o inglês (fonte mais completa) e aceita
 * os demais idiomas de forma parcial; o site cai para inglês quando faltar.
 */
export const localizedText = z
  .object({
    en: z.string().min(1),
    'pt-BR': z.string().optional(),
    'zh-CN': z.string().optional(),
    ja: z.string().optional(),
    ko: z.string().optional(),
  })
  .strict()
export type LocalizedText = z.infer<typeof localizedText>

export const element = z.enum(ELEMENTS)

export const path = z.enum(PATHS)

/** Data no formato YYYY-MM-DD. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use o formato YYYY-MM-DD')

/**
 * Campos de embargo presentes em toda entidade publicável.
 * Ver `utils/spoiler.ts` e `data/README.md`.
 */
export const embargoFields = {
  /** Data do anúncio oficial. Sem ela, a entidade não é publicada. */
  announcedAt: isoDate.nullable().default(null),
  /** Data de lançamento do patch em que a entidade entra. */
  patchReleaseDate: isoDate.nullable().default(null),
  /** Versão do jogo, ex.: "3.8". */
  version: z.string().regex(/^\d+\.\d+$/).optional(),
}

/**
 * Caminho relativo de um asset no StarRailRes (ex.: "icon/character/1001.png").
 * O site monta a URL final a partir de `utils/assets.ts`, então trocar de CDN
 * não exige regenerar os dados.
 */
export const assetPath = z.string().min(1)

/** Parâmetros numéricos por nível/rank usados nos templates de descrição. */
export const paramTable = z.array(z.array(z.number()))
