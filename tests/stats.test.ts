import { describe, expect, it } from 'vitest'
import { displayPercent, displayStat, maxLevelFor, minPromotionFor, scaleValue, statsAt } from '../utils/stats'

// Valores reais da March 7th (StarRailRes 4.7.0), ascensões 0 e 6.
const row = (hp: number, atk: number, def: number) => ({
  hp: { base: hp, step: 7.2 },
  atk: { base: atk, step: 3.48 },
  def: { base: def, step: 3.9 },
  spd: { base: 101, step: 0 },
})
// Ascensão a ascensão, como em character_promotions.json (a ATQ sobe 27,84 por ascensão).
const real = [
  row(144, 69.6, 78),
  row(201.6, 97.44, 109.2),
  row(259.2, 125.28, 140.4),
  row(316.8, 153.12, 171.6),
  row(374.4, 180.96, 202.8),
  row(432, 208.8, 234),
  row(489.6, 236.64, 265.2),
]

describe('níveis e ascensões', () => {
  it('cada ascensão libera 10 níveis a mais', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(maxLevelFor)).toEqual([20, 30, 40, 50, 60, 70, 80])
  })

  it('acha a menor ascensão que permite o nível', () => {
    expect([1, 20, 21, 30, 31, 70, 71, 80].map(minPromotionFor)).toEqual([0, 0, 1, 1, 2, 5, 6, 6])
  })

  it('limita valores fora do intervalo', () => {
    expect(maxLevelFor(99)).toBe(80)
    expect(minPromotionFor(500)).toBe(6)
    expect(minPromotionFor(-3)).toBe(0)
  })
})

describe('statsAt', () => {
  it('bate com o jogo: March 7th nível 80 (ascensão 6)', () => {
    const s = statsAt(real, 80)
    expect(displayStat(s.hp)).toBe(1058)
    expect(displayStat(s.atk)).toBe(511)
    expect(displayStat(s.def)).toBe(573)
    expect(s.spd).toBe(101)
  })

  it('nível 1 é o valor base da ascensão 0', () => {
    const s = statsAt(real, 1)
    expect(s.hp).toBe(144)
    expect(s.atk).toBe(69.6)
  })

  it('uma mesma ascensão no nível máximo e a seguinte no nível 20 diferem pelo salto da ascensão', () => {
    const maxedP0 = statsAt(real, 20, 0).hp // 144 + 7.2 × 19
    const freshP1 = statsAt(real, 20, 1).hp // 201.6 + 7.2 × 19
    expect(displayStat(maxedP0)).toBe(280)
    expect(displayStat(freshP1)).toBe(338)
  })

  it('limita o nível ao máximo da ascensão', () => {
    expect(statsAt(real, 80, 2).hp).toBe(statsAt(real, 40, 2).hp)
  })

  it('sem ascensão informada, usa a menor possível', () => {
    expect(statsAt(real, 70).hp).toBe(statsAt(real, 70, 5).hp)
  })

  it('não quebra com menos ascensões do que o esperado', () => {
    expect(statsAt([real[0]], 80, 6).hp).toBe(statsAt([real[0]], 20, 0).hp)
  })

  it('scaleValue aplica base + passo × (nível − 1)', () => {
    expect(scaleValue({ base: 10, step: 2 }, 6)).toBe(20)
  })
})

describe('exibição', () => {
  it('trunca como o jogo', () => {
    expect(displayStat(511.6)).toBe(511)
    expect(displayStat(1058.4)).toBe(1058)
    expect(displayStat(100)).toBe(100)
  })

  it('percentuais com uma casa, sem erro de ponto flutuante', () => {
    expect(displayPercent(0.05)).toBe('5.0%')
    expect(displayPercent(0.5)).toBe('50.0%')
    expect(displayPercent(0.288)).toBe('28.8%')
    expect(displayPercent(0.1)).toBe('10.0%')
  })
})
