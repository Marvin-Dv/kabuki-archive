import { describe, expect, it } from 'vitest'
import { slugify, uniqueSlug } from '../utils/slug'

describe('slug', () => {
  it('normaliza acentos, apóstrofos e símbolos', () => {
    expect(slugify("Dan Heng • Imbibitor Lunae")).toBe('dan-heng-imbibitor-lunae')
    expect(slugify("Welt's Café")).toBe('welts-cafe')
  })

  it('desambigua colisões com o ID', () => {
    const taken = new Set<string>()
    expect(uniqueSlug('Trailblazer', 8001, taken)).toBe('trailblazer')
    expect(uniqueSlug('Trailblazer', 8002, taken)).toBe('trailblazer-8002')
  })

  it('usa o ID quando o nome não gera slug', () => {
    expect(uniqueSlug('???', 77, new Set())).toBe('item-77')
  })
})
