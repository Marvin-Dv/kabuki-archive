import { describe, expect, it } from 'vitest'
import { applyOverride } from '../utils/merge'

describe('applyOverride', () => {
  it('retorna a base quando não há override', () => {
    expect(applyOverride({ a: 1 }, undefined)).toEqual({ a: 1 })
  })

  it('mescla objetos aninhados', () => {
    const base = { name: { en: 'Sparkle', ja: '花火' }, rarity: 5 }
    const override = { name: { 'pt-BR': 'Sparkle' } }
    expect(applyOverride(base, override)).toEqual({
      name: { en: 'Sparkle', ja: '花火', 'pt-BR': 'Sparkle' },
      rarity: 5,
    })
  })

  it('substitui arrays por completo', () => {
    expect(applyOverride({ tags: ['a', 'b'] }, { tags: ['c'] })).toEqual({ tags: ['c'] })
  })

  it('remove campos com null', () => {
    expect(applyOverride({ a: 1, b: 2 }, { b: null })).toEqual({ a: 1 })
  })

  it('não altera o objeto original', () => {
    const base = { a: { b: 1 } }
    applyOverride(base, { a: { b: 2 } })
    expect(base).toEqual({ a: { b: 1 } })
  })
})
