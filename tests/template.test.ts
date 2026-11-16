import { describe, expect, it } from 'vitest'
import { placeholderCount, renderTemplate } from '../utils/template'

describe('renderTemplate', () => {
  it('formata percentuais, inteiros e decimais', () => {
    expect(renderTemplate('Deals #1[i]% DMG', [0.5])).toBe('Deals 50% DMG')
    expect(renderTemplate('#1[f1] turns', [2.5])).toBe('2.5 turns')
    expect(renderTemplate('#1[f1]%', [0.055])).toBe('5.5%')
  })

  it('não gera ruído de ponto flutuante', () => {
    expect(renderTemplate('#1[i]%', [0.55])).toBe('55%')
  })

  it('mantém o placeholder quando falta o parâmetro', () => {
    expect(renderTemplate('#1[i]% e #2[i]%', [0.5])).toBe('50% e #2[i]%')
  })

  it('remove tags quando pedido', () => {
    expect(renderTemplate('<unbreak>#1[i]%</unbreak>', [0.2], { stripTags: true })).toBe('20%')
  })

  it('conta placeholders distintos', () => {
    expect(placeholderCount('#1[i]% #1[i]% #2[f1]')).toBe(2)
  })
})
