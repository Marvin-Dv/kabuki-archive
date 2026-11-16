import { z } from 'zod'

/** Idiomas suportados pelo site. */
export const LOCALES = ['pt-BR', 'en', 'zh-CN', 'ja', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

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

/** Elementos do jogo. */
export const ELEMENTS = [
  'Physical',
  'Fire',
  'Ice',
  'Lightning',
  'Wind',
  'Quantum',
  'Imaginary',
] as const
export const element = z.enum(ELEMENTS)

/**
 * Caminhos do jogo. Se o jogo lançar um caminho novo, o validador falha de
 * propósito: adicione-o aqui (e o ícone/tradução correspondente).
 */
export const PATHS = [
  'Destruction',
  'Hunt',
  'Erudition',
  'Harmony',
  'Nihility',
  'Preservation',
  'Abundance',
  'Remembrance',
] as const
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
