import { describe, expect, it } from 'vitest'
import {
  SPOILER_WINDOW_DAYS,
  isPublishable,
  isSpoilerActive,
  spoilerExpiresAt,
} from '../utils/spoiler'

const at = (iso: string) => new Date(iso)

describe('isPublishable', () => {
  it('não publica sem anúncio oficial', () => {
    expect(isPublishable({}, at('2026-11-16T12:00:00Z'))).toBe(false)
    expect(isPublishable({ announcedAt: null }, at('2026-11-16T12:00:00Z'))).toBe(false)
  })

  it('não publica anúncio com data futura', () => {
    expect(isPublishable({ announcedAt: '2026-12-01' }, at('2026-11-16T12:00:00Z'))).toBe(false)
  })

  it('publica depois do anúncio', () => {
    expect(isPublishable({ announcedAt: '2026-11-16' }, at('2026-11-16T12:00:00Z'))).toBe(true)
    expect(isPublishable({ announcedAt: '2026-10-01' }, at('2026-11-16T12:00:00Z'))).toBe(true)
  })

  it('ignora datas inválidas', () => {
    expect(isPublishable({ announcedAt: 'não-é-data' }, at('2026-11-16T12:00:00Z'))).toBe(false)
  })
})

describe('isSpoilerActive', () => {
  it('usa a janela de 14 dias', () => {
    expect(SPOILER_WINDOW_DAYS).toBe(14)
  })

  it('está ativo antes do lançamento do patch', () => {
    expect(isSpoilerActive('2026-12-01', at('2026-11-20T00:00:00Z'))).toBe(true)
  })

  it('está ativo durante as 2 semanas depois do patch', () => {
    expect(isSpoilerActive('2026-11-01', at('2026-11-14T23:59:59Z'))).toBe(true)
  })

  it('expira exatamente 14 dias depois do lançamento', () => {
    expect(isSpoilerActive('2026-11-01', at('2026-11-15T00:00:00Z'))).toBe(false)
    expect(isSpoilerActive('2026-11-01', at('2026-12-20T00:00:00Z'))).toBe(false)
  })

  it('é conservador sem data de lançamento', () => {
    expect(isSpoilerActive(undefined, at('2026-11-16T00:00:00Z'))).toBe(true)
    expect(isSpoilerActive('lixo', at('2026-11-16T00:00:00Z'))).toBe(true)
  })
})

describe('spoilerExpiresAt', () => {
  it('soma 14 dias ao lançamento', () => {
    expect(spoilerExpiresAt('2026-11-01')?.toISOString()).toBe('2026-11-15T00:00:00.000Z')
  })

  it('retorna null sem data válida', () => {
    expect(spoilerExpiresAt(null)).toBeNull()
  })
})
