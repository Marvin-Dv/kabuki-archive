// Constantes do domínio SEM dependências (sem zod).
// O front-end importa daqui; os schemas (schema/common.ts) reexportam.

/** Idiomas suportados pelo site. */
export const LOCALES = ['pt-BR', 'en', 'zh-CN', 'ja', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

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
export type ElementName = (typeof ELEMENTS)[number]

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
  'Elation',
] as const
export type PathName = (typeof PATHS)[number]

/** Valor que cresce por nível (ver `utils/stats.ts`). Mesma forma de `statScale` em schema/common.ts. */
export interface StatScale {
  base: number
  step: number
}
