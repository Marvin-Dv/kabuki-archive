import { describe, expect, it } from 'vitest'
import { character } from '../schema/character'

const valid = {
  id: 9999,
  slug: 'personagem-teste',
  name: { en: 'Test Character', 'pt-BR': 'Personagem de Teste' },
  rarity: 5,
  path: 'Harmony',
  element: 'Imaginary',
  announcedAt: '2026-10-01',
  patchReleaseDate: '2026-11-01',
}

describe('schema de personagem', () => {
  it('aceita um personagem válido e aplica os defaults', () => {
    const parsed = character.parse(valid)
    expect(parsed.skills).toEqual([])
    expect(parsed.eidolons).toEqual([])
    expect(parsed.materialIds).toEqual([])
  })

  it('exige o nome em inglês', () => {
    const result = character.safeParse({ ...valid, name: { 'pt-BR': 'Só português' } })
    expect(result.success).toBe(false)
  })

  it('rejeita raridade, caminho e elemento desconhecidos', () => {
    expect(character.safeParse({ ...valid, rarity: 3 }).success).toBe(false)
    expect(character.safeParse({ ...valid, path: 'Inexistente' }).success).toBe(false)
    expect(character.safeParse({ ...valid, element: 'Inexistente' }).success).toBe(false)
  })

  it('rejeita datas fora do formato YYYY-MM-DD', () => {
    expect(character.safeParse({ ...valid, announcedAt: '01/10/2026' }).success).toBe(false)
  })

  it('rejeita idiomas não suportados no texto localizado', () => {
    expect(character.safeParse({ ...valid, name: { en: 'X', fr: 'Y' } }).success).toBe(false)
  })
})
