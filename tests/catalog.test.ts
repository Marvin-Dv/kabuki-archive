import { describe, expect, it } from 'vitest'
import { character, type Character } from '../schema'
import { buildCharacterIndex, displayName } from '../utils/catalog'

const make = (over: Record<string, unknown>): Character =>
  character.parse({
    id: 1,
    slug: 'teste',
    name: { en: 'Test', 'pt-BR': 'Teste' },
    rarity: 5,
    path: 'Harmony',
    element: 'Ice',
    announcedAt: '2026-10-01',
    images: { icon: 'icon/character/1.png' },
    skills: [{ id: 1, type: 'Basic', name: { en: 'Hit' } }],
    ...over,
  })

describe('buildCharacterIndex', () => {
  const now = new Date('2026-11-16T12:00:00Z')

  it('publica só o que já foi anunciado (embargo)', () => {
    const index = buildCharacterIndex(
      [
        make({ id: 1 }),
        make({ id: 2, announcedAt: null }),
        make({ id: 3, announcedAt: '2026-12-01' }),
      ],
      now,
    )
    expect(index.map((c) => c.id)).toEqual([1])
  })

  it('devolve só os campos do card, sem skills nem eidolons', () => {
    const [card] = buildCharacterIndex([make({})], now)
    expect(Object.keys(card).sort()).toEqual(
      ['element', 'icon', 'id', 'name', 'patchReleaseDate', 'path', 'preview', 'rarity', 'slug'].sort(),
    )
    expect(card.icon).toBe('icon/character/1.png')
  })

  it('ordena por id para a saída ser estável', () => {
    const index = buildCharacterIndex([make({ id: 30, slug: 'c' }), make({ id: 10, slug: 'a' })], now)
    expect(index.map((c) => c.id)).toEqual([10, 30])
  })

  it('usa null quando não há ícone nem recorte', () => {
    const [card] = buildCharacterIndex([make({ images: {} })], now)
    expect(card.icon).toBeNull()
    expect(card.preview).toBeNull()
  })

  it('leva o recorte (preview) para o card, nunca a splash (portrait)', () => {
    const [card] = buildCharacterIndex(
      [
        make({
          images: {
            icon: 'icon/character/1.png',
            preview: 'image/character_preview/1.png',
            portrait: 'image/character_portrait/1.png',
          },
        }),
      ],
      now,
    )
    expect(card.preview).toBe('image/character_preview/1.png')
  })
})

describe('displayName', () => {
  const name = { en: 'Trailblazer', 'pt-BR': '{NICKNAME}' }

  it('cai para inglês quando falta o idioma', () => {
    expect(displayName({ en: 'Sparkle' }, 'ja', 'x')).toBe('Sparkle')
  })

  it('resolve o marcador {NICKNAME}', () => {
    expect(displayName(name, 'pt-BR', 'Desbravador')).toBe('Desbravador')
    expect(displayName({ en: 'Dr. {NICKNAME}' }, 'en', 'Ana')).toBe('Dr. Ana')
  })
})
