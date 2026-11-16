// Índice enxuto do catálogo, gerado no build por scripts/build-index.ts.
//
// Os arquivos completos de data/generated pesam ~1,8 MB só para personagens
// (skills e eidolons em 5 idiomas). A lista só precisa do que aparece no card,
// então ela lê este índice. O filtro de embargo é aplicado aqui, no build:
// entidade sem `announcedAt` no passado nunca chega ao site.

import type { Character } from '../schema'
import type { Locale } from '../schema/constants'
import { isPublishable } from './spoiler'

type Names = { en: string } & Partial<Record<Locale, string>>

export interface CharacterCard {
  id: number
  slug: string
  name: Names
  rarity: 4 | 5
  path: Character['path']
  element: Character['element']
  /** Caminho relativo do ícone (use `assetUrl`). */
  icon: string | null
  patchReleaseDate: string | null
  version?: string
}

export function toCharacterCard(c: Character): CharacterCard {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    rarity: c.rarity,
    path: c.path,
    element: c.element,
    icon: c.images.icon ?? null,
    patchReleaseDate: c.patchReleaseDate,
    ...(c.version ? { version: c.version } : {}),
  }
}

/** Só entidades já anunciadas, ordenadas por ID (saída estável entre builds). */
export function buildCharacterIndex(entities: Character[], now: Date = new Date()): CharacterCard[] {
  return entities
    .filter((entity) => isPublishable(entity, now))
    .map(toCharacterCard)
    .sort((a, b) => a.id - b.id)
}

/** Marcador do jogo para o nome do protagonista (Trailblazer). */
export const NICKNAME_TOKEN = '{NICKNAME}'

/** Nome no idioma pedido, com fallback para inglês e o marcador {NICKNAME} resolvido. */
export function displayName(name: Names, locale: string, nickname: string): string {
  const text = (name as Record<string, string | undefined>)[locale] || name.en
  return text.split(NICKNAME_TOKEN).join(nickname)
}
