// Cálculo de atributos por nível e ascensão.
//
// Os dados guardam, para cada ascensão (0 a 6), um `base` e um `step` por atributo:
//   valor(nível, ascensão) = base + step × (nível − 1)
// Cada ascensão libera mais níveis: 20, 30, 40, 50, 60, 70 e 80.
// Conferido com o jogo: March 7th, nível 80 (ascensão 6) → HP 1058, ATQ 511, DEF 573, VEL 101.
// O jogo exibe o valor truncado (511.6 aparece como 511): use `displayStat`.

import type { StatScale } from '../schema/constants'

export const MAX_PROMOTION = 6
export const MAX_LEVEL = 80

/** Nível máximo permitido em uma ascensão: 20, 30, ..., 80. */
export const maxLevelFor = (promotion: number): number => 20 + 10 * clamp(promotion, 0, MAX_PROMOTION)

/** Menor ascensão em que o nível existe (nível 20 → 0, nível 21 → 1, nível 80 → 6). */
export const minPromotionFor = (level: number): number =>
  clamp(Math.ceil((clamp(level, 1, MAX_LEVEL) - 20) / 10), 0, MAX_PROMOTION)

/** Valor de um atributo em um nível, dentro de uma ascensão. */
export const scaleValue = (scale: StatScale, level: number): number =>
  scale.base + scale.step * (level - 1)

/**
 * Todos os atributos de uma ascensão no nível pedido.
 * Sem `promotion`, usa a menor ascensão que permite o nível (ex.: nível 70 → ascensão 5).
 * Se o nível passar do máximo da ascensão, ele é limitado (ascensão 2 + nível 80 → nível 40).
 */
export function statsAt<T extends Record<string, StatScale>>(
  stats: readonly T[],
  level: number,
  promotion: number = minPromotionFor(level),
): { [K in keyof T]: number } {
  const p = clamp(promotion, 0, Math.min(MAX_PROMOTION, stats.length - 1))
  const lv = clamp(level, 1, maxLevelFor(p))
  const row = stats[p]
  const result = {} as { [K in keyof T]: number }
  for (const key of Object.keys(row) as Array<keyof T>) {
    result[key] = scaleValue(row[key] as StatScale, lv)
  }
  return result
}

/** Valor como o jogo exibe: truncado (a precisão de ponto flutuante não vaza). */
export const displayStat = (value: number): number => Math.floor(value + 1e-6)

/** Taxas (CRIT, etc.) são frações: 0.05 → "5%". Uma casa decimal, sem arredondar para cima. */
export const displayPercent = (fraction: number): string =>
  `${(Math.floor(fraction * 1000 + 1e-6) / 10).toFixed(1)}%`

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
